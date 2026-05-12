import { MessageCircle } from "lucide-react";
import { WA_LINK, trackCta } from "@/lib/api";

export default function FloatingWA() {
  return (
    <a
      href={WA_LINK("Halo, saya ingin tanya tentang ebook Gubernur Konten.")}
      target="_blank"
      rel="noreferrer"
      onClick={() => trackCta("floating-wa", "global")}
      data-testid="floating-wa"
      className="fab-wa"
      aria-label="Chat WhatsApp"
    >
      <MessageCircle className="w-6 h-6" strokeWidth={1.7} />
    </a>
  );
}
