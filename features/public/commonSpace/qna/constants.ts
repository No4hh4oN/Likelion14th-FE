import type { CommonSpacePartId } from "../types";

/**
 * 질의응답 목록 조회 기본 페이지 번호다.
 */
export const DEFAULT_COMMON_SPACE_QNA_PAGE = 0;

/**
 * 질의응답 섹션 기본 페이지 크기다.
 */
export const DEFAULT_COMMON_SPACE_QNA_PAGE_SIZE = 8;

/**
 * 질의응답 목록이 비었을 때 표시할 안내 문구다.
 */
export const COMMON_SPACE_QNA_EMPTY_TITLE_BY_PART: Record<
  CommonSpacePartId,
  string
> = {
  all: "등록된 질문이 없습니다.",
  "front-end": "등록된 질문이 없습니다.",
  "back-end": "등록된 질문이 없습니다.",
  "ai-ml": "등록된 질문이 없습니다.",
  "pm-design": "등록된 질문이 없습니다.",
};

/**
 * 질의응답 섹션 비동기 상태별 안내 문구다.
 */
export const COMMON_SPACE_QNA_STATUS_MESSAGE = {
  loading: "질문 목록을 불러오는 중입니다.",
  error: "질문 목록을 불러오지 못했습니다.",
} as const;
