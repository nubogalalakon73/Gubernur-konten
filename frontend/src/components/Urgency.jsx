import { ArrowRight } from "lucide-react";
import { trackCta } from "@/lib/api";
import { useReveal } from "@/lib/useReveal";

export default function Urgency() {
  const [ref, vis] = useReveal(0.1);

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
          Edisi 2026
        </div>
        <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-[#F4F0E8] leading-[1.05] text-shadow-cinematic">
          Di era politik <span className="italic text-[#C9920A]">algoritma</span>,
          <br />
          siapa yang menguasai konten,
          <br />
          <span className="text-[#F4F0E8]">menguasai </span><span className="text-[#C9920A] italic">persepsi.</span>
        </h2>

        <p className="mt-8 max-w-2xl mx-auto text-[#F4F0E8]/70 leading-relaxed">
          Baca dari mereka yang membedah panggung itu — bukan dari ringkasan media, bukan dari opini X, melainkan dari analisis dalam yang sudah dirumuskan.
        </p>

        <button
          onClick={onClick}
          data-testid="urgency-cta"
          className="mt-10 btn-primary text-base"
        >
          Miliki Ebook Sekarang
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
