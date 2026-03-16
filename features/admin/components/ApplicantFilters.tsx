import type {
  AdminApplicationStatus,
  AdminApplyPart,
  AdminEvaluationFilter,
  AdminRecruitmentListItem,
} from "../type";

const PART_OPTIONS: Array<{ label: string; value: "ALL" | AdminApplyPart }> = [
  { label: "전체 파트", value: "ALL" },
  { label: "FRONTEND", value: "FRONTEND" },
  { label: "BACKEND", value: "BACKEND" },
  { label: "AI/ML", value: "AI_ML" },
  { label: "PM/DESIGN", value: "PM_DESIGN" },
];

const STATUS_OPTIONS: Array<{
  label: string;
  value: "ALL" | AdminApplicationStatus;
}> = [
  { label: "전체 상태", value: "ALL" },
  { label: "서류 판정 미처리", value: "SUBMITTED" },
  { label: "서류 합격", value: "DOC_PASSED" },
  { label: "서류 불합격", value: "DOC_FAILED" },
  { label: "최종 합격", value: "FINAL_PASSED" },
  { label: "최종 불합격", value: "FINAL_FAILED" },
  { label: "임시 저장", value: "DRAFT" },
];

const EVALUATION_OPTIONS: Array<{
  label: string;
  value: AdminEvaluationFilter;
}> = [
  { label: "내 평가 전체", value: "ALL" },
  { label: "내 미평가", value: "NOT_REVIEWED" },
  { label: "내 평가 완료", value: "REVIEWED" },
];

type ApplicantFiltersProps = {
  recruitments: AdminRecruitmentListItem[];
  selectedRecruitmentId: string;
  isRecruitmentsLoading: boolean;
  compact?: boolean;
  part?: "ALL" | AdminApplyPart;
  status?: "ALL" | AdminApplicationStatus;
  evaluationFilter?: AdminEvaluationFilter;
  onRecruitmentChange: (value: string) => void;
  onPartChange?: (value: "ALL" | AdminApplyPart) => void;
  onStatusChange?: (value: "ALL" | AdminApplicationStatus) => void;
  onEvaluationFilterChange?: (value: AdminEvaluationFilter) => void;
  onApply: () => void;
};

export default function ApplicantFilters({
  recruitments,
  selectedRecruitmentId,
  isRecruitmentsLoading,
  compact = false,
  part,
  status,
  evaluationFilter,
  onRecruitmentChange,
  onPartChange,
  onStatusChange,
  onEvaluationFilterChange,
  onApply,
}: ApplicantFiltersProps) {
  const showPartFilter = Boolean(onPartChange && part);
  const showStatusFilter = Boolean(onStatusChange && status);
  const showEvaluationFilter = Boolean(onEvaluationFilterChange && evaluationFilter);
  const desktopFilterCount = [
    showPartFilter,
    showStatusFilter,
    showEvaluationFilter,
  ].filter(Boolean).length;
  const desktopGridClass = compact
    ? "grid-cols-1"
    : desktopFilterCount === 3
      ? "lg:grid-cols-[1fr_220px_220px_220px_auto]"
      : desktopFilterCount === 2
        ? "lg:grid-cols-[1fr_220px_220px_auto]"
        : desktopFilterCount === 1
          ? "lg:grid-cols-[1fr_220px_auto]"
          : "lg:grid-cols-[1fr_auto]";

  return (
    <div className={`min-w-0 grid gap-2 ${desktopGridClass}`}>
      <select
        value={selectedRecruitmentId}
        onChange={(event) => onRecruitmentChange(event.target.value)}
        disabled={isRecruitmentsLoading || recruitments.length === 0}
        className={`min-w-0 w-full rounded-lg border border-[#535968] bg-[#3a3f4d] px-3 text-white outline-none focus:border-main-1 disabled:opacity-60 ${
          compact ? "h-10 text-xs" : "h-11 text-sm"
        }`}
      >
        {isRecruitmentsLoading && <option value="">모집 목록 불러오는 중...</option>}
        {!isRecruitmentsLoading && recruitments.length === 0 && (
          <option value="">모집 목록 없음</option>
        )}
        {!isRecruitmentsLoading &&
          recruitments.map((item) => (
            <option key={item.recruitmentId} value={item.recruitmentId}>
              {`[${item.generation}기] ${item.title} (#${item.recruitmentId})`}
            </option>
          ))}
      </select>

      {showPartFilter && (
        <select
          value={part}
          onChange={(event) => onPartChange?.(event.target.value as "ALL" | AdminApplyPart)}
          className={`min-w-0 w-full rounded-lg border border-[#535968] bg-[#3a3f4d] px-3 text-white outline-none focus:border-main-1 ${
            compact ? "h-10 text-xs" : "h-11 text-sm"
          }`}
        >
          {PART_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}

      {showStatusFilter && (
        <select
          value={status}
          onChange={(event) =>
            onStatusChange?.(event.target.value as "ALL" | AdminApplicationStatus)
          }
          className={`min-w-0 w-full rounded-lg border border-[#535968] bg-[#3a3f4d] px-3 text-white outline-none focus:border-main-1 ${
            compact ? "h-10 text-xs" : "h-11 text-sm"
          }`}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}

      {showEvaluationFilter && (
        <select
          value={evaluationFilter}
          onChange={(event) =>
            onEvaluationFilterChange?.(event.target.value as AdminEvaluationFilter)
          }
          className={`min-w-0 w-full rounded-lg border border-[#535968] bg-[#3a3f4d] px-3 text-white outline-none focus:border-main-1 ${
            compact ? "h-10 text-xs" : "h-11 text-sm"
          }`}
        >
          {EVALUATION_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}

      <button
        type="button"
        onClick={onApply}
        disabled={!selectedRecruitmentId}
        className={`rounded-lg bg-main-1 font-semibold disabled:opacity-60 ${
          compact ? "h-10 w-full px-4 text-xs" : "h-11 px-5 text-sm"
        }`}
      >
        조회
      </button>
    </div>
  );
}
