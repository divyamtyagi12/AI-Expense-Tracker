// frontend/src/pages/Expenses.jsx

import { useEffect, useState, useCallback } from 'react';
import Navbar from '../components/Navbar';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseFilters from '../components/ExpenseFilters';
import ExpenseTable from '../components/ExpenseTable';
import Loader from '../components/Loader';
import ErrorBanner from '../components/ErrorBanner';
import ExportButton from '../components/ExportButton';
import { getExpenses, deleteExpense as deleteExpenseApi } from '../api/expenseApi';
import { getErrorMessage } from '../utils/getErrorMessage';

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ month: '', year: '', category: '' });
  const [editingExpense, setEditingExpense] = useState(null);

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getExpenses(filters);
      setExpenses(res.data.data.expenses);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  function handleSaved() {
    setEditingExpense(null);
    loadExpenses();
  }

  function handleEdit(expense) {
    setEditingExpense(expense);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDelete(expense) {
    const confirmed = window.confirm(
      `Delete this ${expense.category_name} expense of ₹${expense.amount}? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await deleteExpenseApi(expense.id);
      loadExpenses();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="expenses-page">
      <Navbar />
      <div className="expenses-container">
        {/* Page header */}
        <div className="expenses-header">
          <h1 className="page-title" style={{ marginBottom: 0 }}>Expenses</h1>
          <ExportButton filters={filters} />
        </div>

        <ExpenseForm
          editingExpense={editingExpense}
          onSaved={handleSaved}
          onCancelEdit={() => setEditingExpense(null)}
        />

        <ExpenseFilters filters={filters} onChange={setFilters} />

        <ErrorBanner message={error} />

        {loading ? (
          <Loader label="Loading expenses…" />
        ) : (
          <ExpenseTable expenses={expenses} onEdit={handleEdit} onDelete={handleDelete} />
        )}
      </div>
    </div>
  );
}

export default Expenses;
