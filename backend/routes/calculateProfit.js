const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

// Cache for mandi coordinates to avoid repeated geocoding
const mandiCoordinatesCache = new Map();

// Major mandi coordinates (pre-geocoded for common markets)
const majorMandiCoordinates = {
  'Azadpur': { lat: 28.7041, lng: 77.1025 },
  'Sonipat': { lat: 28.9931, lng: 77.0151 },
  'Gurgaon': { lat: 28.4595, lng: 77.0266 },
  'Noida': { lat: 28.5355, lng: 77.3910 },
  'Faridabad': { lat: 28.4089, lng: 77.3178 },
  'Ghaziabad': { lat: 28.6692, lng: 77.4538 },
  'Jodhpur (F&V) APMC': { lat: 26.2389, lng: 73.0243 },
  'Chutmalpur APMC': { lat: 30.0167, lng: 77.7833 },
  'Dhragradhra APMC': { lat: 22.8333, lng: 71.7333 },
  'Delhi': { lat: 28.6139, lng: 77.2090 },
  'Mumbai': { lat: 19.0760, lng: 72.8777 },
  'Bangalore': { lat: 12.9716, lng: 77.5946 },
  'Chennai': { lat: 13.0827, lng: 80.2707 },
  'Kolkata': { lat: 22.5726, lng: 88.3639 },
  'Hyderabad': { lat: 17.3850, lng: 78.4867 },
  'Pune': { lat: 18.5204, lng: 73.8567 },
  'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
  'Jaipur': { lat: 26.9124, lng: 75.7873 },
  'Lucknow': { lat: 26.8467, lng: 80.9462 },
  'Kanpur': { lat: 26.4499, lng: 80.3319 }
};

const vehicleRates = {
  'Tractor': 15,
  'Tata Ace': 20,
  'Truck': 35
};

async function getMandiPrices() {
  try {
    const apiKey = process.env.GOVERNMENT_API_KEY;
    const apiUrl = process.env.GOVERNMENT_API_URL;
    const url = `${apiUrl}?api-key=${apiKey}&offset=0&limit=500&format=json`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.records && data.records.length > 0) {
      return data.records.map(record => ({
        state: record.state,
        district: record.district,
        mandi: record.market,
        commodity: record.commodity,
        variety: record.variety,
        grade: record.grade,
        price: record.modal_price || 0, // Use modal_price as the main price
        minPrice: record.min_price || 0,
        maxPrice: record.max_price || 0,
        arrivalDate: record.arrival_date
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching mandi prices:', error);
    return [];
  }
}

async function getMandiCoordinates(mandi, district, state) {
  const cacheKey = `${mandi}-${district}-${state}`;
  
  // Check cache first
  if (mandiCoordinatesCache.has(cacheKey)) {
    return mandiCoordinatesCache.get(cacheKey);
  }
  
  // Check if we have pre-coordinates
  if (majorMandiCoordinates[mandi]) {
    mandiCoordinatesCache.set(cacheKey, majorMandiCoordinates[mandi]);
    return majorMandiCoordinates[mandi];
  }
  
  // Try city-level coordinates
  if (majorMandiCoordinates[state]) {
    mandiCoordinatesCache.set(cacheKey, majorMandiCoordinates[state]);
    return majorMandiCoordinates[state];
  }
  
  // Fallback to geocoding (using Nominatim)
  try {
    const searchQuery = `${mandi}, ${district}, ${state}, India`;
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`;
    
    const response = await fetch(geocodeUrl);
    const data = await response.json();
    
    if (data && data.length > 0) {
      const coordinates = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
      mandiCoordinatesCache.set(cacheKey, coordinates);
      return coordinates;
    }
  } catch (error) {
    console.error('Error geocoding mandi:', error);
  }
  
  // Try district-level geocoding
  try {
    const districtQuery = `${district}, ${state}, India`;
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(districtQuery)}&limit=1`;
    
    const response = await fetch(geocodeUrl);
    const data = await response.json();
    
    if (data && data.length > 0) {
      const coordinates = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
      mandiCoordinatesCache.set(cacheKey, coordinates);
      return coordinates;
    }
  } catch (error) {
    console.error('Error geocoding district:', error);
  }
  
  // Final fallback - use state capital
  const fallbackCoords = majorMandiCoordinates[state] || majorMandiCoordinates['Delhi'];
  mandiCoordinatesCache.set(cacheKey, fallbackCoords);
  return fallbackCoords;
}

async function getDistance(fromLng, fromLat, toLng, toLat) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.routes && data.routes.length > 0) {
      return {
        distance: data.routes[0].distance / 1000, // Convert meters to km
        geometry: data.routes[0].geometry
      };
    }
    throw new Error('No route found');
  } catch (error) {
    console.error('Error fetching distance:', error);
    throw error;
  }
}

