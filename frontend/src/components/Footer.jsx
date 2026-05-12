import { Instagram, Music2, Facebook, Mail } from "lucide-react";

const SOCIAL = [
  { icon: Instagram, label: "Instagram", href: "https://instagram.com/" },
  { icon: Music2, label: "TikTok", href: "https://tiktok.com/" },
  { icon: Facebook, label: "Facebook", href: "https://facebook.com/" },
];

export default function Footer() {
  return (
    <footer data-testid="footer" className="relative bg-[#080B10] border-t border-white/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-10 pb-10 border-b border-white/5">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-2">
              <span className="relative inline-flex h-9 w-9 items-center justify-center border border-white/20">
                <span className="font-display text-[#F4F0E8] text-xl font-bold leading-none">G</span>
                <span className="absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 bg-[#B8211A]" />
              </span>
              <div>
                <div className="font-display text-[#F4F0E8] text-base font-semibold">Gubernur Konten</div>
                <div className="overline text-[#C9920A] text-[10px]">Edisi 2026</div>
              </div>
            </div>
            <p className="mt-5 text-[#F4F0E8]/55 text-sm leading-relaxed max-w-md">
              Buku politik akademik tentang populisme digital & otoritas neo-tradisional dalam politik lokal Indonesia. Ditulis oleh <span className="text-[#F4F0E8]">Didi Subandi</span> & <span className="text-[#F4F0E8]">Yully Ambarsih Ekawardhani</span>.
            </p>
          </div>

          <div className="lg:col-span-3">
            <div className="overline text-[#C9920A] mb-4">Kontak</div>
            <a
              href="mailto:risethibrida@gmail.com"
              data-testid="footer-email"
              className="flex items-center gap-2 text-[#F4F0E8]/80 hover:text-[#C9920A] transition-colors text-sm"
            >
              <Mail className="w-4 h-4" strokeWidth={1.6} />
              risethibrida@gmail.com
            </a>
            <div className="mt-3 text-[#F4F0E8]/55 text-sm">WA: 0899-855-3333</div>
          </div>

          <div className="lg:col-span-4">
            <div className="overline text-[#C9920A] mb-4">Ikuti</div>
            <div className="flex items-center gap-3">
              {SOCIAL.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  data-testid={`footer-social-${label.toLowerCase()}`}
                  aria-label={label}
                  className="w-10 h-10 grid place-items-center border border-white/10 text-[#F4F0E8]/70 hover:text-[#B8211A] hover:border-[#B8211A] transition-colors"
                >
                  <Icon className="w-4 h-4" strokeWidth={1.6} />
                </a>
              ))}
            </div>
            <p className="mt-6 text-xs text-[#F4F0E8]/40 leading-relaxed">
              <span className="text-[#F4F0E8]/60">Disclaimer akademik:</span> Buku & landing page ini adalah karya analitik, tidak berafiliasi dengan partai politik atau pejabat publik manapun.
            </p>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#F4F0E8]/40">
          <div>© 2026 Gubernur Konten. Hak cipta dilindungi.</div>
          <div className="flex items-center gap-5">
            <a href="#faq" className="hover:text-[#C9920A] transition-colors">Kebijakan Privasi</a>
            <a href="#faq" className="hover:text-[#C9920A] transition-colors">Syarat & Ketentuan</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
