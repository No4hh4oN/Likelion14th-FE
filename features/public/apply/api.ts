import { apiClient } from "@/lib/axios";
import type {
  ActiveRecruitmentResponse,
  DocumentQuestionsResponse,
  SaveApplyDraftRequest,
  SubmitApplyRequest,
} from "./types";

/**
 * 진행중 모집을 조회합니다.
 * 200: 모집 1건 반환
 * 204: 진행중 모집 없음(null 반환)
 */
export async function getActiveRecruitment(): Promise<ActiveRecruitmentResponse | null> {
  const response = await apiClient.get<ActiveRecruitmentResponse>(
    "/recruitments/active",
    {
      validateStatus: (status) => status === 200 || status === 204,
    },
  );

  if (response.status === 204) {
    return null;
  }

  return response.data;
}

/**
 * 지원서 폼(질문 목록)을 조회합니다.
 * GET /recruitments/{recruitmentId}/document/questions
 */
export async function getDocumentQuestions(
  recruitmentId: number,
): Promise<DocumentQuestionsResponse> {
  const response = await apiClient.get<DocumentQuestionsResponse>(
    `/recruitments/${recruitmentId}/document/questions`,
  );
  return response.data;
}

/**
 * 지원서 임시저장.
 * TODO: 실제 endpoint/body schema 확정 필요.
 */
export async function saveApplyDraft(
  payload: SaveApplyDraftRequest,
): Promise<unknown> {
  const response = await apiClient.post<unknown>(
    "/applications/{applicationId}/applications",
    payload,
  );
  return response.data;
}

/**
 * 지원서 최종 제출.
 * TODO: 실제 endpoint/body schema 확정 필요.
 */
export async function submitApply(
  payload: SubmitApplyRequest,
): Promise<unknown> {
  const response = await apiClient.post<unknown>(
    "/applications/{applicationId}/submit",
    payload,
  );
  return response.data;
}
