// frontend/src/api/budgetApi.js

import api from './axios';

export const getBudget = (month, year) =>
  api.get('/budgets', { params: { month, year } });

export const upsertBudget = (month, year, amount) =>
  api.put('/budgets', { month, year, amount });

export const deleteBudget = (month, year) =>
  api.delete('/budgets', { params: { month, year } });
