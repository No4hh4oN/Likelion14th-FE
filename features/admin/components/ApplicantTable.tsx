import type { AdminApplicationListResponse } from "../type";

function formatPart(value: string) {
  if (value === "FRONTEND") return "프론트엔드";
  if (value === "BACKEND") return "백엔드";
  if (value === "AI_ML") return "AI / ML";
  if (value === "PM_DESIGN") return "기획 / 디자인";
  return value;
}

function formatEnrollment(value: string) {
  const upper = value.toUpperCase();
  if (upper === "ENROLLED") return "재학";
  if (upper === "LEAVE") return "휴학";
  if (upper === "GRADUATED") return "졸업";
  return value;
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("ko-KR", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Seoul",
  }).format(date);
}

type ApplicantTableProps = {
  result: AdminApplicationListResponse;
  isLoading: boolean;
  hasRecruitmentId: boolean;
  selectedApplicationId?: number | null;
  compact?: boolean;
  onSelectApplication?: (applicationId: number) => void;
};

export default function ApplicantTable({
  result,
  isLoading,
  hasRecruitmentId,
  selectedApplicationId,
  compact = false,
  onSelectApplication,
}: ApplicantTableProps) {
  const columnCount = compact ? 3 : 7;

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-[#4a4f5b]">
      <table className="w-full table-fixed text-center text-sm">
        <thead className="bg-[#343843] text-gray-2">
          <tr className="[&>th]:px-2 [&>th]:py-3">
            {!compact && <th className="w-[70px]">No.</th>}
            {!compact && <th>학과</th>}
            <th className="w-[90px]">학번</th>
            <th className="w-[140px]">파트</th>
            {!compact && <th className="w-[120px]">학적</th>}
            {!compact && <th className="w-[180px]">지원일시</th>}
            <th className="w-[90px]">점수</th>
          </tr>
        </thead>
        <tbody className="bg-[#2d3037] text-gray-1">
          {isLoading && (
            <tr>
              <td colSpan={columnCount} className="px-3 py-12 text-gray-4">
                불러오는 중...
              </td>
            </tr>
          )}

          {!isLoading && result.items.length === 0 && hasRecruitmentId && (
            <tr>
              <td colSpan={columnCount} className="px-3 py-12 text-gray-4">
                조회된 지원자가 없습니다.
              </td>
            </tr>
          )}

          {!isLoading &&
            result.items.map((item, index) => (
              <tr
                key={item.applicationId}
                onClick={() => onSelectApplication?.(item.applicationId)}
              className={`border-t border-[#4b4f59] [&>td]:px-2 [&>td]:py-3 cursor-pointer transition-colors ${
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
                {!compact && <td>{formatDateTime(item.submittedAt)}</td>}
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
