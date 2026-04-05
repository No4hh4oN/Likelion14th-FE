import type { CommonSpacePartId } from "../types";
import type { CommonSpaceAuthorApiItem } from "../author";

/**
 * 질의응답 API가 사용하는 질문 파트 식별자다.
 */
export type CommonSpaceQnaApiPart =
  | "FRONTEND"
  | "BACKEND"
  | "AI_ML"
  | "PM_DESIGN"
  | "ETC";

/**
 * 질의응답 API가 반환하는 상태 값이다.
 */
export type CommonSpaceQnaApiStatus = "ACTIVE" | "DELETED";

/**
 * 질의응답 카드에 표시할 질문 종류 식별자다.
 */
export type CommonSpaceQnaQuestionPartId =
  | "front-end"
  | "back-end"
  | "ai-ml"
  | "pm-design"
  | "etc";

/**
 * 질의응답 카드에 표시할 답변 상태다.
 */
export type CommonSpaceQnaAnswerState = "pending" | "completed";

/**
 * 질의응답 목록 API의 단일 항목 응답이다.
 */
export type CommonSpaceQnaSummaryApiItem = {
  /** 질문 식별자 */
  qnaId: number;
  /** 질문 제목 */
  title: string;
  /** 비밀글 여부 */
  isSecret: boolean;
  /** 질문 파트 */
  part: CommonSpaceQnaApiPart | string;
  /** 게시글 상태 */
  status: CommonSpaceQnaApiStatus | string;
  /** 생성 시각 */
  createdAt: string;
  /** 수정 시각 */
  updatedAt: string;
  /** 첨부파일 개수 */
  fileCount: number;
  /** 답변 존재 여부 */
  hasAnswer: boolean;
};

/**
 * 질의응답 목록 조회 API 응답이다.
 */
export type CommonSpaceQnaListApiResponse = {
  /** 질문 목록 */
  qnaList: CommonSpaceQnaSummaryApiItem[];
  /** 전체 페이지 수 */
  totalPages: number;
  /** 전체 아이템 수 */
  totalElements: number;
};

/**
 * 질의응답 API에서 공통으로 사용하는 파일 응답이다.
 */
export type CommonSpaceQnaFileApiItem = {
  /** 파일 식별자 */
  fileId: number;
  /** 원본 파일명 */
  originalFileName: string;
  /** 파일 URL */
  fileUrl: string;
};

/**
 * 질의응답 상세의 qna 객체 응답이다.
 */
export type CommonSpaceQnaApiItem = {
  /** 질문 식별자 */
  qnaId: number;
  /** 작성자 식별자 */
  userId: number;
  /** 질문 제목 */
  title: string;
  /** 질문 본문 HTML 문자열 */
  content: string;
  /** 질문 파트 */
  qnaPart: CommonSpaceQnaApiPart | string;
  /** 비밀글 여부 */
  isSecret: boolean;
  /** 게시글 상태 */
  status: CommonSpaceQnaApiStatus | string;
  /** 생성 시각 */
  createdAt: string;
  /** 수정 시각 */
  updatedAt: string;
  /** 관리자 삭제 여부 */
  deletedByAdmin: boolean;
};

/**
 * 질의응답 상세의 단일 답변 응답이다.
 */
export type CommonSpaceQnaAnswerApiItem = {
  /** 답변 식별자 */
  answerId: number;
  /** 질문 식별자 */
  qnaId: number;
  /** 작성자 식별자 */
  userId: number;
  /** 작성자 표시 정보 */
  author?: CommonSpaceAuthorApiItem;
  /** 답변 본문 */
  content: string;
  /** 답변 상태 */
  status: CommonSpaceQnaApiStatus | string;
  /** 생성 시각 */
  createdAt: string;
  /** 수정 시각 */
  updatedAt: string;
  /** 첨부파일 목록 */
  files: CommonSpaceQnaFileApiItem[];
};

/**
 * 질의응답 상세 조회 API 응답이다.
 */
export type CommonSpaceQnaDetailApiResponse = {
  /** 질문 본문 데이터 */
  qna: CommonSpaceQnaApiItem;
  /** 질문 작성자 표시 정보 */
  author?: CommonSpaceAuthorApiItem;
  /** 질문 첨부파일 목록 */
  files: CommonSpaceQnaFileApiItem[];
  /** 답변 목록 */
  answers: CommonSpaceQnaAnswerApiItem[];
};

/**
 * 질문 작성 API 요청 본문이다.
 */
