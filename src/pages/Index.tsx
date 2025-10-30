import Navbar from "@/components/Navbar";
import HeroCarousel from "@/components/HeroCarousel";
import FeaturesSection from "@/components/FeaturesSection";
import TransformationShowcase from "@/components/TransformationShowcase";
import ProcessSection from "@/components/ProcessSection";
import StatsSection from "@/components/StatsSection";
import ResultsGallery from "@/components/ResultsGallery";
import UseCasesSection from "@/components/UseCasesSection";
import BenefitsSection from "@/components/BenefitsSection";
import PhoenixSection from "@/components/PhoenixSection";
import ModelsSection from "@/components/ModelsSection";
import CommunityGallery from "@/components/CommunityGallery";
import CTASection from "@/components/CTASection";
import TestimonialsSection from "@/components/TestimonialsSection";
import PricingSection from "@/components/PricingSection";
import FinalCTA from "@/components/FinalCTA";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroCarousel />
      <StatsSection />
      <TransformationShowcase />
      <FeaturesSection />
      <ProcessSection />
      <ResultsGallery />
      <UseCasesSection />
      <BenefitsSection />
      <PhoenixSection />
      <ModelsSection />
      <CommunityGallery />
      <CTASection />
      <TestimonialsSection />
      <PricingSection />
      <FinalCTA />
    </div>
  );
};

export default Index;
