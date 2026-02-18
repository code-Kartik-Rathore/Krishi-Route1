import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProfitCard from '../components/ProfitCard';
import ProfitChart from '../components/ProfitChart';

interface DashboardState {
  bestMandi: string;
  results: Array<{
    mandi: string;
    state?: string;
    district?: string;
    distance: number;
    profit: number;
    revenue: number;
    transportCost: number;
    handlingCost: number;
    price: number;
    minPrice?: number;
    maxPrice?: number;
    variety?: string;
    grade?: string;
    arrivalDate?: string;
    coordinates: { lat: number; lng: number };
  }>;
  route: any;
  farmerLocation: { lat: number; lng: number };
  crop: string;
  quantity: number;
  vehicle: string;
  totalMandisFound?: number;
  dataSource?: string;
}

const Dashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as DashboardState;

  if (!state) {
    navigate('/');
    return null;
  }

  const { bestMandi, results, crop, quantity, vehicle, totalMandisFound, dataSource } = state;

  const chartData = results.map(result => ({
    mandi: result.mandi,
    profit: result.profit,
    distance: result.distance
  }));

  const handleMapView = () => {
    navigate('/map', { state });
  };

  const handleNewSearch = () => {
    navigate('/');
  };

  const bestMandiResult = results.find(result => result.mandi === bestMandi);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📊 Profit Analysis Results</h1>
        <button style={styles.newSearchButton} onClick={handleNewSearch}>
          New Search
        </button>
      </div>

      <div style={styles.summarySection}>
        <h2 style={styles.summaryTitle}>Input Summary</h2>
        <div style={styles.summaryGrid}>
          <span style={styles.summaryItem}>Crop: {crop}</span>
          <span style={styles.summaryItem}>Quantity: {quantity} quintals</span>
          <span style={styles.summaryItem}>Vehicle: {vehicle}</span>
        </div>
      </div>

      <div style={styles.bestMandiSection}>
        <h2 style={styles.bestMandiTitle}>🏆 Recommended Mandi: {bestMandi}</h2>
        <p style={styles.bestMandiDescription}>
          This mandi offers the maximum net profit considering transport costs and distance.
        </p>
        {totalMandisFound && (
          <p style={styles.dataInfo}>
            📊 Found {totalMandisFound} mandis for {crop} | Source: {dataSource}
          </p>
        )}
        {bestMandiResult && (
          <div style={styles.bestMandiDetails}>
            <span style={styles.detailItem}>📍 {bestMandiResult.district}, {bestMandiResult.state}</span>
            <span style={styles.detailItem}>📏 {bestMandiResult.distance} km away</span>
            <span style={styles.detailItem}>💰 ₹{bestMandiResult.price}/quintal</span>
          </div>
        )}
      </div>

      <div style={styles.cardsContainer}>
        {results.slice(0, 5).map((result, index) => (
          <ProfitCard
            key={index}
            mandi={result.mandi}
            state={result.state}
            district={result.district}
            distance={result.distance}
            profit={result.profit}
            revenue={result.revenue}
            transportCost={result.transportCost}
            handlingCost={result.handlingCost}
            price={result.price}
            minPrice={result.minPrice}
            maxPrice={result.maxPrice}
            variety={result.variety}
            grade={result.grade}
            arrivalDate={result.arrivalDate}
            isBest={result.mandi === bestMandi}
          />
        ))}
      </div>

      <ProfitChart data={chartData} />

      <div style={styles.actions}>
        <button style={styles.secondaryButton} onClick={handleNewSearch}>
          New Search
        </button>
        <button style={styles.primaryButton} onClick={handleMapView}>
          View Route Map
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
    marginBottom: '30px',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    margin: 0,
    color: '#1f2937',
  },
  newSearchButton: {
    padding: '10px 20px',
    background: 'white',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'border-color 0.2s ease',
  },
  summarySection: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '30px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    border: '2px solid #e5e7eb',
  },
  summaryTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    margin: '0 0 15px 0',
    color: '#1f2937',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
  },
  summaryItem: {
    fontSize: '1rem',
    color: '#4b5563',
    fontWeight: '600',
  },
  bestMandiSection: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderRadius: '12px',
    padding: '30px',
    marginBottom: '30px',
    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
    textAlign: 'center' as const,
  },
  bestMandiTitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    margin: '0 0 10px 0',
  },
  bestMandiDescription: {
    fontSize: '1rem',
    color: 'rgba(255, 255, 255, 0.9)',
    maxWidth: '600px',
    margin: '0 auto',
  },
  dataInfo: {
    fontSize: '0.9rem',
    color: 'rgba(255, 255, 255, 0.8)',
    margin: '10px 0 0 0',
    fontWeight: '600',
  },
  bestMandiDetails: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginTop: '20px',
    flexWrap: 'wrap' as const,
  },
  detailItem: {
    fontSize: '0.9rem',
    background: 'rgba(255, 255, 255, 0.1)',
    padding: '5px 10px',
    borderRadius: '15px',
  },
  cardsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginTop: '30px',
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

export default Dashboard;
