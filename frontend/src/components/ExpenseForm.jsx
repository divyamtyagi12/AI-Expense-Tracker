// frontend/src/components/ExpenseForm.jsx
// Handles both "add new expense" and "edit existing expense" — if
// `editingExpense` is passed, the form pre-fills and submits an update
// instead of a create.

import { useEffect, useState } from 'react';
import CategorySelect from './CategorySelect';
import ErrorBanner from './ErrorBanner';
import { createExpense, updateExpense } from '../api/expenseApi';
import { getErrorMessage } from '../utils/getErrorMessage';

const emptyForm = { categoryId: '', amount: '', note: '', expenseDate: '' };

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function ExpenseForm({ editingExpense, onSaved, onCancelEdit }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // When editingExpense changes (user clicked "Edit" on a row), populate the form.
  useEffect(() => {
    if (editingExpense) {
      setForm({
        categoryId: String(editingExpense.category_id),
        amount: String(editingExpense.amount),
        note: editingExpense.note || '',
        expenseDate: editingExpense.expense_date.slice(0, 10),
      });
    } else {
      setForm({ ...emptyForm, expenseDate: todayISO() });
    }
  }, [editingExpense]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.categoryId) {
      setError('Please select a category');
      return;
    }

    setSubmitting(true);
    const payload = {
      categoryId: Number(form.categoryId),
      amount: Number(form.amount),
      note: form.note.trim() || undefined,
      expenseDate: form.expenseDate,
    };

    try {
      if (editingExpense) {
        await updateExpense(editingExpense.id, payload);
      } else {
        await createExpense(payload);
      }
      setForm({ ...emptyForm, expenseDate: todayISO() });
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card expense-form">
      <h2 className="expense-form__title">
        {editingExpense ? '✏️ Edit Expense' : '+ Add Expense'}
      </h2>

      <ErrorBanner message={error} />

      <div className="expense-form__grid">
        <div className="form-group">
          <label className="form-label" htmlFor="categoryId">Category</label>
          <CategorySelect
            id="categoryId"
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="amount">Amount (₹)</label>
          <input
            id="amount"
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            required
            value={form.amount}
            onChange={handleChange}
            className="input"
            placeholder="0.00"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="expenseDate">Date</label>
          <input
            id="expenseDate"
            name="expenseDate"
            type="date"
            required
            value={form.expenseDate}
            onChange={handleChange}
            className="input"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="note">Note (optional)</label>
          <input
            id="note"
            name="note"
            type="text"
            maxLength={255}
            placeholder="e.g. Lunch with friends"
            value={form.note}
            onChange={handleChange}
            className="input"
          />
        </div>
      </div>

      <div className="expense-form__actions">
        <button type="submit" disabled={submitting} className="btn btn--primary">
          {submitting ? 'Saving…' : editingExpense ? 'Update Expense' : 'Add Expense'}
        </button>
        {editingExpense && (
          <button type="button" onClick={onCancelEdit} className="btn btn--outline">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default ExpenseForm;
