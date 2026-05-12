import { Check, Sparkles, BookOpen, ArrowRight, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { trackCta } from "@/lib/api";
import { useReveal } from "@/lib/useReveal";
import { openChat } from "@/lib/chatEvents";

const PLANS = [
  {
    id: "free",
    tag: "Free Preview",
    name: "Bab 1 Gratis",
    sub: "Ketika Algoritma Menjadi Alun-Alun",
    price: "Rp 0",
    priceNote: "Akses langsung di HP",
    features: [
      "Bisa dibaca langsung di HP",
      "Mode baca responsive — tanpa unduh PDF",
      "Tampilan seperti artikel premium",
      "Gratis akses preview",
    ],
    note: "Ribuan pembaca memulai dari bab ini.",
    cta: "Baca Gratis Sekarang",
    style: "ghost",
    icon: BookOpen,
  },
  {
    id: "perbab",
    tag: "Satuan",
    name: "Per Bab",
    sub: "Pilih kedalaman yang ingin Anda bongkar",
    price: "Rp 10.000",
    priceNote: "per bab · Bab 2 – Bab 7",
    features: [
      "Bab 2 — Dedi Mulyadi & Kelahiran Genre",
      "Bab 3 — Empat Gubernur, Empat Strategi",
      "Bab 4 — Tujuh Dakwaan",
      "Bab 5 — Pembelaan & Epistemologi",
      "Bab 6 — AI, Deepfake & Demokrasi",
      "Bab 7 — Setelah Panggung Ditutup",
    ],
    note: "Seperti membeli episode serial politik.",
    cta: "Pilih Bab",
    style: "ghost",
    icon: Sparkles,
  },
  {
    id: "full",
    tag: "Full Access",
    name: "Full Buku",
    sub: "Tujuh bab, tiga format, satu peta kekuasaan.",
    price: "Rp 55.000",
    priceNote: "Sekali bayar · Akses selamanya",
    features: [
      "Semua 7 bab",
      "PDF premium · cetak-siap",
      "EPUB mobile · Kindle / Apple Books",
      "Flipbook cinematic",
      "Update revisi terbaru",
      "Bonus: akses AI Assistant",
    ],
    note: "Paling diminati pembaca akademis & praktisi.",
    cta: "Ambil Full Buku",
    style: "primary",
    featured: true,
    icon: Sparkles,
  },
];

export default function Pricing() {
  const [ref, vis] = useReveal(0.05);

  const onSelect = (plan) => {
    trackCta(`pricing-${plan.id}`, "pricing");
    // Open AI chat with appropriate intent
    if (plan.id === "free") {
      openChat({ intent: "bab1" });
    } else if (plan.id === "perbab") {
      openChat({ intent: "select-perbab" });
    } else {
      openChat({ intent: "select-full" });
    }
  };

  return (
    <section
      id="pricing"
      ref={ref}
      data-testid="pricing-section"
      className="relative py-24 sm:py-32"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className={`max-w-3xl mb-14 reveal ${vis ? "is-visible" : ""}`}>
          <div className="gk-ribbon mb-5">Pilih jalur akses</div>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-[#F4F0E8] leading-tight">
            Mulai dari <span className="italic text-[#C9920A]">gratis</span>. Lanjut sesuai kedalaman.
          </h2>
          <p className="mt-5 text-[#F4F0E8]/65 max-w-2xl">
            Bab 1 gratis untuk semua — bayar hanya bila Anda ingin membongkar lebih dalam. Konfirmasi pembelian dilakukan oleh AI Assistant langsung di halaman ini, lalu akses dikirim ke WhatsApp Anda.
          </p>
        </div>

        <div className={`grid lg:grid-cols-3 gap-6 lg:gap-7 stagger ${vis ? "is-visible" : ""}`}>
          {PLANS.map((p, i) => {
            const Icon = p.icon;
            return (
              <div
                key={p.id}
                data-testid={`pricing-card-${p.id}`}
                className={`relative p-8 sm:p-10 flex flex-col ${
                  p.featured ? "pricing-card-featured" : "gk-card"
                }`}
              >
                {p.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-[#B8211A] text-[#F4F0E8] text-[10px] font-bold tracking-[0.24em] flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" />
                    PALING DIMINATI
                  </div>
                )}

                <div className="flex items-start justify-between">
                  <div>
                    <div className="overline text-[#C9920A]">{p.tag}</div>
                    <h3 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-[#F4F0E8]">
                      {p.name}
                    </h3>
                    <p className="mt-1.5 text-xs text-[#F4F0E8]/55 max-w-[28ch]">{p.sub}</p>
                  </div>
                  <Icon className="w-6 h-6 text-[#C9920A]/70 shrink-0" strokeWidth={1.5} />
                </div>

                <div className="mt-7">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-display text-5xl font-black text-[#F4F0E8]">{p.price}</span>
                  </div>
                  <div className="mt-1 text-xs text-[#F4F0E8]/45 font-mono uppercase tracking-wider">{p.priceNote}</div>
                </div>

                <ul className="mt-7 space-y-3 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-[#F4F0E8]/80">
                      <Check className="w-4 h-4 text-[#C9920A] mt-0.5 shrink-0" strokeWidth={2.2} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {p.note && (
                  <p className="mt-6 text-xs italic text-[#F4F0E8]/55 font-display">{p.note}</p>
                )}

                {p.id === "free" ? (
                  <Link
                    to="/bab1"
                    onClick={() => onSelect(p)}
                    data-testid={`pricing-cta-${p.id}`}
                    className="mt-7 btn-ghost justify-center"
                  >
                    <BookOpen className="w-4 h-4" strokeWidth={1.8} />
                    {p.cta}
                  </Link>
                ) : (
                  <button
                    onClick={() => onSelect(p)}
                    data-testid={`pricing-cta-${p.id}`}
                    className={`mt-7 ${p.featured ? "btn-primary" : "btn-ghost"} justify-center`}
                  >
                    <MessageCircle className="w-4 h-4" strokeWidth={1.8} />
                    {p.cta}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-center text-xs text-[#F4F0E8]/45 font-mono">
          KONFIRMASI VIA AI ASSISTANT · TRANSFER · QRIS · WHATSAPP ADMIN · AKSES &lt; 10 MENIT
        </p>
      </div>
    </section>
  );
}
