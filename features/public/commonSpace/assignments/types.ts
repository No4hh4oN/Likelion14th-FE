import type { AssignmentItem, CommonSpacePartId } from "../types";

/**
 * 과제 API가 사용하는 트랙 식별자다.
 */
export type CommonSpaceAssignmentApiTrack =
  | "FRONTEND"
  | "BACKEND"
  | "AI_ML"
  | "PM_DESIGN";

/**
 * 과제 제출 API가 반환하는 제출 상태다.
 */
export type CommonSpaceAssignmentSubmissionApiStatus =
  | "NOT_SUBMITTED"
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

/**
 * 과제 목록 API의 단일 항목 응답이다.
 */
export type CommonSpaceAssignmentProjectListApiItem = {
  /** 과제 식별자 */
  id: number;
  /** 과제 제목 */
  title: string;
  /** 과제 설명 */
  description: string;
  /** 과제 대상 트랙 */
  track?: CommonSpaceAssignmentApiTrack | null;
  /** 과제 시작 시각 */
  startDate: string;
  /** 과제 마감 시각 */
  deadline: string;
  /** 과제 활성 상태 */
  status: string;
};

/**
 * 로그인한 사용자의 단일 과제 제출 응답이다.
 */
export type CommonSpaceAssignmentMySubmissionApiResponse = {
  /** 제출 여부 */
  submitted?: boolean;
  /** 제출 식별자 */
  submissionId?: number;
  /** 제출 본문 */
  content?: string;
  /** 제출 상태 */
  status?: CommonSpaceAssignmentSubmissionApiStatus;
  /** 평가 피드백 */
  feedback?: string;
  /** 제출 파일 URL */
  fileUrl?: string;
  /** 제출 시각 */
  submittedAt?: string;
};

/**
 * 과제 목록 조회에 사용하는 화면용 쿼리 타입이다.
 */
export type CommonSpaceAssignmentListQuery = {
  /** 조회 대상 파트 */
  partId?: CommonSpacePartId;
};

/**
 * 과제 섹션 목록 화면이 사용하는 단일 과제 아이템이다.
 */
export type CommonSpaceAssignmentListItem = AssignmentItem & {
  /** 과제 식별자 */
  id: number;
  /** 과제 대상 파트 */
  partId: CommonSpacePartId;
  /** 과제 설명 */
  description: string;
  /** 실제 마감 시각 */
  deadlineAt: string;
  /** 제출 식별자 */
  submissionId?: number;
};

/**
 * 과제 섹션 목록 화면이 소비하는 최종 데이터 구조다.
 */
export type CommonSpaceAssignmentListResult = {
  /** 화면에 노출할 과제 목록 */
  items: CommonSpaceAssignmentListItem[];
};

/**
 * 과제 섹션에서 고려할 비동기 로드 상태다.
 */
export type CommonSpaceAssignmentLoadState =
  | "idle"
  | "loading"
  | "success"
  | "empty"
  | "error";
