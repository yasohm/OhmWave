export const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
export const apiUrl = (path) => `${API_URL}${path}`;
export const apiFetch = (path, options) => fetch(apiUrl(path), options);
