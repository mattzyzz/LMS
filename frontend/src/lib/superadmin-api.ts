import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export const SUPERADMIN_TOKEN_KEY = 'superadmin_token';

export function getSuperadminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(SUPERADMIN_TOKEN_KEY);
}

export function setSuperadminToken(token: string) {
  sessionStorage.setItem(SUPERADMIN_TOKEN_KEY, token);
}

export function clearSuperadminToken() {
  sessionStorage.removeItem(SUPERADMIN_TOKEN_KEY);
}

const superadminApi = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

superadminApi.interceptors.request.use((config) => {
  const token = getSuperadminToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function superadminLogin(secret: string): Promise<string> {
  const { data } = await axios.post(`${API_BASE}/superadmin/auth`, { secret });
  setSuperadminToken(data.accessToken);
  return data.accessToken;
}

export default superadminApi;
