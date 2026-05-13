import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Lock, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { API } from "@/lib/api";
import { getAdminToken, setAdminToken } from "@/lib/adminAuth";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (getAdminToken()) navigate("/admin/dashboard", { replace: true });
  }, [navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/admin/login`, { password });
      setAdminToken(data.token);
      toast.success("Berhasil masuk");
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.detail || "Login gagal";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F14] grid place-items-center p-5 grain">
      <form onSubmit={onSubmit} className="w-full max-w-sm gk-card p-8 sm:p-10" data-testid="admin-login-form">
        <div className="flex items-center gap-3 mb-7">
          <span className="relative inline-flex h-10 w-10 items-center justify-center border border-white/20">
            <span className="font-display text-[#F4F0E8] text-xl font-bold leading-none">G</span>
            <span className="absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 bg-[#B8211A]" />
          </span>
          <div>
            <div className="font-display text-[#F4F0E8] text-lg font-semibold">Admin Login</div>
            <div className="overline text-[#C9920A] text-[10px]">Gubernur Konten</div>
          </div>
        </div>
        <label className="overline text-[#F4F0E8]/60 block mb-2">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F4F0E8]/40" />
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="gk-input pl-10"
            data-testid="admin-login-password"
          />
        </div>
        <button type="submit" disabled={loading || !password} className="mt-6 btn-primary w-full justify-center disabled:opacity-50" data-testid="admin-login-submit">
          {loading ? "Masuk…" : (<>Masuk <ArrowRight className="w-4 h-4" /></>)}
        </button>
        <p className="mt-4 text-[11px] text-[#F4F0E8]/40 text-center font-mono">
          Akses internal. Hubungi admin bila lupa password.
        </p>
      </form>
    </div>
  );
}
