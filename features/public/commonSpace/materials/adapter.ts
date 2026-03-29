import type { CommonSpacePartId } from "../types";
import {
  COMMON_SPACE_MATERIAL_CATEGORY,
  DEFAULT_COMMON_SPACE_MATERIAL_PAGE,
  DEFAULT_COMMON_SPACE_MATERIAL_PAGE_SIZE,
} from "./constants";
import type {
  CommonSpaceMaterialApiPart,
  CommonSpaceMaterialAttachment,
  CommonSpaceMaterialDetailApiResponse,
  CommonSpaceMaterialDetailItem,
  CommonSpaceMaterialFileApiItem,
  CommonSpaceMaterialListApiResponse,
  CommonSpaceMaterialListItem,
  CommonSpaceMaterialListQuery,
  CommonSpaceMaterialListResult,
  CommonSpaceMaterialSummaryApiItem,
} from "./types";

type CommonSpaceMaterialListApiParams = {
  page: number;
  size: number;
  category: typeof COMMON_SPACE_MATERIAL_CATEGORY;
  part: CommonSpaceMaterialApiPart;
};

const commonSpacePartIdToMaterialApiPart: Record<
  CommonSpacePartId,
  CommonSpaceMaterialApiPart
> = {
  all: "ETC",
  "front-end": "FRONTEND",
  "back-end": "BACKEND",
  "ai-ml": "AI_ML",
  "pm-design": "PM_DESIGN",
};

const materialApiPartToCommonSpacePartId: Record<
  CommonSpaceMaterialApiPart,
  CommonSpacePartId
> = {
  FRONTEND: "front-end",
  BACKEND: "back-end",
  AI_ML: "ai-ml",
  PM_DESIGN: "pm-design",
  ETC: "all",
};

/**
 * 공통공간 파트 식별자를 세션 자료 API 파트 값으로 변환한다.
 * `all`은 공통 공간 자료를 의미하므로 API의 `ETC`와 매핑한다.
 */
export function mapCommonSpacePartIdToMaterialApiPart(
  partId: CommonSpacePartId = "all",
): CommonSpaceMaterialApiPart {
  return commonSpacePartIdToMaterialApiPart[partId];
}

/**
 * 세션 자료 API의 part 값을 공통공간 파트 식별자로 정규화한다.
 * 알 수 없는 값은 안전하게 all로 되돌린다.
 */
export function mapMaterialApiPartToCommonSpacePartId(
  part: CommonSpaceMaterialApiPart | string,
): CommonSpacePartId {
  if (part in materialApiPartToCommonSpacePartId) {
    return materialApiPartToCommonSpacePartId[part as CommonSpaceMaterialApiPart];
  }

  return "all";
}

/**
 * 세션 자료 목록 조회용 API 파라미터를 생성한다.
 */
export function buildCommonSpaceMaterialListParams(
  query: CommonSpaceMaterialListQuery = {},
): CommonSpaceMaterialListApiParams {
  const page = query.page ?? DEFAULT_COMMON_SPACE_MATERIAL_PAGE;
  const size = query.size ?? DEFAULT_COMMON_SPACE_MATERIAL_PAGE_SIZE;
  const part = mapCommonSpacePartIdToMaterialApiPart(query.partId ?? "all");

  return {
    page,
    size,
    category: COMMON_SPACE_MATERIAL_CATEGORY,
    part,
  };
}

/**
 * 목록 API 단일 아이템을 화면용 세션 자료 아이템으로 변환한다.
 */
export function toCommonSpaceMaterialListItem(
  item: CommonSpaceMaterialSummaryApiItem,
): CommonSpaceMaterialListItem {
  return {
    id: item.noticeId,
    title: item.title,
    partId: mapMaterialApiPartToCommonSpacePartId(item.part),
    createdAt: item.createdAt,
    fileCount: item.fileCount,
    hasAttachments: item.fileCount > 0,
    isPinned: false,
    isNew: false,
  };
}

/**
 * 목록 API 응답을 화면용 세션 자료 결과로 변환한다.
 */
export function toCommonSpaceMaterialListResult(
  response: CommonSpaceMaterialListApiResponse,
  query: CommonSpaceMaterialListQuery = {},
): CommonSpaceMaterialListResult {
  return {
    items: response.noticeList.map(toCommonSpaceMaterialListItem),
    page: {
      page: query.page ?? DEFAULT_COMMON_SPACE_MATERIAL_PAGE,
      size: query.size ?? DEFAULT_COMMON_SPACE_MATERIAL_PAGE_SIZE,
      totalPages: response.totalPages,
      totalElements: response.totalElements,
    },
  };
}

/**
 * 첨부파일 API 응답을 화면용 세션 자료 첨부파일 데이터로 변환한다.
 */
export function toCommonSpaceMaterialAttachment(
  file: CommonSpaceMaterialFileApiItem,
): CommonSpaceMaterialAttachment {
  return {
    id: file.fileId,
    name: file.originalFileName,
    url: file.fileUrl,
  };
}

/**
 * 세션 자료 상세 API의 notice 객체를 화면용 상세 아이템으로 변환한다.
 */
export function toCommonSpaceMaterialDetailItem(
  response: CommonSpaceMaterialDetailApiResponse,
): CommonSpaceMaterialDetailItem {
  const attachments = response.files.map(toCommonSpaceMaterialAttachment);
  const material = response.notice;

  return {
    id: material.noticeId,
    title: material.title,
    content: material.content,
    partId: mapMaterialApiPartToCommonSpacePartId(material.noticePart),
    status: material.status,
    createdAt: material.createdAt,
    updatedAt: material.updatedAt,
    attachments,
    hasAttachments: attachments.length > 0,
  };
}
