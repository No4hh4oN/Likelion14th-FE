import { apiClient } from "@/lib/axios";
import {
  buildCommonSpaceQnaListParams,
  mapQuestionPartIdToQnaApiPart,
  toCommonSpaceQnaDetailItem,
  toCommonSpaceQnaListResult,
} from "./adapter";
import type {
  CommonSpaceQnaAnswerApiResponse,
  CommonSpaceQnaAnswerCreateRequest,
  CommonSpaceQnaAnswerMutationRequest,
  CommonSpaceQnaAnswerMutationResult,
  CommonSpaceQnaCreateRequest,
  CommonSpaceQnaCreateResponse,
  CommonSpaceQnaDetailApiResponse,
  CommonSpaceQnaDetailItem,
  CommonSpaceQnaListApiResponse,
  CommonSpaceQnaListQuery,
  CommonSpaceQnaListResult,
  CommonSpaceQnaQuestionMutationRequest,
  CommonSpaceQnaQuestionMutationResult,
  CommonSpaceQnaUploadFilesResponse,
} from "./types";

/**
 * 질의응답 파일 업로드 multipart 요청에 사용할 FormData를 생성한다.
 */
function createCommonSpaceQnaFilesFormData(files: File[]) {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  return formData;
}

/**
 * 공통 공간 질의응답 목록을 조회한다.
 */
export async function getCommonSpaceQnaList(
  query: CommonSpaceQnaListQuery = {},
): Promise<CommonSpaceQnaListResult> {
  const response = await apiClient.get<CommonSpaceQnaListApiResponse>(
    "/community/qna",
    {
      params: buildCommonSpaceQnaListParams(query),
    },
  );

  return toCommonSpaceQnaListResult(response.data, query);
}

/**
 * 공통 공간 질의응답 상세를 조회한다.
 */
export async function getCommonSpaceQnaDetail(
  qnaId: number,
): Promise<CommonSpaceQnaDetailItem> {
  const response = await apiClient.get<CommonSpaceQnaDetailApiResponse>(
    `/community/qna/${qnaId}`,
  );

  return toCommonSpaceQnaDetailItem(response.data);
}

/**
 * 공통 공간 질문을 작성한다.
 */
export async function createCommonSpaceQna(payload: CommonSpaceQnaCreateRequest) {
  const response = await apiClient.post<CommonSpaceQnaCreateResponse>(
    "/community/qna",
    payload,
  );

  return response.data;
}

/**
 * 공통 공간 질문 답변을 작성한다.
 */
export async function createCommonSpaceQnaAnswer(
  qnaId: number,
  payload: CommonSpaceQnaAnswerCreateRequest,
) {
  const response = await apiClient.post<CommonSpaceQnaAnswerApiResponse>(
    `/community/qna/${qnaId}/answer`,
    payload,
  );

  return response.data;
}

/**
 * 공통 공간 질문 답변을 수정한다.
 */
export async function updateCommonSpaceQnaAnswer(
  qnaId: number,
  payload: CommonSpaceQnaAnswerCreateRequest,
) {
  const response = await apiClient.put<CommonSpaceQnaAnswerApiResponse>(
    `/community/qna/${qnaId}/answer`,
    payload,
  );

  return response.data;
}

/**
 * 공통 공간 질문 또는 답변에 첨부파일을 업로드한다.
 */
export async function uploadCommonSpaceQnaFiles(
  qnaId: number,
  files: File[],
  answerId?: number,
) {
  const response = await apiClient.post<CommonSpaceQnaUploadFilesResponse>(
    `/community/qna/${qnaId}/files`,
    createCommonSpaceQnaFilesFormData(files),
    {
      params: answerId ? { answerId } : undefined,
    },
  );

  return response.data;
}

/**
 * 공통 공간 질문 답변 작성과 파일 업로드를 한 번에 수행한다.
 */
export async function submitCommonSpaceQnaAnswer(
  qnaId: number,
  payload: CommonSpaceQnaAnswerMutationRequest,
) {
  const answerResponse = await createCommonSpaceQnaAnswer(qnaId, {
    content: payload.content,
  });

  if (payload.files.length > 0) {
    await uploadCommonSpaceQnaFiles(qnaId, payload.files, answerResponse.answerId);
  }

  return {
    result: answerResponse.result,
    answerId: answerResponse.answerId,
    qnaId: answerResponse.qnaId,
    createdAt: answerResponse.createdAt,
    updatedAt: answerResponse.updatedAt,
  } satisfies CommonSpaceQnaAnswerMutationResult;
}

/**
 * 공통 공간 질문 작성과 파일 업로드를 한 번에 수행한다.
 */
export async function submitCommonSpaceQnaQuestion(
  payload: CommonSpaceQnaQuestionMutationRequest,
) {
  const createResponse = await createCommonSpaceQna({
    title: payload.title,
    content: payload.content,
    isSecret: payload.isSecret,
    part: mapQuestionPartIdToQnaApiPart(payload.questionPartId),
  });

  if (payload.files.length > 0) {
    await uploadCommonSpaceQnaFiles(createResponse.qnaId, payload.files);
  }

  return {
    result: createResponse.result,
    qnaId: createResponse.qnaId,
    status: createResponse.status,
    createdAt: createResponse.createdAt,
  } satisfies CommonSpaceQnaQuestionMutationResult;
}
