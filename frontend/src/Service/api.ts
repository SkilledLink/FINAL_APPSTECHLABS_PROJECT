// src/api/api.ts
import axios from 'axios';

const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ||
  window.location.origin;   // ← same-origin: the tunnel URL

export const api = axios.create({
  baseURL: API_URL,
});