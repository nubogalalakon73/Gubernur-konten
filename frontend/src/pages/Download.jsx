import { useEffect, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { Download as DownloadIcon, Loader2, CheckCircle2, AlertCircle, ArrowLeft, BookOpen, Mail, MessageCircle, Sparkles, Coffee } from "lucide-react";
import { API, WA_LINK, trackCta } from "@/lib/api";

const PAKET_LABEL = {
  full: "Full Buku Gubernur Konten (Bab 1-7)",
  "bab-2": "Bab 2 — Sang Pionir",
  "bab-3": "Bab 3 — Gelombang Kedua",
  "bab-4": "Bab 4 — Tujuh Dakwaan",
  "bab-5": "Bab 5 — Pembelaan & Epistemologi",
  "bab-6": "Bab 6 — Sintesis",
  "bab-7": "Bab 7 — Penutup",
};

const POLL_INTERVAL = 4000;
const POLL_MAX_MS = 5 * 60_000; // 5 minutes

export default function Download() {
  const [params] = useSearchParams();
  const orderIdFromUrl = params.get("order_id") || "";
  const emailFromUrl = params.get("email") || "";

  // Recovery from sessionStorage if URL lacks params (e.g. user returns later)
  const stored = (() => {
    try { return JSON.parse(sessionStorage.getItem("gk_pending_order") || "null"); } catch { return null; }
  })();
  const orderId = orderIdFromUrl || stored?.order_id || "";
  const email = emailFromUrl || stored?.email || "";

  const [status, setStatus] = useState("loading");
  const [order, setOrder] = useState(null);
  const [accessToken, setAccessToken] = useState("");
  const [error, setError] = useState("");
  const startedAt = useRef(Date.now());

  useEffect(() => { trackCta("download-page-open", "download"); }, []);

  useEffect(() => {
    if (!orderId || !email) {
      setStatus("missing");
      return;
    }
    let cancelled = false;
    let timer = null;

    const poll = async () => {
      try {
        const { data } = await axios.get(`${API}/order-status`, { params: { order_id: orderId, email } });
        if (cancelled) return;
        setOrder(data);
        if (data.status === "success" && data.access_token) {
          setAccessToken(data.access_token);
          setStatus("success");
          return;
        }
        if (["failure", "deny", "expire", "cancel"].includes(data.status)) {
          setStatus("failed");
          setError(`Status pembayaran: ${data.status}`);
          return;
        }
        // pending — keep polling
        if (Date.now() - startedAt.current > POLL_MAX_MS) {
          setStatus("timeout");
          return;
        }
        timer = setTimeout(poll, POLL_INTERVAL);
      } catch (e) {
        if (cancelled) return;
        const msg = e?.response?.data?.detail || "Gagal memeriksa status order";
        setStatus("error");
        setError(msg);
      }
    };

    poll();
    return () => { cancelled = true; if (timer) clearTimeout(timer); };
  }, [orderId, email]);

  const onDownload = () => {
    if (!accessToken) return;
    trackCta(`download-pdf-${order?.paket || "unknown"}`, "download");
    const url = `${API}/download/pdf?token=${encodeURIComponent(accessToken)}`;
    window.open(url, "_blank", "noopener");
  };

  const paketLabel = order?.paket ? (PAKET_LABEL[order.paket] || order.paket) : "";

  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#F4F0E8] relative overflow-x-hidden grain" data-testid="download-page">
      <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />
      <div className="spotlight" style={{ top: "10%", right: "5%" }} />

      <header className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 py-6">
        <Link to="/" className="inline-flex items-center gap-2 text-[#F4F0E8]/60 hover:text-[#B8211A] text-sm" data-testid="download-back">
          <ArrowLeft className="w-4 h-4" /> Beranda
        </Link>
      </header>

      <main className="relative z-10 max-w-2xl mx-auto px-5 sm:px-8 pb-20">

        {status === "loading" && (
          <div className="gk-card p-8 sm:p-12 text-center" data-testid="download-loading">
            <Loader2 className="w-12 h-12 text-[#C9920A] animate-spin mx-auto mb-5" strokeWidth={1.4} />
            <h1 className="font-display text-3xl font-bold">Memverifikasi pembayaran…</h1>
            <p className="mt-3 text-[#F4F0E8]/60">Kami sedang menunggu konfirmasi dari Midtrans. Biasanya butuh 5-30 detik untuk QRIS/E-Wallet, hingga beberapa menit untuk transfer bank.</p>
            <div className="mt-6 text-[10px] text-[#F4F0E8]/40 font-mono">ORDER · {orderId}</div>
          </div>
        )}

        {status === "success" && (
          <div className="gk-card p-8 sm:p-12 text-center glow-gold" data-testid="download-success">
            <CheckCircle2 className="w-14 h-14 text-[#C9920A] mx-auto mb-5" strokeWidth={1.4} />
            <div className="gk-ribbon mx-auto mb-5" style={{ borderColor: "rgba(201,146,10,0.5)" }}>Pembayaran berhasil</div>
            <h1 className="font-display text-4xl sm:text-5xl font-black leading-tight">Terima kasih, <span className="text-[#C9920A]">{order?.nama || "Pendukung"}</span>.</h1>
            <p className="mt-4 text-[#F4F0E8]/70 max-w-md mx-auto">Traktiran kopi Anda sudah sampai ☕ Akses {paketLabel} kini siap diunduh.</p>

            <button onClick={onDownload} className="mt-9 btn-primary text-base" data-testid="download-btn">
              <DownloadIcon className="w-4 h-4" />
              Unduh PDF
            </button>

            <div className="mt-7 grid sm:grid-cols-2 gap-3 text-left">
              {order?.paket === "full" && (
                <Link to="/bab1" className="gk-card p-4 hover:border-[#C9920A]/40 transition-all flex items-center gap-3" data-testid="download-read-bab1">
                  <BookOpen className="w-5 h-5 text-[#C9920A]" />
                  <div>
                    <div className="font-display text-sm font-semibold">Mulai dari Bab 1 gratis</div>
                    <div className="text-[11px] text-[#F4F0E8]/55">~14 menit baca</div>
                  </div>
                </Link>
              )}
              {order?.paket && order.paket !== "full" && (() => {
                const n = order.paket.split("-")[1];
                return (
                  <Link to={`/bab/${n}?t=${accessToken}`} className="gk-card p-4 hover:border-[#C9920A]/40 transition-all flex items-center gap-3" data-testid="download-read-online">
                    <BookOpen className="w-5 h-5 text-[#C9920A]" />
                    <div>
                      <div className="font-display text-sm font-semibold">Baca Bab {n} online</div>
                      <div className="text-[11px] text-[#F4F0E8]/55">Mode baca premium</div>
                    </div>
                  </Link>
                );
              })()}
              <a href={WA_LINK(`Halo, order ${orderId} sukses. Ada pertanyaan lanjutan.`)} target="_blank" rel="noreferrer" className="gk-card p-4 hover:border-[#C9920A]/40 transition-all flex items-center gap-3" data-testid="download-wa">
                <MessageCircle className="w-5 h-5 text-[#25D366]" />
                <div>
                  <div className="font-display text-sm font-semibold">Tanya Admin via WA</div>
                  <div className="text-[11px] text-[#F4F0E8]/55">Bantuan tambahan</div>
                </div>
              </a>
            </div>

            <div className="mt-8 pt-7 border-t border-white/10 text-left">
              <div className="overline text-[#F4F0E8]/55 mb-3">Detail order</div>
              <div className="grid grid-cols-2 gap-3 text-xs text-[#F4F0E8]/70 font-mono">
                <div>Order ID</div><div className="text-right">{orderId}</div>
                <div>Paket</div><div className="text-right">{paketLabel}</div>
                <div>Total</div><div className="text-right">Rp {order?.harga?.toLocaleString("id-ID")}</div>
                <div>Email</div><div className="text-right break-all">{email}</div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-[#C9920A]/5 border border-[#C9920A]/20 rounded text-xs text-[#F4F0E8]/65 text-left">
              <div className="flex items-center gap-2 text-[#C9920A] font-bold uppercase tracking-wider text-[10px] mb-1.5">
                <Mail className="w-3 h-3" /> Simpan link ini
              </div>
              Bookmark halaman ini atau simpan link berikut. Anda bisa unduh ulang kapan saja menggunakan link yang sama.
              <div className="mt-2 p-2 bg-[#0B0F14] rounded font-mono text-[10px] break-all text-[#C9920A]">
                {typeof window !== "undefined" ? window.location.href : ""}
              </div>
            </div>
          </div>
        )}

        {status === "failed" && (
          <div className="gk-card p-8 sm:p-12 text-center" data-testid="download-failed">
            <AlertCircle className="w-14 h-14 text-[#B8211A] mx-auto mb-5" strokeWidth={1.4} />
            <h1 className="font-display text-3xl font-bold">Pembayaran tidak berhasil</h1>
            <p className="mt-3 text-[#F4F0E8]/70">{error || "Order Anda tidak terbayar."}</p>
            <div className="mt-7 flex flex-col gap-3">
              <Link to={`/checkout?paket=${order?.paket || "full"}`} className="btn-primary justify-center" data-testid="download-retry">Coba lagi</Link>
              <a href={WA_LINK(`Halo, saya butuh bantuan order ${orderId}.`)} target="_blank" rel="noreferrer" className="btn-ghost justify-center">Hubungi Admin</a>
            </div>
          </div>
        )}

        {status === "timeout" && (
          <div className="gk-card p-8 sm:p-12 text-center" data-testid="download-timeout">
            <Coffee className="w-14 h-14 text-[#C9920A] mx-auto mb-5" strokeWidth={1.4} />
            <h1 className="font-display text-3xl font-bold">Konfirmasi tertunda</h1>
            <p className="mt-3 text-[#F4F0E8]/70">Bank atau e-wallet butuh waktu lebih lama dari biasanya. Refresh halaman ini, atau hubungi admin via WhatsApp dengan menyebut Order ID.</p>
            <div className="mt-2 text-xs text-[#F4F0E8]/45 font-mono">ORDER · {orderId}</div>
            <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => window.location.reload()} className="btn-primary">Refresh</button>
              <a href={WA_LINK(`Halo, status order ${orderId} masih pending. Mohon dibantu.`)} target="_blank" rel="noreferrer" className="btn-ghost">Hubungi Admin</a>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="gk-card p-8 sm:p-12 text-center" data-testid="download-error">
            <AlertCircle className="w-14 h-14 text-[#B8211A] mx-auto mb-5" strokeWidth={1.4} />
            <h1 className="font-display text-3xl font-bold">Tidak dapat memuat order</h1>
            <p className="mt-3 text-[#F4F0E8]/70">{error}</p>
            <div className="mt-7"><Link to="/" className="btn-ghost justify-center">Kembali ke Beranda</Link></div>
          </div>
        )}

        {status === "missing" && (
          <div className="gk-card p-8 sm:p-12 text-center" data-testid="download-missing">
            <Sparkles className="w-14 h-14 text-[#C9920A] mx-auto mb-5" strokeWidth={1.4} />
            <h1 className="font-display text-3xl font-bold">Belum ada order aktif</h1>
            <p className="mt-3 text-[#F4F0E8]/70">Halaman ini menampilkan akses setelah pembayaran. Mulai dengan memilih paket dulu.</p>
            <div className="mt-7"><Link to="/checkout?paket=full" className="btn-primary">Traktir Sekarang</Link></div>
          </div>
        )}
      </main>
    </div>
  );
}
