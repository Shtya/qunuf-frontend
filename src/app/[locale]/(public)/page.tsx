import BasedOnLocationSection from "@/components/pages/home/BasedOnLocationSection";
import ContactUsSection from "@/components/pages/home/ContactUsSection";
import Features from "@/components/pages/home/Features";
import HeroSection from "@/components/pages/home/HeroSection";
import PaymentsCompanyRow from "@/components/pages/home/PaymentsCompanyRow";
import PropertyCategorySection from "@/components/pages/home/PropertyCategorySection";
import RecentPropertiesSection from "@/components/pages/home/RecentPropertiesSection";



export default async function Home() {

  return (
    <div>
      <HeroSection />
      <RecentPropertiesSection />
      <PropertyCategorySection />
      <BasedOnLocationSection />
      {/* <PaymentsCompanyRow /> */}
      <Features />
      <ContactUsSection />
    </div>
  );
}
