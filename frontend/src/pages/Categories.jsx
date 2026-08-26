// frontend/src/pages/Categories.jsx
// Manage custom categories: view all (default + custom), add new,
// rename custom ones, and delete custom ones.

import { useEffect, useState, useCallback } from 'react';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import ErrorBanner from '../components/ErrorBanner';
import {
  getCategories,
  createCategory,
  renameCategory,
  deleteCategory,
} from '../api/categoryApi';
import { getErrorMessage } from '../utils/getErrorMessage';

// ── Add-Category Form ────────────────────────────────────────────
function AddCategoryForm({ onAdded }) {
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setSubmitting(true);
    setError('');
    try {
      await createCategory({ name: trimmed });
      setName('');
      onAdded();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="cat-add-form" onSubmit={handleSubmit}>
      <h2 className="cat-add-form__title">Add Custom Category</h2>
      <div className="cat-add-form__row">
        <input
          id="new-category-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Subscriptions"
          maxLength={50}
          required
          className="input cat-add-form__input"
          aria-label="New category name"
        />
        <button
          type="submit"
          disabled={submitting || !name.trim()}
          className="btn btn--primary"
        >
          {submitting ? 'Adding…' : '+ Add'}
        </button>
      </div>
      {error && <p className="form-error" style={{ marginTop: '0.5rem' }}>{error}</p>}
    </form>
  );
}

// ── Single Category Row ──────────────────────────────────────────
function CategoryRow({ category, onChanged }) {
  const [renaming, setRenaming] = useState(false);
  const [nameInput, setNameInput] = useState(category.name);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleRename(e) {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed === category.name) {
      setRenaming(false);
      return;
    }
    setSaving(true);
    setError('');
    try {
      await renameCategory(category.id, trimmed);
      setRenaming(false);
      onChanged();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete category "${category.name}"? Expenses using it will remain but may need re-categorising.`)) return;
    setSaving(true);
    setError('');
    try {
      await deleteCategory(category.id);
      onChanged();
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  }

  return (
    <li className={`cat-row${category.is_default ? ' cat-row--default' : ''}`}>
      <div className="cat-row__left">
        {category.is_default ? (
          <span className="cat-default-badge">Default</span>
        ) : (
          <span className="cat-custom-badge">Custom</span>
        )}

        {renaming ? (
          <form className="cat-row__rename-form" onSubmit={handleRename}>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="input cat-row__rename-input"
              maxLength={50}
              autoFocus
              aria-label="Rename category"
            />
            <button type="submit" disabled={saving} className="btn btn--sm btn--primary">
              {saving ? '…' : 'Save'}
            </button>
            <button
              type="button"
              className="btn btn--sm btn--ghost"
              onClick={() => { setRenaming(false); setNameInput(category.name); setError(''); }}
            >
              Cancel
            </button>
          </form>
        ) : (
          <span className="cat-row__name">{category.name}</span>
        )}
      </div>

      {!category.is_default && !renaming && (
        <div className="cat-row__actions">
          <button
            className="btn btn--xs btn--ghost"
            onClick={() => { setRenaming(true); setNameInput(category.name); }}
            aria-label={`Rename ${category.name}`}
          >
            Rename
          </button>
          <button
            className="btn btn--xs btn--ghost btn--danger-text"
            onClick={handleDelete}
            disabled={saving}
            aria-label={`Delete ${category.name}`}
          >
            Delete
          </button>
        </div>
      )}

      {error && <p className="form-error cat-row__error">{error}</p>}
    </li>
  );
}

// ── Page ─────────────────────────────────────────────────────────
function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getCategories();
      setCategories(res.data.data.categories);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const defaults = categories.filter((c) => c.is_default);
  const customs = categories.filter((c) => !c.is_default);

  return (
    <div className="categories-page">
      <Navbar />
      <div className="categories-container">
        <div className="categories-header">
          <div>
            <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>Categories</h1>
            <p className="dashboard-subtitle">
              Manage your spending categories. Default categories are shared by everyone and cannot be modified.
            </p>
          </div>
        </div>

        <AddCategoryForm onAdded={loadCategories} />

        <ErrorBanner message={error} />

        {loading ? (
          <Loader label="Loading categories…" />
        ) : (
          <div className="cat-lists">
            {/* Custom categories */}
            <div className="cat-section">
              <h2 className="cat-section__title">
                Your Custom Categories
                <span className="cat-section__count">{customs.length}</span>
              </h2>
              {customs.length === 0 ? (
                <div className="cat-empty">
                  You haven't created any custom categories yet. Use the form above to add one.
                </div>
              ) : (
                <ul className="cat-list">
                  {customs.map((cat) => (
                    <CategoryRow key={cat.id} category={cat} onChanged={loadCategories} />
                  ))}
                </ul>
              )}
            </div>

            {/* Default categories */}
            <div className="cat-section">
              <h2 className="cat-section__title">
                Default Categories
                <span className="cat-section__count">{defaults.length}</span>
              </h2>
              <ul className="cat-list">
                {defaults.map((cat) => (
                  <CategoryRow key={cat.id} category={cat} onChanged={loadCategories} />
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Categories;
