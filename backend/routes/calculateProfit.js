
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

// ----------------------------
// CONFIG
// ----------------------------
const SHORTLIST_LIMIT = 5;
const HANDLING_COST = 500;
const OSRM_TIMEOUT_MS = 2000;

// ----------------------------
// IN-MEMORY CACHES
// ----------------------------
let mandiDataCache = [];
const mandiCoordinatesCache = new Map();
const distanceCache = new Map();
const fuelPriceCache = new Map();

// ----------------------------
// STATIC COORDINATES (LOWERCASE KEYS)
// ----------------------------
const majorMandiCoordinates = {
  'azadpur': { lat: 28.7041, lng: 77.1025 },
  'sonipat': { lat: 28.9931, lng: 77.0151 },
  'gurgaon': { lat: 28.4595, lng: 77.0266 },
  'noida': { lat: 28.5355, lng: 77.3910 },
  'faridabad': { lat: 28.4089, lng: 77.3178 },
  'ghaziabad': { lat: 28.6692, lng: 77.4538 },
  'delhi': { lat: 28.6139, lng: 77.2090 }
};

const vehicleRates = {
  'Tractor': 15,
  'Tata Ace': 20,
  'Truck': 35
};

const vehicleFuelEfficiency = {
  'Tractor': 4,    // km per liter
  'Tata Ace': 8,   // km per liter
  'Truck': 6       // km per liter
};

// ----------------------------
// LOAD MANDI DATA ONCE
// ----------------------------
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
        price: record.modal_price || 0,
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

async function loadMandiPricesOnce() {
  mandiDataCache = await getMandiPrices();
  console.log("Mandi data loaded:", mandiDataCache.length);
}

loadMandiPricesOnce();

// ----------------------------
// FUEL PRICE API
// ----------------------------
async function getDieselPrice(location, locationType = 'state') {
  const cacheKey = `${location}-${locationType}`;
  
  if (fuelPriceCache.has(cacheKey)) {
    return fuelPriceCache.get(cacheKey);
  }

  try {
    const apiKey = process.env.FUEL_PRICE_API_KEY;
    console.log('Fuel API Key:', apiKey);
    const url = `https://fuel.indianapi.in/live_fuel_price?fuel_type=diesel&location_type=${locationType}&location=${encodeURIComponent(location)}`;
    console.log('Fuel API URL:', url);
    
    const response = await fetch(url, {
      headers: {
        'x-api-key': apiKey
      }
    });
    const data = await response.json();
    console.log('Fuel API Response:', data);
    
    if (data && data.length > 0) {
      // Find the matching location in the response
      const locationData = data.find(item => 
        item.city && item.city.toLowerCase() === location.toLowerCase()
      );
      
      if (locationData && locationData.price) {
        const dieselPrice = parseFloat(locationData.price);
        fuelPriceCache.set(cacheKey, dieselPrice);
        return dieselPrice;
      }
    }
    
    // Fallback to average diesel price if API fails or location not found
    console.log('Fuel API failed or location not found, using fallback price');
    const fallbackPrice = 90; // Average diesel price in India
    fuelPriceCache.set(cacheKey, fallbackPrice);
    return fallbackPrice;
    
  } catch (error) {
    console.error('Error fetching diesel price:', error);
    // Fallback to state-based average diesel prices for demo
    const statePrices = {
      'delhi': 94.5,
      'maharashtra': 96.2,
      'gujarat': 93.8,
      'rajasthan': 92.1,
      'punjab': 95.3,
      'uttar pradesh': 91.7,
      'karnataka': 97.4,
      'tamil nadu': 98.1,
      'west bengal': 90.5,
      'bihar': 89.8
    };
    
    const locationLower = location.toLowerCase();
    const fallbackPrice = statePrices[locationLower] || 90;
    console.log(`Using fallback price for ${location}: ₹${fallbackPrice}`);
    fuelPriceCache.set(cacheKey, fallbackPrice);
    return fallbackPrice;
  }
}

// ----------------------------
// HELPERS
// ----------------------------

// Haversine (fast estimation)
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI/180) *
    Math.cos(lat2 * Math.PI/180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function distanceKey(fromLat, fromLng, toLat, toLng) {
  return `${fromLat},${fromLng}_${toLat},${toLng}`;
}

async function getDistance(fromLng, fromLat, toLng, toLat) {
  const key = distanceKey(fromLat, fromLng, toLat, toLng);

  if (distanceCache.has(key)) {
    return distanceCache.get(key);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OSRM_TIMEOUT_MS);

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;

    const response = await fetch(url, { signal: controller.signal });
    const data = await response.json();

    clearTimeout(timeout);

    if (data.routes && data.routes.length > 0) {
      const result = {
        distance: data.routes[0].distance / 1000,
        geometry: data.routes[0].geometry
      };

      distanceCache.set(key, result);
      return result;
    }

    throw new Error('No route found');
  } catch (error) {
    clearTimeout(timeout);
    
    // If OSRM fails, fallback to haversine distance
    console.warn('OSRM failed, using haversine fallback:', error.message);
    const fallbackDistance = haversine(fromLat, fromLng, toLat, toLat);
    const result = {
      distance: fallbackDistance,
      geometry: null
    };
    
    distanceCache.set(key, result);
    return result;
  }
}

