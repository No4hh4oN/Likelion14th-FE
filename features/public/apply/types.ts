/**
 * 지원서 화면에서 사용하는 파트 키.
 */
export type ApplyPartKey = "FRONTEND" | "BACKEND" | "AI_ML" | "PM_DESIGN";

/**
 * 백엔드 questions 응답 파트 enum.
 */
export type DocumentQuestionCategory =
  | "COMMON"
  | "FRONTEND"
  | "BACKEND"
  | "AI_ML"
  | "PM_DESIGN";

/**
 * 모집 단계 타입.
 */
export type RecruitmentPhaseType =
  | "DOC_OPEN"
  | "DOC_CLOSED"
  | "INTERVIEW_SELECT"
  | "FINAL_RESULT"
  | "CLOSED";

/**
 * 진행중 모집 조회 응답 타입.
 * GET /api/recruitments/active (200)
 */
export type ActiveRecruitmentResponse = {
  recruitmentId: number;
  phaseType: RecruitmentPhaseType;
  startAt: string;
  endAt: string;
};

/**
 * 지원서 폼 질문 1개 응답 타입.
 */
export type DocumentQuestion = {
  questionId: number;
  category: DocumentQuestionCategory;
  order: number;
  content: string;
};

/**
 * 지원서 폼 조회 응답 타입.
 * GET /api/recruitments/{recruitmentId}/application-form (200)
 */
export type DocumentQuestionsResponse = {
  recruitmentId: number;
  questions: DocumentQuestion[];
};

/**
 * 지원서 페이지 초기 상태 타입.
 */
export type ApplyPageStatus =
  | "loading"
  | "ready"
  | "empty"
  | "closed"
  | "error";

/**
 * 질문/지원서 API 연동용 공통 답변 타입.
 */
export type ApplyAnswer = {
  questionId: number;
  answer: string;
};

/**
 * 지원서 임시저장 요청 타입 초안.
 * TODO: Swagger 실제 요청 바디에 맞게 확정.
 */
export type SaveApplyDraftRequest = {
  recruitmentId: number;
  part: ApplyPartKey;
  commonAnswers: ApplyAnswer[];
  partAnswers: ApplyAnswer[];
  portfolioUrl?: string;
};

/**
 * 지원서 제출 요청 타입 초안.
 * TODO: applicationId 등 실제 필드 확정 필요.
 */
export type SubmitApplyRequest = {
  recruitmentId: number;
};
