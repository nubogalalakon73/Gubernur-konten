import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, BookOpen, ArrowRight, Lock, X, Sparkles } from "lucide-react";
import { BAB1 } from "@/lib/bab1Content";
import { COVER_FRONT, trackCta, WA_LINK } from "@/lib/api";
import { openChat } from "@/lib/chatEvents";

export default function Bab1() {
  const [progress, setProgress] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [popupDismissed, setPopupDismissed] = useState(false);
  const articleRef = useRef(null);
  const navigate = useNavigate();

  // SEO
  useEffect(() => {
    const prev = document.title;
    document.title = "Bab 1 — Ketika Algoritma Menjadi Alun-Alun | Gubernur Konten";

    const setMeta = (name, content, attr = "name") => {
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", "Baca Bab 1 buku 'Gubernur Konten' gratis. 'Ketika Algoritma Menjadi Alun-Alun Kekuasaan' — pembukaan analisis populisme digital politik lokal Indonesia.");
    setMeta("og:title", "Bab 1 — Ketika Algoritma Menjadi Alun-Alun", "property");
    setMeta("og:description", "Preview gratis buku 'Gubernur Konten: Siapa Dalang, Siapa Wayang?'", "property");
    setMeta("og:image", COVER_FRONT, "property");
    setMeta("og:type", "article", "property");

    return () => { document.title = prev; };
  }, []);

  // Scroll progress + 60% popup
  useEffect(() => {
    const onScroll = () => {
      const el = articleRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(total, 0));
      const pct = total > 0 ? (scrolled / total) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, pct)));
      if (!popupDismissed && pct >= 60 && !showPopup) {
        setShowPopup(true);
        trackCta("bab1-60-popup-shown", "bab1");
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [showPopup, popupDismissed]);

  // Light anti-copy
  useEffect(() => {
    const block = (e) => { e.preventDefault(); return false; };
    const copy = (e) => {
      e.preventDefault();
      try {
        e.clipboardData.setData(
          "text/plain",
          "Preview Bab 1 — © Gubernur Konten oleh Didi Subandi & Yully Ambarsih Ekawardhani. Versi penuh: https://gubernur-konten.preview.emergentagent.com"
        );
      } catch (_) {}
    };
    document.addEventListener("contextmenu", block);
    document.addEventListener("copy", copy);
    return () => {
      document.removeEventListener("contextmenu", block);
      document.removeEventListener("copy", copy);
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const buyFull = () => {
    trackCta("bab1-buy-full", "bab1");
    navigate("/");
    setTimeout(() => {
      document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  };

  const askAI = () => {
    trackCta("bab1-ask-ai", "bab1");
    openChat({ intent: "harga" });
  };

  return (
    <div className="bg-[#0B0F14] text-[#F4F0E8] min-h-screen relative overflow-x-hidden" data-testid="bab1-page">
      {/* Watermark behind */}
      <div className="reader-watermark" aria-hidden="true" />

      {/* Progress bar */}
      <div
        className="reader-progress"
        style={{ width: `${progress}%` }}
        data-testid="bab1-progress"
      />

      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-[#0B0F14]/85 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 py-3 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2 text-[#F4F0E8]/70 hover:text-[#B8211A] transition-colors text-sm" data-testid="bab1-back">
            <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Beranda</span>
          </Link>
          <div className="text-xs text-[#F4F0E8]/55 flex items-center gap-3">
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {BAB1.readingTimeMin} min</span>
            <span className="hidden sm:inline-flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> Bab 1 / 7</span>
          </div>
          <button
            onClick={buyFull}
            data-testid="bab1-topbar-buy"
            className="text-xs font-bold uppercase tracking-wider px-3 py-2 bg-[#B8211A] text-[#F4F0E8] hover:bg-[#8A1713] transition-colors"
          >
            Full Buku · 55K
          </button>
        </div>
      </header>

      <article
        ref={articleRef}
        className="relative z-10 max-w-3xl mx-auto px-5 sm:px-6 pt-12 pb-32 reader-no-select"
        data-testid="bab1-article"
      >
        {/* Cover header */}
        <div className="mb-12 flex flex-col items-center text-center">
          <img
            src={COVER_FRONT}
            alt="Gubernur Konten — Cover"
            className="w-40 sm:w-48 shadow-2xl mb-7"
            draggable="false"
          />
          <div className="gk-ribbon mb-5">{BAB1.number} · Preview Gratis</div>
          <h1 className="font-display text-3xl sm:text-5xl font-black text-[#F4F0E8] leading-[1.1] text-shadow-cinematic">
            {BAB1.title}
          </h1>
          <p className="mt-4 text-[#F4F0E8]/65 font-display italic text-base sm:text-lg max-w-xl">
            {BAB1.subtitle}
          </p>
          <div className="mt-6 text-xs font-mono text-[#F4F0E8]/45 flex items-center gap-4">
            <span>{BAB1.authors}</span>
            <span>·</span>
            <span>{BAB1.date}</span>
          </div>
          <div className="mt-8 gk-divider w-32" />
        </div>

        {/* Body */}
        <div className="reader-body">
          {BAB1.sections.map((s, i) => (
            <section key={i} className="reader-section" data-testid={`bab1-section-${i}`}>
              <h2>{s.h}</h2>
              {s.p.map((para, j) => (
                <p key={j}>{para}</p>
              ))}

              {/* Mid-article soft CTA after section 2 */}
              {i === 2 && (
                <aside className="reader-cta-soft" data-testid="bab1-mid-cta">
                  <div className="overline text-[#C9920A] mb-2">Selingan dari editor</div>
                  <p className="font-display italic text-lg sm:text-xl text-[#F4F0E8] leading-snug !mb-0">
                    Jika Bab 1 saja sudah membuka cara pandang baru tentang politik digital Indonesia,
                    bayangkan apa yang terjadi di <span className="text-[#C9920A]">Bab 4</span> dan <span className="text-[#C9920A]">Bab 6</span>.
                  </p>
                  <button
                    onClick={buyFull}
                    data-testid="bab1-mid-cta-btn"
                    className="mt-5 btn-primary"
                  >
                    Buka Full Buku <ArrowRight className="w-4 h-4" />
                  </button>
                </aside>
              )}
            </section>
          ))}

          {/* Locked chapter teasers */}
          <div className="mt-16 pt-10 border-t border-white/10">
            <div className="gk-ribbon mb-5">Bab Berikutnya</div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold !mt-0 text-[#F4F0E8]">Tunggu Anda di halaman berikutnya.</h2>
            <p className="text-[#F4F0E8]/70 text-base mt-3">Akses berikut hanya tersedia di Full Buku atau pembelian per-bab.</p>

            <div className="mt-7 space-y-3" data-testid="bab1-locked-list">
              {[
                "BAB 2 — Dedi Mulyadi dan Kelahiran Genre",
                "BAB 3 — Empat Gubernur, Empat Strategi",
                "BAB 4 — Tujuh Dakwaan terhadap Gubernur Konten",
                "BAB 5 — Pembelaan dan Epistemologi Politik Lokal",
                "BAB 6 — AI, Deepfake, dan Masa Depan Demokrasi",
                "BAB 7 — Setelah Panggung Ditutup",
              ].map((c, i) => (
                <div key={c} className="flex items-center justify-between gap-3 p-4 bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-3 min-w-0">
                    <Lock className="w-4 h-4 text-[#C9920A] shrink-0" />
                    <span className="font-display text-base sm:text-lg text-[#F4F0E8]/85 truncate">{c}</span>
                  </div>
                  <span className="text-xs font-mono text-[#F4F0E8]/40 shrink-0">Rp 10K</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </article>

      {/* Sticky bottom CTA */}
      <div className="fixed bottom-0 inset-x-0 z-30 bg-gradient-to-t from-[#0B0F14] via-[#0B0F14]/95 to-transparent pt-8 pb-3" data-testid="bab1-sticky-cta">
        <div className="max-w-3xl mx-auto px-5 sm:px-6">
          <div className="gk-card p-4 sm:p-5 flex items-center gap-3 sm:gap-4 glow-red">
            <div className="hidden sm:block">
              <Sparkles className="w-7 h-7 text-[#C9920A]" strokeWidth={1.4} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display text-[#F4F0E8] font-semibold text-sm sm:text-base">Lanjut ke 6 bab berikutnya?</div>
              <div className="text-[11px] sm:text-xs text-[#F4F0E8]/55">Full Buku — PDF · EPUB · Flipbook · Akses AI Assistant</div>
            </div>
            <button onClick={askAI} className="hidden sm:inline-flex btn-ghost text-xs py-2 px-3" data-testid="bab1-ai-btn">
              Tanya AI
            </button>
            <button onClick={buyFull} className="btn-primary text-xs py-2.5 px-4 shrink-0" data-testid="bab1-sticky-buy">
              Beli Rp 55K
            </button>
          </div>
        </div>
      </div>

      {/* 60% scroll popup */}
      {showPopup && (
        <div
          className="fixed inset-0 z-50 grid place-items-center p-5 bg-black/70 backdrop-blur-sm"
          onClick={() => { setShowPopup(false); setPopupDismissed(true); }}
          data-testid="bab1-popup-overlay"
        >
          <div
            className="relative w-full max-w-md gk-card p-7 sm:p-9"
            onClick={(e) => e.stopPropagation()}
            data-testid="bab1-popup"
          >
            <button
              onClick={() => { setShowPopup(false); setPopupDismissed(true); }}
              className="absolute top-3 right-3 text-[#F4F0E8]/50 hover:text-[#F4F0E8] p-2"
              data-testid="bab1-popup-close"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="gk-ribbon mb-4">Catatan pembaca</div>
            <p className="font-display text-xl sm:text-2xl text-[#F4F0E8] leading-snug">
              Pembaca yang menyelesaikan Bab 1 biasanya langsung melanjutkan ke <span className="text-[#C9920A]">Bab 4</span>:
              <span className="italic"> 'Tujuh Dakwaan terhadap Gubernur Konten.'</span>
            </p>
            <p className="mt-3 text-sm text-[#F4F0E8]/60">Bab paling sering dikutip dan didiskusikan oleh pembaca awal.</p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button onClick={buyFull} className="btn-primary justify-center flex-1" data-testid="bab1-popup-continue">
                Lanjutkan Membaca
              </button>
              <button onClick={() => { setShowPopup(false); setPopupDismissed(true); }} className="btn-ghost justify-center flex-1" data-testid="bab1-popup-later">
                Nanti Saja
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
