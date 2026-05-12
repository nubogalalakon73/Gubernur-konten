import { useEffect, useState } from "react";
import axios from "axios";
import { Download, Trash2, Mail, Phone, RefreshCw, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { API } from "@/lib/api";

export default function Admin() {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({ leads: 0, cta_clicks: 0, readers: 0, downloads: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [a, b] = await Promise.all([
        axios.get(`${API}/leads`),
        axios.get(`${API}/stats`),
      ]);
      setLeads(a.data || []);
      setStats(b.data || {});
    } catch (e) {
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onDelete = async (id) => {
    if (!window.confirm("Hapus lead ini?")) return;
    try {
      await axios.delete(`${API}/leads/${id}`);
      setLeads((s) => s.filter((l) => l.id !== id));
      toast.success("Dihapus");
    } catch (e) {
      toast.error("Gagal menghapus");
    }
  };

  const filtered = leads.filter((l) => {
    if (!filter) return true;
    const q = filter.toLowerCase();
    return (
      l.name?.toLowerCase().includes(q) ||
      l.email?.toLowerCase().includes(q) ||
      l.whatsapp?.toLowerCase().includes(q) ||
      l.profession?.toLowerCase().includes(q) ||
      l.city?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#F4F0E8]" data-testid="admin-page">
      <header className="border-b border-white/10 bg-[#0B0F14]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-[#F4F0E8]/60 hover:text-[#B8211A] flex items-center gap-2 text-sm">
              <ArrowLeft className="w-4 h-4" /> Beranda
            </Link>
            <div className="h-6 w-px bg-white/10" />
            <div>
              <div className="font-display text-xl font-semibold">Admin · Gubernur Konten</div>
              <div className="overline text-[#C9920A] text-[10px]">Lead Database</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={load} data-testid="admin-refresh" className="btn-ghost">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            <a
              href={`${API}/leads/export.csv`}
              data-testid="admin-export"
              className="btn-primary"
            >
              <Download className="w-4 h-4" /> Export CSV
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-10">
        {/* Stat cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8" data-testid="admin-stats">
          {[
            { label: "Total Leads", value: stats.leads, color: "#C9920A" },
            { label: "CTA Clicks", value: stats.cta_clicks, color: "#B8211A" },
            { label: "Readers (with baseline)", value: stats.readers, color: "#F4F0E8" },
            { label: "Downloads (with baseline)", value: stats.downloads, color: "#F4F0E8" },
          ].map((s) => (
            <div key={s.label} className="gk-card p-6">
              <div className="overline text-[#F4F0E8]/55">{s.label}</div>
              <div className="font-display text-4xl font-black mt-2" style={{ color: s.color }}>
                {(s.value ?? 0).toLocaleString("id-ID")}
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="gk-card overflow-hidden">
          <div className="p-5 flex items-center justify-between border-b border-white/5">
            <div>
              <div className="font-display text-xl font-semibold">Lead Database</div>
              <div className="text-xs text-[#F4F0E8]/50 mt-0.5">{filtered.length} / {leads.length} entries</div>
            </div>
            <input
              type="text"
              placeholder="Cari nama, email, kota…"
              className="gk-input max-w-xs"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              data-testid="admin-filter"
            />
          </div>

          {loading ? (
            <div className="p-10 text-center text-[#F4F0E8]/50">Memuat…</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-[#F4F0E8]/50" data-testid="admin-empty">
              {leads.length === 0 ? "Belum ada lead masuk. Form akan menyimpan data ke sini." : "Tidak ada hasil."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-testid="admin-table">
                <thead className="bg-[#131A22] text-[#F4F0E8]/60 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3 text-left">Tanggal</th>
                    <th className="px-5 py-3 text-left">Nama</th>
                    <th className="px-5 py-3 text-left">Kontak</th>
                    <th className="px-5 py-3 text-left">Profesi · Kota</th>
                    <th className="px-5 py-3 text-left">Ketertarikan</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((l) => (
                    <tr key={l.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                      <td className="px-5 py-4 text-[#F4F0E8]/60 font-mono text-xs">
                        {new Date(l.created_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                      </td>
                      <td className="px-5 py-4 font-display font-semibold">{l.name}</td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1">
                          <a href={`mailto:${l.email}`} className="flex items-center gap-1.5 text-[#C9920A] hover:underline text-xs">
                            <Mail className="w-3 h-3" /> {l.email}
                          </a>
                          <a href={`https://wa.me/${l.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[#25D366] hover:underline text-xs">
                            <Phone className="w-3 h-3" /> {l.whatsapp}
                          </a>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[#F4F0E8]/70">
                        <div>{l.profession || "—"}</div>
                        <div className="text-xs text-[#F4F0E8]/45">{l.city || "—"}</div>
                      </td>
                      <td className="px-5 py-4 text-[#F4F0E8]/70 text-xs">{l.interest || "—"}</td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => onDelete(l.id)}
                          className="text-[#F4F0E8]/40 hover:text-[#B8211A] p-2"
                          data-testid={`admin-delete-${l.id}`}
                          aria-label="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
