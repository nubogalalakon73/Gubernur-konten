import { FileText, BookOpen, Smartphone, Tablet } from "lucide-react";
import { useReveal } from "@/lib/useReveal";

const FORMATS = [
  { icon: FileText, label: "PDF", note: "Cetak-siap. Buka di Adobe, Preview, atau browser." },
  { icon: BookOpen, label: "EPUB", note: "Reflowable untuk Kindle, Apple Books, Google Play Books." },
  { icon: Tablet, label: "FLIPBOOK", note: "Interaktif. Halaman membalik seperti majalah." },
  { icon: Smartphone, label: "MOBILE READER", note: "Optimal di iOS & Android. Dark mode siap." },
];

export default function Formats() {
  const [ref, vis] = useReveal(0.1);

  return (
    <section
      ref={ref}
      data-testid="formats-section"
      className="relative py-24 sm:py-28"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className={`max-w-3xl mb-12 reveal ${vis ? "is-visible" : ""}`}>
          <div className="gk-ribbon mb-5">Format produk</div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-[#F4F0E8] leading-tight">
            Empat cara membaca. Satu kewarasan akademik.
          </h2>
        </div>

        <div className={`grid sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger ${vis ? "is-visible" : ""}`}>
          {FORMATS.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={f.label}
                data-testid={`format-${i}`}
                className="gk-card p-7 text-center"
              >
                <div className="mx-auto w-14 h-14 grid place-items-center border border-[#C9920A]/40 mb-5">
                  <Icon className="w-6 h-6 text-[#C9920A]" strokeWidth={1.4} />
                </div>
                <div className="font-display text-lg font-semibold text-[#F4F0E8]">{f.label}</div>
                <div className="mt-2 text-xs text-[#F4F0E8]/55 leading-relaxed">{f.note}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
