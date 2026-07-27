import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import StatusBadge from "@/components/StatusBadge";
import AboutSection from "@/components/AboutSection";
import MenuPreview from "@/components/MenuPreview";
import SocialGrid from "@/components/SocialGrid";
import BoardPreview from "@/components/BoardPreview";
import LocationMap from "@/components/LocationMap";
import Footer from "@/components/Footer";

/**
 * / — Landing page assembly.
 * Order: Nav → Hero → StatusBadge → About → MenuPreview → SocialGrid → BoardPreview → Map → Footer
 */
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      <main className="flex-1">
        <Hero />
        <div className="bg-parchment py-8 text-center">
          <StatusBadge />
        </div>
        <AboutSection />
        <MenuPreview />
        <SocialGrid />
        <BoardPreview />
        <LocationMap />
      </main>

      <Footer />
    </div>
  );
}
