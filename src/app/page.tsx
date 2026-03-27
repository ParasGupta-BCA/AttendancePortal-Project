import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { TrustSection } from "@/components/landing/TrustSection";
import { Features } from "@/components/landing/Features";
import { Operations } from "@/components/landing/Operations";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#ffffff]">
      <Navbar />
      <Hero />
      <TrustSection />
      <Features />
      <Operations />
      <Footer />
    </main>
  );
}
