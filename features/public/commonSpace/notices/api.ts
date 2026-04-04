import { apiClient } from "@/lib/axios";
import {
  buildCommonSpaceNoticeListParams,
  toCommonSpaceNoticeDetailItem,
  toCommonSpaceNoticeListResult,
} from "./adapter";
import type {
  CommonSpaceNoticeCommentCreateRequest,
  CommonSpaceNoticeCreateCommentApiResponse,
  CommonSpaceNoticeDetailApiResponse,
  CommonSpaceNoticeDetailItem,
  CommonSpaceNoticeListApiResponse,
  CommonSpaceNoticeListQuery,
  CommonSpaceNoticeListResult,
} from "./types";

/**
 * 공지 댓글 업로드 multipart 요청에 사용할 FormData를 생성한다.
 */
function createCommonSpaceNoticeCommentFormData(files: File[]) {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  return formData;
}

/**
 * 공통 공간 전체 공지 목록을 조회한다.
 * UI에서는 이 함수가 반환하는 화면용 타입만 소비하도록 유지한다.
 */
export async function getCommonSpaceNoticeList(
  query: CommonSpaceNoticeListQuery = {},
): Promise<CommonSpaceNoticeListResult> {
  const response = await apiClient.get<CommonSpaceNoticeListApiResponse>("/notice", {
    params: buildCommonSpaceNoticeListParams(query),
  });

  return toCommonSpaceNoticeListResult(response.data, query);
}

/**
 * 공통 공간 공지 상세를 조회한다.
 * 첨부파일 정보까지 포함한 화면용 상세 타입으로 정규화한다.
 */
export async function getCommonSpaceNoticeDetail(
  noticeId: number,
): Promise<CommonSpaceNoticeDetailItem> {
  const response = await apiClient.get<CommonSpaceNoticeDetailApiResponse>(
    `/notice/${noticeId}`,
  );

  return toCommonSpaceNoticeDetailItem(response.data);
}

/**
 * 공통 공간 공지 댓글을 작성한다.
 */
export async function createCommonSpaceNoticeComment(
  noticeId: number,
  payload: CommonSpaceNoticeCommentCreateRequest,
) {
  const response = await apiClient.post<CommonSpaceNoticeCreateCommentApiResponse>(
    `/notice/${noticeId}/comments`,
    createCommonSpaceNoticeCommentFormData(payload.files),
    {
      params: {
        content: payload.content,
      },
    },
  );

  return response.data;
}
