import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Clock, BookOpen, Lock, AlertCircle, ChevronRight } from "lucide-react";
import { API, COVER_FRONT, trackCta } from "@/lib/api";

function renderInline(text) {
  // Simple markdown: **bold** and *italic*
  const parts = [];
  let remaining = text;
  let key = 0;
  const re = /(\*\*([^*]+)\*\*|\*([^*]+)\*)/;
  while (true) {
    const m = re.exec(remaining);
    if (!m) {
      if (remaining) parts.push(remaining);
      break;
    }
    if (m.index > 0) parts.push(remaining.slice(0, m.index));
    if (m[2]) parts.push(<strong key={key++} className="text-[#F4F0E8]">{m[2]}</strong>);
    else if (m[3]) parts.push(<em key={key++} className="text-[#C9920A]">{m[3]}</em>);
    remaining = remaining.slice(m.index + m[0].length);
  }
  return parts;
}

export default function Chapter() {
  const { n: nParam } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const n = parseInt(nParam, 10);
  const token = params.get("t") || "";

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const articleRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    axios
      .get(`${API}/chapters/${n}`, { params: { token } })
      .then((r) => { if (!cancelled) setData(r.data); })
      .catch((e) => {
        if (cancelled) return;
        const msg = e?.response?.data?.detail || "Gagal memuat bab";
        setError(msg);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [n, token]);

  // SEO
  useEffect(() => {
    if (!data) return;
    document.title = `${data.number} — ${data.title} | Gubernur Konten`;
  }, [data]);

  // Scroll progress
  useEffect(() => {
    const onScroll = () => {
      const el = articleRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(total, 0));
      const pct = total > 0 ? (scrolled / total) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, pct)));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [data]);

  // Anti-copy
  useEffect(() => {
    const block = (e) => { e.preventDefault(); return false; };
    const copy = (e) => {
      e.preventDefault();
      try {
        e.clipboardData.setData(
          "text/plain",
          `© Gubernur Konten — ${data?.title || ""}. Penulis: Didi Subandi,S.Sn.,MM & Dr.Yully Ambarsih Ekawardhani,M.Sn`
        );
      } catch {}
    };
    document.addEventListener("contextmenu", block);
    document.addEventListener("copy", copy);
    return () => {
      document.removeEventListener("contextmenu", block);
      document.removeEventListener("copy", copy);
    };
  }, [data]);

  useEffect(() => { window.scrollTo(0, 0); }, [n]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F14] text-[#F4F0E8] grid place-items-center">
        <div className="text-center">
          <div className="font-display text-2xl text-[#C9920A] mb-2">Memuat bab…</div>
          <div className="overline text-[#F4F0E8]/50">Memverifikasi token akses</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0B0F14] text-[#F4F0E8] grid place-items-center p-6">
        <div className="max-w-md text-center gk-card p-8" data-testid="chapter-error">
          <Lock className="w-12 h-12 text-[#B8211A] mx-auto mb-4" strokeWidth={1.4} />
          <h2 className="font-display text-3xl font-bold text-[#F4F0E8]">Akses Terkunci</h2>
          <p className="mt-3 text-[#F4F0E8]/70">{error}</p>
          <p className="mt-2 text-xs text-[#F4F0E8]/45 font-mono">Bab {n}</p>
          <div className="mt-7 flex flex-col gap-3">
            <button onClick={() => { trackCta("chapter-locked-buy", "chapter"); navigate("/#pricing"); }} className="btn-primary justify-center" data-testid="chapter-error-buy">
              Traktir Akses Sekarang
            </button>
            <Link to="/" className="btn-ghost justify-center" data-testid="chapter-error-home">Kembali ke Beranda</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0B0F14] text-[#F4F0E8] min-h-screen relative overflow-x-hidden">
      <div className="reader-watermark" aria-hidden="true" />
      <div className="reader-progress" style={{ width: `${progress}%` }} data-testid="chapter-progress" />

      <header className="sticky top-0 z-40 bg-[#0B0F14]/85 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 py-3 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2 text-[#F4F0E8]/70 hover:text-[#B8211A] transition-colors text-sm" data-testid="chapter-back">
            <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Beranda</span>
          </Link>
          <div className="text-xs text-[#F4F0E8]/55 flex items-center gap-3">
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {data.reading_time_min} min</span>
            <span className="hidden sm:inline-flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> Bab {n} / 7</span>
          </div>
          {n < 7 && (
            <Link to={`/bab/${n + 1}?t=${token}`} className="text-xs font-bold uppercase tracking-wider px-3 py-2 border border-[#C9920A]/40 text-[#C9920A] hover:bg-[#C9920A] hover:text-[#0B0F14]" data-testid="chapter-next-link">
              Bab {n + 1} <ChevronRight className="w-3 h-3 inline" />
            </Link>
          )}
        </div>
      </header>

      <article ref={articleRef} className="relative z-10 max-w-3xl mx-auto px-5 sm:px-6 pt-12 pb-32 reader-no-select" data-testid="chapter-article">
        <div className="mb-12 flex flex-col items-center text-center">
          <img src={COVER_FRONT} alt="Cover" className="w-32 sm:w-40 shadow-2xl mb-7" draggable="false" />
          <div className="gk-ribbon mb-5">{data.number}</div>
          <h1 className="font-display text-3xl sm:text-5xl font-black text-[#F4F0E8] leading-[1.1] text-shadow-cinematic">
            {data.title}
          </h1>
          <p className="mt-4 text-[#F4F0E8]/65 font-display italic text-base sm:text-lg max-w-xl">
            {data.subtitle}
          </p>
          <div className="mt-6 text-xs font-mono text-[#F4F0E8]/45">DIDI SUBANDI &amp; YULLY AMBARSIH EKAWARDHANI · 2026</div>
          <div className="mt-8 gk-divider w-32" />
        </div>

        <div className="reader-body">
          {data.sections.map((s, i) => (
            <section key={i} className="reader-section" data-testid={`chapter-section-${i}`}>
              <h2>{s.h}</h2>
              {s.p.map((para, j) => (
                <p key={j}>{renderInline(para)}</p>
              ))}
            </section>
          ))}
        </div>

        {/* Bottom nav */}
        <div className="mt-16 pt-10 border-t border-white/10 flex flex-col sm:flex-row gap-4 items-center justify-between">
          {n > 2 ? (
            <Link to={`/bab/${n - 1}?t=${token}`} className="btn-ghost" data-testid="chapter-prev">
              <ArrowLeft className="w-4 h-4" /> Bab Sebelumnya
            </Link>
          ) : <span />}
          {n < 7 ? (
            <Link to={`/bab/${n + 1}?t=${token}`} className="btn-primary" data-testid="chapter-next">
              Bab Selanjutnya <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link to="/" className="btn-primary" data-testid="chapter-finish">
              Selesai · Kembali ke Beranda
            </Link>
          )}
        </div>
      </article>
    </div>
  );
}
