import AboutSection from "./sections/AboutSection";
import CTASection from "./sections/CTASection";
import GallerySection from "./sections/GallerySection";
import HeroSection from "./sections/HeroSection";
import ReviewSection from "./sections/ReviewSection";
import TracksSection from "./sections/TracksSection";
import { SectionTransition } from "./SectionTransition";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <AboutSection />
      <TracksSection />
      <SectionTransition type="fade" />
      <GallerySection />
      <ReviewSection />
      <CTASection />
    </div>
  );
}
