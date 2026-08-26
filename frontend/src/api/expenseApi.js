// frontend/src/api/expenseApi.js

import api from './axios';

// filters: { month, year, category } — all optional
export function getExpenses(filters = {}) {
  const params = {};
  if (filters.month) params.month = filters.month;
  if (filters.year) params.year = filters.year;
  if (filters.category) params.category = filters.category;
  return api.get('/expenses', { params });
}

export function createExpense({ categoryId, amount, note, expenseDate }) {
  return api.post('/expenses', { categoryId, amount, note, expenseDate });
}

export function updateExpense(id, { categoryId, amount, note, expenseDate }) {
  return api.put(`/expenses/${id}`, { categoryId, amount, note, expenseDate });
}

export function deleteExpense(id) {
  return api.delete(`/expenses/${id}`);
}
