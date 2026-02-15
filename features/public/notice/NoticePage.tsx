import ScheduleSection from "./sections/ScheduleSection";
import NoticeSection from "./sections/NoticeSection";
import FAQSection from "./sections/FAQSection";
import HeroSection from "./sections/HeroSection";

export default function NoticePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <NoticeSection />
      <ScheduleSection />
      <FAQSection />
    </div>
  );
}
