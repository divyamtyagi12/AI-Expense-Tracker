// frontend/src/api/categoryApi.js

import api from './axios';

export function getCategories() {
  return api.get('/categories');
}

export function createCategory({ name }) {
  return api.post('/categories', { name });
}

export function renameCategory(id, name) {
  return api.patch(`/categories/${id}`, { name });
}

export function deleteCategory(id) {
  return api.delete(`/categories/${id}`);
}
