// frontend/src/components/ExpenseFilters.jsx

import CategorySelect from './CategorySelect';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function ExpenseFilters({ filters, onChange }) {
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2];
  const hasFilters = filters.month || filters.year || filters.category;

  return (
    <div className="filters-bar">
      <div className="filters-bar__fields">
        <div className="filters-bar__field">
          <label className="form-label" htmlFor="filterMonth">Month</label>
          <select
            id="filterMonth"
            value={filters.month}
            onChange={(e) => onChange({ ...filters, month: e.target.value })}
            className="input filters-bar__select"
          >
            <option value="">All months</option>
            {MONTHS.map((name, idx) => (
              <option key={name} value={idx + 1}>{name}</option>
            ))}
          </select>
        </div>

        <div className="filters-bar__field">
          <label className="form-label" htmlFor="filterYear">Year</label>
          <select
            id="filterYear"
            value={filters.year}
            onChange={(e) => onChange({ ...filters, year: e.target.value })}
            className="input filters-bar__select"
          >
            <option value="">All years</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div className="filters-bar__field">
          <label className="form-label" htmlFor="filterCategory">Category</label>
          <CategorySelect
            id="filterCategory"
            value={filters.category}
            includeAllOption
            onChange={(e) => onChange({ ...filters, category: e.target.value })}
          />
        </div>
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={() => onChange({ month: '', year: '', category: '' })}
          className="btn btn--ghost btn--sm filters-bar__clear"
        >
          ✕ Clear filters
        </button>
      )}
    </div>
  );
}

export default ExpenseFilters;
