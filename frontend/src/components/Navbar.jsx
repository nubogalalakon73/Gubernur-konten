import { useEffect, useState } from "react";
import { Menu, X, MessageCircle } from "lucide-react";
import { WA_LINK, trackCta } from "@/lib/api";

const links = [
  { label: "Beranda", id: "hero" },
  { label: "Tentang Buku", id: "about" },
  { label: "Isi Bab", id: "chapters" },
  { label: "Mengapa Penting", id: "viral" },
  { label: "Testimoni", id: "testimonials" },
  { label: "FAQ", id: "faq" },
  { label: "Beli Sekarang", id: "pricing" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => {
    setOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header
      data-testid="navbar"
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#0B0F14]/85 backdrop-blur-xl border-b border-white/10"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 h-16 sm:h-20 flex items-center justify-between">
        <button
          onClick={() => scrollTo("hero")}
          data-testid="navbar-logo"
          className="flex items-center gap-2 group"
        >
          <span className="relative inline-flex h-8 w-8 items-center justify-center border border-white/20 group-hover:border-[#B8211A] transition-colors">
            <span className="font-display text-[#F4F0E8] text-lg font-bold leading-none">G</span>
            <span className="absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 bg-[#B8211A]" />
          </span>
          <div className="leading-tight text-left hidden sm:block">
            <div className="font-display text-[#F4F0E8] text-sm font-semibold tracking-wide">Gubernur Konten</div>
            <div className="overline text-[#C9920A] text-[9px]">Edisi 2026</div>
          </div>
        </button>

        <nav className="hidden lg:flex items-center gap-7">
          {links.map((l) => (
            <button
              key={l.id}
              onClick={() => scrollTo(l.id)}
              data-testid={`nav-${l.id}`}
              className="nav-link"
            >
              {l.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={WA_LINK("Halo, saya ingin tanya tentang ebook Gubernur Konten.")}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackCta("navbar-ai-assistant", "navbar")}
            data-testid="navbar-cta-ai"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 border border-[#C9920A]/60 text-[#C9920A] hover:bg-[#C9920A] hover:text-[#0B0F14] transition-all text-xs uppercase tracking-[0.18em] font-bold"
          >
            <MessageCircle className="w-3.5 h-3.5" strokeWidth={1.7} />
            Tanya AI
          </a>
          <button
            onClick={() => setOpen(!open)}
            data-testid="navbar-menu-toggle"
            className="lg:hidden text-[#F4F0E8] p-2"
            aria-label="Menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-[#0B0F14] border-t border-white/10" data-testid="navbar-mobile-menu">
          <div className="px-6 py-6 flex flex-col gap-1">
            {links.map((l) => (
              <button
                key={l.id}
                onClick={() => scrollTo(l.id)}
                className="text-left py-3 text-[#F4F0E8]/80 hover:text-[#B8211A] border-b border-white/5 font-display text-lg"
              >
                {l.label}
              </button>
            ))}
            <a
              href={WA_LINK()}
              target="_blank"
              rel="noreferrer"
              className="mt-4 btn-gold justify-center"
            >
              <MessageCircle className="w-4 h-4" /> Tanya AI Assistant
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
