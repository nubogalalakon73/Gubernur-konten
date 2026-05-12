import { ArrowRight, MessageCircle, Star, Download, Users, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { COVER_FRONT, COVER_BACK, WA_LINK, trackCta, API } from "@/lib/api";
import { useReveal } from "@/lib/useReveal";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Hero() {
  const [ref, visible] = useReveal(0.05);
  const [stats, setStats] = useState({ readers: 4280, downloads: 1742, rating: 4.9 });

  useEffect(() => {
    axios.get(`${API}/stats`).then((r) => setStats(r.data)).catch(() => {});
  }, []);

  const scrollToPricing = () => {
    trackCta("hero-beli-sekarang", "hero");
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      ref={ref}
      data-testid="hero-section"
      className="relative min-h-screen overflow-hidden flex items-center pt-28 pb-20 grain"
    >
      {/* Background layers */}
      <div className="absolute inset-0 dot-grid opacity-50" />
      <div className="hero-vignette" />
      <div className="spotlight" style={{ top: "15%", left: "5%" }} />
      <div className="spotlight" style={{ bottom: "10%", right: "5%", background: "radial-gradient(circle, rgba(201,146,10,0.18), transparent 60%)" }} />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 w-full">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* LEFT — copy */}
          <div className={`lg:col-span-7 reveal ${visible ? "is-visible" : ""}`}>
            <div className="flex flex-wrap items-center gap-3 mb-7">
              <span className="gk-ribbon" data-testid="hero-badge-bestseller">
                Best Seller · Political Analysis 2026
              </span>
              <span className="gk-ribbon" style={{ borderColor: "rgba(201,146,10,0.4)" }}>
                Limited Release
              </span>
            </div>

            <h1 className="font-display text-[2.5rem] sm:text-5xl lg:text-7xl font-black leading-[1.02] text-[#F4F0E8] text-shadow-cinematic">
              Ketika <span className="italic font-light" style={{ color: "#C9920A" }}>Algoritma</span>
              <br />
              Menjadi Alun-Alun
              <br />
              <span className="text-[#B8211A]">Kekuasaan.</span>
            </h1>

            <p className="mt-7 max-w-xl text-base sm:text-lg text-[#F4F0E8]/75 leading-relaxed font-light">
              Buku pertama yang membedah bagaimana <span className="text-[#F4F0E8] font-medium">konten digital</span> berubah menjadi instrumen kekuasaan politik di Indonesia — dari panggung Dedi Mulyadi hingga arsitektur populisme algoritmik lima gubernur paling viral.
            </p>

            {/* CTAs */}
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <button
                onClick={scrollToPricing}
                data-testid="hero-cta-primary"
                className="btn-primary group"
              >
                Beli Ebook Sekarang
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={2} />
              </button>
              <Link
                to="/bab1"
                onClick={() => trackCta("hero-bab1", "hero")}
                data-testid="hero-cta-bab1"
                className="btn-gold"
              >
                <BookOpen className="w-4 h-4" strokeWidth={1.7} />
                Baca Bab 1 Gratis
              </Link>
              <a
                href={WA_LINK("Halo, saya tertarik dengan ebook Gubernur Konten. Mohon info pembelian.")}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackCta("hero-wa-consult", "hero")}
                data-testid="hero-cta-secondary"
                className="btn-ghost"
              >
                <MessageCircle className="w-4 h-4" strokeWidth={1.7} />
                Konsultasi WhatsApp
              </a>
            </div>

            {/* Social proof */}
            <div className="mt-12 flex flex-wrap items-center gap-6 sm:gap-10 pt-7 border-t border-white/10">
              <div data-testid="hero-stat-readers">
                <div className="flex items-center gap-2 text-[#C9920A]">
                  <Users className="w-4 h-4" strokeWidth={1.6} />
                  <span className="font-display text-2xl font-bold text-[#F4F0E8]">{stats.readers.toLocaleString("id-ID")}+</span>
                </div>
                <div className="overline text-[#F4F0E8]/50 mt-1">Pembaca</div>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div data-testid="hero-stat-downloads">
                <div className="flex items-center gap-2 text-[#C9920A]">
                  <Download className="w-4 h-4" strokeWidth={1.6} />
                  <span className="font-display text-2xl font-bold text-[#F4F0E8]">{stats.downloads.toLocaleString("id-ID")}+</span>
                </div>
                <div className="overline text-[#F4F0E8]/50 mt-1">Download</div>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div data-testid="hero-stat-rating">
                <div className="flex items-center gap-2 text-[#C9920A]">
                  <Star className="w-4 h-4 fill-[#C9920A]" strokeWidth={1.6} />
                  <span className="font-display text-2xl font-bold text-[#F4F0E8]">{stats.rating}/5</span>
                </div>
                <div className="overline text-[#F4F0E8]/50 mt-1">Rating Pembaca</div>
              </div>
            </div>

            <p className="mt-7 text-sm text-[#F4F0E8]/55 italic font-display">
              “Saya harus baca buku ini sebelum semua orang membahasnya.” — Pembaca awal
            </p>
          </div>

          {/* RIGHT — 3D book */}
          <div className={`lg:col-span-5 relative reveal ${visible ? "is-visible" : ""}`}>
            <div className="book-stage relative mx-auto max-w-md">
              <div className="book-glow" />
              <div className="book-3d">
                <div className="spine" />
                <div
                  className="back"
                  style={{ backgroundImage: `url(${COVER_BACK})` }}
                />
                <div
                  className="cover"
                  style={{ backgroundImage: `url(${COVER_FRONT})` }}
                  data-testid="hero-book-cover"
                />
              </div>
              {/* Bottom reflection */}
              <div className="mt-6 mx-auto w-3/4 h-12 rounded-[50%] bg-gradient-to-b from-black/50 to-transparent blur-2xl" />
            </div>

            {/* Side captions */}
            <div className="hidden lg:flex flex-col gap-3 absolute -right-2 top-1/3">
              <div className="text-right">
                <div className="overline text-[#C9920A]">Edition</div>
                <div className="font-display text-2xl text-[#F4F0E8] font-bold">2026</div>
              </div>
              <div className="text-right pt-3 border-t border-white/10">
                <div className="overline text-[#F4F0E8]/50">Format</div>
                <div className="font-mono text-xs text-[#F4F0E8]/80">PDF · EPUB · FLIPBOOK</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-2 text-[#F4F0E8]/40">
        <div className="overline">Scroll</div>
        <div className="w-px h-10 bg-gradient-to-b from-[#B8211A] to-transparent" />
      </div>
    </section>
  );
}
