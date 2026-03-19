import clsx from "clsx";
import type {
  AssignmentReviewState,
  AssignmentSubmissionState,
} from "../types";

/**
 * AssignmentReviewBadge 컴포넌트가 받을 props다.
 */
type AssignmentReviewBadgeProps = {
  /** 평가 진행 상태 */
  reviewState: AssignmentReviewState;
  /** 제출 상태 */
  submissionState: AssignmentSubmissionState;
};

/**
 * 화면에 실제로 노출할 평가 배지의 시각적 변형이다.
 */
type ReviewBadgeVariant = "pending" | "rejected" | "completed";

/**
 * 배지 변형별 색상 스타일을 매핑한다.
 */
const reviewBadgeClassNameByVariant: Record<ReviewBadgeVariant, string> = {
  pending: "border-main-2 bg-main-1",
  rejected: "border-[#D20000] bg-red-1",
  completed: "border-[#109A3E] bg-green-1",
};

/**
 * 배지 변형별 표시 문구를 매핑한다.
 */
const reviewBadgeLabelByVariant: Record<ReviewBadgeVariant, string> = {
  pending: "평가 대기",
  rejected: "과제 반려",
  completed: "평가 완료",
};

/**
 * 제출 이후 노출되는 평가 진행 상태 배지다.
 */
export default function AssignmentReviewBadge({
  reviewState,
  submissionState,
}: AssignmentReviewBadgeProps) {
  /**
   * 제출 상태와 평가 상태를 조합해 실제로 노출할 배지 종류를 결정한다.
   */
  const reviewBadgeVariant =
    reviewState === "pending"
      ? "pending"
      : reviewState === "published" && submissionState === "rejected"
        ? "rejected"
        : reviewState === "published" && submissionState === "submitted"
          ? "completed"
          : null;

  if (!reviewBadgeVariant) {
    return null;
  }

  return (
    <span
      className={clsx(
        "inline-flex items-center justify-center rounded-[10px] border-[3px] px-5.5 py-3.25 font-bold text-white-1 text-[20px]",
        reviewBadgeClassNameByVariant[reviewBadgeVariant],
      )}
    >
      {reviewBadgeLabelByVariant[reviewBadgeVariant]}
    </span>
  );
}
