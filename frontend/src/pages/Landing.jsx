import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ViralStats from "@/components/ViralStats";
import Chapters from "@/components/Chapters";
import Audiences from "@/components/Audiences";
import Difference from "@/components/Difference";
import Testimonials from "@/components/Testimonials";
import Formats from "@/components/Formats";
import Pricing from "@/components/Pricing";
import AIAssistant from "@/components/AIAssistant";
import LeadForm from "@/components/LeadForm";
import FAQ from "@/components/FAQ";
import Urgency from "@/components/Urgency";
import Footer from "@/components/Footer";

export default function Landing() {
  return (
    <div data-testid="landing-page" className="bg-[#0B0F14] text-[#F4F0E8] min-h-screen relative">
      <Navbar />
      <main>
        <Hero />
        <Difference />
        <Chapters />
        <ViralStats />
        <Audiences />
        <Testimonials />
        <Formats />
        <Pricing />
        <AIAssistant />
        <LeadForm />
        <FAQ />
        <Urgency />
      </main>
      <Footer />
    </div>
  );
}
