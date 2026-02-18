# 🌾 Krishi-Route — Profit & Logistics Optimizer for Farmers

> 🚜 Google Maps for Farmer Profit Optimization

Krishi-Route is a geospatial decision-support platform that helps farmers choose **the most profitable mandi** instead of the nearest one by analyzing:

- Real-time mandi prices
- Transport cost
- Distance
- Net profit

---

## 📌 Problem Statement

Most farmers in India sell their crops at the nearest mandi without comparing prices across nearby markets.  
This results in a loss of **₹5,000 – ₹10,000 per trip** due to:

- No profit calculation
- Transport cost uncertainty
- Lack of price comparison tools

Krishi-Route solves this by recommending the mandi that **maximizes net profit**, not just minimizes distance.

---

## ✨ Key Features

✅ Real-time mandi price integration (Agmarknet)  
✅ Net profit calculation (Revenue – Transport – Handling cost)  
✅ Smart mandi recommendation  
✅ Route visualization on map  
✅ Profit comparison dashboard  
✅ Geospatial distance-based transport estimation  
✅ Dynamic geocoding cache for performance  

---

## ⚡ Performance Optimization

Initial API response time: **~35 seconds**  
Optimized response time: **~3 seconds**

Optimizations implemented:

- 📦 In-memory caching of Agmarknet data
- ⚡ Haversine distance for fast pre-filtering
- 🔀 Parallel routing for shortlisted mandis
- 🧠 Intelligent candidate selection
- 📍 Dynamic geocoding cache

---

## 🧠 How It Works

1. Farmer enters:
   - Crop
   - Quantity
   - Vehicle type
   - Location

2. System:
   - Fetches mandi prices
   - Estimates profit for multiple mandis
   - Calculates transport cost using distance
   - Recommends the most profitable mandi

---

## 🏗 Tech Stack

### Frontend
- React.js
- TypeScript
- Leaflet (Maps)
- Recharts

### Backend
- Node.js
- Express.js
- MongoDB
- REST APIs

### Data & Geospatial
- Agmarknet API (data.gov.in)
- OpenStreetMap
- OSRM (routing engine)
- Nominatim (geocoding)

---

## 📊 Impact

Krishi-Route enables farmers to:

- 💰 Increase income per trip
- 🧭 Make data-driven selling decisions
- 🚚 Optimize transport usage

---

## 🔮 Future Scope

- 📈 Price prediction (Best day to sell)
- 🚛 Truck-sharing for nearby farmers
- ⛽ Fuel-price-aware transport cost
- 📍 Coverage for 7,000+ mandis across India

---

## 🖥 Demo Video

🎥 **[Watch Demo](#)**  
*(Add your YouTube / Drive link here)*

---

## 🛠 Local Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/code-Kartik-Rathore/Krishi-Route.git
cd Krishi-Route

2️⃣ Backend Setup
cd backend
npm install


Create a .env file:

PORT=3001
GOVERNMENT_API_KEY=your_api_key
GOVERNMENT_API_URL=your_api_url


Run backend:

npm run dev

3️⃣ Frontend Setup
cd frontend
npm install
npm start

📂 Project Structure
Krishi-Route
│── frontend
│── backend
│── README.md
```

👥 Team Lazy Loaders

Built for Hackathon – Problem Statement 6

Kartik Rathore (Team Leader)
Kanishk Gupta
Ekansh Aggarwal
Himanshu Yadav

🏁 Conclusion

Krishi-Route transforms mandi selection from a distance-based decision into a profit-driven intelligent recommendation system, empowering farmers with data and geospatial insights.

