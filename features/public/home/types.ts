/**
 * 모집 진행 단계(enum) 타입입니다.
 */
export type RecruitmentPhaseType =
  | "DOC_OPEN"
  | "DOC_CLOSED"
  | "INTERVIEW_SELECT"
  | "FINAL_RESULT"
  | "CLOSED";

/**
 * 진행 중 모집 조회 응답 타입입니다.
 */
export type ActiveRecruitmentResponse = {
  recruitmentId: number;
  phaseType: RecruitmentPhaseType;
  startAt: string;
  endAt: string;
};
