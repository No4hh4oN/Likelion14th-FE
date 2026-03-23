import {
  getCommonSpaceNoticeDetail,
  getCommonSpaceNoticeList,
} from "./api";
import {
  getMockCommonSpaceNoticeDetail,
  getMockCommonSpaceNoticeList,
} from "./notice.mock";
import type {
  CommonSpaceNoticeDetailItem,
  CommonSpaceNoticeListQuery,
  CommonSpaceNoticeListResult,
} from "./notice.types";

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
};
