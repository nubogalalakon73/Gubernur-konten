import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { useReveal } from "@/lib/useReveal";

const CHAPTERS = [
  {
    n: "01",
    title: "Ketika Algoritma Menjadi Alun-Alun",
    teaser:
      "Bab pembuka yang menggeser metafora politik: dari ruang fisik ke ruang algoritmik. Mengapa platform sosial bukan lagi alat — melainkan panggung utama kekuasaan lokal.",
  },
  {
    n: "02",
    title: "Dedi Mulyadi dan Kelahiran Genre",
    teaser:
      "Bagaimana satu figur lokal menciptakan tata bahasa baru: kombinasi sundanesme, ke-bapakan, performa kepemimpinan, dan kalibrasi algoritma. Sebuah anatomi genre 'Gubernur Konten'.",
  },
  {
    n: "03",
    title: "Empat Gubernur, Empat Strategi",
    teaser:
      "Komparasi cinematic empat figur populer: dari religiusitas, militer-sentris, citra agraris, hingga pop-tekno. Empat jalan menuju otoritas neo-tradisional.",
  },
  {
    n: "04",
    title: "Tujuh Dakwaan terhadap Gubernur Konten",
    teaser:
      "Bagian paling provokatif. Tujuh tuduhan terhadap fenomena: dari simulasi pelayanan, performance governance, hingga kolonisasi ruang publik oleh konten.",
  },
  {
    n: "05",
    title: "Pembelaan dan Epistemologi Politik Lokal",
    teaser:
      "Penyeimbangan argumen. Mengapa fenomena ini juga merupakan bentuk demokratisasi akses, dan bagaimana ia membongkar elitisme media arus utama.",
  },
  {
    n: "06",
    title: "AI, Deepfake, dan Masa Depan Demokrasi",
    teaser:
      "Proyeksi 2026–2029: ketika kecerdasan buatan, deepfake, dan agen otomatis memasuki politik daerah. Apa yang harus disiapkan publik dan regulator?",
  },
  {
    n: "07",
    title: "Setelah Panggung Ditutup",
    teaser:
      "Sintesis penutup: bagaimana membaca, mendukung, atau melawan Gubernur Konten dengan kewarasan akademik dan kewaspadaan demokratik.",
  },
];

export default function Chapters() {
  const [open, setOpen] = useState(0);
  const [ref, vis] = useReveal(0.05);

  return (
    <section
      id="chapters"
      ref={ref}
      data-testid="chapters-section"
      className="relative py-24 sm:py-32"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className={`grid lg:grid-cols-12 gap-10 reveal ${vis ? "is-visible" : ""}`}>
          <div className="lg:col-span-4 lg:sticky lg:top-32 self-start">
            <div className="gk-ribbon mb-5">Apa yang akan Anda temukan</div>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-[#F4F0E8] leading-tight">
              Tujuh bab.
              <br />
              Satu peta <span className="italic text-[#C9920A]">kekuasaan</span> digital.
            </h2>
            <p className="mt-5 text-[#F4F0E8]/65 leading-relaxed">
              Setiap bab dirancang seperti adegan film dokumenter: ada panggung, ada dalang, ada arsip data, dan ada pembacaan kritis.
            </p>
            <div className="mt-8 animated-line" />
            <div className="mt-6 font-mono text-xs text-[#F4F0E8]/40">
              ESTIMATED READ TIME · 4 HRS · 248 PAGES
            </div>
          </div>

          <div className="lg:col-span-8" data-testid="chapters-accordion">
            {CHAPTERS.map((c, i) => {
              const isOpen = open === i;
              return (
                <div
                  key={c.n}
                  data-testid={`chapter-row-${i}`}
                  data-open={isOpen}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="chapter-row group"
                >
                  <div className="chapter-track" />
                  <div className="py-7 pl-6 pr-3 sm:pr-6 flex items-start gap-6">
                    <div className="font-mono text-xs text-[#C9920A] pt-1 w-10 shrink-0">{c.n}</div>
                    <div className="flex-1">
                      <h3 className="font-display text-xl sm:text-2xl text-[#F4F0E8] font-semibold group-hover:text-[#B8211A] transition-colors">
                        {c.title}
                      </h3>
                      <div
                        className="grid transition-all duration-500 overflow-hidden"
                        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                      >
                        <div className="overflow-hidden">
                          <p className="mt-3 text-[#F4F0E8]/70 leading-relaxed max-w-2xl">{c.teaser}</p>
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
      </div>
    </section>
  );
}
