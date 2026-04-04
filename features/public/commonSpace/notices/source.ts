import {
  createCommonSpaceNoticeComment,
  getCommonSpaceNoticeDetail,
  getCommonSpaceNoticeList,
} from "./api";
import {
  getMockCommonSpaceNoticeDetail,
  getMockCommonSpaceNoticeList,
} from "./mock";
import type {
  CommonSpaceNoticeCommentCreateRequest,
  CommonSpaceNoticeDetailItem,
  CommonSpaceNoticeListItem,
  CommonSpaceNoticeListQuery,
  CommonSpaceNoticeListResult,
} from "./types";
import type { CommonSpacePartId } from "../types";

/**
 * 전체 공지 섹션이 의존할 데이터 소스 계약이다.
 * 레이아웃 컴포넌트는 이 인터페이스만 바라보도록 분리한다.
 */
export type CommonSpaceNoticeDataSource = {
  /**
   * 공지 목록을 조회한다.
   */
  getList(query?: CommonSpaceNoticeListQuery): Promise<CommonSpaceNoticeListResult>;
  /**
   * 공지 상세를 조회한다.
   */
  getDetail(noticeId: number): Promise<CommonSpaceNoticeDetailItem | null>;
  /**
   * 공지 댓글을 작성한다.
   */
  createComment(
    noticeId: number,
    payload: CommonSpaceNoticeCommentCreateRequest,
  ): Promise<void>;
};

/**
 * 실 API를 사용하는 공지 데이터 소스다.
 */
export const commonSpaceNoticeApiDataSource: CommonSpaceNoticeDataSource = {
  async getList(query = {}) {
    return getCommonSpaceNoticeList(query);
  },
  async getDetail(noticeId) {
    return getCommonSpaceNoticeDetail(noticeId);
  },
  async createComment(noticeId, payload) {
    await createCommonSpaceNoticeComment(noticeId, payload);
  },
};

/**
 * 레이아웃 검증과 스토리 성격 작업에 사용할 mock 데이터 소스다.
 */
export const commonSpaceNoticeMockDataSource: CommonSpaceNoticeDataSource = {
  async getList(query = {}) {
    return getMockCommonSpaceNoticeList(query);
  },
  async getDetail(noticeId) {
    return getMockCommonSpaceNoticeDetail(noticeId);
  },
  async createComment() {
    return;
  },
};

/**
 * 상단 배너에 사용할 pinned 공지 목록을 조회한다.
 */
export async function getCommonSpacePinnedNoticeItems(
  partId: CommonSpacePartId,
): Promise<CommonSpaceNoticeListItem[]> {
  try {
    const response = await commonSpaceNoticeApiDataSource.getList({
      partId,
      page: 0,
      size: 100,
    });

    return response.items.filter((item) => item.isPinned);
  } catch {
    return [];
  }
}

/**
 * 일반 공지 목록에서 별도로 상단에 노출한 pinned 공지를 제외한다.
 */
export function excludeCommonSpacePinnedNoticeItems(
  items: CommonSpaceNoticeListItem[],
  pinnedItems: CommonSpaceNoticeListItem[],
) {
  const pinnedItemIds = new Set(pinnedItems.map((item) => item.id));

  return items.filter((item) => !pinnedItemIds.has(item.id));
}
