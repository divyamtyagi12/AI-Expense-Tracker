// frontend/src/components/SpendingPieChart.jsx
// Recharts PieChart showing spending by category.

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Premium harmonious color palette
const COLORS = [
  '#4f46e5', // indigo (primary)
  '#06b6d4', // cyan
  '#f59e0b', // amber
  '#10b981', // emerald
  '#ef4444', // red
  '#8b5cf6', // violet
  '#f97316', // orange
  '#ec4899', // pink
];

const formatINR = (value) =>
  `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const { name, value } = payload[0];
    return (
      <div className="chart-tooltip">
        <p className="chart-tooltip__name">{name}</p>
        <p className="chart-tooltip__value">{formatINR(value)}</p>
      </div>
    );
  }
  return null;
}

function SpendingPieChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-empty">
        <span>No spending data for this month.</span>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={65}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
          nameKey="name"
        >
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={10}
          wrapperStyle={{ fontSize: '13px', paddingTop: '12px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default SpendingPieChart;
