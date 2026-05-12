import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { API, trackCta } from "@/lib/api";
import { useReveal } from "@/lib/useReveal";

const PROFESSIONS = [
  "Politisi",
  "Akademisi / Dosen",
  "Mahasiswa",
  "ASN / PNS",
  "Konsultan Politik",
  "Aktivis / NGO",
  "Jurnalis / Media",
  "Konten Kreator",
  "Lainnya",
];

const INTERESTS = [
  "PDF Only — Rp 79.000",
  "Bundle — Rp 129.000",
  "Premium Bundle — Rp 249.000",
  "Pre-order edisi cetak",
  "Workshop / undangan diskusi",
];

export default function LeadForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    whatsapp: "",
    profession: "",
    city: "",
    interest: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ref, vis] = useReveal(0.1);

  const onChange = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

  const validate = () => {
    if (!form.name.trim()) return "Nama wajib diisi";
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) return "Email tidak valid";
    if (!form.whatsapp.trim() || form.whatsapp.replace(/\D/g, "").length < 8) return "Nomor WhatsApp tidak valid";
    return null;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/leads`, form);
      trackCta("lead-form-submit", "lead-form");
      setSuccess(true);
      try {
        const saved = JSON.parse(localStorage.getItem("gk_leads") || "[]");
        saved.push({ ...form, ts: new Date().toISOString() });
        localStorage.setItem("gk_leads", JSON.stringify(saved));
      } catch (_) {}
      toast.success("Terima kasih! Tim kami akan menghubungi via WhatsApp dalam 24 jam.");
      setForm({ name: "", email: "", whatsapp: "", profession: "", city: "", interest: "" });
    } catch (e2) {
      toast.error("Gagal mengirim. Coba lagi atau hubungi WhatsApp langsung.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="lead"
      ref={ref}
      data-testid="lead-section"
      className="relative py-24 sm:py-32 bg-[#0E141B]"
    >
      <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className={`grid lg:grid-cols-12 gap-10 lg:gap-14 items-start reveal ${vis ? "is-visible" : ""}`}>
          <div className="lg:col-span-5">
            <div className="gk-ribbon mb-5">Dapatkan akses lebih awal</div>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-[#F4F0E8] leading-tight">
              Pre-order &<br />
              prioritas <span className="italic text-[#C9920A]">pembaca</span>.
            </h2>
            <p className="mt-5 text-[#F4F0E8]/70 leading-relaxed">
              Daftar di sini untuk menerima cuplikan bab gratis, diskon early-reader, dan undangan diskusi tertutup bersama penulis.
            </p>
            <div className="mt-7 animated-line" />
            <div className="mt-6 text-xs text-[#F4F0E8]/45 font-mono">
              DATA AMAN · TIDAK DIBAGIKAN KE PIHAK KETIGA
            </div>
          </div>

          <form
            onSubmit={onSubmit}
            data-testid="lead-form"
            className="lg:col-span-7 gk-card p-7 sm:p-10 relative"
          >
            {success && (
              <div className="absolute inset-0 grid place-items-center bg-[#0E141B]/95 backdrop-blur-sm z-10 p-8 text-center" data-testid="lead-form-success">
                <div>
                  <CheckCircle2 className="w-12 h-12 text-[#C9920A] mx-auto mb-4" strokeWidth={1.4} />
                  <h3 className="font-display text-3xl font-bold text-[#F4F0E8]">Terima kasih.</h3>
                  <p className="mt-3 text-[#F4F0E8]/70 max-w-md">
                    Data Anda tersimpan. Tim AI Assistant akan menghubungi via WhatsApp untuk konfirmasi & link unduh.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSuccess(false)}
                    className="mt-6 btn-ghost"
                    data-testid="lead-form-reset"
                  >
                    Kirim Lagi
                  </button>
                </div>
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="overline text-[#F4F0E8]/60 block mb-2">Nama Lengkap *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={onChange("name")}
                  placeholder="Mis. Didi Subandi"
                  className="gk-input"
                  data-testid="lead-input-name"
                  required
                />
              </div>
              <div>
                <label className="overline text-[#F4F0E8]/60 block mb-2">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={onChange("email")}
                  placeholder="anda@email.com"
                  className="gk-input"
                  data-testid="lead-input-email"
                  required
                />
              </div>
              <div>
                <label className="overline text-[#F4F0E8]/60 block mb-2">WhatsApp *</label>
                <input
                  type="tel"
                  value={form.whatsapp}
                  onChange={onChange("whatsapp")}
                  placeholder="08123456789"
                  className="gk-input"
                  data-testid="lead-input-whatsapp"
                  required
                />
              </div>
              <div>
                <label className="overline text-[#F4F0E8]/60 block mb-2">Profesi</label>
                <select
                  value={form.profession}
                  onChange={onChange("profession")}
                  className="gk-input appearance-none"
                  data-testid="lead-input-profession"
                  style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23F4F0E8' stroke-width='2'><polyline points='6 9 12 15 18 9'/></svg>\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", paddingRight: 36 }}
                >
                  <option value="">Pilih profesi…</option>
                  {PROFESSIONS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="overline text-[#F4F0E8]/60 block mb-2">Kota</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={onChange("city")}
                  placeholder="Bandung"
                  className="gk-input"
                  data-testid="lead-input-city"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="overline text-[#F4F0E8]/60 block mb-2">Ketertarikan</label>
                <select
                  value={form.interest}
                  onChange={onChange("interest")}
                  className="gk-input appearance-none"
                  data-testid="lead-input-interest"
                  style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23F4F0E8' stroke-width='2'><polyline points='6 9 12 15 18 9'/></svg>\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", paddingRight: 36 }}
                >
                  <option value="">Pilih paket atau minat…</option>
                  {INTERESTS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              data-testid="lead-form-submit"
              className="mt-7 btn-primary w-full justify-center disabled:opacity-50"
            >
              {loading ? "Mengirim…" : (<>Daftarkan Saya <Send className="w-4 h-4" /></>)}
            </button>
            <p className="mt-4 text-[11px] text-[#F4F0E8]/45 text-center">
              Dengan mendaftar, Anda menyetujui kebijakan privasi & komunikasi via WhatsApp.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
