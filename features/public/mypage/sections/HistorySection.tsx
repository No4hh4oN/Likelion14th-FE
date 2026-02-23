import { MOCK_APPLICATION_HISTORY } from "../mock";
import type { ApplicationRecord, MyPageUser } from "../types";
import ActionButton from "../components/ActionButton";

type HistorySectionProps = {
  user: MyPageUser;
  onBack: () => void;
};

export default function HistorySection({ user, onBack }: HistorySectionProps) {
  const documentRecord = MOCK_APPLICATION_HISTORY.find(
    (record) => record.type === "서류",
  );
  const canApplyInterview = documentRecord?.result === "합격";

  const visibleRecords = MOCK_APPLICATION_HISTORY.filter((record) => {
    if (record.type === "면접") {
      return canApplyInterview;
    }

    return true;
  });

  const handleEditClick = (record: ApplicationRecord) => {
    if (record.type !== "서류") {
      return;
    }

    // TODO: 지원서 수정 페이지 연결
    console.log("지원서 수정", record.id);
  };

  const handleResultClick = (record: ApplicationRecord) => {
    // TODO: 전형별 결과 확인 페이지 연결
    console.log("결과 확인", record.id);
  };

  if (user.role !== "게스트") {
    return (
      <section className="min-h-screen bg-background px-4 text-white-1 lg:px-6">
        <div className="mx-auto w-full max-w-[960px] rounded-[8px] border border-white/10 bg-[#2E313A]/95 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.28)] lg:p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-[24px] font-bold lg:text-[30px]">
              나의 지원 내역
            </h1>
            <ActionButton
              text="돌아가기"
              onClick={onBack}
              className="text-[12px]"
              hoverClassName="hover:bg-gray-5"
            />
          </div>
          <p className="mt-4 text-[14px] text-white/75 lg:text-[16px]">
            지원 내역은 게스트 등급에서만 확인할 수 있습니다.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-background px-4 text-white-1 lg:px-6">
      <div className="mx-auto w-full max-w-[1300px] rounded-[8px] border border-white/10 bg-[#2E313A]/95 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.28)] lg:p-8">
        <div className="relative flex items-start justify-between gap-3">
          <div className="flex-1 text-center">
            <h1 className="text-[26px] font-bold lg:text-[36px]">
              나의 지원 내역
            </h1>
            <p className="mt-2 text-[12px] text-white/55 lg:text-[14px]">
              14기 이후 내역부터 확인 가능합니다
            </p>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="absolute right-0 top-0 h-8 w-8 text-[36px] leading-none text-gray-6 transition-colors hover:text-white/80"
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[920px] border-separate border-spacing-0 text-center text-[12px] lg:text-[14px]">
            <thead>
              <tr className="text-white/80">
                <th className="border-b border-white/15 px-3 py-3 font-semibold">
                  No.
                </th>
                <th className="border-b border-white/15 px-3 py-3 font-semibold">
                  기수
                </th>
                <th className="border-b border-white/15 px-3 py-3 font-semibold">
                  전형
                </th>
                <th className="border-b border-white/15 px-3 py-3 font-semibold">
                  지원일시
                </th>
                <th className="border-b border-white/15 px-3 py-3 font-semibold">
                  수정일시
                </th>
                <th className="border-b border-white/15 px-3 py-3 font-semibold">
                  면접일시
                </th>
                <th className="border-b border-white/15 px-3 py-3 font-semibold">
                  수정하기
                </th>
                <th className="border-b border-white/15 px-3 py-3 font-semibold">
                  결과 확인
                </th>
              </tr>
            </thead>

            <tbody>
              {visibleRecords.map((record) => (
                <tr key={record.id} className="text-white/85">
                  <td className="border-b border-white/10 px-3 py-3">
                    {record.id}
                  </td>
                  <td className="border-b border-white/10 px-3 py-3">
                    {record.generation}
                  </td>
                  <td className="border-b border-white/10 px-3 py-3">
                    {record.type}
                  </td>
                  <td className="border-b border-white/10 px-3 py-3">
                    {record.appliedAt ?? "-"}
                  </td>
                  <td className="border-b border-white/10 px-3 py-3">
                    {record.updatedAt ?? "-"}
                  </td>
                  <td className="border-b border-white/10 px-3 py-3">
                    {record.type === "면접"
                      ? (record.interviewAt ?? "미선택")
                      : "-"}
                  </td>
                  <td className="border-b border-white/10 px-3 py-3">
                    {record.type === "서류" && record.isWithinEditPeriod ? (
                      <ActionButton
                        text="수정하기"
                        onClick={() => handleEditClick(record)}
                        className="bg-main-3 px-5 py-2.25 text-[14px] leading-none"
                        hoverClassName="hover:bg-amber-600"
                      />
                    ) : (
                      <span className="text-white/50">-</span>
                    )}
                  </td>
                  <td className="border-b border-white/10 px-3 py-3">
                    <ActionButton
                      text="결과 확인"
                      onClick={() => handleResultClick(record)}
                      className="bg-main-1 px-5 py-2.25 text-[14px] leading-none"
                      hoverClassName="hover:bg-[#2289E6]"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
