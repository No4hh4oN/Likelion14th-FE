/**
 * 지원 파트 식별자 타입입니다.
 */
export type ApplyPartKey = "FRONTEND" | "BACKEND" | "AI_ML" | "PM_DESIGN";

/**
 * 질문 카테고리(enum) 타입입니다.
 */
export type DocumentQuestionCategory =
  | "COMMON"
  | "FRONTEND"
  | "BACKEND"
  | "AI_ML"
  | "PM_DESIGN";

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
 * 지원서 상태(enum) 타입입니다.
 * - DRAFT: 임시저장 상태
 * - SUBMITTED: 제출 완료 상태
 * - DOC_FAILED / DOC_PASSED: 서류 결과
 * - FINAL_FAILED / FINAL_PASSED: 최종 결과
 */
export type ApplicationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "DOC_FAILED"
  | "DOC_PASSED"
  | "FINAL_FAILED"
  | "FINAL_PASSED";

/**
 * 진행 중 모집 조회 응답 타입입니다.
 */
export type ActiveRecruitmentResponse = {
  recruitmentId: number;
  phaseType: RecruitmentPhaseType;
  startAt: string;
  endAt: string;
};

/**
 * 질문 1개 아이템 타입입니다.
 */
export type DocumentQuestion = {
  questionId: number;
  category: DocumentQuestionCategory;
  order: number;
  content: string;
};

/**
 * 질문 목록 조회 응답 타입입니다.
 */
export type DocumentQuestionsResponse = {
  recruitmentId: number;
  questions: DocumentQuestion[];
};

/**
 * 지원서 페이지 초기/로딩 상태 타입입니다.
 */
export type ApplyPageStatus =
  | "loading"
  | "ready"
  | "empty"
  | "closed"
  | "error";

/**
 * 답변 페이로드 1개 아이템 타입입니다.
 */
export type ApplyAnswerPayload = {
  questionId: number;
  answer: string;
};

/**
 * 지원서 저장/수정 요청 바디 타입입니다.
 */
export type SaveApplicationDraftRequest = {
  applyPart: ApplyPartKey;
  portfolioUrl: string;
  answers: ApplyAnswerPayload[];
  fileIds: number[];
};

/**
 * 지원서 최초 생성 응답 타입입니다.
 */
export type CreateApplicationDraftResponse = {
  applicationId: number;
};

/**
 * 지원서 수정 응답 타입입니다.
 */
export type UpdateApplicationDraftResponse = {
  applicationId: number;
  status: ApplicationStatus | string;
  updatedAt: string;
  portfolioUrl: string;
};

/**
 * 지원서 제출 응답 타입입니다.
 */
export type SubmitApplicationResponse = {
  applicationId: number;
  status: ApplicationStatus | string;
  submittedAt: string;
  portfolioUrl: string;
};

/**
 * 업로드된 지원서 파일 메타 정보 타입입니다.
 */
export type ApplicationFile = {
  fileId: number;
  originalName: string;
  size: number;
  url: string;
};

/**
 * 지원서 상세 조회 응답 타입입니다.
 */
export type ApplicationDetailResponse = {
  serverTime: string;
  applicationId: number;
  recruitmentId: number;
  applyPart: ApplyPartKey | string;
  status: ApplicationStatus | string;
  submittedAt: string;
  portfolioUrl: string;
  answers: ApplyAnswerPayload[];
  files: ApplicationFile[];
};

/**
 * 지원서 목록 조회의 아이템 타입입니다.
 */
export type ApplicationListItem = {
  applicationId: number;
  recruitmentId: number;
  applyPart: ApplyPartKey | string;
  status: ApplicationStatus | string;
  canEdit: boolean;
  canSubmit: boolean;
};

/**
 * 지원서 목록 조회 응답 타입입니다.
 */
export type ApplicationListResponse = {
  items: ApplicationListItem[];
  page: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
};

/**
 * 지원서 파일 업로드 응답 타입입니다.
 */
export type UploadApplicationFileResponse = {
  fileId: number;
  originalName: string;
  size: number;
};

/**
 * 지원서 삭제 응답 타입입니다.
 */
export type DeleteApplicationResponse = {
  ok: boolean;
};
