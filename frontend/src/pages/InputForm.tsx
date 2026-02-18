import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface FormData {
  crop: string;
  quantity: number;
  vehicle: string;
  locationSearch: string;
  farmerLocation: { lat: number; lng: number };
}

const InputForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    crop: 'Onion',
    quantity: 10,
    vehicle: 'Tata Ace',
    locationSearch: '',
    farmerLocation: { lat: 28.6139, lng: 77.2090 } // Default to Delhi
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? Number(value) : value
    }));
  };

  const handleLocationSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      locationSearch: e.target.value
    }));
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            farmerLocation: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            },
            locationSearch: 'Current Location'
          }));
          setError('');
        },
        () => {
          setError('Unable to get your location. Please enter manually.');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  };

  const geocodeLocation = async (searchQuery: string) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
      throw new Error('Location not found');
    } catch (error) {
      throw new Error('Failed to find location. Please try a different search term.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let location = formData.farmerLocation;

      // If user entered a search query, geocode it
      if (formData.locationSearch && formData.locationSearch !== 'Current Location') {
        location = await geocodeLocation(formData.locationSearch);
      }

      const response = await fetch('http://localhost:3001/api/calculate-profit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          crop: formData.crop,
          quantity: formData.quantity,
          vehicle: formData.vehicle,
          farmerLocation: location
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to calculate profit');
      }

      navigate('/dashboard', { state: result });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🚜 Krishi-Route</h1>
        <p style={styles.subtitle}>
          Find the most profitable mandi for your crops
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Select Crop</label>
            <select
              name="crop"
              value={formData.crop}
              onChange={handleChange}
              style={styles.select}
            >
              <option value="Onion">Onion</option>
              <option value="Tomato">Tomato</option>
              <option value="Potato">Potato</option>
              <option value="Mustard">Mustard</option>
              <option value="Cotton">Cotton</option>
              <option value="Castor Seed">Castor Seed</option>
              <option value="Arhar(Tur/Red Gram)(Whole)">Arhar (Tur)</option>
              <option value="Brinjal">Brinjal</option>
              <option value="Mousambi(Sweet Lime)">Mousambi (Sweet Lime)</option>
              <option value="Spinach">Spinach</option>
              <option value="Sweet Potato">Sweet Potato</option>
              <option value="Apple">Apple</option>
              <option value="Banana">Banana</option>
              <option value="Bhindi(Ladies Finger)">Bhindi (Lady's Finger)</option>
              <option value="Cabbage">Cabbage</option>
              <option value="Capsicum">Capsicum</option>
              <option value="Carrot">Carrot</option>
              <option value="Cauliflower">Cauliflower</option>
              <option value="Coconut Seed">Coconut</option>
              <option value="Cucumbar(Kheera)">Cucumber (Kheera)</option>
              <option value="Garlic">Garlic</option>
              <option value="Ginger(Green)">Ginger (Green)</option>
              <option value="Green Chilli">Green Chilli</option>
              <option value="Lemon">Lemon</option>
              <option value="Maize">Maize</option>
              <option value="Paddy(Common)">Paddy (Rice)</option>
              <option value="Peas Wet">Green Peas</option>
              <option value="Pumpkin">Pumpkin</option>
              <option value="Wheat">Wheat</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Quantity (quintals)</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="1"
              max="1000"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Transport Vehicle</label>
            <select
              name="vehicle"
              value={formData.vehicle}
              onChange={handleChange}
              style={styles.select}
            >
              <option value="Tractor">Tractor (₹15/km)</option>
              <option value="Tata Ace">Tata Ace (₹20/km)</option>
              <option value="Truck">Truck (₹35/km)</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Your Location</label>
            <div style={styles.locationContainer}>
              <input
                type="text"
                value={formData.locationSearch}
                onChange={handleLocationSearchChange}
                placeholder="Enter city, address, or use current location"
                style={styles.input}
              />
              <button
                type="button"
                onClick={getCurrentLocation}
                style={styles.locationButton}
              >
                📍 Current Location
              </button>
            </div>
          </div>

          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={isLoading ? styles.buttonDisabled : styles.button}
          >
            {isLoading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ 
                  width: '16px', 
                  height: '16px', 
                  border: '2px solid transparent', 
                  borderTop: '2px solid white', 
                  borderRight: '2px solid white', 
                  borderBottom: '2px solid white', 
                  borderRadius: '50%', 
                  animation: 'spin 1s linear infinite' 
                }}></span>
                Calculating...
              </span>
            ) : 'Find Best Mandi'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    maxWidth: '500px',
    width: '100%',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    margin: '0 0 10px 0',
    textAlign: 'center' as const,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#6b7280',
    margin: '0 0 30px 0',
    textAlign: 'center' as const,
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '1rem',
    transition: 'border-color 0.2s ease',
  },
  select: {
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '1rem',
    backgroundColor: 'white',
    cursor: 'pointer',
  },
  locationContainer: {
    display: 'flex',
    gap: '10px',
  },
  locationButton: {
    padding: '12px 16px',
    background: '#f3f4f6',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
  },
  button: {
    padding: '14px 24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
  },
  buttonDisabled: {
    padding: '14px 24px',
    background: '#9ca3af',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'not-allowed',
  },
  error: {
    padding: '12px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    color: '#dc2626',
    fontSize: '0.9rem',
  },
};

export default InputForm;
