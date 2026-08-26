// frontend/src/pages/Dashboard.jsx
// Full dashboard with summary cards, budget widget, charts, and recent expenses.

import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import ErrorBanner from '../components/ErrorBanner';
import SummaryCard from '../components/SummaryCard';
import BudgetWidget from '../components/BudgetWidget';
import SpendingPieChart from '../components/SpendingPieChart';
import SpendingLineChart from '../components/SpendingLineChart';
import RecentExpenses from '../components/RecentExpenses';
import { getDashboardData } from '../api/dashboardApi';
import { getErrorMessage } from '../utils/getErrorMessage';
import { useAuth } from '../context/AuthContext';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatINR(amount) {
  return `₹${Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

function MonthYearPicker({ month, year, onChange }) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <div className="month-picker">
      <select
        id="dashboard-month"
        value={month}
        onChange={(e) => onChange(Number(e.target.value), year)}
        className="input month-picker__select"
        aria-label="Select month"
      >
        {MONTH_NAMES.map((name, idx) => (
          <option key={name} value={idx + 1}>
            {name}
          </option>
        ))}
      </select>
      <select
        id="dashboard-year"
        value={year}
        onChange={(e) => onChange(month, Number(e.target.value))}
        className="input month-picker__select"
        aria-label="Select year"
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getDashboardData(month, year);
      setData(res.data.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  function handlePeriodChange(newMonth, newYear) {
    setMonth(newMonth);
    setYear(newYear);
  }

  const isOverBudget = data?.budget != null && data?.totalSpent > data?.budget;

  return (
    <div className="dashboard-page">
      <Navbar />

      <div className="dashboard-container">
        {/* ── Header ─────────────────────────────────────── */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">
              Hello, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="dashboard-subtitle">
              Here's your financial overview for {MONTH_NAMES[month - 1]} {year}.
            </p>
          </div>
          <div className="dashboard-header__actions">
            <MonthYearPicker month={month} year={year} onChange={handlePeriodChange} />
            <Link to="/expenses" className="btn btn--primary">
              + Add Expense
            </Link>
          </div>
        </div>

        <ErrorBanner message={error} />

        {loading ? (
          <div className="dashboard-loader">
            <Loader label="Loading dashboard…" />
          </div>
        ) : data ? (
          <>
            {/* ── Summary Cards ───────────────────────────── */}
            <div className="summary-grid">
              <SummaryCard
                icon="💸"
                label="Total Spent"
                value={formatINR(data.totalSpent)}
                accent="#4f46e5"
              />
              <SummaryCard
                icon="🧾"
                label="Transactions"
                value={data.expenseCount}
                subtext={data.expenseCount === 1 ? 'expense' : 'expenses'}
                accent="#06b6d4"
              />
              <SummaryCard
                icon="🏆"
                label="Top Category"
                value={data.topCategory || '—'}
                subtext={data.topCategory ? 'highest spending' : 'no data yet'}
                accent="#f59e0b"
              />
              <SummaryCard
                icon={isOverBudget ? '🚨' : '💰'}
                label="Budget Remaining"
                value={
                  data.budget != null
                    ? formatINR(Math.max(0, data.remaining))
                    : '—'
                }
                subtext={
                  data.budget != null
                    ? isOverBudget
                      ? `₹${Math.abs(data.remaining).toLocaleString('en-IN', { maximumFractionDigits: 2 })} over budget`
                      : `of ${formatINR(data.budget)} budget`
                    : 'no budget set'
                }
                accent={isOverBudget ? '#ef4444' : '#10b981'}
                danger={isOverBudget}
              />
            </div>

            {/* ── Budget Widget ────────────────────────────── */}
            <BudgetWidget
              month={month}
              year={year}
              budget={data.budget}
              spent={data.totalSpent}
              onUpdated={loadDashboard}
            />

            {/* ── Charts Row ──────────────────────────────── */}
            <div className="charts-grid">
              <div className="chart-card">
                <h2 className="chart-card__title">Spending by Category</h2>
                <SpendingPieChart data={data.byCategory} />
              </div>
              <div className="chart-card">
                <h2 className="chart-card__title">Daily Spending</h2>
                <SpendingLineChart data={data.dailyTotals} />
              </div>
            </div>

            {/* ── Recent Expenses ──────────────────────────── */}
            <div className="recent-card">
              <div className="recent-card__header">
                <h2 className="chart-card__title">Recent Expenses</h2>
                <Link to="/expenses" className="recent-card__link">
                  View all →
                </Link>
              </div>
              <RecentExpenses expenses={data.recentExpenses} />
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default Dashboard;
