import ScheduleSection from "./sections/ScheduleSection";
import NoticeSection from "./sections/NoticeSection";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <NoticeSection />
      <ScheduleSection />
    </div>
  );
}
