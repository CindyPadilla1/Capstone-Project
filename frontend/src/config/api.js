const PRODUCTION_DEFAULT = "https://aura-backend-ysqh.onrender.com";
export const API_BASE_URL =
    (import.meta.env.VITE_API_URL && String(import.meta.env.VITE_API_URL).trim()) ||
    (import.meta.env.DEV ? "http://localhost:4000" : PRODUCTION_DEFAULT);
