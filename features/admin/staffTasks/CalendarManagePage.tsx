import Link from "next/link";
import CalendarManageSection from "./CalendarManageSection";
import StaffTasksShell from "./StaffTasksShell";

/**
 * 운영진 일정 관리 전용 페이지입니다.
 */
export default function CalendarManagePage() {
  return (
    <StaffTasksShell
      title="운영진 일정 관리"
      description="마이페이지 캘린더에 노출되는 일정을 생성하고, 월별 목록에서 삭제할 수 있습니다."
      actions={
        <Link
          href="/admin/staff-tasks"
          className="rounded-lg bg-[#485165] px-4 py-2 text-sm font-semibold"
        >
          업무 개요
        </Link>
      }
    >
      <CalendarManageSection />
    </StaffTasksShell>
  );
}
