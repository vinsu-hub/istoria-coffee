import Hero from "@/components/Hero";
import StatusBadge from "@/components/StatusBadge";
import AboutSection from "@/components/AboutSection";
import MenuPreview from "@/components/MenuPreview";
import FreedomBoardPreview from "@/components/FreedomBoardPreview";
import SocialGrid from "@/components/SocialGrid";
import LocationMap from "@/components/LocationMap";

export default function Home() {
  return (
    <>
      <Hero />
      <StatusBadge />
      <AboutSection />
      <MenuPreview />
      <SocialGrid />
      <FreedomBoardPreview />
      <LocationMap />
    </>
  );
}
