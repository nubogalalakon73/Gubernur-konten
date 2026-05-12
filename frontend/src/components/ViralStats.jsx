import { TrendingUp, AlertTriangle } from "lucide-react";
import { useCountUp, useReveal } from "@/lib/useReveal";

export default function ViralStats() {
  const [r1, v1] = useCountUp(95.5, 2000);
  const [r2, v2] = useCountUp(3.55, 2000);
  const [secRef, secVis] = useReveal(0.1);

  return (
    <section
      id="viral"
      ref={secRef}
      data-testid="viral-section"
      className="relative py-24 sm:py-32 overflow-hidden grain"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F14] via-[#0E141B] to-[#0B0F14]" />
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className={`max-w-3xl mb-16 reveal ${secVis ? "is-visible" : ""}`}>
          <div className="gk-ribbon mb-5">Kenapa buku ini viral</div>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-[#F4F0E8] leading-tight">
            Bagaimana mungkin <span className="italic text-[#C9920A]">kepuasan publik</span> hampir sempurna,
            <br className="hidden sm:block" /> sementara <span className="text-[#B8211A]">ketimpangan</span> masih membesar?
          </h2>
          <p className="mt-5 text-[#F4F0E8]/70 max-w-2xl">
            Dua angka di bawah ini diam-diam menjelaskan paradoks politik lokal Indonesia hari ini — dan menjadi titik berangkat seluruh argumen buku.
          </p>
        </div>

        {/* Dashboard stat grid */}
        <div className={`grid md:grid-cols-2 gap-6 lg:gap-10 stagger ${secVis ? "is-visible" : ""}`}>
          {/* Card 1 */}
          <div
            ref={r1}
            data-testid="viral-stat-satisfaction"
            className="gk-card p-8 sm:p-12 relative"
          >
            <div className="flex items-start justify-between mb-8">
              <div>
                <div className="overline text-[#C9920A]">Indikator Politik</div>
                <div className="mt-1 text-[#F4F0E8]/60 text-sm">Kepuasan terhadap pemerintahan populis lokal</div>
              </div>
              <TrendingUp className="w-5 h-5 text-[#C9920A]" strokeWidth={1.5} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-7xl sm:text-8xl font-black text-[#F4F0E8] leading-none">
                {v1.toFixed(1)}
              </span>
              <span className="font-display text-3xl text-[#C9920A]">%</span>
            </div>
            <div className="mt-6 h-1.5 bg-white/5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#C9920A] to-[#E0B554] transition-all duration-[1800ms]"
                style={{ width: `${Math.min(v1, 100)}%` }}
              />
            </div>
            <div className="mt-4 text-xs text-[#F4F0E8]/50 font-mono">SOURCE · BPS / SURVEY POLITIK 2025</div>
            <p className="mt-6 text-[#F4F0E8]/75 leading-relaxed">
              Hampir seluruh publik puas. Sebuah konsensus yang nyaris mustahil dalam demokrasi normal. Dari mana ia datang?
            </p>
          </div>

          {/* Card 2 */}
          <div
            ref={r2}
            data-testid="viral-stat-poverty"
            className="gk-card p-8 sm:p-12 relative"
            style={{ borderColor: "rgba(184,33,26,0.25)" }}
          >
            <div className="flex items-start justify-between mb-8">
              <div>
                <div className="overline text-[#B8211A]">Realita Material</div>
                <div className="mt-1 text-[#F4F0E8]/60 text-sm">Penduduk miskin Jawa Barat (BPS)</div>
              </div>
              <AlertTriangle className="w-5 h-5 text-[#B8211A]" strokeWidth={1.5} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-7xl sm:text-8xl font-black text-[#F4F0E8] leading-none">
                {v2.toFixed(2)}
              </span>
              <span className="font-display text-3xl text-[#B8211A]">Juta</span>
            </div>
            <div className="mt-6 h-1.5 bg-white/5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#B8211A] to-[#8A1713] transition-all duration-[1800ms]"
                style={{ width: `${(v2 / 5) * 100}%` }}
              />
            </div>
            <div className="mt-4 text-xs text-[#F4F0E8]/50 font-mono">SOURCE · BPS PROVINSI 2025</div>
            <p className="mt-6 text-[#F4F0E8]/75 leading-relaxed">
              Di balik panggung digital yang gemerlap, ketimpangan tetap berbicara. Buku ini membaca jarak di antara keduanya.
            </p>
          </div>
        </div>

        <div className="animated-line mt-14" />

        <p className="mt-10 max-w-3xl font-display italic text-xl sm:text-2xl text-[#F4F0E8]/80 leading-relaxed">
          “Konten yang viral memenangkan persepsi. Tetapi sejarah politik dimenangkan
          oleh siapa yang menjelaskan jarak antara <span className="text-[#C9920A]">persepsi</span> dan <span className="text-[#B8211A]">realita</span>.”
        </p>
      </div>
    </section>
  );
}
