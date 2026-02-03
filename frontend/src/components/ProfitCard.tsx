import React from 'react';

interface ProfitCardProps {
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
  isBest: boolean;
}

const ProfitCard: React.FC<ProfitCardProps> = ({
  mandi,
  state,
  district,
  distance,
  profit,
  revenue,
  transportCost,
  handlingCost,
  price,
  minPrice,
  maxPrice,
  variety,
  grade,
  arrivalDate,
  isBest
}) => {
  return (
    <div style={isBest ? styles.cardBest : styles.card}>
      <div style={styles.header}>
        <div>
          <h3 style={styles.mandiName}>{mandi}</h3>
          {(state || district) && (
            <p style={styles.location}>
              {district && `${district}`}{state && district && ', '}{state}
            </p>
          )}
        </div>
        {isBest && <span style={styles.bestBadge}>BEST</span>}
      </div>
      
      <div style={isBest ? { ...styles.profitSection, background: 'rgba(255, 255, 255, 0.1)' } : styles.profitSection}>
        <div style={styles.profitLabel}>Net Profit</div>
        <div style={isBest ? styles.profitValueBest : styles.profitValue}>
          ₹{profit.toLocaleString('en-IN')}
        </div>
      </div>

      <div style={styles.detailsSection}>
        <div style={styles.detailRow}>
          <span style={styles.label}>Revenue:</span>
          <span style={styles.value}>₹{revenue.toLocaleString('en-IN')}</span>
        </div>
        <div style={styles.detailRow}>
          <span style={styles.label}>Transport Cost:</span>
          <span style={styles.value}>₹{transportCost.toLocaleString('en-IN')}</span>
        </div>
        <div style={styles.detailRow}>
          <span style={styles.label}>Handling Cost:</span>
          <span style={styles.value}>₹{handlingCost.toLocaleString('en-IN')}</span>
        </div>
        <div style={styles.detailRow}>
          <span style={styles.label}>Distance:</span>
          <span style={styles.value}>{distance} km</span>
        </div>
        <div style={styles.detailRow}>
          <span style={styles.label}>Price/Quintal:</span>
          <span style={styles.value}>₹{price.toLocaleString('en-IN')}</span>
        </div>
        {(minPrice || maxPrice) && (
          <div style={styles.detailRow}>
            <span style={styles.label}>Price Range:</span>
            <span style={styles.value}>
              ₹{minPrice?.toLocaleString('en-IN')} - ₹{maxPrice?.toLocaleString('en-IN')}
            </span>
          </div>
        )}
        {variety && (
          <div style={styles.detailRow}>
            <span style={styles.label}>Variety:</span>
            <span style={styles.value}>{variety}</span>
          </div>
        )}
        {grade && (
          <div style={styles.detailRow}>
            <span style={styles.label}>Grade:</span>
            <span style={styles.value}>{grade}</span>
          </div>
        )}
        {arrivalDate && (
          <div style={styles.detailRow}>
            <span style={styles.label}>Arrival Date:</span>
            <span style={styles.value}>{arrivalDate}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    border: '2px solid #e5e7eb',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  cardBest: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
    border: '2px solid #667eea',
    transform: 'scale(1.02)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  mandiName: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    margin: '0 0 5px 0',
    color: 'inherit',
  },
  location: {
    fontSize: '0.9rem',
    margin: '0',
    opacity: 0.8,
  },
  bestBadge: {
    background: '#ffd700',
    color: '#333',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
  },
  profitSection: {
    textAlign: 'center' as const,
    marginBottom: '15px',
    padding: '15px',
    background: '#f8fafc',
    borderRadius: '8px',
  },
  profitLabel: {
    fontSize: '0.9rem',
    marginBottom: '5px',
    opacity: 0.8,
  },
  profitValue: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#059669',
  },
  profitValueBest: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: 'white',
  },
  detailsSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '4px 0',
    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
  },
  label: {
    fontSize: '0.85rem',
    opacity: 0.7,
  },
  value: {
    fontSize: '0.9rem',
    fontWeight: '600',
  },
};

export default ProfitCard;
