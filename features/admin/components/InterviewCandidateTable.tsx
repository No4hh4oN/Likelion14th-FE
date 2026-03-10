import type { AdminInterviewCandidateListResponse } from "../type";

function formatPart(value: string) {
  if (value === "FRONTEND") return "FRONTEND";
  if (value === "BACKEND") return "BACKEND";
  if (value === "AI_ML") return "AI / ML";
  if (value === "PM_DESIGN") return "PM / DESIGN";
  return value;
}

function formatEnrollment(value: string) {
  const upper = value?.toUpperCase?.() ?? "";
  if (upper === "ENROLLED") return "재학";
  if (upper === "LEAVE") return "휴학";
  if (upper === "GRADUATED") return "졸업";
  return value ?? "-";
}

function formatInterviewSlot(startAt: string, endAt: string) {
  const start = new Date(startAt);
  const end = new Date(endAt);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "-";

  const dateText = new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Seoul",
  }).format(start);

  const endText = new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Seoul",
  }).format(end);

  return `${dateText} - ${endText}`;
}

type InterviewCandidateTableProps = {
  result: AdminInterviewCandidateListResponse;
  isLoading: boolean;
  hasRecruitmentId: boolean;
  selectedApplicationId?: number | null;
  compact?: boolean;
  onSelectApplication?: (applicationId: number) => void;
};

export default function InterviewCandidateTable({
  result,
  isLoading,
  hasRecruitmentId,
  selectedApplicationId,
  compact = false,
  onSelectApplication,
}: InterviewCandidateTableProps) {
  const columnCount = compact ? 4 : 7;

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-[#4a4f5b]">
      <table className="w-full table-fixed text-center text-sm">
        <thead className="bg-[#343843] text-gray-2">
          <tr className="[&>th]:px-2 [&>th]:py-3">
            {!compact && <th className="w-[70px]">No.</th>}
            {!compact && <th>학과</th>}
            <th className="w-[110px]">학번</th>
            <th className="w-[140px]">파트</th>
            {!compact && <th className="w-[120px]">학적</th>}
            <th className={compact ? "w-[180px]" : "w-[220px]"}>면접 시간</th>
            <th className="w-[90px]">서류 평균</th>
          </tr>
        </thead>
        <tbody className="bg-[#2d3037] text-gray-1">
          {isLoading && (
            <tr>
              <td colSpan={columnCount} className="px-3 py-12 text-gray-4">
                불러오는 중입니다.
              </td>
            </tr>
          )}

          {!isLoading && result.items.length === 0 && hasRecruitmentId && (
            <tr>
              <td colSpan={columnCount} className="px-3 py-12 text-gray-4">
                조회된 면접 대상자가 없습니다.
              </td>
            </tr>
          )}

          {!isLoading &&
            result.items.map((item, index) => (
              <tr
                key={item.applicationId}
                onClick={() => onSelectApplication?.(item.applicationId)}
                className={`cursor-pointer border-t border-[#4b4f59] transition-colors [&>td]:px-2 [&>td]:py-3 ${
                  selectedApplicationId === item.applicationId
                    ? "bg-[#3a404d]"
                    : "hover:bg-[#3a3f49]"
                }`}
              >
                {!compact && <td>{result.page.page * result.page.size + index + 1}</td>}
                {!compact && <td className="truncate px-3 text-left">{item.department}</td>}
                <td>{item.studentNoPrefix}</td>
                <td>{formatPart(item.applyPart)}</td>
                {!compact && (
                  <td>
                    {item.grade}학년 {formatEnrollment(item.enrollment)}
                  </td>
                )}
                <td>{formatInterviewSlot(item.slotStartAt, item.slotEndAt)}</td>
                <td>
                  {typeof item.docAvgScore === "number"
                    ? item.docAvgScore.toFixed(1)
                    : "-"}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