export type CommonSpaceQnaCreateRequest = {
  /** 질문 제목 */
  title: string;
  /** 질문 본문 HTML 문자열 */
  content: string;
  /** 비밀글 여부 */
  isSecret: boolean;
  /** 질문 파트 */
  part: CommonSpaceQnaApiPart;
};

/**
 * 질문 작성 후 반환되는 응답이다.
 */
export type CommonSpaceQnaCreateResponse = {
  /** 결과 문자열 */
  result: string;
  /** 질문 식별자 */
  qnaId: number;
  /** 게시글 상태 */
  status: CommonSpaceQnaApiStatus | string;
  /** 생성 시각 */
  createdAt: string;
};

/**
 * 질문 작성 시 화면에서 전달하는 업로드 요청 데이터다.
 */
export type CommonSpaceQnaQuestionMutationRequest = {
  /** 질문 제목 */
  title: string;
  /** 질문 본문 HTML 문자열 */
  content: string;
  /** 비밀글 여부 */
  isSecret: boolean;
  /** 질문 종류 뱃지에 표시할 파트 */
  questionPartId: CommonSpaceQnaQuestionPartId;
  /** 첨부 파일 목록 */
  files: File[];
  /** mock 렌더링에 사용할 작성자명 */
  authorName?: string;
  /** mock 렌더링에 사용할 작성자 부가 정보 */
  authorDescription?: string;
  /** mock 렌더링에 사용할 프로필 이미지 경로 */
  profileImageSrc?: string;
  /** mock 렌더링에 사용할 프로필 이미지 대체 텍스트 */
  profileImageAlt?: string;
};

/**
 * 질문 작성 후 반환되는 화면용 결과 데이터다.
 */
export type CommonSpaceQnaQuestionMutationResult = {
  /** 결과 문자열 */
  result: string;
  /** 질문 식별자 */
  qnaId: number;
  /** 게시글 상태 */
  status: CommonSpaceQnaApiStatus | string;
  /** 생성 시각 */
  createdAt: string;
};

/**
 * 답변 작성/수정 API 요청 본문이다.
 */
export type CommonSpaceQnaAnswerCreateRequest = {
  /** 답변 본문 */
  content: string;
};

/**
 * 답변 작성/수정 후 반환되는 응답이다.
 */
export type CommonSpaceQnaAnswerApiResponse = {
  /** 결과 문자열 */
  result: string;
  /** 답변 식별자 */
  answerId: number;
  /** 질문 식별자 */
  qnaId: number;
  /** 답변 상태 */
  status: CommonSpaceQnaApiStatus | string;
  /** 생성 시각 */
  createdAt: string;
  /** 수정 시각 */
  updatedAt: string;
};

/**
 * 질의응답 파일 업로드 응답이다.
 */
export type CommonSpaceQnaUploadFilesResponse = {
  /** 결과 문자열 */
  result: string;
  /** 질문 식별자 */
  qnaId: number;
  /** 업로드된 파일 개수 */
  uploadedCount: number;
};

/**
 * 질의응답 목록 조회에 사용하는 화면용 쿼리 타입이다.
 */
export type CommonSpaceQnaListQuery = {
  /** 조회할 페이지 번호. 0부터 시작한다. */
  page?: number;
  /** 페이지당 항목 수 */
  size?: number;
  /** 조회 대상 파트 */
  partId?: CommonSpacePartId;
};

/**
 * 질의응답 목록 카드 한 장에 필요한 화면용 데이터다.
 */
export type CommonSpaceQnaListItem = {
  /** 질문 식별자 */
  id: number;
  /** 질문 제목 */
  title: string;
  /** 비밀글 여부 */
  isSecret: boolean;
  /** 질문 종류 뱃지에 표시할 파트 */
  questionPartId: CommonSpaceQnaQuestionPartId;
  /** 답변 상태 뱃지 */
  answerState: CommonSpaceQnaAnswerState;
  /** 생성 시각 */
  createdAt: string;
  /** 수정 시각 */
  updatedAt: string;
  /** 첨부파일 개수 */
  fileCount: number;
  /** 첨부파일 존재 여부 */
  hasAttachments: boolean;
};

/**
 * 상세 화면에서 재사용할 첨부파일 데이터다.
 */
export type CommonSpaceQnaAttachment = {
  /** 파일 식별자 */
  id: number;
  /** 화면에 표시할 파일명 */
  name: string;
  /** 다운로드 URL */
  url: string;
};

/**
 * 답변 본문 아래 미리보기로 보여줄 이미지 데이터다.
 */
