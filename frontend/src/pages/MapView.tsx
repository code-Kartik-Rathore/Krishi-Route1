import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MapBounds from '../components/MapBounds';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewState {
  bestMandi: string;
  results: Array<{
    mandi: string;
    state?: string;
    district?: string;
    distance: number;
    profit: number;
    coordinates: { lat: number; lng: number };
  }>;
  route: any;
  farmerLocation: { lat: number; lng: number };
  crop: string;
  quantity: number;
  vehicle: string;
}

const MapView: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as MapViewState;

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!state) {
    navigate('/');
    return null;
  }

  const { bestMandi, results, route, farmerLocation, crop, quantity, vehicle } = state;
  const bestMandiResult = results.find(result => result.mandi === bestMandi);

  const farmerPosition: LatLngExpression = [farmerLocation.lat, farmerLocation.lng];
  const bestMandiPosition: LatLngExpression = bestMandiResult 
    ? [bestMandiResult.coordinates.lat, bestMandiResult.coordinates.lng]
    : farmerPosition;

  // Convert route geometry to LatLngExpression array
  const routeCoordinates: LatLngExpression[] = [];
  if (route && route.coordinates) {
    route.coordinates.forEach((coord: number[]) => {
      routeCoordinates.push([coord[1], coord[0]]); // Leaflet uses [lat, lng]
    });
  }

  // Calculate straight-line distance (Haversine formula)
  const calculateStraightLineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const straightLineDistance = calculateStraightLineDistance(
    farmerLocation.lat, 
    farmerLocation.lng, 
    bestMandiPosition[0], 
    bestMandiPosition[1]
  );

  const customIcon = (type: 'farmer' | 'best' | 'other') => {
    const color = type === 'farmer' ? '#3b82f6' : type === 'best' ? '#10b981' : '#6b7280';
    return L.divIcon({
      html: `
        <div style="
          background-color: ${color};
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 10px;
          font-weight: bold;
        ">
          ${type === 'farmer' ? '👨‍🌾' : type === 'best' ? '🏆' : '📍'}
        </div>
      `,
      className: 'custom-marker',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  };

  if (!isClient) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loading}>Loading map...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🗺️ Route Map</h1>
        <button style={styles.backButton} onClick={() => navigate('/dashboard', { state })}>
          ← Back to Dashboard
        </button>
      </div>

      <div style={styles.mapContainer}>
        <MapContainer
          center={farmerPosition}
          zoom={7}
          style={{ height: '500px', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* Map bounds to fit route */}
          <MapBounds
            routeCoordinates={routeCoordinates}
            farmerPosition={farmerPosition}
            bestMandiPosition={bestMandiPosition}
          />

          {/* Other Mandi Markers (only show non-route mandis) */}
          {results
            .filter(result => result.mandi !== bestMandi)
            .map((result, index) => (
              <Marker
                key={index}
                position={[result.coordinates.lat, result.coordinates.lng]}
                icon={customIcon('other')}
              >
                <Popup>
                  <div style={styles.popup}>
                    <h4 style={styles.popupTitle}>{result.mandi}</h4>
                    <p style={styles.popupText}>
                      {result.district}, {result.state}
                    </p>
                    <p style={styles.popupText}>
                      Distance: {result.distance} km
                    </p>
                    <p style={styles.popupText}>
                      Profit: ₹{result.profit.toLocaleString('en-IN')}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}

          {/* Route Line */}
          {routeCoordinates.length > 0 && (
            <>
              {/* Direct straight line from user to mandi */}
              <Polyline
                positions={[farmerPosition, bestMandiPosition]}
                color="#ef4444"
                weight={3}
                opacity={0.6}
                dashArray="5, 10"
              />
              
              {/* Main driving route line */}
              <Polyline
                positions={routeCoordinates}
                color="#667eea"
                weight={8}
                opacity={0.9}
                smoothFactor={1}
              />
              
              {/* Route outline for better visibility */}
              <Polyline
                positions={routeCoordinates}
                color="#ffffff"
                weight={10}
                opacity={0.5}
                smoothFactor={1}
              />
              
              {/* Intermediate route markers */}
              {routeCoordinates.length > 100 && [
                routeCoordinates[Math.floor(routeCoordinates.length * 0.25)],
                routeCoordinates[Math.floor(routeCoordinates.length * 0.5)],
                routeCoordinates[Math.floor(routeCoordinates.length * 0.75)]
              ].map((position, index) => (
                <Marker
                  key={`waypoint-${index}`}
                  position={position}
                  icon={L.divIcon({
                    html: `
                      <div style="
                        background-color: #f59e0b;
                        width: 12px;
                        height: 12px;
                        border-radius: 50%;
                        border: 2px solid white;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                      "></div>
                    `,
                    className: 'route-waypoint',
                    iconSize: [12, 12],
                    iconAnchor: [6, 6],
                  })}
                >
                  <Popup>
                    <div style={styles.popup}>
                      <h4 style={styles.popupTitle}>📍 Waypoint {index + 1}</h4>
                      <p style={styles.popupText}>
                        Route Progress: {Math.round((index + 1) * 25)}%
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}
              
              {/* Start point marker */}
              <Marker position={farmerPosition} icon={customIcon('farmer')}>
                <Popup>
                  <div style={styles.popup}>
                    <h4 style={styles.popupTitle}>🚀 Route Start</h4>
                    <p style={styles.popupText}>
                      Your Location: {farmerLocation.lat.toFixed(4)}, {farmerLocation.lng.toFixed(4)}
                    </p>
                    <p style={styles.popupText}>
                      Destination: {bestMandi}
                    </p>
                    <p style={styles.popupText}>
                      Total Distance: {bestMandiResult?.distance} km
                    </p>
                    <p style={styles.popupText}>
                      Crop: {crop} ({quantity} quintals)
                    </p>
                    <p style={styles.popupText}>
                      Vehicle: {vehicle}
                    </p>
                  </div>
                </Popup>
              </Marker>
              
              {/* End point marker */}
              {bestMandiResult && (
                <Marker position={bestMandiPosition} icon={customIcon('best')}>
                  <Popup>
                    <div style={styles.popup}>
                      <h4 style={styles.popupTitle}>🎯 Route End</h4>
                      <p style={styles.popupText}>
                        Destination: {bestMandi}
                      </p>
                      <p style={styles.popupText}>
                        {bestMandiResult.district}, {bestMandiResult.state}
                      </p>
                      <p style={styles.popupText}>
                        Expected Profit: ₹{bestMandiResult.profit.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              )}
            </>
          )}
        </MapContainer>
      </div>

      <div style={styles.routeInfo}>
        <h3 style={styles.routeInfoTitle}>🛣️ Route Information</h3>
        {bestMandiResult && (
          <div style={styles.routeDetails}>
            <div style={styles.routeItem}>
              <span style={styles.routeLabel}>From:</span>
              <span style={styles.routeValue}>Your Location</span>
            </div>
            <div style={styles.routeItem}>
              <span style={styles.routeLabel}>To:</span>
              <span style={styles.routeValue}>{bestMandi}</span>
            </div>
            <div style={styles.routeItem}>
              <span style={styles.routeLabel}>Driving Distance:</span>
              <span style={styles.routeValue}>{bestMandiResult.distance} km</span>
            </div>
            <div style={styles.routeItem}>
              <span style={styles.routeLabel}>Straight Distance:</span>
              <span style={styles.routeValue}>{straightLineDistance.toFixed(1)} km</span>
            </div>
            <div style={styles.routeItem}>
              <span style={styles.routeLabel}>Transport Cost:</span>
              <span style={styles.routeValue}>₹{(bestMandiResult.distance * (vehicle === 'Tractor' ? 15 : vehicle === 'Tata Ace' ? 20 : 35)).toLocaleString('en-IN')}</span>
            </div>
            <div style={styles.routeItem}>
              <span style={styles.routeLabel}>Net Profit:</span>
              <span style={styles.routeValue}>₹{bestMandiResult.profit.toLocaleString('en-IN')}</span>
            </div>
          </div>
        )}
      </div>

      <div style={styles.legend}>
        <h3 style={styles.legendTitle}>Map Legend</h3>
        <div style={styles.legendItems}>
          <div style={styles.legendItem}>
            <div style={{ ...styles.legendColor, backgroundColor: '#3b82f6' }}></div>
            <span>🚀 Route Start (Your Location)</span>
          </div>
          <div style={styles.legendItem}>
            <div style={{ ...styles.legendColor, backgroundColor: '#10b981' }}></div>
            <span>🎯 Route End (Best Mandi)</span>
          </div>
          <div style={styles.legendItem}>
            <div style={{ ...styles.legendColor, backgroundColor: '#f59e0b' }}></div>
            <span>📍 Route Waypoints</span>
          </div>
          <div style={styles.legendItem}>
            <div style={{ ...styles.legendColor, backgroundColor: '#6b7280' }}></div>
            <span>Other Mandis</span>
          </div>
          <div style={styles.legendItem}>
            <div style={{ 
              ...styles.legendColor, 
              backgroundColor: '#667eea', 
              border: '3px solid white',
              height: '8px'
            }}></div>
            <span>🛣️ Driving Route</span>
          </div>
          <div style={styles.legendItem}>
            <div style={{ 
              ...styles.legendColor, 
              backgroundColor: '#ef4444', 
              border: '2px dashed #ef4444',
              height: '4px'
            }}></div>
            <span>📏 Direct Line (Straight Distance)</span>
          </div>
        </div>
      </div>

      <div style={styles.actions}>
        <button style={styles.secondaryButton} onClick={() => navigate('/dashboard', { state })}>
          Back to Dashboard
        </button>
        <button style={styles.primaryButton} onClick={() => navigate('/')}>
          New Search
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f8fafc',
    padding: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    margin: 0,
    color: '#1f2937',
  },
  backButton: {
    padding: '10px 20px',
    background: 'white',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'border-color 0.2s ease',
  },
  mapContainer: {
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    border: '2px solid #e5e7eb',
    marginBottom: '20px',
  },
  loadingContainer: {
    minHeight: '100vh',
    background: '#f8fafc',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loading: {
    fontSize: '1.5rem',
    color: '#6b7280',
  },
  popup: {
    minWidth: '200px',
  },
  popupTitle: {
    margin: '0 0 10px 0',
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#1f2937',
  },
  popupText: {
    margin: '5px 0',
    fontSize: '0.9rem',
    color: '#4b5563',
  },
  routeInfo: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    border: '2px solid #e5e7eb',
  },
  routeInfoTitle: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    margin: '0 0 15px 0',
    color: '#1f2937',
  },
  routeDetails: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
  },
  routeItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    background: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
  },
  routeLabel: {
    fontSize: '0.9rem',
    color: '#6b7280',
    fontWeight: '600',
  },
  routeValue: {
    fontSize: '0.9rem',
    color: '#1f2937',
    fontWeight: 'bold',
  },
  legend: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    border: '2px solid #e5e7eb',
  },
  legendTitle: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    margin: '0 0 15px 0',
    color: '#1f2937',
  },
  legendItems: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap' as const,
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  legendColor: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    border: '2px solid white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
  },
  primaryButton: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
  },
  secondaryButton: {
    padding: '12px 24px',
    background: 'white',
    color: '#4b5563',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'border-color 0.2s ease',
  },
};

export default MapView;
