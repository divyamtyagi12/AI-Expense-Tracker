// frontend/src/api/aiApi.js

import api from './axios';

export const analyzeSpending = (month, year) =>
  api.post('/ai/analyze', { month, year });

export const askQuestion = (question, month, year) =>
  api.post('/ai/ask', { question, month, year });

export const getAiHistory = (limit = 20) =>
  api.get('/ai/history', { params: { limit } });

export const clearAiHistory = () =>
  api.delete('/ai/history');
