import { Check, X } from "lucide-react";
import { useReveal } from "@/lib/useReveal";

const NOT = [
  "Buku puja-puji untuk figur tertentu",
  "Propaganda politik berbungkus akademik",
  "Sekadar opini tanpa data",
  "Hard selling popularitas",
];

const IS = [
  "Kerangka dakwaan–pembelaan–sintesis",
  "Berbasis data BPS & observasi sosial",
  "Pembedahan populisme digital Indonesia",
  "Disiplin akademik dengan nuansa investigatif",
];

export default function Difference() {
  const [ref, vis] = useReveal(0.05);

  return (
    <section
      id="about"
      ref={ref}
      data-testid="difference-section"
      className="relative py-24 sm:py-32 grain"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className={`grid lg:grid-cols-12 gap-10 reveal ${vis ? "is-visible" : ""}`}>
          <div className="lg:col-span-5">
            <div className="gk-ribbon mb-5">Tentang Buku</div>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-[#F4F0E8] leading-tight">
              Apa yang membuat buku ini <span className="italic text-[#C9920A]">berbeda</span>?
            </h2>
            <p className="mt-6 text-[#F4F0E8]/70 leading-relaxed">
              <span className="font-display italic text-[#F4F0E8]">Gubernur Konten</span> tidak ditulis untuk memuji atau menjatuhkan. Buku ini dirancang sebagai instrumen baca — sebuah lensa yang membantu publik memahami pergeseran besar di balik panggung digital politik lokal.
            </p>
            <div className="mt-10 animated-line" />
            <div className="mt-8 text-[#F4F0E8]/50 text-sm font-mono">
              METODE · DAKWAAN — PEMBELAAN — SINTESIS
            </div>
          </div>

          <div className="lg:col-span-7 grid sm:grid-cols-2 gap-6">
            <div className="gk-card p-7" data-testid="diff-card-not">
              <div className="overline text-[#B8211A] flex items-center gap-2">
                <X className="w-4 h-4" /> Buku ini bukan
              </div>
              <ul className="mt-5 space-y-4">
                {NOT.map((t) => (
                  <li key={t} className="flex gap-3 text-[#F4F0E8]/75 text-sm">
                    <span className="text-[#B8211A] mt-1">—</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="gk-card p-7" data-testid="diff-card-is" style={{ borderColor: "rgba(201,146,10,0.3)" }}>
              <div className="overline text-[#C9920A] flex items-center gap-2">
                <Check className="w-4 h-4" /> Buku ini adalah
              </div>
              <ul className="mt-5 space-y-4">
                {IS.map((t) => (
                  <li key={t} className="flex gap-3 text-[#F4F0E8]/85 text-sm">
                    <span className="text-[#C9920A] mt-1">→</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cinematic blockquote spanning */}
            <blockquote className="sm:col-span-2 relative p-8 sm:p-12 border-l-2 border-[#B8211A] bg-gradient-to-br from-[#131A22] to-transparent">
              <div className="font-display text-[5rem] leading-none text-[#B8211A]/30 absolute top-4 left-6">“</div>
              <p className="font-display italic text-2xl sm:text-3xl text-[#F4F0E8] leading-snug relative">
                Ini bukan sekadar konten.
                <br />
                Ini tentang <span className="text-[#C9920A]">siapa dalang</span>, dan
                <span className="text-[#B8211A]"> siapa yang dimainkan</span>.
              </p>
              <div className="mt-6 text-sm text-[#F4F0E8]/55 font-mono">
                — DIDI SUBANDI &amp; YULLY AMBARSIH EKAWARDHANI
              </div>
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
}
