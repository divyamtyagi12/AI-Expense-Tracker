// frontend/src/components/RecentExpenses.jsx
// Compact table-style list of the most recent expenses.

const formatINR = (amount) =>
  `₹${Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const formatDate = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

// Consistent category colors (must match SpendingPieChart order)
const CATEGORY_COLORS = {
  Food: '#4f46e5',
  Transport: '#06b6d4',
  Shopping: '#f59e0b',
  Entertainment: '#10b981',
  'Bills & Utilities': '#ef4444',
  Health: '#8b5cf6',
  Other: '#94a3b8',
};

function CategoryBadge({ name }) {
  const color = CATEGORY_COLORS[name] || '#94a3b8';
  return (
    <span
      className="category-badge"
      style={{ '--badge-color': color }}
    >
      {name}
    </span>
  );
}

function RecentExpenses({ expenses }) {
  if (!expenses || expenses.length === 0) {
    return (
      <div className="recent-empty">
        <span>No expenses recorded this month.</span>
      </div>
    );
  }

  return (
    <ul className="recent-list">
      {expenses.map((exp) => (
        <li key={exp.id} className="recent-item">
          <div className="recent-item__left">
            <CategoryBadge name={exp.category_name} />
            {exp.note && <span className="recent-item__note">{exp.note}</span>}
          </div>
          <div className="recent-item__right">
            <span className="recent-item__amount">{formatINR(exp.amount)}</span>
            <span className="recent-item__date">{formatDate(exp.expense_date)}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default RecentExpenses;
