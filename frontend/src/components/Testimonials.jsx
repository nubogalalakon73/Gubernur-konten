import { Star, Quote } from "lucide-react";
import { useReveal } from "@/lib/useReveal";

const TESTIMONIALS = [
  {
    name: "Dr. Rahmat Hidayat",
    role: "Akademisi · Komunikasi Politik",
    text: "Pemetaan yang jujur dan menggigit. Buku ini akan jadi rujukan wajib di mata kuliah komunikasi politik di tahun-tahun ke depan.",
  },
  {
    name: "Anita Wulansari",
    role: "Pengamat Sosial Digital",
    text: "Akhirnya ada buku yang berani memberi nama pada fenomena yang selama ini kita rasakan tapi sulit kita rumuskan: politik algoritmik lokal.",
  },
  {
    name: "Bambang S.",
    role: "Dosen FISIP",
    text: "Kerangka 'dakwaan–pembelaan–sintesis' membuat buku ini bukan polemik, tapi proses berpikir. Itu langka di literatur politik kita.",
  },
  {
    name: "Tania R.",
    role: "Konsultan Kampanye Digital",
    text: "Dibaca seperti laporan investigasi. Saya menandai hampir setiap halaman. Bab 4 sendirian sudah sepadan harganya.",
  },
];

export default function Testimonials() {
  const [ref, vis] = useReveal(0.1);

  return (
    <section
      id="testimonials"
      ref={ref}
      data-testid="testimonials-section"
      className="relative py-24 sm:py-32 bg-[#0E141B]"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className={`max-w-3xl mb-14 reveal ${vis ? "is-visible" : ""}`}>
          <div className="gk-ribbon mb-5">Apa kata pembaca awal</div>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-[#F4F0E8] leading-tight">
            Suara dari ruang kelas, ruang redaksi, dan ruang strategi.
          </h2>
        </div>

        <div className={`grid sm:grid-cols-2 gap-6 stagger ${vis ? "is-visible" : ""}`}>
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.name}
              data-testid={`testimonial-${i}`}
              className="gk-card p-8 relative"
            >
              <Quote className="w-8 h-8 text-[#B8211A]/40 mb-5" strokeWidth={1.2} />
              <p className="font-display text-lg sm:text-xl text-[#F4F0E8] italic leading-relaxed">
                "{t.text}"
              </p>
              <div className="mt-6 flex items-center justify-between pt-6 border-t border-white/5">
                <div>
                  <div className="font-display text-[#F4F0E8] font-semibold">{t.name}</div>
                  <div className="text-xs text-[#F4F0E8]/55 font-mono mt-1">{t.role}</div>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, k) => (
                    <Star key={k} className="w-3.5 h-3.5 fill-[#C9920A] text-[#C9920A]" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
