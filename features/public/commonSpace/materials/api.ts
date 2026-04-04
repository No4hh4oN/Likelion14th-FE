import { apiClient } from "@/lib/axios";
import type { CommonSpaceNoticeCreateCommentApiResponse } from "../notices/types";
import {
  buildCommonSpaceMaterialListParams,
  toCommonSpaceMaterialDetailItem,
  toCommonSpaceMaterialListResult,
} from "./adapter";
import type {
  CommonSpaceMaterialCommentCreateRequest,
  CommonSpaceMaterialDetailApiResponse,
  CommonSpaceMaterialDetailItem,
  CommonSpaceMaterialListApiResponse,
  CommonSpaceMaterialListQuery,
  CommonSpaceMaterialListResult,
} from "./types";

/**
 * 세션 자료 댓글 업로드 multipart 요청에 사용할 FormData를 생성한다.
 */
function createCommonSpaceMaterialCommentFormData(files: File[]) {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  return formData;
}

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

/**
 * 공통 공간 세션 자료 댓글을 작성한다.
 */
export async function createCommonSpaceMaterialComment(
  materialId: number,
  payload: CommonSpaceMaterialCommentCreateRequest,
) {
  const response = await apiClient.post<CommonSpaceNoticeCreateCommentApiResponse>(
    `/notice/${materialId}/comments`,
    createCommonSpaceMaterialCommentFormData(payload.files),
    {
      params: {
        content: payload.content,
      },
    },
  );

  return response.data;
}
