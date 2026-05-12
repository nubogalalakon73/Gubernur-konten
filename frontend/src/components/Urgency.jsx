import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { trackCta } from "@/lib/api";
import { useReveal } from "@/lib/useReveal";

function useCountdown(targetMs) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, targetMs - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff / 3600000) % 24);
  const m = Math.floor((diff / 60000) % 60);
  const s = Math.floor((diff / 1000) % 60);
  return { d, h, m, s };
}

export default function Urgency() {
  const [ref, vis] = useReveal(0.1);
  // 14 days from page load
  const [target] = useState(() => Date.now() + 14 * 86400000);
  const { d, h, m, s } = useCountdown(target);

  const onClick = () => {
    trackCta("urgency-buy", "urgency");
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      ref={ref}
      data-testid="urgency-section"
      className="relative py-24 sm:py-32 overflow-hidden grain grain-strong"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#3a0d0a] via-[#1a0606] to-[#0B0F14]" />
      <div className="spotlight" style={{ top: "10%", left: "30%", background: "radial-gradient(circle, rgba(184,33,26,0.4), transparent 60%)" }} />

      <div className={`relative z-10 max-w-5xl mx-auto px-5 sm:px-8 lg:px-12 text-center reveal ${vis ? "is-visible" : ""}`}>
        <div className="gk-ribbon mx-auto mb-6" style={{ borderColor: "rgba(244,240,232,0.3)" }}>
          Edisi Terbatas · Awal Rilis 2026
        </div>
        <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-[#F4F0E8] leading-[1.05] text-shadow-cinematic">
          Di era politik <span className="italic text-[#C9920A]">algoritma</span>,
          <br />
          siapa yang menguasai konten,
          <br />
          <span className="text-[#F4F0E8]">menguasai </span><span className="text-[#C9920A] italic">persepsi.</span>
        </h2>

        <div
          className="mt-12 grid grid-cols-4 max-w-xl mx-auto gap-2 sm:gap-4"
          data-testid="urgency-countdown"
        >
          {[
            { v: d, l: "Hari" },
            { v: h, l: "Jam" },
            { v: m, l: "Menit" },
            { v: s, l: "Detik" },
          ].map((b) => (
            <div key={b.l} className="bg-[#0B0F14]/60 border border-white/10 backdrop-blur-sm py-4 sm:py-6">
              <div className="font-display text-3xl sm:text-5xl font-black text-[#F4F0E8] tabular-nums">
                {String(b.v).padStart(2, "0")}
              </div>
              <div className="overline text-[#C9920A] text-[10px] mt-1">{b.l}</div>
            </div>
          ))}
        </div>

        <button
          onClick={onClick}
          data-testid="urgency-cta"
          className="mt-12 btn-primary text-base"
        >
          Miliki Ebook Sekarang
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
