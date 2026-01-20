import AboutSection from './sections/AboutSection'
import CTASection from './sections/CTASection'
import GallerySection from './sections/GallerySection'
import HeroSection from './sections/HeroSection'
import ReviewSection from './sections/ReviewSection'
import TracksSection from './sections/TracksSection'

export default function HomePage() {
  return (
    <div className="flex flex-col gap-24 pb-28 bg-[#0b0d13] text-[#f5f6ff]">
      <HeroSection />
      <AboutSection />
      <TracksSection />
      <GallerySection />
      <ReviewSection />
      <CTASection />
    </div>
  )
}
