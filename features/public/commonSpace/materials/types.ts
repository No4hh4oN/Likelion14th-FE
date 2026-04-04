import type { CommonSpacePartId } from "../types";
import type {
  CommonSpaceNoticeCommentApiItem,
  CommonSpaceNoticeCommentCreateRequest,
  CommonSpaceNoticeCommentItem,
} from "../notices/types";

/**
 * 세션 자료 목록 조회 API에서 사용하는 카테고리 값이다.
 */
export type CommonSpaceMaterialApiCategory = "SESSION_DATA";

/**
 * 세션 자료 API가 사용하는 파트 식별자다.
 */
export type CommonSpaceMaterialApiPart =
  | "FRONTEND"
  | "BACKEND"
  | "AI_ML"
  | "PM_DESIGN"
  | "ETC";

/**
 * 세션 자료 상세 API가 반환하는 게시글 상태다.
 */
export type CommonSpaceMaterialApiStatus = "ACTIVE" | "DELETED";

/**
 * 세션 자료 목록 API의 단일 항목 응답이다.
 */
export type CommonSpaceMaterialSummaryApiItem = {
  /** 자료 식별자 */
  noticeId: number;
  /** 자료 제목 */
  title: string;
  /** 상단 고정 자료 여부 */
  pinned: boolean;
  /** 자료 카테고리 */
  category: CommonSpaceMaterialApiCategory | string;
  /** 자료 대상 파트 */
  part: CommonSpaceMaterialApiPart | string;
  /** 생성 시각 */
  createdAt: string;
  /** 첨부파일 개수 */
  fileCount: number;
  /** 목록 대표 이미지 URL */
  thumbnailImageUrl?: string;
};

/**
 * 세션 자료 목록 조회 API 응답이다.
 */
export type CommonSpaceMaterialListApiResponse = {
  /** 서버가 반환한 자료 목록 */
  noticeList: CommonSpaceMaterialSummaryApiItem[];
  /** 전체 페이지 수 */
  totalPages: number;
  /** 전체 아이템 수 */
  totalElements: number;
};

/**
 * 세션 자료 상세의 첨부파일 응답이다.
 */
export type CommonSpaceMaterialFileApiItem = {
  /** 첨부파일 식별자 */
  fileId: number;
  /** 원본 파일명 */
  originalFileName: string;
  /** 다운로드 URL */
  fileUrl: string;
};

/**
 * 세션 자료 상세의 notice 객체 응답이다.
 */
export type CommonSpaceMaterialApiItem = {
  /** 자료 식별자 */
  noticeId: number;
  /** 작성자 식별자 */
  userId: number;
  /** 자료 제목 */
  title: string;
  /** 자료 본문 */
  content: string;
  /** 자료 카테고리 */
  category: CommonSpaceMaterialApiCategory | string;
  /** 자료 대상 파트 */
  noticePart: CommonSpaceMaterialApiPart | string;
  /** 게시글 상태 */
  status: CommonSpaceMaterialApiStatus | string;
  /** 상단 고정 자료 여부 */
  pinned: boolean;
  /** 생성 시각 */
  createdAt: string;
  /** 수정 시각 */
  updatedAt: string;
};

/**
 * 세션 자료 상세 조회 API 응답이다.
 */
export type CommonSpaceMaterialDetailApiResponse = {
  /** 자료 본문 데이터 */
  notice: CommonSpaceMaterialApiItem;
  /** 첨부파일 목록 */
  files: CommonSpaceMaterialFileApiItem[];
  /** 댓글 목록 */
  comments: CommonSpaceNoticeCommentApiItem[];
};

/**
 * 세션 자료 댓글 생성에 사용하는 요청 타입이다.
 */
export type CommonSpaceMaterialCommentCreateRequest =
  CommonSpaceNoticeCommentCreateRequest;

/**
 * 세션 자료 목록 조회에 사용하는 화면용 쿼리 타입이다.
 */
export type CommonSpaceMaterialListQuery = {
  /** 조회할 페이지 번호. 0부터 시작 */
  page?: number;
  /** 페이지당 항목 수 */
  size?: number;
  /** 조회 대상 파트 */
  partId?: CommonSpacePartId;
};

/**
 * 세션 자료 목록 화면이 사용하는 단일 자료 아이템이다.
 */
export type CommonSpaceMaterialListItem = {
  /** 자료 식별자 */
  id: number;
  /** 자료 제목 */
  title: string;
  /** 자료 요약문 */
  summary?: string;
  /** 리스트 대표 이미지 경로 */
  thumbnailSrc?: string;
  /** 리스트 대표 이미지 대체 텍스트 */
  thumbnailAlt?: string;
  /** 자료 대상 파트 */
  partId: CommonSpacePartId;
  /** 생성 시각 */
  createdAt: string;
  /** 첨부파일 개수 */
  fileCount: number;
  /** 첨부파일 존재 여부 */
  hasAttachments: boolean;
  /** 고정 자료 여부 */
  isPinned: boolean;
  /** 신규 자료 여부 */
  isNew: boolean;
};

/**
 * 세션 자료 상세 화면이 사용하는 첨부파일 아이템이다.
 */
export type CommonSpaceMaterialAttachment = {
  /** 첨부파일 식별자 */
  id: number;
  /** 화면에 노출할 파일명 */
  name: string;
  /** 다운로드 URL */
  url: string;
};

/**
 * 세션 자료 상세 화면이 사용하는 표시용 데이터다.
 */
export type CommonSpaceMaterialDetailItem = {
  /** 자료 식별자 */
  id: number;
  /** 자료 제목 */
  title: string;
  /** 작성자명 */
  authorName?: string;
  /** 작성자 부가 정보 */
  authorDescription?: string;
  /** 자료 본문 */
  content: string;
  /** 본문 상단에 노출할 이미지 경로 */
  bodyImageSrc?: string;
  /** 본문 이미지 대체 텍스트 */
  bodyImageAlt?: string;
  /** 자료 대상 파트 */
  partId: CommonSpacePartId;
  /** 게시글 상태 */
  status: CommonSpaceMaterialApiStatus | string;
  /** 생성 시각 */
  createdAt: string;
  /** 수정 시각 */
  updatedAt: string;
  /** 첨부파일 목록 */
  attachments: CommonSpaceMaterialAttachment[];
  /** 첨부파일 존재 여부 */
  hasAttachments: boolean;
  /** 댓글 목록 */
  comments: CommonSpaceNoticeCommentItem[];
};

/**
 * 목록 화면에서 공통으로 재사용할 페이지네이션 메타 정보다.
 */
export type CommonSpaceMaterialPage = {
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
 * 세션 자료 목록 화면이 소비하는 최종 데이터 구조다.
 */
export type CommonSpaceMaterialListResult = {
  /** 화면에 노출할 자료 목록 */
  items: CommonSpaceMaterialListItem[];
  /** 페이지네이션 메타 정보 */
  page: CommonSpaceMaterialPage;
};

/**
 * 세션 자료 섹션에서 고려할 비동기 로드 상태다.
 */
export type CommonSpaceMaterialLoadState =
  | "idle"
  | "loading"
  | "success"
  | "empty"
  | "error";
