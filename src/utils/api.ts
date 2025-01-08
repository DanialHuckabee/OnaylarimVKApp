export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7242'

export const getApiUrl = (path: string) => `${API_BASE_URL}${path}` 