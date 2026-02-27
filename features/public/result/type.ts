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

export type ResultStatus = ApplicationHistoryStatus;

export type InterviewReservation = {
  slotId: number;
  startAt: string;
  endAt: string;
};

export type InterviewSlot = {
  slotId: number;
  startAt: string;
  endAt: string;
  remainingCount: number | null;
  closed: boolean;
};

export type ApplicationForResultResponse = {
  applicationId: number;
  recruitmentId: number;
  status: ApplicationHistoryStatus | string;
};

export type DashboardForResultResponse = {
  serverTime: string;
  recruitment: {
    recruitmentId: number;
    generation: number;
    title: string;
    phaseType: PhaseType;
    docStartAt: string;
    docEndAt: string;
  };
  myApplication: {
    applicationId: number;
    applyPart: ApplyPart;
    status: ApplicationHistoryStatus | string;
    canEdit: boolean;
    canSubmit: boolean;
  };
  documentResult: {
    visible: boolean;
    result: string;
  };
  interview: {
    canReserve: boolean;
    myReservation: InterviewReservation | null;
  };
};

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
