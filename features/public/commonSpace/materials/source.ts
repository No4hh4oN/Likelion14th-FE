import {
  createCommonSpaceMaterialComment,
  getCommonSpaceMaterialDetail,
  getCommonSpaceMaterialList,
} from "./api";
import type {
  CommonSpaceMaterialCommentCreateRequest,
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
  /**
   * 세션 자료 댓글을 작성한다.
   */
  createComment(
    materialId: number,
    payload: CommonSpaceMaterialCommentCreateRequest,
  ): Promise<void>;
};

/**
 * 세션 자료 목록 카드에 사용할 요약문 최대 길이다.
 */
const COMMON_SPACE_MATERIAL_SUMMARY_MAX_LENGTH = 140;

/**
 * 세션 자료 본문을 목록 카드용 요약문으로 정규화한다.
 */
export function buildCommonSpaceMaterialSummary(content: string) {
  const normalizedContent = content.replace(/\s+/g, " ").trim();

  if (normalizedContent.length <= COMMON_SPACE_MATERIAL_SUMMARY_MAX_LENGTH) {
    return normalizedContent;
  }

  return `${normalizedContent.slice(0, COMMON_SPACE_MATERIAL_SUMMARY_MAX_LENGTH).trimEnd()}...`;
}

/**
 * 목록 아이템에 상세 본문 기반 요약문을 붙인다.
 */
export async function hydrateCommonSpaceMaterialSummaries(
  dataSource: CommonSpaceMaterialDataSource,
  items: CommonSpaceMaterialListResult["items"],
) {
  const hydratedItems = await Promise.all(
    items.map(async (item) => {
      const detail = await dataSource.getDetail(item.id);

      return {
        ...item,
        summary: detail ? buildCommonSpaceMaterialSummary(detail.content) : item.summary,
      };
    }),
  );

  return hydratedItems;
}

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
  async createComment(materialId, payload) {
    await createCommonSpaceMaterialComment(materialId, payload);
  },
};
