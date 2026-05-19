import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import axios from "axios";
import { greeting, intentOf, respond, INITIAL_QUICK_REPLIES } from "@/lib/chatBot";
import { onOpenChat } from "@/lib/chatEvents";
import { trackCta, API } from "@/lib/api";

const SESSION_KEY = "gk_chat_session_id";

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [quickReplies, setQuickReplies] = useState(INITIAL_QUICK_REPLIES);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [pulse, setPulse] = useState(true);
  const [sessionId, setSessionId] = useState(() => {
    try { return localStorage.getItem(SESSION_KEY) || ""; } catch { return ""; }
  });
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  // Open from external event (Pricing, Hero, etc.)
  useEffect(() => {
    return onOpenChat((detail) => {
      setOpen(true);
      setPulse(false);
      if (detail?.intent) {
        // small delay so greeting renders first if needed
        setTimeout(() => handleIntent(detail.intent), 350);
      } else if (detail?.text) {
        setTimeout(() => userSay(detail.text), 350);
      }
    });
  }, []);

  // Greeting auto when first opened
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

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight + 999;
    }
  }, [messages, typing]);

  // Pulse to attract attention after 10s
  useEffect(() => {
    if (open) return;
    const t = setTimeout(() => setPulse(true), 10_000);
    return () => clearTimeout(t);
  }, [open]);

  const sendBot = (resp) => {
    setTyping(true);
    setQuickReplies([]);
    setTimeout(() => {
      setMessages((m) => [...m, { role: "bot", text: resp.text }]);
      setQuickReplies(resp.quickReplies || []);
      setTyping(false);
      if (resp.action) handleAction(resp.action);
    }, 700 + Math.min(resp.text.length * 6, 900));
  };

  const handleAction = (action) => {
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
    }
  };

  const persistSession = (sid) => {
    if (!sid) return;
    setSessionId(sid);
    try { localStorage.setItem(SESSION_KEY, sid); } catch {}
  };

  // Call the LLM backend for free-text messages.
  const callLlm = async (text, currentMessages) => {
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
  };

  // Keywords that we keep rule-based (faster + deterministic for purchase flows).
  const FAST_INTENTS = new Set([
    "bab1",
    "harga",
    "wa",
    "select-free",
    "select-perbab",
    "select-full",
    "pay-transfer",
    "pay-qris",
  ]);

  const userSay = (text) => {
    if (!text.trim()) return;
    const newMsg = { role: "user", text };
    const newMessages = [...messages, newMsg];
    setMessages(newMessages);
    setInput("");
    trackCta("ai-chat-message", "ai-widget");

    const intent = intentOf(text);
    if (FAST_INTENTS.has(intent)) {
      // Fast rule-based path for transactional intents
      sendBot(respond(intent));
    } else {
      // Free-text → LLM
      callLlm(text, newMessages.slice(0, -1));
    }
  };

  const handleIntent = (intent) => {
    // Echo the chosen label as a user message if it matches a quick reply
    const qr = quickReplies.find((q) => q.intent === intent);
    if (qr) {
      setMessages((m) => [...m, { role: "user", text: qr.label }]);
    }
    trackCta(`ai-intent-${intent}`, "ai-widget");
    sendBot(respond(intent));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    userSay(input);
  };

  return (
    <>
      {/* Floating launcher */}
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

      {/* Chat panel */}
      {open && (
        <div
          className="fixed z-50 bottom-0 right-0 sm:bottom-5 sm:right-5 w-full sm:w-[400px] sm:max-w-[92vw] h-[100dvh] sm:h-[620px] sm:max-h-[80vh] flex flex-col bg-[#0B0F14] sm:rounded-xl border border-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] overflow-hidden"
          data-testid="ai-chat-panel"
        >
          {/* Header */}
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

          {/* Messages */}
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

          {/* Quick replies */}
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

          {/* Composer */}
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
