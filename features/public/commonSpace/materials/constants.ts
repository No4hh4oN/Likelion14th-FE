import type { CommonSpacePartId } from "../types";
import type {
  CommonSpaceMaterialApiCategory,
  CommonSpaceMaterialLoadState,
} from "./types";

/**
 * 세션 자료 목록 조회 시 고정으로 전달할 카테고리 값이다.
 */
export const COMMON_SPACE_MATERIAL_CATEGORY: CommonSpaceMaterialApiCategory =
  "SESSION_DATA";

/**
 * 세션 자료 목록 조회 기본 페이지 번호다.
 */
export const DEFAULT_COMMON_SPACE_MATERIAL_PAGE = 0;

/**
 * 세션 자료 목록 조회 기본 페이지 크기다.
 */
export const DEFAULT_COMMON_SPACE_MATERIAL_PAGE_SIZE = 5;

/**
 * 세션 자료 섹션에서 사용할 비동기 상태별 기본 문구다.
 */
export const COMMON_SPACE_MATERIAL_STATUS_MESSAGE: Record<
  Exclude<CommonSpaceMaterialLoadState, "idle" | "success">,
  string
> = {
  loading: "세션 자료를 불러오는 중입니다.",
  empty: "등록된 세션 자료가 없습니다.",
  error: "세션 자료를 불러오지 못했습니다.",
};

/**
 * 파트별 세션 자료 빈 상태 제목이다.
 */
export const COMMON_SPACE_MATERIAL_EMPTY_TITLE_BY_PART: Record<
  CommonSpacePartId,
  string
> = {
  all: "등록된 공통 공간 세션 자료가 없습니다.",
  "front-end": "등록된 프론트엔드 세션 자료가 없습니다.",
  "back-end": "등록된 백엔드 세션 자료가 없습니다.",
  "ai-ml": "등록된 AI/ML 세션 자료가 없습니다.",
  "pm-design": "등록된 기획/디자인 세션 자료가 없습니다.",
};
