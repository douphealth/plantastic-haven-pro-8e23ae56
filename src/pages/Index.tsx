import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import PlantShelf from "@/components/PlantShelf";
import PricingSection from "@/components/PricingSection";
import CommunitySection from "@/components/CommunitySection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <PlantShelf />
      <PricingSection />
      <CommunitySection />
      <Footer />
    </div>
  );
};

export default Index;
