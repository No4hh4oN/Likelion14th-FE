import Link from "next/link";
import BabyLionsShell from "./BabyLionsShell";

const CARD_STYLE =
  "rounded-xl border border-[#3d4150] bg-[#343946] p-4 transition hover:border-main-1 hover:bg-[#3a4150]";

export default function BabyLionsOverviewPage() {
  return (
    <BabyLionsShell
      title="아기사자 운영 대시보드"
      description="과제 생성/수정/평가, 제출 현황, 출석 체크를 운영진 화면에서 통합 관리합니다."
    >
      <div className="grid gap-3 md:grid-cols-2">
        <Link href="/admin/baby-lions/projects" className={CARD_STYLE}>
          <p className="text-sm font-semibold text-gray-2">과제 카테고리</p>
          <h3 className="mt-1 text-lg font-bold">과제 생성 및 현황 관리</h3>
          <p className="mt-2 text-sm text-gray-4">
            트랙별 과제 목록 조회, 상세 수정, 제출 상태 현황판, 제출물 평가까지 처리합니다.
          </p>
        </Link>

        <Link href="/admin/baby-lions/attendance" className={CARD_STYLE}>
          <p className="text-sm font-semibold text-gray-2">출석 카테고리</p>
          <h3 className="mt-1 text-lg font-bold">출석부 조회 및 저장</h3>
          <p className="mt-2 text-sm text-gray-4">
            날짜/트랙별 출석 상태를 조회하고 상태값(PRESENT/LATE/ABSENT/EXCUSED)을 일괄 저장합니다.
          </p>
        </Link>
      </div>
    </BabyLionsShell>
  );
}