async function getMandiCoordinates(mandi, district, state) {
  const cacheKey = `${mandi}-${district}-${state}`;

  if (mandiCoordinatesCache.has(cacheKey)) {
    return mandiCoordinatesCache.get(cacheKey);
  }

  const mandiKey = mandi.toLowerCase();
  const stateKey = state.toLowerCase();

  if (majorMandiCoordinates[mandiKey]) {
    mandiCoordinatesCache.set(cacheKey, majorMandiCoordinates[mandiKey]);
    return majorMandiCoordinates[mandiKey];
  }

  if (majorMandiCoordinates[stateKey]) {
    mandiCoordinatesCache.set(cacheKey, majorMandiCoordinates[stateKey]);
    return majorMandiCoordinates[stateKey];
  }

  // Geocode only if needed
  try {
    const searchQuery = `${district}, ${state}, India`;
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
    console.error("Geocoding error:", error.message);
  }

  return null;
}

// ----------------------------
// MAIN ROUTE
// ----------------------------

router.post('/calculate-profit', async (req, res) => {
  console.time("TOTAL_API");

  try {
    const { crop, quantity, vehicle, farmerLocation } = req.body;

    if (!crop || !quantity || !vehicle || !farmerLocation) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const vehicleRate = vehicleRates[vehicle];
    if (!vehicleRate) {
      return res.status(400).json({ error: 'Invalid vehicle type' });
    }

    if (!mandiDataCache.length) {
      return res.status(500).json({ error: 'Mandi data not loaded yet' });
    }

    // 1️⃣ Filter crop
    const relevantMandis = mandiDataCache.filter(mandi =>
      mandi.commodity.toLowerCase() === crop.toLowerCase()
    );

    if (!relevantMandis.length) {
      return res.status(400).json({ error: `No mandis found for ${crop}` });
    }

    // 2️⃣ Estimate profit using Haversine
    const estimatedMandis = [];
    
    // Get diesel price for the farmer's state
    const dieselPrice = await getDieselPrice(farmerLocation.state || 'delhi', 'state');

    for (const mandi of relevantMandis) {
      const coordinates = await getMandiCoordinates(
        mandi.mandi,
        mandi.district,
        mandi.state
      );

      if (!coordinates) continue;

      const approxDistance = haversine(
        farmerLocation.lat,
        farmerLocation.lng,
        coordinates.lat,
        coordinates.lng
      );

      const estimatedRevenue = mandi.price * quantity;
      
      // Calculate fuel cost
      const fuelConsumed = approxDistance / vehicleFuelEfficiency[vehicle];
      const fuelCost = fuelConsumed * dieselPrice;
      
      // Keep existing transport cost as base rate + fuel cost
      const estimatedTransport = (approxDistance * vehicleRate) + fuelCost;
      const estimatedProfit = estimatedRevenue - estimatedTransport - HANDLING_COST;

      estimatedMandis.push({
        ...mandi,
        coordinates,
        estimatedProfit
      });
    }

    if (!estimatedMandis.length) {
      return res.status(500).json({ error: "Unable to estimate mandis" });
    }

    // 3️⃣ Shortlist top candidates
    estimatedMandis.sort((a, b) => b.estimatedProfit - a.estimatedProfit);
    const shortlist = estimatedMandis.slice(0, SHORTLIST_LIMIT);

    // 4️⃣ Accurate OSRM calculation for shortlist
    const results = await Promise.all(
      shortlist.map(async (mandi) => {
        try {
          const routeData = await getDistance(
            farmerLocation.lng,
            farmerLocation.lat,
            mandi.coordinates.lng,
            mandi.coordinates.lat
          );

          const revenue = mandi.price * quantity;
          
          // Calculate fuel cost with accurate distance
          const fuelConsumed = routeData.distance / vehicleFuelEfficiency[vehicle];
          const fuelCost = fuelConsumed * dieselPrice;
          
          // Keep existing transport cost as base rate + fuel cost
          const transportCost = (routeData.distance * vehicleRate) + fuelCost;
          const netProfit = revenue - transportCost - HANDLING_COST;

          return {
            mandi: mandi.mandi,
            state: mandi.state,
            district: mandi.district,
            distance: Math.round(routeData.distance * 100) / 100,
            profit: Math.round(netProfit),
            revenue: Math.round(revenue),
            transportCost: Math.round(transportCost),
            fuelCost: Math.round(fuelCost),
            handlingCost: HANDLING_COST,
            price: mandi.price,
            coordinates: mandi.coordinates,
            route: routeData.geometry,
            dieselPrice: Math.round(dieselPrice * 100) / 100
          };

        } catch (err) {
          console.error("OSRM error:", err.message);
          return null;
        }
      })
    );

    const filteredResults = results.filter(Boolean);

    if (!filteredResults.length) {
      return res.status(500).json({ error: "Unable to calculate final profits" });
    }

    filteredResults.sort((a, b) => b.profit - a.profit);

    console.timeEnd("TOTAL_API");

    res.json({
      bestMandi: filteredResults[0].mandi,
      results: filteredResults,
      route: filteredResults[0].route,
      farmerLocation,
      crop,
      quantity,
      vehicle,
      totalMandisProcessed: filteredResults.length,
      dataSource: "Government API (cached + hybrid routing)"
    });

  } catch (error) {
    console.timeEnd("TOTAL_API");
    console.error('Error in calculate-profit:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
