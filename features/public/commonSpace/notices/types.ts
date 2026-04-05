import type { CommonSpacePartId } from "../types";
import type { CommonSpaceAuthorApiItem } from "../author";

/**
 * 공지 목록 조회 API에서 사용하는 카테고리 값이다.
 */
export type CommonSpaceNoticeApiCategory = "NOTICE";

/**
 * 공지 API가 사용하는 파트 식별자다.
 */
export type CommonSpaceNoticeApiPart =
  | "FRONTEND"
  | "BACKEND"
  | "AI_ML"
  | "PM_DESIGN"
  | "ETC";

/**
 * 공지 상세 API가 반환하는 게시글 상태다.
 */
export type CommonSpaceNoticeApiStatus = "ACTIVE" | "DELETED";

/**
 * 공지 목록 API의 단일 항목 응답이다.
 */
export type CommonSpaceNoticeSummaryApiItem = {
  /** 공지 식별자 */
  noticeId: number;
  /** 공지 제목 */
  title: string;
  /** 상단 고정 공지 여부 */
  pinned: boolean;
  /** 공지 카테고리 */
  category: CommonSpaceNoticeApiCategory | string;
  /** 공지 대상 파트 */
  part: CommonSpaceNoticeApiPart | string;
  /** 생성 시각 */
  createdAt: string;
  /** 첨부파일 개수 */
  fileCount: number;
  /** 목록 대표 이미지 URL */
  thumbnailImageUrl?: string;
};

/**
 * 공지 목록 조회 API 응답이다.
 */
export type CommonSpaceNoticeListApiResponse = {
  /** 서버가 반환한 공지 목록 */
  noticeList: CommonSpaceNoticeSummaryApiItem[];
  /** 전체 페이지 수 */
  totalPages: number;
  /** 전체 아이템 수 */
  totalElements: number;
};

/**
 * 공지 상세 API의 첨부파일 응답이다.
 */
export type CommonSpaceNoticeFileApiItem = {
  /** 첨부파일 식별자 */
  fileId: number;
  /** 원본 파일명 */
  originalFileName: string;
  /** 다운로드 URL */
  fileUrl: string;
};

/**
 * 공지 상세 API의 notice 객체 응답이다.
 */
export type CommonSpaceNoticeApiItem = {
  /** 공지 식별자 */
  noticeId: number;
  /** 작성자 식별자 */
  userId: number;
  /** 공지 제목 */
  title: string;
  /** 공지 본문 */
  content: string;
  /** 공지 카테고리 */
  category: CommonSpaceNoticeApiCategory | string;
  /** 공지 대상 파트 */
  noticePart: CommonSpaceNoticeApiPart | string;
  /** 게시글 상태 */
  status: CommonSpaceNoticeApiStatus | string;
  /** 상단 고정 공지 여부 */
  pinned: boolean;
  /** 생성 시각 */
  createdAt: string;
  /** 수정 시각 */
  updatedAt: string;
};

/**
 * 댓글 첨부파일 API 응답이다.
 */
export type CommonSpaceNoticeCommentFileApiItem = {
  /** 파일 식별자 */
  fileId: number;
  /** 파일 URL */
  fileUrl: string;
  /** 원본 파일명 */
  originalFileName: string;
  /** 파일 확장자 */
  fileExtension?: string;
  /** MIME 타입 */
  contentType?: string;
  /** 파일 크기 */
  fileSize?: number;
  /** 업로드 시각 */
  uploadedAt?: string;
};

/**
 * 댓글 API의 단일 댓글 응답이다.
 */
export type CommonSpaceNoticeCommentApiItem = {
  /** 댓글 식별자 */
  commentId: number;
  /** 작성자 식별자 */
  userId: number;
  /** 작성자 표시 정보 */
  author?: CommonSpaceAuthorApiItem;
  /** 구 명세 호환용 작성자명 */
  userName?: string;
  /** 댓글 본문 */
  content: string;
  /** 댓글 상태 */
  status: CommonSpaceNoticeApiStatus | string;
  /** 생성 시각 */
  createdAt: string;
  /** 수정 시각 */
  updatedAt: string;
  /** 댓글 첨부파일 목록 */
  files: CommonSpaceNoticeCommentFileApiItem[];
};

/**
 * 공지 상세 조회 API 응답이다.
 */
export type CommonSpaceNoticeDetailApiResponse = {
  /** 공지 본문 데이터 */
  notice: CommonSpaceNoticeApiItem;
  /** 작성자 표시 정보 */
  author?: CommonSpaceAuthorApiItem;
  /** 첨부파일 목록 */
  files: CommonSpaceNoticeFileApiItem[];
  /** 댓글 목록 */
  comments: CommonSpaceNoticeCommentApiItem[];
};

/**
 * 공지 댓글 생성 API의 화면용 요청 타입이다.
 */