router.post('/calculate-profit', async (req, res) => {
  try {
    const { crop, quantity, vehicle, farmerLocation } = req.body;

    if (!crop || !quantity || !vehicle || !farmerLocation) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const vehicleRate = vehicleRates[vehicle];
    if (!vehicleRate) {
      return res.status(400).json({ error: 'Invalid vehicle type' });
    }

    // Fetch real mandi prices from government API
    const allMandiPrices = await getMandiPrices();
    
    if (allMandiPrices.length === 0) {
      return res.status(500).json({ error: 'Unable to fetch mandi prices from government API' });
    }

    // Filter mandis by crop (case-insensitive)
    const relevantMandis = allMandiPrices.filter(mandi => 
      mandi.commodity.toLowerCase() === crop.toLowerCase()
    );
    
    if (relevantMandis.length === 0) {
      return res.status(400).json({ 
        error: `No mandis found for ${crop}. Try: Onion, Tomato, Potato, or other commodities` 
      });
    }

    console.log(`Found ${relevantMandis.length} mandis for ${crop}`);

    const results = [];
    let bestMandi = null;
    let maxProfit = -Infinity;
    let bestRoute = null;

    // Calculate profit for each mandi
    for (const mandi of relevantMandis) {
      try {
        // Get coordinates for this mandi
        const coordinates = await getMandiCoordinates(mandi.mandi, mandi.district, mandi.state);
        
        const routeData = await getDistance(
          farmerLocation.lng,
          farmerLocation.lat,
          coordinates.lng,
          coordinates.lat
        );

        const revenue = mandi.price * quantity;
        const transportCost = routeData.distance * vehicleRate;
        const handlingCost = 500; // Fixed handling cost
        const netProfit = revenue - transportCost - handlingCost;

        const result = {
          mandi: mandi.mandi,
          state: mandi.state,
          district: mandi.district,
          distance: Math.round(routeData.distance * 100) / 100,
          profit: Math.round(netProfit),
          revenue: Math.round(revenue),
          transportCost: Math.round(transportCost),
          handlingCost: handlingCost,
          price: mandi.price,
          minPrice: mandi.minPrice,
          maxPrice: mandi.maxPrice,
          variety: mandi.variety,
          grade: mandi.grade,
          arrivalDate: mandi.arrivalDate,
          coordinates: coordinates
        };

        results.push(result);

        if (netProfit > maxProfit) {
          maxProfit = netProfit;
          bestMandi = mandi.mandi;
          bestRoute = routeData.geometry;
        }
      } catch (error) {
        console.error(`Error calculating for mandi ${mandi.mandi}:`, error);
        // Continue with other mandis even if one fails
      }
    }

    if (results.length === 0) {
      return res.status(500).json({ error: 'Unable to calculate profits for any mandi' });
    }

    // Sort results by profit (descending)
    results.sort((a, b) => b.profit - a.profit);

    res.json({
      bestMandi,
      results,
      route: bestRoute,
      farmerLocation,
      crop,
      quantity,
      vehicle,
      totalMandisFound: relevantMandis.length,
      dataSource: 'Government API - data.gov.in'
    });

  } catch (error) {
    console.error('Error in calculate-profit:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
