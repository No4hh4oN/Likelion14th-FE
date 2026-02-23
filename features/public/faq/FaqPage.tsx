import ScheduleSection from "./sections/ScheduleSection";
import NoticeSection from "./sections/NoticeSection";
import FaqSection from "./sections/FaqSection";
import HeroSection from "./sections/HeroSection";

export default function FaqPage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <NoticeSection />
      <ScheduleSection />
      <FaqSection />
    </div>
  );
}
