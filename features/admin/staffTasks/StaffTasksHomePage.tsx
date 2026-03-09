import Link from "next/link";
import StaffTasksShell from "./StaffTasksShell";

const CARD_CLASS =
  "rounded-xl border border-[#43485a] bg-[#363c4a] p-5 transition hover:border-main-1 hover:bg-[#3c4354]";

export default function StaffTasksHomePage() {
  return (
    <StaffTasksShell
      title="운영진 주요업무"
      description="공지사항 운영과 사용자 정보 관리를 빠르게 이동할 수 있습니다."
    >
      <div className="grid gap-3 md:grid-cols-2">
        <Link href="/admin/staff-tasks/notices" className={CARD_CLASS}>
          <p className="text-sm font-semibold text-gray-2">공지사항 카테고리</p>
          <h3 className="mt-1 text-lg font-bold">공지/세션자료 관리</h3>
          <p className="mt-2 text-sm text-gray-4">
            목록 조회, 작성, 수정, 삭제/복구, 첨부파일 업로드/삭제를 운영진 화면에서 처리합니다.
          </p>
        </Link>

        <Link href="/admin/users" className={CARD_CLASS}>
          <p className="text-sm font-semibold text-gray-2">사용자 카테고리</p>
          <h3 className="mt-1 text-lg font-bold">사용자 조회</h3>
          <p className="mt-2 text-sm text-gray-4">
            `/admin/users` 화면으로 이동해 유저 목록/상세 정보를 확인합니다.
          </p>
        </Link>
      </div>
    </StaffTasksShell>
  );
}