export type CommonSpaceQnaAnswerImage = {
  /** 이미지 식별자 */
  id: string;
  /** 이미지 URL */
  src: string;
  /** 이미지 대체 텍스트 */
  alt: string;
};

/**
 * 상세 화면의 단일 답변 표시용 데이터다.
 */
export type CommonSpaceQnaAnswerItem = {
  /** 답변 식별자 */
  id: number;
  /** 작성자명 */
  authorName: string;
  /** 작성자 부가 정보 */
  authorDescription?: string;
  /** 작성자 프로필 이미지 경로 */
  profileImageSrc?: string;
  /** 작성자 프로필 이미지 대체 텍스트 */
  profileImageAlt?: string;
  /** 답변 본문 */
  content: string;
  /** 생성 시각 */
  createdAt: string;
  /** 수정 시각 */
  updatedAt: string;
  /** 일반 첨부파일 목록 */
  attachments: CommonSpaceQnaAttachment[];
  /** 이미지 첨부 목록 */
  images: CommonSpaceQnaAnswerImage[];
};

/**
 * 질의응답 상세 화면이 사용하는 표시용 데이터다.
 */
export type CommonSpaceQnaDetailItem = {
  /** 질문 식별자 */
  id: number;
  /** 질문 제목 */
  title: string;
  /** 질문 본문 HTML 문자열 */
  content: string;
  /** 비밀글 여부 */
  isSecret: boolean;
  /** 질문 종류 뱃지에 표시할 파트 */
  questionPartId: CommonSpaceQnaQuestionPartId;
  /** 답변 상태 뱃지 */
  answerState: CommonSpaceQnaAnswerState;
  /** 작성자명 */
  authorName?: string;
  /** 작성자 부가 정보 */
  authorDescription?: string;
  /** 작성자 프로필 이미지 경로 */
  profileImageSrc?: string;
  /** 작성자 프로필 이미지 대체 텍스트 */
  profileImageAlt?: string;
  /** 게시글 상태 */
  status: CommonSpaceQnaApiStatus | string;
  /** 생성 시각 */
  createdAt: string;
  /** 수정 시각 */
  updatedAt: string;
  /** 질문 첨부파일 목록 */
  attachments: CommonSpaceQnaAttachment[];
  /** 첨부파일 존재 여부 */
  hasAttachments: boolean;
  /** 답변 목록 */
  answers: CommonSpaceQnaAnswerItem[];
};

/**
 * 답변 작성 시 화면에서 전달하는 업로드 요청 데이터다.
 */
export type CommonSpaceQnaAnswerMutationRequest = {
  /** 답변 본문 */
  content: string;
  /** 이미지 첨부 파일 목록 */
  files: File[];
  /** mock 렌더링에 사용할 작성자명 */
  authorName?: string;
  /** mock 렌더링에 사용할 작성자 부가 정보 */
  authorDescription?: string;
  /** mock 렌더링에 사용할 프로필 이미지 경로 */
  profileImageSrc?: string;
  /** mock 렌더링에 사용할 프로필 이미지 대체 텍스트 */
  profileImageAlt?: string;
};

/**
 * 답변 작성 후 반환되는 화면용 결과 데이터다.
 */
export type CommonSpaceQnaAnswerMutationResult = {
  /** 결과 문자열 */
  result: string;
  /** 답변 식별자 */
  answerId: number;
  /** 질문 식별자 */
  qnaId: number;
  /** 생성 시각 */
  createdAt: string;
  /** 수정 시각 */
  updatedAt: string;
};

/**
 * 목록 화면에서 공통으로 재사용할 페이지네이션 메타 정보다.
 */
export type CommonSpaceQnaPage = {
  /** 현재 페이지 번호 */
  page: number;
  /** 현재 페이지 크기 */
  size: number;
  /** 전체 페이지 수 */
  totalPages: number;
  /** 전체 아이템 수 */
  totalElements: number;
};

/**
 * 질의응답 목록 화면이 소비하는 최종 데이터 구조다.
 */
export type CommonSpaceQnaListResult = {
  /** 화면에 노출할 질문 목록 */
  items: CommonSpaceQnaListItem[];
  /** 페이지네이션 메타 정보 */
  page: CommonSpaceQnaPage;
};

/**
 * 질의응답 섹션에서 고려할 비동기 로드 상태다.
 */
export type CommonSpaceQnaLoadState =
  | "idle"
  | "loading"
  | "success"
  | "empty"
  | "error";
