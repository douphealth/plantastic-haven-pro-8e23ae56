import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import PlantShelf from "@/components/PlantShelf";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import PricingSection from "@/components/PricingSection";
import CommunitySection from "@/components/CommunitySection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/Footer";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const RevealSection = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const { ref, isVisible } = useScrollReveal(0.1);
  return (
    <div
      ref={ref}
      className="transition-all duration-700 ease-out"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(40px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <RevealSection><FeaturesSection /></RevealSection>
      <RevealSection><PlantShelf /></RevealSection>
      <RevealSection><TestimonialsSection /></RevealSection>
      <RevealSection><PricingSection /></RevealSection>
      <RevealSection><CommunitySection /></RevealSection>
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
