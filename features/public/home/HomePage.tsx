"use client";

import { useEffect } from "react";
import AboutSection from "./sections/AboutSection";
import CTASection from "./sections/CTASection";
import GallerySection from "./sections/GallerySection";
import HeroSection from "./sections/HeroSection";
import ReviewSection from "./sections/ReviewSection";
import TracksSection from "./sections/TracksSection";
import { SectionTransition } from "./SectionTransition";

export default function HomePage() {
  useEffect(() => {
    const onScroll = () => {
      if (window.location.pathname !== "/" || window.location.hash !== "#about") {
        return;
      }

      const aboutSection = document.getElementById("about");
      if (!aboutSection) {
        return;
      }

      const aboutTop = aboutSection.getBoundingClientRect().top + window.scrollY;
      const resetThreshold = 120;

      if (window.scrollY < aboutTop - resetThreshold) {
        window.history.replaceState(null, "", "/");
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

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
