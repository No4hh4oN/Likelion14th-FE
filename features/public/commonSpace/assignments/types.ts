import type { AssignmentItem, CommonSpacePartId } from "../types";
import type { CommonSpaceAuthorApiItem } from "../author";

/**
 * 과제 API가 사용하는 트랙 식별자다.
 */
export type CommonSpaceAssignmentApiTrack =
  | "FRONTEND"
  | "BACKEND"
  | "AI_ML"
  | "PM_DESIGN"
  | "COMMON";

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
  /** 작성자 표시 정보 */
  author?: CommonSpaceAuthorApiItem;
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
 * 과제 제출/재제출 요청 본문에 담을 JSON 데이터다.
 */
export type CommonSpaceAssignmentSubmissionRequestBody = {
  /** 텍스트 제출 본문 */
  content?: string;
};

/**
 * 과제 제출/재제출 시 화면에서 전달하는 업로드 요청 데이터다.
 */
export type CommonSpaceAssignmentSubmissionRequest = {
  /** JSON request 파트에 실어 보낼 제출 본문 */
  request: CommonSpaceAssignmentSubmissionRequestBody;
  /** multipart로 업로드할 제출 파일 목록 */
  files: File[];
};

/**
 * 과제 제출/재제출 후 반환되는 응답 메시지다.
 */
export type CommonSpaceAssignmentSubmissionMutationResult = {
  /** 서버가 반환한 결과 메시지 */
  message: string;
};

/**
 * 과제 상세 API의 첨부파일 응답이다.
 */
export type CommonSpaceAssignmentFileApiItem = {
  /** 첨부파일 식별자 */
  fileId: number;
  /** 원본 파일명 */
  originalFileName: string;
  /** 다운로드 URL */
  fileUrl: string;
};

/**
 * 과제 상세 조회 API 응답이다.
 */
export type CommonSpaceAssignmentDetailApiResponse = {
  /** 과제 식별자 */
  projectId: number;
  /** 과제 제목 */
  title: string;
  /** 과제 본문 */
  description: string;
  /** 과제 대상 트랙 */
  track?: CommonSpaceAssignmentApiTrack | null;
  /** 과제 시작 시각 */
  startDate: string;
  /** 과제 마감 시각 */
  endDate: string;
  /** 과제 상태 */
  status: "ACTIVE" | "INACTIVE" | string;
  /** 작성자 표시 정보 */
  author?: CommonSpaceAuthorApiItem;
  /** 첨부파일 목록 */
  files: CommonSpaceAssignmentFileApiItem[];
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
 * 과제 상세 화면이 사용하는 첨부파일 아이템이다.
 */
export type CommonSpaceAssignmentAttachment = {
  /** 첨부파일 식별자 */
  id: number;
  /** 화면에 노출할 파일명 */
  name: string;
  /** 다운로드 URL */
  url: string;
};

/**
 * 과제 상세 화면이 사용하는 표시용 데이터다.
 */
export type CommonSpaceAssignmentDetailItem = {
  /** 과제 식별자 */
  id: number;
  /** 과제 제목 */
  title: string;
  /** 작성자명 */
  authorName?: string;
  /** 작성자 부가 정보 */
  authorDescription?: string;
  /** 작성자 프로필 이미지 경로 */
  profileImageSrc?: string;
  /** 작성자 프로필 이미지 대체 텍스트 */
  profileImageAlt?: string;
  /** 과제 본문 */
  content: string;
  /** 본문 상단에 노출할 이미지 경로 */
  bodyImageSrc?: string;
  /** 본문 이미지 대체 텍스트 */
  bodyImageAlt?: string;
  /** 과제 대상 파트 */
  partId: CommonSpacePartId;
  /** 화면 상단에 노출할 기준 시각 */
  createdAt: string;
  /** mock 검증 시 D-Day 계산에 사용할 기준 시각 */
  displayNowAt?: string;
  /** 과제 마감 시각 */
  deadlineAt: string;
  /** 과제 상태 */
  status: string;
  /** 첨부파일 목록 */
  attachments: CommonSpaceAssignmentAttachment[];
  /** 하단 제출 영역에 재사용할 카드 데이터 */
  assignment: CommonSpaceAssignmentListItem;
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
