declare global {
  interface Window {
    APP_CONFIG?: { apiUrl?: string };
  }
}

export const API_BASE_URL: string =
  window.APP_CONFIG?.apiUrl ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:1111';
