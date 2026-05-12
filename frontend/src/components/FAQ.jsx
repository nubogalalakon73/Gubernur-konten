import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { useReveal } from "@/lib/useReveal";

const FAQS = [
  {
    q: "Apakah ini buku politik partisan?",
    a: "Tidak. Buku ini dirancang dengan kerangka 'dakwaan–pembelaan–sintesis' — dirumuskan untuk menjaga netralitas analitik dan keseimbangan argumen. Kami menempatkan figur sebagai studi kasus, bukan sebagai obyek pujian atau hujatan.",
  },
  {
    q: "Apakah buku ini mendukung tokoh tertentu?",
    a: "Tidak ada endorsement terhadap tokoh manapun. Lima gubernur dianalisis sebagai representasi tipologi politik digital yang berbeda, masing-masing diuji dengan standar kritis yang sama.",
  },
  {
    q: "Apakah tersedia versi cetak?",
    a: "Saat ini fokus pada versi digital (PDF, EPUB, Flipbook). Versi cetak terbatas direncanakan rilis pertengahan 2026 — daftarkan di formulir pre-order untuk diberi tahu pertama.",
  },
  {
    q: "Bisa dibaca di HP?",
    a: "Ya. Format EPUB dan Flipbook sudah dioptimalkan untuk layar mobile. PDF tersedia dengan layout responsif yang nyaman dibaca di iOS & Android.",
  },
  {
    q: "Apakah cocok untuk akademisi & mahasiswa?",
    a: "Sangat cocok. Buku ini disusun dengan referensi akademik, data BPS, dan kerangka analitik yang siap dipakai sebagai rujukan kuliah komunikasi politik, sosiologi digital, atau studi media.",
  },
  {
    q: "Bagaimana cara membeli?",
    a: "Pilih paket di section harga, klik tombol pembelian, dan Anda akan diarahkan ke WhatsApp AI Assistant. Tim kami mengirim invoice, menerima pembayaran (BCA/Mandiri/QRIS/E-Wallet), lalu mengirim link unduh dalam kurang dari 10 menit.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(0);
  const [ref, vis] = useReveal(0.1);

  return (
    <section id="faq" ref={ref} data-testid="faq-section" className="relative py-24 sm:py-32">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className={`max-w-2xl mb-12 reveal ${vis ? "is-visible" : ""}`}>
          <div className="gk-ribbon mb-5">FAQ</div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-[#F4F0E8] leading-tight">
            Pertanyaan yang sering ditanyakan.
          </h2>
        </div>

        <div className={`reveal ${vis ? "is-visible" : ""}`}>
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                data-testid={`faq-row-${i}`}
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="chapter-row group"
                data-open={isOpen}
              >
                <div className="chapter-track" />
                <div className="py-6 pl-6 pr-3 flex items-start gap-6">
                  <div className="font-mono text-xs text-[#C9920A] pt-1 w-8 shrink-0">{String(i + 1).padStart(2, "0")}</div>
                  <div className="flex-1">
                    <h3 className="font-display text-lg sm:text-xl text-[#F4F0E8] font-semibold group-hover:text-[#B8211A] transition-colors">
                      {f.q}
                    </h3>
                    <div
                      className="grid transition-all duration-500 overflow-hidden"
                      style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                    >
                      <div className="overflow-hidden">
                        <p className="mt-3 text-[#F4F0E8]/70 leading-relaxed">{f.a}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-[#F4F0E8]/60 group-hover:text-[#B8211A] transition-colors pt-1">
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
