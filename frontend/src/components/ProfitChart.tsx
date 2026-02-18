import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface ProfitChartProps {
  data: Array<{
    mandi: string;
    profit: number;
    distance: number;
  }>;
}

const ProfitChart: React.FC<ProfitChartProps> = ({ data }) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'white',
          padding: '10px',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{label}</p>
          <p style={{ margin: '0', color: '#059669' }}>
            Profit: ₹{payload[0].value.toLocaleString('en-IN')}
          </p>
          <p style={{ margin: '0', color: '#6b7280' }}>
            Distance: {payload[0].payload.distance} km
          </p>
        </div>
      );
    }
    return null;
  };

  // Sort data by profit (descending) and take top 10
  const sortedData = [...data].sort((a, b) => b.profit - a.profit).slice(0, 10);

  // Generate colors based on profit values
  const getBarColor = (profit: number, index: number) => {
    if (index === 0) return '#667eea'; // Best profit - highlight color
    const maxProfit = sortedData[0]?.profit || 0;
    const ratio = profit / maxProfit;
    const green = Math.floor(255 * ratio);
    const red = Math.floor(255 * (1 - ratio));
    return `rgb(${red}, ${green}, 100)`;
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Profit Comparison</h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={sortedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="mandi" 
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="profit" radius={[8, 8, 0, 0]}>
            {sortedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.profit, index)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const styles = {
  container: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    border: '2px solid #e5e7eb',
  },
  title: {
    margin: '0 0 20px 0',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center' as const,
  },
};

export default ProfitChart;
