// frontend/src/components/BudgetWidget.jsx
// Shows the monthly budget vs. spent with a progress bar.
// Allows inline editing to set or update the budget.

import { useState } from 'react';
import { upsertBudget, deleteBudget } from '../api/budgetApi';
import { getErrorMessage } from '../utils/getErrorMessage';

function BudgetWidget({ month, year, budget, spent, onUpdated }) {
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState(budget != null ? String(budget) : '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const percentage = budget != null && budget > 0
    ? Math.min((spent / budget) * 100, 100)
    : 0;

  const isWarning = percentage >= 80 && percentage < 100;
  const isDanger = budget != null && spent > budget;

  const barColor = isDanger
    ? 'var(--color-danger)'
    : isWarning
    ? '#f59e0b'
    : 'var(--color-primary)';

  async function handleSave(e) {
    e.preventDefault();
    const amount = parseFloat(inputVal);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await upsertBudget(month, year, amount);
      setEditing(false);
      onUpdated();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Remove budget for this month?')) return;
    setSaving(true);
    setError('');
    try {
      await deleteBudget(month, year);
      setEditing(false);
      setInputVal('');
      onUpdated();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (budget == null && !editing) {
    return (
      <div className="budget-widget budget-widget--empty">
        <p className="budget-widget__empty-text">No budget set for this month.</p>
        <button
          className="btn btn--sm btn--outline"
          onClick={() => { setEditing(true); setInputVal(''); }}
        >
          + Set Budget
        </button>
      </div>
    );
  }

  return (
    <div className={`budget-widget${isDanger ? ' budget-widget--danger' : isWarning ? ' budget-widget--warning' : ''}`}>
      <div className="budget-widget__header">
        <span className="budget-widget__title">Monthly Budget</span>
        {!editing && (
          <div className="budget-widget__actions">
            <button
              className="btn btn--xs btn--ghost"
              onClick={() => { setEditing(true); setInputVal(String(budget)); }}
            >
              Edit
            </button>
            <button className="btn btn--xs btn--ghost btn--danger-text" onClick={handleDelete}>
              Remove
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <form className="budget-widget__form" onSubmit={handleSave}>
          <div className="budget-widget__form-row">
            <span className="budget-widget__currency">₹</span>
            <input
              id="budget-amount-input"
              type="number"
              min="1"
              step="0.01"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="input budget-widget__input"
              placeholder="e.g. 15000"
              autoFocus
            />
            <button type="submit" className="btn btn--sm btn--primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              className="btn btn--sm btn--ghost"
              onClick={() => { setEditing(false); setError(''); }}
            >
              Cancel
            </button>
          </div>
          {error && <p className="budget-widget__error">{error}</p>}
        </form>
      ) : (
        <>
          <div className="budget-widget__amounts">
            <span className="budget-widget__spent">
              ₹{Number(spent).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              <em> spent</em>
            </span>
            <span className="budget-widget__of">of</span>
            <span className="budget-widget__budget">
              ₹{Number(budget).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="budget-progress">
            <div
              className="budget-progress__bar"
              style={{ width: `${percentage}%`, background: barColor }}
            />
          </div>

          <div className="budget-widget__footer">
            {isDanger ? (
              <span className="budget-widget__status budget-widget__status--danger">
                ⚠ Over budget by ₹{Math.abs(budget - spent).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
            ) : (
              <span className="budget-widget__status">
                ₹{(budget - spent).toLocaleString('en-IN', { maximumFractionDigits: 2 })} remaining ({(100 - percentage).toFixed(0)}%)
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default BudgetWidget;
