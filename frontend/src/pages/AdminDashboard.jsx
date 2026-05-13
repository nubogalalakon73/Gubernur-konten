import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Download, Trash2, Mail, Phone, RefreshCw, ArrowLeft, LogOut, Plus, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { API } from "@/lib/api";
import { adminAxios, clearAdminToken, getAdminToken } from "@/lib/adminAuth";

const CH_OPTIONS = [
  { value: "2", label: "BAB 2 — Sang Pionir" },
  { value: "3", label: "BAB 3 — Gelombang Kedua" },
  { value: "4", label: "BAB 4 — Tujuh Dakwaan" },
  { value: "5", label: "BAB 5 — Pembelaan" },
  { value: "6", label: "BAB 6 — Sintesis" },
  { value: "7", label: "BAB 7 — Penutup" },
  { value: "full", label: "FULL — Bab 2-7 semua" },
];

export default function AdminDashboard() {
  const [leads, setLeads] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [stats, setStats] = useState({ leads: 0, cta_clicks: 0, readers: 0, downloads: 0 });
  const [tab, setTab] = useState("leads");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const navigate = useNavigate();

  // Form state for token generation
  const [tEmail, setTEmail] = useState("");
  const [tName, setTName] = useState("");
  const [tChapter, setTChapter] = useState("full");
  const [tSendEmail, setTSendEmail] = useState(true);
  const [tCreating, setTCreating] = useState(false);
  const [lastCreated, setLastCreated] = useState(null);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    if (!getAdminToken()) {
      navigate("/admin", { replace: true });
      return;
    }
    void load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const a = adminAxios();
      const [leadsR, statsR, tokR] = await Promise.all([
        axios.get(`${API}/leads`),
        axios.get(`${API}/stats`),
        a.get("/admin/tokens"),
      ]);
      setLeads(leadsR.data || []);
      setStats(statsR.data || {});
      setTokens(tokR.data || []);
    } catch (e) {
      if (e?.response?.status !== 401) toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  const onLogout = () => {
    clearAdminToken();
    navigate("/admin", { replace: true });
  };

  const onDeleteLead = async (id) => {
    if (!window.confirm("Hapus lead ini?")) return;
    try {
      await axios.delete(`${API}/leads/${id}`);
      setLeads((s) => s.filter((l) => l.id !== id));
      toast.success("Dihapus");
    } catch {
      toast.error("Gagal menghapus");
    }
  };

  const onCreateToken = async (e) => {
    e.preventDefault();
    if (!tEmail) { toast.error("Email wajib"); return; }
    setTCreating(true);
    try {
      const a = adminAxios();
      const { data } = await a.post("/admin/tokens", {
        email: tEmail,
        name: tName,
        chapter: tChapter,
        send_email: tSendEmail,
      });
      setLastCreated(data);
      toast.success(data.email_sent ? "Token dibuat & email terkirim" : "Token dibuat (email tidak terkirim/dimatikan)");
      setTEmail(""); setTName("");
      void load();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Gagal membuat token");
    } finally {
      setTCreating(false);
    }
  };

  const onRevoke = async (id) => {
    if (!window.confirm("Cabut token ini? User tidak akan bisa mengakses lagi.")) return;
    try {
      const a = adminAxios();
      await a.delete(`/admin/tokens/${id}`);
      toast.success("Dicabut");
      void load();
    } catch {
      toast.error("Gagal mencabut");
    }
  };

  const copyText = (txt, key) => {
    try {
      navigator.clipboard.writeText(txt);
      setCopied(key);
      setTimeout(() => setCopied(""), 1600);
    } catch {}
  };

  const filteredLeads = leads.filter((l) => {
    if (!filter) return true;
    const q = filter.toLowerCase();
    return (l.name + l.email + l.whatsapp + (l.profession || "") + (l.city || "")).toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#F4F0E8]" data-testid="admin-dashboard">
      <header className="border-b border-white/10 bg-[#0B0F14]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-[#F4F0E8]/60 hover:text-[#B8211A] flex items-center gap-2 text-sm">
              <ArrowLeft className="w-4 h-4" /> Beranda
            </Link>
            <div className="h-6 w-px bg-white/10" />
            <div>
              <div className="font-display text-xl font-semibold">Admin · Gubernur Konten</div>
              <div className="overline text-[#C9920A] text-[10px]">Dashboard</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={load} data-testid="admin-refresh" className="btn-ghost text-xs py-2 px-3">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            <button onClick={onLogout} data-testid="admin-logout" className="btn-ghost text-xs py-2 px-3">
              <LogOut className="w-4 h-4" /> Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-10">
        {/* Stat cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8" data-testid="admin-stats">
          {[
            { label: "Total Leads", value: stats.leads, color: "#C9920A" },
            { label: "Total Tokens", value: tokens.length, color: "#B8211A" },
            { label: "CTA Clicks", value: stats.cta_clicks, color: "#F4F0E8" },
            { label: "Readers (baseline)", value: stats.readers, color: "#F4F0E8" },
          ].map((s) => (
            <div key={s.label} className="gk-card p-6">
              <div className="overline text-[#F4F0E8]/55">{s.label}</div>
              <div className="font-display text-4xl font-black mt-2" style={{ color: s.color }}>
                {(s.value ?? 0).toLocaleString("id-ID")}
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/10">
          {[
            { id: "leads", label: "Leads" },
            { id: "tokens", label: "Tokens Akses" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              data-testid={`admin-tab-${t.id}`}
              className={`px-5 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${tab === t.id ? "text-[#F4F0E8] border-b-2 border-[#B8211A]" : "text-[#F4F0E8]/45 hover:text-[#F4F0E8]/80"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "leads" && (
          <div className="gk-card overflow-hidden" data-testid="admin-leads-panel">
            <div className="p-5 flex flex-col sm:flex-row gap-3 items-center justify-between border-b border-white/5">
              <div>
                <div className="font-display text-xl font-semibold">Lead Database</div>
                <div className="text-xs text-[#F4F0E8]/50 mt-0.5">{filteredLeads.length} / {leads.length} entries</div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <input type="text" placeholder="Cari…" className="gk-input flex-1 sm:max-w-xs" value={filter} onChange={(e) => setFilter(e.target.value)} data-testid="admin-filter" />
                <a href={`${API}/leads/export.csv`} data-testid="admin-export" className="btn-primary text-xs py-2 px-4 shrink-0">
                  <Download className="w-4 h-4" /> CSV
                </a>
              </div>
            </div>
            {loading ? (
              <div className="p-10 text-center text-[#F4F0E8]/50">Memuat…</div>
            ) : filteredLeads.length === 0 ? (
              <div className="p-12 text-center text-[#F4F0E8]/50" data-testid="admin-empty">
                {leads.length === 0 ? "Belum ada lead masuk." : "Tidak ada hasil."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#131A22] text-[#F4F0E8]/60 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3 text-left">Tanggal</th>
                      <th className="px-5 py-3 text-left">Nama</th>
                      <th className="px-5 py-3 text-left">Kontak</th>
                      <th className="px-5 py-3 text-left">Profesi · Kota</th>
                      <th className="px-5 py-3 text-left">Minat</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((l) => (
                      <tr key={l.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                        <td className="px-5 py-4 text-[#F4F0E8]/60 font-mono text-xs">{new Date(l.created_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}</td>
                        <td className="px-5 py-4 font-display font-semibold">{l.name}</td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-1">
                            <a href={`mailto:${l.email}`} className="flex items-center gap-1.5 text-[#C9920A] hover:underline text-xs"><Mail className="w-3 h-3" /> {l.email}</a>
                            <a href={`https://wa.me/${l.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[#25D366] hover:underline text-xs"><Phone className="w-3 h-3" /> {l.whatsapp}</a>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-[#F4F0E8]/70">
                          <div>{l.profession || "—"}</div>
                          <div className="text-xs text-[#F4F0E8]/45">{l.city || "—"}</div>
                        </td>
                        <td className="px-5 py-4 text-[#F4F0E8]/70 text-xs">{l.interest || "—"}</td>
                        <td className="px-5 py-4 text-right">
                          <button onClick={() => onDeleteLead(l.id)} className="text-[#F4F0E8]/40 hover:text-[#B8211A] p-2" aria-label="Hapus"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === "tokens" && (
          <div className="grid lg:grid-cols-3 gap-6" data-testid="admin-tokens-panel">
            {/* Create token form */}
            <form onSubmit={onCreateToken} className="gk-card p-6 lg:col-span-1 h-fit" data-testid="admin-token-form">
              <h3 className="font-display text-xl font-semibold mb-1">Generate Token</h3>
              <p className="text-xs text-[#F4F0E8]/55 mb-5">Setelah pembayaran dikonfirmasi, buat link akses pribadi untuk pembeli.</p>
              <div className="space-y-4">
                <div>
                  <label className="overline text-[#F4F0E8]/60 block mb-1.5">Email pembeli *</label>
                  <input type="email" value={tEmail} onChange={(e) => setTEmail(e.target.value)} className="gk-input" required data-testid="admin-token-email" />
                </div>
                <div>
                  <label className="overline text-[#F4F0E8]/60 block mb-1.5">Nama (opsional)</label>
                  <input type="text" value={tName} onChange={(e) => setTName(e.target.value)} className="gk-input" data-testid="admin-token-name" />
                </div>
                <div>
                  <label className="overline text-[#F4F0E8]/60 block mb-1.5">Bab</label>
                  <select value={tChapter} onChange={(e) => setTChapter(e.target.value)} className="gk-input" data-testid="admin-token-chapter">
                    {CH_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <label className="flex items-center gap-2 text-sm text-[#F4F0E8]/80">
                  <input type="checkbox" checked={tSendEmail} onChange={(e) => setTSendEmail(e.target.checked)} data-testid="admin-token-sendmail" />
                  Kirim email otomatis ke pembeli
                </label>
              </div>
              <button type="submit" disabled={tCreating} className="mt-5 btn-primary w-full justify-center disabled:opacity-50" data-testid="admin-token-create">
                {tCreating ? "Membuat…" : (<><Plus className="w-4 h-4" /> Generate</>)}
              </button>
              {lastCreated && (
                <div className="mt-5 p-4 border border-[#C9920A]/30 bg-[#C9920A]/5 rounded" data-testid="admin-token-last">
                  <div className="overline text-[#C9920A] mb-2">Token Baru Dibuat</div>
                  <div className="text-xs text-[#F4F0E8]/70 mb-2">{lastCreated.label}</div>
                  <div className="flex items-center gap-2 bg-[#0B0F14] border border-white/10 p-2.5 rounded">
                    <code className="text-[11px] text-[#F4F0E8]/90 break-all flex-1">{lastCreated.link}</code>
                    <button onClick={() => copyText(lastCreated.link, "last")} className="text-[#C9920A] hover:text-[#F4F0E8] p-1" data-testid="admin-token-copy">
                      {copied === "last" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  {lastCreated.email_sent && <div className="mt-2 text-[10px] text-[#25D366]">✓ Email terkirim ke pembeli</div>}
                </div>
              )}
            </form>

            {/* Token list */}
            <div className="gk-card lg:col-span-2 overflow-hidden">
              <div className="p-5 border-b border-white/5">
                <div className="font-display text-xl font-semibold">Token Aktif</div>
                <div className="text-xs text-[#F4F0E8]/50 mt-0.5">{tokens.length} token</div>
              </div>
              {tokens.length === 0 ? (
                <div className="p-10 text-center text-[#F4F0E8]/50">Belum ada token. Buat token pertama di form sebelah kiri.</div>
              ) : (
                <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto" data-testid="admin-token-list">
                  {tokens.map((t) => (
                    <div key={t.id} className={`p-4 ${t.revoked ? "opacity-50" : ""}`} data-testid={`admin-token-row-${t.id}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-display font-semibold text-[#F4F0E8] text-sm">{t.name || t.email}</span>
                            <span className="text-[10px] uppercase tracking-wider bg-[#B8211A]/15 text-[#B8211A] px-2 py-0.5">{t.chapter === "full" ? "FULL BUKU" : `BAB ${t.chapter}`}</span>
                            {t.revoked && <span className="text-[10px] uppercase bg-white/10 text-[#F4F0E8]/55 px-2 py-0.5">REVOKED</span>}
                          </div>
                          <div className="text-xs text-[#F4F0E8]/55 mt-0.5">{t.email}</div>
                          <div className="mt-2 flex items-center gap-2 bg-[#0B0F14] border border-white/10 p-2 rounded">
                            <code className="text-[10px] text-[#F4F0E8]/85 break-all flex-1 font-mono">{t.link}</code>
                            <button onClick={() => copyText(t.link, t.id)} className="text-[#C9920A] hover:text-[#F4F0E8] p-1 shrink-0" data-testid={`admin-token-copy-${t.id}`}>
                              {copied === t.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                          <div className="mt-2 flex gap-3 text-[10px] text-[#F4F0E8]/40 font-mono">
                            <span>Dibuat {new Date(t.created_at).toLocaleDateString("id-ID")}</span>
                            <span>·</span>
                            <span>{t.used_count} kunjungan</span>
                            {t.last_used_at && (<><span>·</span><span>Terakhir {new Date(t.last_used_at).toLocaleDateString("id-ID")}</span></>)}
                          </div>
                        </div>
                        {!t.revoked && (
                          <button onClick={() => onRevoke(t.id)} className="text-[#F4F0E8]/40 hover:text-[#B8211A] p-2 shrink-0" data-testid={`admin-token-revoke-${t.id}`} aria-label="Revoke">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
