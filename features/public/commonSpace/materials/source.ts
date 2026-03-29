import {
  getCommonSpaceMaterialDetail,
  getCommonSpaceMaterialList,
} from "./api";
import {
  getMockCommonSpaceMaterialDetail,
  getMockCommonSpaceMaterialList,
} from "./mock";
import type {
  CommonSpaceMaterialDetailItem,
  CommonSpaceMaterialListQuery,
  CommonSpaceMaterialListResult,
} from "./types";

/**
 * 세션 자료 섹션이 의존할 데이터 소스 계약이다.
 * 레이아웃 컴포넌트는 이 인터페이스만 바라보도록 분리한다.
 */
export type CommonSpaceMaterialDataSource = {
  /**
   * 세션 자료 목록을 조회한다.
   */
  getList(
    query?: CommonSpaceMaterialListQuery,
  ): Promise<CommonSpaceMaterialListResult>;
  /**
   * 세션 자료 상세를 조회한다.
   */
  getDetail(materialId: number): Promise<CommonSpaceMaterialDetailItem | null>;
};

/**
 * 실 API를 사용하는 세션 자료 데이터 소스다.
 */
export const commonSpaceMaterialApiDataSource: CommonSpaceMaterialDataSource = {
  async getList(query = {}) {
    return getCommonSpaceMaterialList(query);
  },
  async getDetail(materialId) {
    return getCommonSpaceMaterialDetail(materialId);
  },
};

/**
 * 레이아웃 검증과 스토리 성격 작업에 사용할 mock 데이터 소스다.
 */
export const commonSpaceMaterialMockDataSource: CommonSpaceMaterialDataSource = {
  async getList(query = {}) {
    return getMockCommonSpaceMaterialList(query);
  },
  async getDetail(materialId) {
    return getMockCommonSpaceMaterialDetail(materialId);
  },
};
