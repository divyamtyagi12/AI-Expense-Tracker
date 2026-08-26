// frontend/src/api/exportApi.js
// Downloads expenses as a CSV file by triggering a browser save dialog.

import api from './axios';

/**
 * Fetches the CSV from the backend and triggers a browser download.
 * @param {object} filters - { month, year, category }
 */
export async function downloadExpensesCsv(filters = {}) {
  const params = {};
  if (filters.month) params.month = filters.month;
  if (filters.year) params.year = filters.year;
  if (filters.category) params.category = filters.category;

  const res = await api.get('/export/expenses.csv', {
    params,
    responseType: 'blob',
  });

  // Derive filename from Content-Disposition header or build a default
  const disposition = res.headers['content-disposition'] || '';
  const match = disposition.match(/filename="?([^"]+)"?/);
  const filename = match ? match[1] : 'expenses.csv';

  // Create a temporary link and click it to trigger the download
  const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
