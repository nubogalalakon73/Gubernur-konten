// Helpers for admin auth (localStorage bearer token)
import axios from "axios";
import { API } from "@/lib/api";

const KEY = "gk_admin_token";

export function getAdminToken() {
  try { return localStorage.getItem(KEY) || ""; } catch { return ""; }
}

export function setAdminToken(t) {
  try { localStorage.setItem(KEY, t); } catch {}
}

export function clearAdminToken() {
  try { localStorage.removeItem(KEY); } catch {}
}

export function adminAxios() {
  const inst = axios.create({ baseURL: API });
  inst.interceptors.request.use((cfg) => {
    const t = getAdminToken();
    if (t) cfg.headers.Authorization = `Bearer ${t}`;
    return cfg;
  });
  inst.interceptors.response.use(
    (r) => r,
    (err) => {
      if (err?.response?.status === 401) {
        clearAdminToken();
        if (window.location.pathname.startsWith("/admin")) {
          window.location.href = "/admin";
        }
      }
      return Promise.reject(err);
    }
  );
  return inst;
}
