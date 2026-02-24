export type PhaseType =
  | "DOC_OPEN"
  | "DOC_CLOSED"
  | "INTERVIEW_SELECT"
  | "FINAL_RESULT";

export type ApplicationHistoryStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "DOC_FAILED"
  | "DOC_PASSED"
  | "FINAL_FAILED"
  | "FINAL_PASSED";

export type ApplyPart = "FRONTEND" | "BACKEND" | "AI_ML" | "PM_DESIGN";

/**
 * 모집 상세 조회 타입입니다.
 */
export type RecruitmentDetailResponse = {
  serverTime: string;
  recruitmentId: number;
  generation: number;
  title: string;
  phaseType: PhaseType;
  docStartAt: string;
  docEndAt: string;
  docResultAt: string;
  interviewSelectStartAt: string;
  interviewSelectEndAt: string;
  finalResultAt: string;
};
