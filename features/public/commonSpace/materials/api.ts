import { apiClient } from "@/lib/axios";
import {
  buildCommonSpaceMaterialListParams,
  toCommonSpaceMaterialDetailItem,
  toCommonSpaceMaterialListResult,
} from "./adapter";
import type {
  CommonSpaceMaterialDetailApiResponse,
  CommonSpaceMaterialDetailItem,
  CommonSpaceMaterialListApiResponse,
  CommonSpaceMaterialListQuery,
  CommonSpaceMaterialListResult,
} from "./types";

/**
 * 공통 공간 세션 자료 목록을 조회한다.
 * UI에서는 이 함수가 반환하는 화면용 타입만 소비하도록 유지한다.
 */
export async function getCommonSpaceMaterialList(
  query: CommonSpaceMaterialListQuery = {},
): Promise<CommonSpaceMaterialListResult> {
  const response = await apiClient.get<CommonSpaceMaterialListApiResponse>("/notice", {
    params: buildCommonSpaceMaterialListParams(query),
  });

  return toCommonSpaceMaterialListResult(response.data, query);
}

/**
 * 공통 공간 세션 자료 상세를 조회한다.
 * 첨부파일 정보까지 포함한 화면용 상세 타입으로 정규화한다.
 */
export async function getCommonSpaceMaterialDetail(
  materialId: number,
): Promise<CommonSpaceMaterialDetailItem> {
  const response = await apiClient.get<CommonSpaceMaterialDetailApiResponse>(
    `/notice/${materialId}`,
  );

  return toCommonSpaceMaterialDetailItem(response.data);
}
