import {
  Landmark,
  GraduationCap,
  Megaphone,
  BookOpen,
  Briefcase,
  Building2,
  Video,
  Newspaper,
} from "lucide-react";
import { useReveal } from "@/lib/useReveal";

const AUDIENCES = [
  { icon: Landmark, label: "Politisi", note: "Strategi citra & otoritas" },
  { icon: GraduationCap, label: "Dosen & Akademisi", note: "Bahan kuliah komunikasi politik" },
  { icon: Megaphone, label: "Aktivis Politik", note: "Membaca medan kontestasi" },
  { icon: BookOpen, label: "Mahasiswa", note: "Komunikasi · Politik · Sosiologi" },
  { icon: Briefcase, label: "Konsultan Politik", note: "Riset playbook viral" },
  { icon: Building2, label: "ASN / PNS", note: "Memahami performance governance" },
  { icon: Video, label: "Kreator Konten Politik", note: "Etika & arsitektur naratif" },
  { icon: Newspaper, label: "Tim Media Pemerintah", note: "Audit komunikasi publik" },
];

export default function Audiences() {
  const [ref, vis] = useReveal(0.1);

  return (
    <section
      id="audience"
      ref={ref}
      data-testid="audience-section"
      className="relative py-24 sm:py-32 bg-[#0E141B]"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className={`max-w-3xl mb-14 reveal ${vis ? "is-visible" : ""}`}>
          <div className="gk-ribbon mb-5">Untuk siapa</div>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-[#F4F0E8] leading-tight">
            Jika Anda bekerja di sekitar <span className="italic text-[#C9920A]">opini publik</span>,
            <br className="hidden sm:block" /> buku ini akan mengubah cara Anda membaca kekuasaan.
          </h2>
        </div>

        <div className={`grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 stagger ${vis ? "is-visible" : ""}`}>
          {AUDIENCES.map((a, i) => {
            const Icon = a.icon;
            return (
              <div
                key={a.label}
                data-testid={`audience-${i}`}
                className="gk-card p-7 group"
              >
                <Icon className="w-7 h-7 text-[#C9920A] group-hover:text-[#B8211A] transition-colors mb-5" strokeWidth={1.4} />
                <div className="font-display text-lg sm:text-xl font-semibold text-[#F4F0E8]">{a.label}</div>
                <div className="mt-1 text-sm text-[#F4F0E8]/55">{a.note}</div>
                <div className="mt-5 h-px w-8 bg-[#B8211A] group-hover:w-16 transition-all duration-500" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
