import Navbar from "@/components/Navbar";
import HeroSlider from "@/components/HeroSlider";
import FeaturesSection from "@/components/FeaturesSection";
import TransformationShowcase from "@/components/TransformationShowcase";
import ProcessSection from "@/components/ProcessSection";
import StatsSection from "@/components/StatsSection";
import ResultsGallery from "@/components/ResultsGallery";
import UseCasesSection from "@/components/UseCasesSection";
import BenefitsSection from "@/components/BenefitsSection";
import PhoenixSection from "@/components/PhoenixSection";
import CommunityGallery from "@/components/CommunityGallery";
import CTASection from "@/components/CTASection";
import TestimonialsSection from "@/components/TestimonialsSection";
import PricingSection from "@/components/PricingSection";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSlider />
      <StatsSection />
      <TransformationShowcase />
      <FeaturesSection />
      <ProcessSection />
      <ResultsGallery />
      <UseCasesSection />
      <BenefitsSection />
      <PhoenixSection />
      <CommunityGallery />
      <CTASection />
      <TestimonialsSection />
      <PricingSection />
      <FinalCTA />
      <Footer />
    </div>
  );
};

export default Index;