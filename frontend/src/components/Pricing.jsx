import { Check, Sparkles, MessageCircle } from "lucide-react";
import { WA_LINK, trackCta } from "@/lib/api";
import { useReveal } from "@/lib/useReveal";

const PLANS = [
  {
    name: "PDF Only",
    price: "Rp 79.000",
    cap: "Edisi digital paling efisien",
    features: [
      "Versi PDF cetak-siap (248 hal.)",
      "Akses unduh selamanya",
      "Bonus: ringkasan eksekutif 12 hal.",
    ],
    featured: false,
    cta: "Beli PDF",
  },
  {
    name: "Pembaca Cerdas",
    price: "Rp 129.000",
    cap: "Paling diminati",
    features: [
      "Versi PDF + EPUB + FLIPBOOK",
      "Optimal di HP, tablet, & desktop",
      "Bonus: Peta visual 7 bab cetak-siap",
      "Akses early update edisi 2027",
    ],
    featured: true,
    cta: "Beli Bundle",
  },
  {
    name: "Premium Bundle",
    price: "Rp 249.000",
    cap: "Untuk pembaca + tim strategi",
    features: [
      "Semua format (PDF, EPUB, Flipbook)",
      "Sesi diskusi privat AI Assistant (30 menit)",
      "Workbook strategi politik digital",
      "Akses webinar pembaca tertutup",
      "Sertifikat pembaca premium",
    ],
    featured: false,
    cta: "Ambil Premium",
  },
];

export default function Pricing() {
  const [ref, vis] = useReveal(0.05);

  const onSelect = (plan) => {
    trackCta(`pricing-${plan.name}`, "pricing");
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
          <div className="gk-ribbon mb-5">Pilih paket</div>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-[#F4F0E8] leading-tight">
            Investasi kecil untuk membaca <span className="italic text-[#C9920A]">peta kekuasaan</span> digital.
          </h2>
          <p className="mt-5 text-[#F4F0E8]/65">
            Bayar sekali, akses selamanya. Konfirmasi pembelian via WhatsApp AI Assistant — invoice & link unduh dikirim dalam hitungan menit.
          </p>
        </div>

        <div className={`grid lg:grid-cols-3 gap-6 lg:gap-7 stagger ${vis ? "is-visible" : ""}`}>
          {PLANS.map((p, i) => (
            <div
              key={p.name}
              data-testid={`pricing-card-${i}`}
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
              <div className="overline text-[#C9920A]">{p.cap}</div>
              <h3 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-[#F4F0E8]">
                {p.name}
              </h3>

              <div className="mt-6 flex items-baseline gap-2">
                <span className="font-display text-5xl font-black text-[#F4F0E8]">{p.price}</span>
              </div>
              <div className="mt-1 text-xs text-[#F4F0E8]/45 font-mono">SEKALI BAYAR · AKSES SELAMANYA</div>

              <ul className="mt-7 space-y-3 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-[#F4F0E8]/80">
                    <Check className="w-4 h-4 text-[#C9920A] mt-0.5 shrink-0" strokeWidth={2.2} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <a
                href={WA_LINK(`Halo, saya ingin beli paket "${p.name}" (${p.price}) ebook Gubernur Konten.`)}
                target="_blank"
                rel="noreferrer"
                onClick={() => onSelect(p)}
                data-testid={`pricing-cta-${i}`}
                className={`mt-8 ${p.featured ? "btn-primary" : "btn-ghost"} justify-center`}
              >
                <MessageCircle className="w-4 h-4" strokeWidth={1.8} />
                {p.cta}
              </a>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-[#F4F0E8]/45 font-mono">
          PEMBAYARAN AMAN · BCA / MANDIRI / GOPAY / OVO / DANA · KONFIRMASI &lt; 10 MENIT
        </p>
      </div>
    </section>
  );
}
