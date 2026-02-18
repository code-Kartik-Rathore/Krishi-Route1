import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sprout,
  Scale,
  Truck,
  MapPin,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

const CROPS = [
  'Onion', 'Tomato', 'Potato', 'Mustard', 'Cotton', 'Castor Seed',
  'Arhar(Tur/Red Gram)(Whole)', 'Brinjal', 'Mousambi(Sweet Lime)', 'Spinach',
  'Sweet Potato', 'Apple', 'Banana', 'Bhindi(Ladies Finger)', 'Cabbage',
  'Capsicum', 'Carrot', 'Cauliflower', 'Coconut Seed', 'Cucumbar(Kheera)',
  'Garlic', 'Ginger(Green)', 'Green Chilli', 'Lemon', 'Maize', 'Paddy(Common)',
  'Peas Wet', 'Pumpkin', 'Wheat',
];

interface FormData {
  crop: string;
  quantity: number;
  vehicle: string;
  locationSearch: string;
  farmerLocation: { lat: number; lng: number };
}

export default function CalculatorCard() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    crop: 'Onion',
    quantity: 10,
    vehicle: 'Tata Ace',
    locationSearch: '',
    farmerLocation: { lat: 28.6139, lng: 77.2090 },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'quantity' ? Number(value) : value,
    }));
  };

  const handleLocationSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, locationSearch: e.target.value }));
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            farmerLocation: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
            locationSearch: 'Current Location',
          }));
          setError('');
        },
        () => setError('Unable to get your location. Please enter manually.')
      );
    } else setError('Geolocation is not supported.');
  };

  const geocodeLocation = async (searchQuery: string) => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
    );
    const data = await res.json();
    if (data?.length > 0)
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    throw new Error('Location not found');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      let location = formData.farmerLocation;
      if (formData.locationSearch && formData.locationSearch !== 'Current Location')
        location = await geocodeLocation(formData.locationSearch);

      const response = await fetch('http://localhost:3001/api/calculate-profit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop: formData.crop,
          quantity: formData.quantity,
          vehicle: formData.vehicle,
          farmerLocation: location,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to calculate profit');
      navigate('/dashboard', { state: result });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.section
      id="calculator"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5 }}
      className="scroll-mt-24"
    >
      <div className="relative max-w-2xl mx-auto rounded-3xl bg-white/90 backdrop-blur-xl border border-white/60 shadow-2xl shadow-slate-200/50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-light/40 via-transparent to-primary-muted/20 pointer-events-none" />
        <div className="relative p-6 sm:p-8 md:p-10">
          <div className="flex items-center gap-2 text-sm font-medium text-primary mb-6">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Live prices from Government API (data.gov.in)</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <Sprout className="w-4 h-4 text-primary" />
                Select crop
              </label>
              <select
                name="crop"
                value={formData.crop}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-800 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
              >
                {CROPS.map((c) => (
                  <option key={c} value={c}>
                    {c.replace(/\(.*\)/g, '').trim() || c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <Scale className="w-4 h-4 text-primary" />
                Quantity (quintals)
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min={1}
                max={1000}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-800 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <Truck className="w-4 h-4 text-primary" />
                Transport vehicle
              </label>
              <select
                name="vehicle"
                value={formData.vehicle}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-800 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
              >
                <option value="Tractor">Tractor (₹15/km)</option>
                <option value="Tata Ace">Tata Ace (₹20/km)</option>
                <option value="Truck">Truck (₹35/km)</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <MapPin className="w-4 h-4 text-primary" />
                Your location
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={formData.locationSearch}
                  onChange={handleLocationSearchChange}
                  placeholder="City, village, or address"
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                />
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-700 font-medium hover:bg-slate-100 hover:border-slate-300 transition shrink-0 flex items-center justify-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  Current location
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={!isLoading ? { scale: 1.02 } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
              className="w-full py-4 rounded-xl font-semibold text-lg text-white bg-primary shadow-lg shadow-primary/30 hover:bg-primary-hover focus:ring-4 focus:ring-primary/30 outline-none transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Calculating best mandi…
                </>
              ) : (
                'Find best mandi'
              )}
            </motion.button>
          </form>
        </div>
      </div>
    </motion.section>
  );
}
