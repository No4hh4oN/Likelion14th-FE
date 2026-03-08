/**
 * 모집 결과 페이지에서 사용하는 모집 단계(enum) 타입입니다.
 */
export type PhaseType =
  | "DOC_OPEN"
  | "DOC_CLOSED"
  | "INTERVIEW_SELECT"
  | "FINAL_RESULT";

/**
 * 지원 결과 페이지에서 해석하는 지원 상태(enum) 타입입니다.
 */
export type ApplicationHistoryStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "DOC_FAILED"
  | "DOC_PASSED"
  | "FINAL_FAILED"
  | "FINAL_PASSED";

/**
 * 지원 파트 식별자 타입입니다.
 */
export type ApplyPart = "FRONTEND" | "BACKEND" | "AI_ML" | "PM_DESIGN";

/**
 * 결과 페이지에서 사용하는 상태 타입 별칭입니다.
 */
export type ResultStatus = ApplicationHistoryStatus;

/**
 * 사용자가 확정한 면접 예약 정보입니다.
 */
export type InterviewReservation = {
  slotId: number;
  startAt: string;
  endAt: string;
  location?: string | null;
};

/**
 * 결과 페이지에서 표시하는 면접 슬롯 정보입니다.
 */
export type InterviewSlot = {
  slotId: number;
  startAt: string;
  endAt: string;
  location: string | null;
  available: boolean;
  remainingCount: number | null;
  closed: boolean;
};

/**
 * 결과 페이지 진입 시 지원서 기준으로 모집과 상태를 식별하기 위한 응답입니다.
 */
export type ApplicationForResultResponse = {
  applicationId: number;
  recruitmentId: number;
  status: ApplicationHistoryStatus | string;
};

/**
 * 결과 페이지 초기 렌더링에 필요한 대시보드 응답입니다.
 */
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
  } | null;
  documentResult: {
    visible: boolean;
    result: string | null;
  };
  interview: {
    canReserve: boolean;
    myReservation: InterviewReservation | null;
  };
};

/**
 * 결과 공개 시각과 면접 선택 시각을 포함한 모집 상세 응답입니다.
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
