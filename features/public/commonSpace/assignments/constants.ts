import type { CommonSpacePartId } from "../types";
import type { CommonSpaceAssignmentLoadState } from "./types";

/**
 * 과제 목록 섹션에 노출할 페이지당 카드 수다.
 */
export const DEFAULT_COMMON_SPACE_ASSIGNMENT_PAGE_SIZE = 3;

/**
 * 과제 섹션에서 사용할 비동기 상태별 기본 문구다.
 */
export const COMMON_SPACE_ASSIGNMENT_STATUS_MESSAGE: Record<
  Exclude<CommonSpaceAssignmentLoadState, "idle" | "success">,
  string
> = {
  loading: "과제 목록을 불러오는 중입니다.",
  empty: "등록된 과제가 없습니다.",
  error: "과제 목록을 불러오지 못했습니다.",
};

/**
 * 파트별 과제 빈 상태 제목이다.
 */
export const COMMON_SPACE_ASSIGNMENT_EMPTY_TITLE_BY_PART: Record<
  CommonSpacePartId,
  string
> = {
  all: "등록된 공통 과제가 없습니다.",
  "front-end": "등록된 프론트엔드 과제가 없습니다.",
  "back-end": "등록된 백엔드 과제가 없습니다.",
  "ai-ml": "등록된 AI/ML 과제가 없습니다.",
  "pm-design": "등록된 기획/디자인 과제가 없습니다.",
};
