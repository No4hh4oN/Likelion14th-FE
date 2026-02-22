import { apiClient } from "@/lib/axios";
import type {
  ActiveRecruitmentResponse,
  ApplicationDetailResponse,
  ApplicationListResponse,
  CreateApplicationDraftResponse,
  DeleteApplicationResponse,
  DocumentQuestionsResponse,
  SaveApplicationDraftRequest,
  SubmitApplicationResponse,
  UpdateApplicationDraftResponse,
  UploadApplicationFileResponse,
} from "./types";

/**
 * 현재 진행 중인 모집 정보를 조회합니다.
 * @returns 진행 중 모집 정보, 없으면 null
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
 * 특정 모집의 서류 질문 목록을 조회합니다.
 * @param recruitmentId 모집 ID
 * @returns 질문 목록 응답
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
 * 로그인 사용자의 지원서 목록을 조회합니다.
 * @returns 지원서 목록 응답
 */
export async function getApplications(): Promise<ApplicationListResponse> {
  const response =
    await apiClient.get<ApplicationListResponse>("/applications");
  return response.data;
}

/**
 * 지원서 상세 정보를 조회합니다.
 * @param applicationId 지원서 ID
 * @returns 지원서 상세 응답
 */
export async function getApplicationDetail(
  applicationId: number,
): Promise<ApplicationDetailResponse> {
  const response = await apiClient.get<ApplicationDetailResponse>(
    `/applications/${applicationId}`,
  );
  return response.data;
}

/**
 * 지원서를 최초 생성(임시저장)합니다.
 * @param recruitmentId 모집 ID
 * @param payload 저장 요청 바디
 * @returns 생성된 지원서 ID
 */
export async function createApplicationDraft(
  recruitmentId: number,
  payload: SaveApplicationDraftRequest,
): Promise<CreateApplicationDraftResponse> {
  const response = await apiClient.post<CreateApplicationDraftResponse>(
    `/recruitments/${recruitmentId}/applications`,
    payload,
  );
  return response.data;
}

/**
 * DRAFT 상태 지원서를 수정합니다.
 * @param applicationId 지원서 ID
 * @param payload 수정 요청 바디
 * @returns 수정 결과 응답
 */
export async function updateApplicationDraft(
  applicationId: number,
  payload: SaveApplicationDraftRequest,
): Promise<UpdateApplicationDraftResponse> {
  const response = await apiClient.put<UpdateApplicationDraftResponse>(
    `/applications/${applicationId}`,
    payload,
  );
  return response.data;
}

/**
 * SUBMITTED 상태 지원서를 수정합니다.
 * @param applicationId 지원서 ID
 * @param payload 수정 요청 바디
 * @returns 수정 결과 응답
 */
export async function updateSubmittedApplication(
  applicationId: number,
  payload: SaveApplicationDraftRequest,
): Promise<UpdateApplicationDraftResponse> {
  const response = await apiClient.put<UpdateApplicationDraftResponse>(
    `/applications/${applicationId}/submitted`,
    payload,
  );
  return response.data;
}

/**
 * 지원서를 최종 제출합니다.
 * @param applicationId 지원서 ID
 * @returns 제출 결과 응답
 */
export async function submitApplication(
  applicationId: number,
): Promise<SubmitApplicationResponse> {
  const response = await apiClient.post<SubmitApplicationResponse>(
    `/applications/${applicationId}/submit`,
  );
  return response.data;
}

/**
 * 지원서 파일을 업로드합니다.
 * @param applicationId 지원서 ID
 * @param file 업로드할 파일
 * @returns 업로드된 파일 메타 정보
 */
export async function uploadApplicationFile(
  applicationId: number,
  file: File,
): Promise<UploadApplicationFileResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post<UploadApplicationFileResponse>(
    `/applications/${applicationId}/files`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
}

/**
 * 지원서를 삭제(지원 취소)합니다.
 * @param applicationId 지원서 ID
 * @returns 삭제 결과 응답
 */
export async function deleteApplication(
  applicationId: number,
): Promise<DeleteApplicationResponse> {
  const response = await apiClient.delete<DeleteApplicationResponse>(
    `/applications/${applicationId}`,
  );
  return response.data;
}
