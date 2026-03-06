import React from 'react';
import { useTranslation } from 'react-i18next';

interface ProfitCardProps {
  mandi: string;
  state?: string;
  district?: string;
  distance: number;
  profit: number;
  revenue: number;
  transportCost: number;
  fuelCost: number;
  handlingCost: number;
  dieselPrice: number;
  price: number;
  perishabilityRisk?: "Low" | "High";
  perishabilityWarning?: string | null;
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
  fuelCost,
  handlingCost,
  dieselPrice,
  price,
  perishabilityRisk,
  perishabilityWarning,
  minPrice,
  maxPrice,
  variety,
  grade,
  arrivalDate,
  isBest
}) => {
  const { t } = useTranslation();
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
        <div style={styles.badges}>
          {perishabilityRisk && (
            <span
              style={{
                ...styles.riskBadge,
                background: perishabilityRisk === 'High' ? '#fee2e2' : '#dcfce7',
                color: perishabilityRisk === 'High' ? '#b91c1c' : '#166534',
                borderColor: perishabilityRisk === 'High' ? '#fecaca' : '#bbf7d0'
              }}
              title={perishabilityWarning || undefined}
            >
              {perishabilityRisk === 'High' ? 'HIGH RISK' : 'LOW RISK'}
            </span>
          )}
          {isBest && <span style={styles.bestBadge}>BEST</span>}
        </div>
      </div>

      {perishabilityWarning && (
        <div style={styles.warningBox}>
          <span style={styles.warningText}>⚠️ {perishabilityWarning}</span>
        </div>
      )}
      
      <div style={isBest ? { ...styles.profitSection, background: 'rgba(255, 255, 255, 0.1)' } : styles.profitSection}>
        <div style={styles.profitLabel}>{t('dashboard.profitDetails.netProfit')}</div>
        <div style={isBest ? styles.profitValueBest : styles.profitValue}>
          ₹{profit.toLocaleString('en-IN')}
        </div>
      </div>

      <div style={styles.detailsSection}>
        <div style={styles.detailRow}>
          <span style={styles.label}>{t('dashboard.profitDetails.revenue')}:</span>
          <span style={styles.value}>₹{revenue.toLocaleString('en-IN')}</span>
        </div>
        <div style={styles.detailRow}>
          <span style={styles.label}>{t('dashboard.profitDetails.transportCost')}:</span>
          <span style={styles.value}>₹{transportCost.toLocaleString('en-IN')}</span>
        </div>
        <div style={styles.detailRow}>
          <span style={styles.label}>{t('dashboard.profitDetails.fuelCost')}:</span>
          <span style={styles.value}>₹{fuelCost.toLocaleString('en-IN')}</span>
        </div>
        <div style={styles.detailRow}>
          <span style={styles.label}>{t('dashboard.profitDetails.dieselPrice')}:</span>
          <span style={styles.value}>₹{dieselPrice}/liter</span>
        </div>
        <div style={styles.detailRow}>
          <span style={styles.label}>{t('dashboard.profitDetails.handlingCost')}:</span>
          <span style={styles.value}>₹{handlingCost.toLocaleString('en-IN')}</span>
        </div>
        <div style={styles.detailRow}>
          <span style={styles.label}>{t('dashboard.profitDetails.distance')}:</span>
          <span style={styles.value}>{distance} km</span>
        </div>
        <div style={styles.detailRow}>
          <span style={styles.label}>{t('dashboard.profitDetails.price')}/Quintal:</span>
          <span style={styles.value}>₹{price.toLocaleString('en-IN')}</span>
        </div>
        {(minPrice || maxPrice) && (
          <div style={styles.detailRow}>
            <span style={styles.label}>{t('dashboard.profitDetails.minPrice')} - {t('dashboard.profitDetails.maxPrice')}:</span>
            <span style={styles.value}>
              ₹{minPrice?.toLocaleString('en-IN')} - ₹{maxPrice?.toLocaleString('en-IN')}
            </span>
          </div>
        )}
        {variety && (
          <div style={styles.detailRow}>
            <span style={styles.label}>{t('dashboard.profitDetails.variety')}:</span>
            <span style={styles.value}>{variety}</span>
          </div>
        )}
        {grade && (
          <div style={styles.detailRow}>
            <span style={styles.label}>{t('dashboard.profitDetails.grade')}:</span>
            <span style={styles.value}>{grade}</span>
          </div>
        )}
        {arrivalDate && (
          <div style={styles.detailRow}>
            <span style={styles.label}>{t('dashboard.profitDetails.arrivalDate')}:</span>
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
  badges: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
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
  riskBadge: {
    padding: '4px 10px',
    borderRadius: '999px',
    fontSize: '0.7rem',
    fontWeight: '800',
    border: '1px solid',
    letterSpacing: '0.02em',
    whiteSpace: 'nowrap' as const,
  },
  warningBox: {
    marginBottom: '12px',
    padding: '10px 12px',
    borderRadius: '10px',
    background: 'rgba(245, 158, 11, 0.15)',
    border: '1px solid rgba(245, 158, 11, 0.3)',
  },
  warningText: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: 'inherit',
    opacity: 0.95,
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
