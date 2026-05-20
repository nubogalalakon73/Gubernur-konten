import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, ArrowRight, Coffee, Sparkles, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { API, trackCta } from "@/lib/api";
import { loadSnap } from "@/lib/snap";

const PACKAGES = [
  { value: "full",  label: "🔥 Full Buku — Semua 7 Bab",                       harga: 55000, featured: true },
  { value: "bab-2", label: "Bab 2 — Sang Pionir: Dedi Mulyadi & Kelahiran Genre", harga: 10000 },
  { value: "bab-3", label: "Bab 3 — Gelombang Kedua: Tipologi Respons",          harga: 10000 },
  { value: "bab-4", label: "Bab 4 — Dakwaan: Tujuh Dakwaan",                     harga: 10000 },
  { value: "bab-5", label: "Bab 5 — Pembelaan & Epistemologi",                    harga: 10000 },
  { value: "bab-6", label: "Bab 6 — Sintesis: Hibriditas yang Mengganggu",        harga: 10000 },
  { value: "bab-7", label: "Bab 7 — Penutup: Setelah Panggung Ditutup",           harga: 10000 },
];


const fmtIDR = (n) => "Rp " + (n ? n.toLocaleString("id-ID") : "0");

export default function Checkout() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const initialPaket = PACKAGES.find((p) => p.value === params.get("paket"))?.value || "full";

  const [paket, setPaket] = useState(initialPaket);
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { trackCta("checkout-open", "checkout"); }, []);

  const selected = PACKAGES.find((p) => p.value === paket) || PACKAGES[0];

  const validate = () => {
    if (!nama.trim() || nama.trim().length < 2) return "Nama minimal 2 karakter";
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Email tidak valid";
    const digits = whatsapp.replace(/\D/g, "");
    if (digits.length < 8) return "Nomor WhatsApp tidak valid";
    return null;
  };

  const onPay = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { toast.error(err); return; }
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/create-payment`, {
        nama: nama.trim(),
        email: email.trim().toLowerCase(),
        whatsapp: whatsapp.trim(),
        paket,
      });
      trackCta(`checkout-snap-${paket}`, "checkout");

      // Store order in sessionStorage so the download page can poll
      try {
        sessionStorage.setItem("gk_pending_order", JSON.stringify({
          order_id: data.order_id, email: email.trim().toLowerCase(), paket, harga: data.harga, nama: nama.trim()
        }));
      } catch {}

      // Path A: Snap.js popup (requires client_key)
      if (data.client_key) {
        try {
          const snap = await loadSnap({ clientKey: data.client_key, isProduction: data.is_production });
          snap.pay(data.snap_token, {
            onSuccess: () => navigate(`/download?order_id=${encodeURIComponent(data.order_id)}&email=${encodeURIComponent(email.trim().toLowerCase())}`),
            onPending: () => navigate(`/download?order_id=${encodeURIComponent(data.order_id)}&email=${encodeURIComponent(email.trim().toLowerCase())}`),
            onError: () => toast.error("Pembayaran gagal. Silakan coba lagi."),
            onClose: () => toast.message("Pembayaran ditutup. Order Anda tersimpan, bisa dilanjutkan kapan saja."),
          });
        } catch (snapErr) {
          // Fallback ke redirect_url bila Snap.js gagal load
          window.location.href = data.redirect_url;
        }
      } else {
        // Path B: redirect ke halaman Midtrans hosted
        window.location.href = data.redirect_url;
      }
    } catch (err2) {
      const msg = err2?.response?.data?.detail || "Gagal memulai transaksi";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#F4F0E8] relative overflow-x-hidden grain" data-testid="checkout-page">
      <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />

      <header className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8 py-6">
        <Link to="/" className="inline-flex items-center gap-2 text-[#F4F0E8]/60 hover:text-[#B8211A] text-sm" data-testid="checkout-back">
          <ArrowLeft className="w-4 h-4" /> Beranda
        </Link>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8 pb-20">
        <div className="mb-10">
          <div className="gk-ribbon mb-5">Checkout · Traktir Kopi ☕</div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold leading-tight">
            Sebentar lagi — <span className="italic text-[#C9920A]">akses ada di tangan Anda.</span>
          </h1>
          <p className="mt-4 text-[#F4F0E8]/65 max-w-xl">
            Pembayaran via Midtrans (BCA VA · Mandiri VA · QRIS · GoPay · ShopeePay · OVO · Kartu Kredit). Akses dikirim otomatis setelah pembayaran terkonfirmasi.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-7">
          {/* FORM */}
          <form onSubmit={onPay} className="gk-card p-6 sm:p-8 lg:col-span-3" data-testid="checkout-form">
            <div className="mb-6">
              <label className="overline text-[#F4F0E8]/60 block mb-2">Pilih Paket</label>
              <select value={paket} onChange={(e) => setPaket(e.target.value)} className="gk-input" data-testid="checkout-paket">
                {PACKAGES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label} — {fmtIDR(p.harga)}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="overline text-[#F4F0E8]/60 block mb-2">Nama lengkap *</label>
                <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} className="gk-input" required data-testid="checkout-nama" />
              </div>
              <div>
                <label className="overline text-[#F4F0E8]/60 block mb-2">Email *</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="gk-input" required data-testid="checkout-email" placeholder="anda@email.com" />
              </div>
              <div>
                <label className="overline text-[#F4F0E8]/60 block mb-2">WhatsApp *</label>
                <input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="gk-input" required data-testid="checkout-wa" placeholder="08123456789" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="mt-7 btn-primary w-full justify-center disabled:opacity-50" data-testid="checkout-pay">
              {loading ? (<><Loader2 className="w-4 h-4 animate-spin" /> Memproses…</>) : (<>Bayar {fmtIDR(selected.harga)} <ArrowRight className="w-4 h-4" /></>)}
            </button>
            <div className="mt-4 flex items-center gap-2 text-[10px] text-[#F4F0E8]/45 font-mono uppercase tracking-wider">
              <Lock className="w-3 h-3" /> Pembayaran diproses oleh Midtrans · 256-bit encrypted
            </div>
          </form>

          {/* SUMMARY */}
          <aside className="lg:col-span-2 gk-card p-6 sm:p-8 h-fit" data-testid="checkout-summary">
            <div className="flex items-center gap-3 mb-5">
              {paket === "full" ? <Sparkles className="w-5 h-5 text-[#C9920A]" /> : <Coffee className="w-5 h-5 text-[#C9920A]" />}
              <div className="overline text-[#C9920A]">Ringkasan Order</div>
            </div>
            <h3 className="font-display text-2xl font-bold leading-tight">{selected.label}</h3>
            <div className="my-7 animated-line" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-[#F4F0E8]/70"><span>Subtotal</span><span>{fmtIDR(selected.harga)}</span></div>
              <div className="flex justify-between text-[#F4F0E8]/70"><span>Biaya admin</span><span>Rp 0</span></div>
            </div>
            <div className="mt-5 pt-5 border-t border-white/10 flex justify-between items-baseline">
              <span className="overline text-[#F4F0E8]/60">Total</span>
              <span className="font-display text-3xl font-black text-[#F4F0E8]">{fmtIDR(selected.harga)}</span>
            </div>
            <ul className="mt-7 space-y-2 text-xs text-[#F4F0E8]/60">
              <li>✓ Akses selamanya</li>
              <li>✓ Dapat dibuka di multi-device</li>
              {paket === "full" && <li>✓ Format PDF + EPUB + Flipbook</li>}
              <li>✓ Akses dikirim &lt; 10 menit setelah bayar</li>
            </ul>
          </aside>
        </div>
      </main>
    </div>
  );
}
