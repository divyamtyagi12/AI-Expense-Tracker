// frontend/src/components/SpendingLineChart.jsx
// Recharts LineChart showing daily spending for the selected month.

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

const formatINR = (value) =>
  `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const formatDate = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00'); // force local time parse
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="chart-tooltip__name">{formatDate(label)}</p>
        <p className="chart-tooltip__value">{formatINR(payload[0].value)}</p>
      </div>
    );
  }
  return null;
}

function SpendingLineChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-empty">
        <span>No daily spending data for this month.</span>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`}
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          width={50}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="total"
          stroke="#4f46e5"
          strokeWidth={2.5}
          fill="url(#spendGradient)"
          dot={{ r: 3, fill: '#4f46e5', strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default SpendingLineChart;
