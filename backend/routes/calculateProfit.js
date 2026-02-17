
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

// ----------------------------
// CONFIG
// ----------------------------
const SHORTLIST_LIMIT = 5;
const HANDLING_COST = 500;
const OSRM_TIMEOUT_MS = 3000;

// ----------------------------
// IN-MEMORY CACHES
// ----------------------------
let mandiDataCache = [];
const mandiCoordinatesCache = new Map();
const distanceCache = new Map();

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
    console.error('OSRM Error:', error.message);
    throw error;
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
      const estimatedTransport = approxDistance * vehicleRate;
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
          const transportCost = routeData.distance * vehicleRate;
          const netProfit = revenue - transportCost - HANDLING_COST;

          return {
            mandi: mandi.mandi,
            state: mandi.state,
            district: mandi.district,
            distance: Math.round(routeData.distance * 100) / 100,
            profit: Math.round(netProfit),
            revenue: Math.round(revenue),
            transportCost: Math.round(transportCost),
            handlingCost: HANDLING_COST,
            price: mandi.price,
            coordinates: mandi.coordinates,
            route: routeData.geometry
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
