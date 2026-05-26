import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, X, Send, Sparkles, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import axios from "axios";
import { greeting, intentOf, respond, INITIAL_QUICK_REPLIES } from "@/lib/chatBot";
import { onOpenChat } from "@/lib/chatEvents";
import { trackCta, API, WA_LINK } from "@/lib/api";

function ResendForm({ onDone, onWA }) {
  const [email, setEmail] = useState("");
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { ok, message }

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/resend-download`, {
        email: email.trim().toLowerCase(),
        order_id: orderId.trim().toUpperCase(),
      });
      setResult({ ok: true, message: data.message });
      setTimeout(() => onDone(data.message), 2000);
    } catch (err) {
      const msg = err?.response?.data?.detail || "Gagal mengirim email. Coba lagi atau hubungi admin.";
      setResult({ ok: false, message: msg });
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className={`rounded-xl p-4 border text-sm ${result.ok ? "bg-[#1f3a2a] border-[#25D366]/30 text-[#25D366]" : "bg-[#2a0d10] border-[#B8211A]/30 text-[#F4F0E8]/80"}`}>
        {result.ok ? <CheckCircle2 className="w-4 h-4 inline mr-2" /> : <AlertCircle className="w-4 h-4 inline mr-2" />}
        {result.message}
        {!result.ok && (
          <button onClick={onWA} className="block mt-3 text-xs underline text-[#C9920A]">Hubungi Admin WA →</button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="bg-[#131A22] border border-white/10 rounded-xl p-4 space-y-3">
      <p className="text-xs text-[#F4F0E8]/60 leading-relaxed">Masukkan email dan Order ID pembelian Anda. Kami kirim ulang link download sekarang.</p>
      <input
        type="email" required value={email} onChange={e => setEmail(e.target.value)}
        placeholder="Email pembelian (contoh: anda@gmail.com)"
        className="w-full bg-[#0B0F14] border border-white/15 rounded-lg px-3 py-2 text-sm text-[#F4F0E8] placeholder:text-[#F4F0E8]/30 focus:outline-none focus:border-[#C9920A]/60"
      />
      <input
        type="text" required value={orderId} onChange={e => setOrderId(e.target.value)}
        placeholder="Order ID (contoh: GK-ABC123DEF456)"
        className="w-full bg-[#0B0F14] border border-white/15 rounded-lg px-3 py-2 text-sm text-[#F4F0E8] placeholder:text-[#F4F0E8]/30 focus:outline-none focus:border-[#C9920A]/60"
      />
      <button type="submit" disabled={loading}
        className="w-full bg-[#B8211A] hover:bg-[#9a1c16] text-[#F4F0E8] text-sm font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-60 transition-colors">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        {loading ? "Mengirim..." : "📧 Kirim Link Download"}
      </button>
      <button type="button" onClick={onWA}
        className="w-full text-xs text-[#F4F0E8]/40 hover:text-[#25D366] transition-colors py-1">
        Atau hubungi Admin WA →
      </button>
    </form>
  );
}

const SESSION_KEY = "gk_chat_session_id";

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [quickReplies, setQuickReplies] = useState(INITIAL_QUICK_REPLIES);
  const [showResendForm, setShowResendForm] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [pulse, setPulse] = useState(true);
  const [sessionId, setSessionId] = useState(() => {
    try { return localStorage.getItem(SESSION_KEY) || ""; } catch { return ""; }
  });
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  const persistSession = (sid) => {
    if (!sid) return;
    setSessionId(sid);
    try { localStorage.setItem(SESSION_KEY, sid); } catch {}
  };

  const callLlm = useCallback(async (text, currentMessages) => {
    setTyping(true);
    setQuickReplies([]);
    try {
      const history = currentMessages.map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        text: m.text,
      }));
      const { data } = await axios.post(
        `${API}/chat`,
        { session_id: sessionId || undefined, message: text, history },
        { timeout: 45000 }
      );
      persistSession(data.session_id);
      setMessages((m) => [...m, { role: "bot", text: data.response }]);
      setQuickReplies(INITIAL_QUICK_REPLIES);
    } catch (err) {
      const fallback = respond("fallback");
      setMessages((m) => [
        ...m,
        {
          role: "bot",
          text:
            "Maaf, koneksi ke AI sedang lambat. Coba lagi dalam beberapa detik — atau pakai tombol cepat di bawah ya.",
        },
      ]);
      setQuickReplies(fallback.quickReplies || INITIAL_QUICK_REPLIES);
    } finally {
      setTyping(false);
    }
  }, [sessionId]);

  const FAST_INTENTS = new Set([
    "bab1",
    "harga",
    "wa",
    "select-free",
    "select-perbab",
    "select-full",
    "pay-transfer",
    "pay-qris",
    "download-error",
    "resend-email-form",
    "download-wa",
  ]);

  const handleAction = useCallback((action) => {
    if (action.type === "navigate-bab1") {
      setTimeout(() => {
        setOpen(false);
        navigate("/bab1");
      }, 700);
    } else if (action.type === "navigate-checkout") {
      setTimeout(() => {
        setOpen(false);
        navigate(`/checkout?paket=${action.paket || "full"}`);
      }, 700);
    } else if (action.type === "open-wa" && action.url) {
      setTimeout(() => {
        window.open(action.url, "_blank", "noopener");
      }, 500);
    } else if (action.type === "show-resend-form") {
      setTimeout(() => setShowResendForm(true), 500);
    }
  }, [navigate]);

  const sendBot = useCallback((resp) => {
    setTyping(true);
    setQuickReplies([]);
    setTimeout(() => {
      setMessages((m) => [...m, { role: "bot", text: resp.text }]);
      setQuickReplies(resp.quickReplies || []);
      setTyping(false);
      if (resp.action) handleAction(resp.action);
    }, 700 + Math.min(resp.text.length * 6, 900));
  }, [handleAction]);

  const userSay = useCallback((text) => {
    if (!text.trim()) return;
    const newMsg = { role: "user", text };
    const newMessages = [...messages, newMsg];
    setMessages(newMessages);
    setInput("");
    trackCta("ai-chat-message", "ai-widget");

    const intent = intentOf(text);
    if (FAST_INTENTS.has(intent)) {
      sendBot(respond(intent));
    } else {
      callLlm(text, newMessages.slice(0, -1));
    }
  }, [messages, sendBot, callLlm]);

  const handleIntent = useCallback((intent) => {
    const qr = quickReplies.find((q) => q.intent === intent);
    if (qr) {
      setMessages((m) => [...m, { role: "user", text: qr.label }]);
    }
    trackCta(`ai-intent-${intent}`, "ai-widget");
    sendBot(respond(intent));
  }, [quickReplies, sendBot]);

  useEffect(() => {
    return onOpenChat((detail) => {
      setOpen(true);
      setPulse(false);
      if (detail?.intent) {
        setTimeout(() => handleIntent(detail.intent), 350);
      } else if (detail?.text) {
        setTimeout(() => userSay(detail.text), 350);
      }
    });
  }, [handleIntent, userSay]);

  useEffect(() => {
    if (open && !hasGreeted) {
      setHasGreeted(true);
      setTyping(true);
      const t = setTimeout(() => {
        const g = greeting();
        setMessages([{ role: "bot", text: g.text }]);
        setQuickReplies(g.quickReplies);
        setTyping(false);
      }, 900);
      return () => clearTimeout(t);
    }
  }, [open, hasGreeted]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight + 999;
    }
  }, [messages, typing]);

  useEffect(() => {
    if (open) return;
    const t = setTimeout(() => setPulse(true), 10_000);
    return () => clearTimeout(t);
  }, [open]);

  const onSubmit = (e) => {
    e.preventDefault();
    userSay(input);
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => { setOpen(true); setPulse(false); trackCta("ai-open", "ai-widget"); }}
          data-testid="ai-chat-launcher"
          aria-label="Open AI Assistant"
          className="fixed bottom-20 right-5 z-50 group"
        >
          <div className={`relative w-16 h-16 rounded-full bg-gradient-to-br from-[#B8211A] to-[#8A1713] grid place-items-center shadow-[0_18px_40px_-8px_rgba(184,33,26,0.6)] ${pulse ? "ai-pulse" : ""}`}>
            <Sparkles className="w-7 h-7 text-[#F4F0E8]" strokeWidth={1.7} />
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-[#25D366] border-2 border-[#0B0F14]" />
          </div>
          <span className="hidden md:block absolute right-20 top-1/2 -translate-y-1/2 whitespace-nowrap text-xs font-medium text-[#F4F0E8] bg-[#131A22] border border-white/10 px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition">
            AI Assistant · Online
          </span>
        </button>
      )}

      {open && (
        <div
          className="fixed z-50 bottom-0 right-0 sm:bottom-5 sm:right-5 w-full sm:w-[400px] sm:max-w-[92vw] h-[100dvh] sm:h-[620px] sm:max-h-[80vh] flex flex-col bg-[#0B0F14] sm:rounded-xl border border-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] overflow-hidden"
          data-testid="ai-chat-panel"
        >
          <div className="relative px-5 py-4 flex items-center gap-3 border-b border-white/10 bg-gradient-to-r from-[#131A22] to-[#0B0F14]">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#B8211A] to-[#8A1713] grid place-items-center">
                <Sparkles className="w-5 h-5 text-[#F4F0E8]" strokeWidth={1.7} />
              </div>
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[#25D366] border-2 border-[#0B0F14]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display text-[#F4F0E8] font-semibold leading-tight text-sm">AI Assistant · Gubernur Konten</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-[#C9920A]">Political Intelligence · Online</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              data-testid="ai-chat-close"
              className="text-[#F4F0E8]/60 hover:text-[#F4F0E8] p-2"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5 space-y-3" data-testid="ai-chat-messages">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[88%] ${m.role === "user" ? "ml-auto" : ""}`}
                data-testid={`ai-msg-${m.role}-${i}`}
              >
                <div
                  className={`px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                    m.role === "user"
                      ? "bg-[#1f3a2a] border border-[#25D366]/20 text-[#F4F0E8]/90 rounded-2xl rounded-br-sm"
                      : "bg-gradient-to-br from-[#2a0d10] to-[#1B232D] border border-[#B8211A]/25 text-[#F4F0E8]/90 rounded-2xl rounded-bl-sm"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {showResendForm && (
              <div className="max-w-[95%]">
                <ResendForm
                  onDone={(msg) => {
                    setShowResendForm(false);
                    setMessages(m => [...m, { role: "bot", text: `✅ ${msg}\n\nCek inbox email Anda (termasuk folder Spam/Promosi). Link download berlaku selamanya.` }]);
                    setQuickReplies(INITIAL_QUICK_REPLIES);
                  }}
                  onWA={() => {
                    setShowResendForm(false);
                    window.open(WA_LINK("Halo Admin, saya gagal download file setelah bayar. Mohon bantuannya."), "_blank", "noopener");
                  }}
                />
              </div>
            )}

            {typing && (
              <div className="max-w-[60%]" data-testid="ai-typing">
                <div className="px-4 py-3 inline-flex items-center gap-1.5 bg-gradient-to-br from-[#2a0d10] to-[#1B232D] border border-[#B8211A]/25 rounded-2xl rounded-bl-sm">
                  <span className="ai-dot" />
                  <span className="ai-dot" style={{ animationDelay: "0.15s" }} />
                  <span className="ai-dot" style={{ animationDelay: "0.3s" }} />
                </div>
              </div>
            )}
          </div>

          {quickReplies.length > 0 && (
            <div className="px-4 pb-3 pt-1 flex flex-wrap gap-2" data-testid="ai-quick-replies">
              {quickReplies.map((q) => (
                <button
                  key={q.id}
                  onClick={() => handleIntent(q.intent)}
                  data-testid={`ai-qr-${q.intent}`}
                  className="text-xs px-3 py-2 border border-[#C9920A]/40 text-[#C9920A] hover:bg-[#C9920A] hover:text-[#0B0F14] transition-all rounded-full font-medium"
                >
                  {q.label}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={onSubmit}
            className="px-4 py-3 border-t border-white/10 flex items-center gap-2 bg-[#0E141B]"
            data-testid="ai-composer"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanya apa saja tentang buku…"
              className="flex-1 bg-[#0B0F14] border border-white/10 px-4 py-2.5 text-sm rounded-full text-[#F4F0E8] placeholder-[#F4F0E8]/40 focus:border-[#B8211A] focus:outline-none"
              data-testid="ai-input"
            />
            <button
              type="submit"
              data-testid="ai-send"
              className="w-10 h-10 grid place-items-center rounded-full bg-[#B8211A] text-[#F4F0E8] hover:bg-[#8A1713] transition-colors disabled:opacity-50"
              disabled={!input.trim()}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pb-2 text-[10px] text-[#F4F0E8]/30 font-mono">
            POWERED BY POLITICAL INTELLIGENCE ENGINE
          </div>
        </div>
      )}
    </>
  );
}
