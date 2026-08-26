// frontend/src/components/CategorySelect.jsx
// Fetches and renders the category dropdown. Used by ExpenseForm and
// ExpenseFilters so we don't duplicate the fetch/render logic.

import { useEffect, useState } from 'react';
import { getCategories } from '../api/categoryApi';

function CategorySelect({ value, onChange, includeAllOption = false, id = 'category' }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.data.data.categories))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <select
      id={id}
      value={value}
      onChange={onChange}
      disabled={loading}
      className="input"
    >
      {includeAllOption && <option value="">All categories</option>}
      {!includeAllOption && <option value="">Select a category</option>}
      {categories.map((cat) => (
        <option key={cat.id} value={cat.id}>
          {cat.name}
        </option>
      ))}
    </select>
  );
}

export default CategorySelect;