export type CommonSpaceNoticeCommentCreateRequest = {
  /** 댓글 본문 */
  content: string;
  /** 첨부할 이미지 파일 목록 */
  files: File[];
};

/**
 * 공지 댓글 생성 API 응답이다.
 */
export type CommonSpaceNoticeCreateCommentApiResponse = {
  /** 처리 결과 */
  result: string;
  /** 공지 식별자 */
  noticeId: number;
  /** 댓글 식별자 */
  commentId: number;
  /** 업로드된 파일 수 */
  uploadedFileCount: number;
  /** 생성 시각 */
  createdAt: string;
};

/**
 * 공지 목록 조회에 사용하는 화면용 쿼리 타입이다.
 */
export type CommonSpaceNoticeListQuery = {
  /** 조회할 페이지 번호. 0부터 시작 */
  page?: number;
  /** 페이지당 항목 수 */
  size?: number;
  /** 조회 대상 파트 */
  partId?: CommonSpacePartId;
};

/**
 * 공지 목록 화면이 사용하는 단일 공지 아이템이다.
 */
export type CommonSpaceNoticeListItem = {
  /** 공지 식별자 */
  id: number;
  /** 공지 제목 */
  title: string;
  /** 공지 대상 파트 */
  partId: CommonSpacePartId;
  /** 생성 시각 */
  createdAt: string;
  /** 첨부파일 개수 */
  fileCount: number;
  /** 첨부파일 존재 여부 */
  hasAttachments: boolean;
  /** 고정 공지 여부 */
  isPinned: boolean;
  /** 생성일 기준 1주일 이내인지 여부를 프론트에서 계산한 값 */
  isNew: boolean;
};

/**
 * 공지 상세 화면이 사용하는 첨부파일 아이템이다.
 */
export type CommonSpaceNoticeAttachment = {
  /** 첨부파일 식별자 */
  id: number;
  /** 화면에 노출할 파일명 */
  name: string;
  /** 다운로드 URL */
  url: string;
};

/**
 * 공지 상세 화면이 사용하는 표시용 데이터다.
 */
export type CommonSpaceNoticeDetailItem = {
  /** 공지 식별자 */
  id: number;
  /** 공지 제목 */
  title: string;
  /** 작성자명 */
  authorName?: string;
  /** 작성자 부가 정보 */
  authorDescription?: string;
  /** 작성자 프로필 이미지 경로 */
  profileImageSrc?: string;
  /** 작성자 프로필 이미지 대체 텍스트 */
  profileImageAlt?: string;
  /** 공지 본문 */
  content: string;
  /** 본문 상단에 노출할 이미지 경로 */
  bodyImageSrc?: string;
  /** 본문 이미지 대체 텍스트 */
  bodyImageAlt?: string;
  /** 공지 대상 파트 */
  partId: CommonSpacePartId;
  /** 게시글 상태 */
  status: CommonSpaceNoticeApiStatus | string;
  /** 생성 시각 */
  createdAt: string;
  /** 수정 시각 */
  updatedAt: string;
  /** 첨부파일 목록 */
  attachments: CommonSpaceNoticeAttachment[];
  /** 첨부파일 존재 여부 */
  hasAttachments: boolean;
  /** 댓글 목록 */
  comments: CommonSpaceNoticeCommentItem[];
};

/**
 * 공지 댓글에 첨부된 이미지 한 장의 표시용 데이터다.
 */
export type CommonSpaceNoticeCommentImage = {
  /** 이미지 식별자 */
  id: string;
  /** 이미지 경로 */
  src: string;
  /** 이미지 대체 텍스트 */
  alt: string;
};

/**
 * 공지 댓글 한 건의 표시용 데이터다.
 */
export type CommonSpaceNoticeCommentItem = {
  /** 댓글 식별자 */
  id: number;
  /** 작성자명 */
  authorName: string;
  /** 작성자 부가 정보 */
  authorDescription?: string;
  /** 작성자 프로필 이미지 경로 */
  profileImageSrc?: string;
  /** 작성자 프로필 이미지 대체 텍스트 */
  profileImageAlt?: string;
  /** 댓글 본문 */
  content: string;
  /** 댓글 첨부 이미지 목록 */
  images: CommonSpaceNoticeCommentImage[];
};

/**
 * 목록 화면에서 공통으로 재사용할 페이지네이션 메타 정보다.
 */
export type CommonSpaceNoticePage = {
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
 * 공지 목록 화면이 소비하는 최종 데이터 구조다.
 */
export type CommonSpaceNoticeListResult = {
  /** 화면에 노출할 공지 목록 */
  items: CommonSpaceNoticeListItem[];
  /** 페이지네이션 메타 정보 */
  page: CommonSpaceNoticePage;
};

/**
 * 공지 섹션에서 고려할 비동기 로드 상태다.
 */
export type CommonSpaceNoticeLoadState =
  | "idle"
  | "loading"
  | "success"
  | "empty"
  | "error";
