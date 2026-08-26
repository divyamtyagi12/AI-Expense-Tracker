// frontend/src/components/ExpenseTable.jsx

import EmptyState from './EmptyState';

function formatCurrency(amount) {
  return `₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(isoDate) {
  return new Date(isoDate + 'T00:00:00').toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// Consistent category color palette (matches dashboard charts)
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
  const color = CATEGORY_COLORS[name] || '#64748b';
  return (
    <span
      className="category-badge"
      style={{ '--badge-color': color }}
    >
      {name}
    </span>
  );
}

function ExpenseTable({ expenses, onEdit, onDelete }) {
  if (expenses.length === 0) {
    return <EmptyState message="No expenses found. Add your first expense above." />;
  }

  return (
    <div className="expense-table-wrapper">
      <table className="expense-table">
        <thead>
          <tr>
            <th className="expense-table__th">Date</th>
            <th className="expense-table__th">Category</th>
            <th className="expense-table__th">Note</th>
            <th className="expense-table__th expense-table__th--right">Amount</th>
            <th className="expense-table__th expense-table__th--right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((exp) => (
            <tr key={exp.id} className="expense-table__row">
              <td className="expense-table__td expense-table__td--date">
                {formatDate(exp.expense_date)}
              </td>
              <td className="expense-table__td">
                <CategoryBadge name={exp.category_name} />
              </td>
              <td className="expense-table__td expense-table__td--note">
                {exp.note || <span className="expense-table__empty">—</span>}
              </td>
              <td className="expense-table__td expense-table__td--amount">
                {formatCurrency(exp.amount)}
              </td>
              <td className="expense-table__td expense-table__td--actions">
                <button
                  onClick={() => onEdit(exp)}
                  className="btn btn--xs btn--ghost"
                  aria-label={`Edit expense: ${exp.note || exp.category_name}`}
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(exp)}
                  className="btn btn--xs btn--ghost btn--danger-text"
                  aria-label={`Delete expense: ${exp.note || exp.category_name}`}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ExpenseTable;
