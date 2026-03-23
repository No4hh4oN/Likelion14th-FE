import type { CommonSpacePartId } from "../types";
import {
  COMMON_SPACE_NOTICE_CATEGORY,
  DEFAULT_COMMON_SPACE_NOTICE_PAGE,
  DEFAULT_COMMON_SPACE_NOTICE_PAGE_SIZE,
} from "./constants";
import type {
  CommonSpaceNoticeApiPart,
  CommonSpaceNoticeAttachment,
  CommonSpaceNoticeDetailApiResponse,
  CommonSpaceNoticeDetailItem,
  CommonSpaceNoticeFileApiItem,
  CommonSpaceNoticeListApiResponse,
  CommonSpaceNoticeListItem,
  CommonSpaceNoticeListQuery,
  CommonSpaceNoticeListResult,
  CommonSpaceNoticeSummaryApiItem,
} from "./types";

type CommonSpaceNoticeListApiParams = {
  page: number;
  size: number;
  category: typeof COMMON_SPACE_NOTICE_CATEGORY;
  part?: CommonSpaceNoticeApiPart;
};

const commonSpacePartIdToNoticeApiPart: Partial<
  Record<CommonSpacePartId, CommonSpaceNoticeApiPart>
> = {
  "front-end": "FRONTEND",
  "back-end": "BACKEND",
  "ai-ml": "AI_ML",
  "pm-design": "PM_DESIGN",
};

const noticeApiPartToCommonSpacePartId: Record<
  CommonSpaceNoticeApiPart,
  CommonSpacePartId
> = {
  FRONTEND: "front-end",
  BACKEND: "back-end",
  AI_ML: "ai-ml",
  PM_DESIGN: "pm-design",
  ETC: "all",
};

/**
 * 공통공간 파트 식별자를 공지 API 파트 값으로 변환한다.
 * `all`은 전체 공지를 의미하므로 part 파라미터를 생략한다.
 */
export function mapCommonSpacePartIdToNoticeApiPart(
  partId?: CommonSpacePartId,
): CommonSpaceNoticeApiPart | undefined {
  if (!partId || partId === "all") {
    return undefined;
  }

  return commonSpacePartIdToNoticeApiPart[partId];
}

/**
 * 공지 API의 part 값을 공통공간 파트 식별자로 정규화한다.
 * 알 수 없는 값은 안전하게 all로 되돌린다.
 */
export function mapNoticeApiPartToCommonSpacePartId(
  part: CommonSpaceNoticeApiPart | string,
): CommonSpacePartId {
  if (part in noticeApiPartToCommonSpacePartId) {
    return noticeApiPartToCommonSpacePartId[part as CommonSpaceNoticeApiPart];
  }

  return "all";
}

/**
 * 공지 목록 조회용 API 파라미터를 생성한다.
 */
export function buildCommonSpaceNoticeListParams(
  query: CommonSpaceNoticeListQuery = {},
): CommonSpaceNoticeListApiParams {
  const page = query.page ?? DEFAULT_COMMON_SPACE_NOTICE_PAGE;
  const size = query.size ?? DEFAULT_COMMON_SPACE_NOTICE_PAGE_SIZE;
  const part = mapCommonSpacePartIdToNoticeApiPart(query.partId);

  return {
    page,
    size,
    category: COMMON_SPACE_NOTICE_CATEGORY,
    ...(part ? { part } : {}),
  };
}

/**
 * 목록 API 단일 아이템을 화면용 목록 아이템으로 변환한다.
 */
export function toCommonSpaceNoticeListItem(
  item: CommonSpaceNoticeSummaryApiItem,
): CommonSpaceNoticeListItem {
  return {
    id: item.noticeId,
    title: item.title,
    partId: mapNoticeApiPartToCommonSpacePartId(item.part),
    createdAt: item.createdAt,
    fileCount: item.fileCount,
    hasAttachments: item.fileCount > 0,
  };
}

/**
 * 목록 API 응답을 화면용 목록 결과로 변환한다.
 */
export function toCommonSpaceNoticeListResult(
  response: CommonSpaceNoticeListApiResponse,
  query: CommonSpaceNoticeListQuery = {},
): CommonSpaceNoticeListResult {
  return {
    items: response.noticeList.map(toCommonSpaceNoticeListItem),
    page: {
      page: query.page ?? DEFAULT_COMMON_SPACE_NOTICE_PAGE,
      size: query.size ?? DEFAULT_COMMON_SPACE_NOTICE_PAGE_SIZE,
      totalPages: response.totalPages,
      totalElements: response.totalElements,
    },
  };
}

/**
 * 첨부파일 API 응답을 화면용 첨부파일 데이터로 변환한다.
 */
export function toCommonSpaceNoticeAttachment(
  file: CommonSpaceNoticeFileApiItem,
): CommonSpaceNoticeAttachment {
  return {
    id: file.fileId,
    name: file.originalFileName,
    url: file.fileUrl,
  };
}

/**
 * 공지 상세 API의 notice 객체를 화면용 상세 아이템으로 변환한다.
 */
export function toCommonSpaceNoticeDetailItem(
  response: CommonSpaceNoticeDetailApiResponse,
): CommonSpaceNoticeDetailItem {
  const attachments = response.files.map(toCommonSpaceNoticeAttachment);
  const notice = response.notice;

  return {
    id: notice.noticeId,
    title: notice.title,
    content: notice.content,
    partId: mapNoticeApiPartToCommonSpacePartId(notice.noticePart),
    status: notice.status,
    createdAt: notice.createdAt,
    updatedAt: notice.updatedAt,
    attachments,
    hasAttachments: attachments.length > 0,
  };
}
