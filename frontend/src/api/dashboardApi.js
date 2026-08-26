// frontend/src/api/dashboardApi.js

import api from './axios';

export const getDashboardData = (month, year) =>
  api.get('/dashboard', { params: { month, year } });
