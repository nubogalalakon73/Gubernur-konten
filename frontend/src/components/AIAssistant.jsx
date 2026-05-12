import { MessageCircle, Send, CheckCheck, BookOpen, CreditCard, Sparkles } from "lucide-react";
import { WA_LINK, WA_DISPLAY, trackCta } from "@/lib/api";
import { useReveal } from "@/lib/useReveal";

const CHAT_FEATURES = [
  { icon: BookOpen, t: "Tanya isi setiap bab" },
  { icon: Sparkles, t: "Rekomendasi bab sesuai profesi" },
  { icon: CreditCard, t: "Bantuan pembayaran & invoice" },
  { icon: MessageCircle, t: "Diskusi langsung dengan penulis" },
];

export default function AIAssistant() {
  const [ref, vis] = useReveal(0.1);

  return (
    <section
      ref={ref}
      data-testid="ai-section"
      className="relative py-24 sm:py-32 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#0E141B] via-[#0B0F14] to-[#0E141B]" />
      <div className="spotlight" style={{ top: "20%", right: "10%", background: "radial-gradient(circle, rgba(37,211,102,0.15), transparent 60%)" }} />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className={`grid lg:grid-cols-12 gap-10 lg:gap-16 items-center reveal ${vis ? "is-visible" : ""}`}>
          <div className="lg:col-span-6">
            <div className="gk-ribbon mb-5" style={{ borderColor: "rgba(37,211,102,0.4)" }}>
              AI WhatsApp Assistant
            </div>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-[#F4F0E8] leading-tight">
              Bicara langsung dengan <span className="italic text-[#C9920A]">AI Assistant</span> Gubernur Konten.
            </h2>
            <p className="mt-6 text-[#F4F0E8]/70 leading-relaxed max-w-xl">
              Bukan chatbot generik. Asisten ini terlatih dari materi buku — siap menjawab pertanyaan isi, memberi rekomendasi bab, dan membantu pembelian — semua di WhatsApp.
            </p>

            <ul className="mt-8 grid sm:grid-cols-2 gap-3 max-w-xl">
              {CHAT_FEATURES.map((f) => {
                const Icon = f.icon;
                return (
                  <li key={f.t} className="flex items-center gap-3 text-sm text-[#F4F0E8]/85 bg-white/[0.02] border border-white/5 px-4 py-3">
                    <Icon className="w-4 h-4 text-[#C9920A]" strokeWidth={1.6} />
                    {f.t}
                  </li>
                );
              })}
            </ul>

            <a
              href={WA_LINK("Halo AI Assistant, saya ingin konsultasi tentang ebook Gubernur Konten.")}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackCta("ai-consult-now", "ai")}
              data-testid="ai-cta-consult"
              className="mt-9 inline-flex items-center gap-2 px-6 py-3.5 bg-[#25D366] text-white font-bold tracking-wider uppercase text-sm hover:bg-[#1ebe5d] transition-all hover:translate-y-[-2px] hover:shadow-[0_18px_40px_-18px_rgba(37,211,102,0.6)]"
            >
              <MessageCircle className="w-4 h-4" />
              Konsultasi Sekarang
            </a>
            <div className="mt-4 text-xs text-[#F4F0E8]/55 font-mono">WA · {WA_DISPLAY}</div>
          </div>

          {/* Chat mockup */}
          <div className="lg:col-span-6">
            <div className="mx-auto max-w-md gk-card p-5 sm:p-7" data-testid="ai-chat-mockup">
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#B8211A] to-[#8A1713] grid place-items-center text-[#F4F0E8] font-display font-bold">G</div>
                <div className="flex-1">
                  <div className="font-display text-[#F4F0E8] font-semibold text-sm">AI Asisten · Gubernur Konten</div>
                  <div className="text-xs text-[#25D366] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
                    Online · Membalas dalam 30 detik
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-3 text-sm">
                <div className="max-w-[85%] p-3 bg-[#1B232D] border border-white/5 rounded-md text-[#F4F0E8]/85">
                  Halo! Saya AI Asisten Gubernur Konten. Bab mana yang ingin Anda eksplor lebih dulu? 📚
                </div>
                <div className="max-w-[85%] ml-auto p-3 bg-[#1f3a2a] border border-[#25D366]/20 rounded-md text-[#F4F0E8]/90 text-right">
                  Saya tertarik bab "Tujuh Dakwaan". Bisa beri preview singkat?
                  <div className="text-[10px] text-[#F4F0E8]/40 mt-1 flex items-center gap-1 justify-end">
                    13:24 <CheckCheck className="w-3 h-3 text-[#25D366]" />
                  </div>
                </div>
                <div className="max-w-[85%] p-3 bg-[#1B232D] border border-white/5 rounded-md text-[#F4F0E8]/85">
                  Bab 4 berisi tujuh tuduhan terhadap fenomena Gubernur Konten — mulai dari simulasi pelayanan hingga kolonisasi ruang publik oleh konten. Mau saya kirim cuplikan PDF gratis sekarang? 📄
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 bg-[#0B0F14] border border-white/10 px-3 py-2 rounded-md">
                <input
                  type="text"
                  placeholder="Tanya apa saja tentang buku…"
                  disabled
                  className="bg-transparent flex-1 text-sm text-[#F4F0E8]/80 outline-none"
                />
                <Send className="w-4 h-4 text-[#25D366]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
