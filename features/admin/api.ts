import { apiClient } from "@/lib/axios";
import type {
  AdminApplicationDetailResponse,
  AdminApplicationListQuery,
  AdminApplicationListResponse,
  AdminDocumentPendingPassListQuery,
  AdminDocumentPendingPassListResponse,
  AdminDocumentFinalizeRequest,
  AdminDocumentFinalizeResponse,
  AdminFinalPendingPassListQuery,
  AdminFinalPendingPassListResponse,
  AdminFinalFinalizeRequest,
  AdminFinalFinalizeResponse,
  AdminFinalPendingDecisionRequest,
  AdminFinalPendingDecisionResponse,
  AdminDocumentPendingDecisionRequest,
  AdminDocumentPendingDecisionResponse,
  AdminDocumentScoresDetailResponse,
  AdminInterviewCandidateDetailResponse,
  AdminInterviewCandidateListQuery,
  AdminInterviewCandidateListResponse,
  AdminInterviewScoreDetailResponse,
  AdminRecruitmentListQuery,
  AdminRecruitmentListResponse,
  AdminUserDetailResponse,
  AdminUsersListResponse,
  AdminMyInterviewScoreResponse,
  AdminMyDocumentScoreResponse,
  UpsertAdminMyInterviewScoreRequest,
  UpsertAdminMyInterviewScoreResponse,
  UpsertAdminMyDocumentScoreRequest,
  UpsertAdminMyDocumentScoreResponse,
  AdminNoticeListQuery,
  AdminNoticeListResponse,
  AdminNoticeDetailResponse,
  CreateAdminNoticeRequest,
  UpsertAdminNoticeResponse,
} from "./type";

export async function getAdminApplications(
  query: AdminApplicationListQuery,
): Promise<AdminApplicationListResponse> {
  const response = await apiClient.get<AdminApplicationListResponse>(
    "/admin/applications",
    {
      params: query,
    },
  );

  return response.data;
}

export async function getAdminApplicationDetail(
  applicationId: number,
): Promise<AdminApplicationDetailResponse> {
  const response = await apiClient.get<AdminApplicationDetailResponse>(
    `/admin/applications/${applicationId}`,
  );

  return response.data;
}

export async function getAdminDocumentPendingPasses(
  query: AdminDocumentPendingPassListQuery,
): Promise<AdminDocumentPendingPassListResponse> {
  const response = await apiClient.get<AdminDocumentPendingPassListResponse>(
    "/admin/document/pending-pass",
    {
      params: query,
    },
  );

  return response.data;
}

export async function getAdminFinalPendingPasses(
  query: AdminFinalPendingPassListQuery,
): Promise<AdminFinalPendingPassListResponse> {
  const response = await apiClient.get<AdminFinalPendingPassListResponse>(
    "/admin/final/pending-pass",
    {
      params: query,
    },
  );

  return response.data;
}

export async function getAdminInterviewCandidates(
  query: AdminInterviewCandidateListQuery,
): Promise<AdminInterviewCandidateListResponse> {
  const response = await apiClient.get<AdminInterviewCandidateListResponse>(
    "/admin/interviews/candidates",
    {
      params: query,
    },
  );

  return response.data;
}

export async function getAdminInterviewCandidateDetail(
  applicationId: number,
): Promise<AdminInterviewCandidateDetailResponse> {
  const response = await apiClient.get<AdminInterviewCandidateDetailResponse>(
    `/admin/interviews/candidates/${applicationId}`,
  );

  return response.data;
}

export async function getMyAdminDocumentScores(
  applicationId: number,
): Promise<AdminMyDocumentScoreResponse> {
  const response = await apiClient.get<AdminMyDocumentScoreResponse>(
    `/admin/applications/${applicationId}/document-scores/me`,
  );
  return response.data;
}

export async function upsertMyAdminDocumentScores(
  applicationId: number,
  payload: UpsertAdminMyDocumentScoreRequest,
): Promise<UpsertAdminMyDocumentScoreResponse> {
  const response = await apiClient.put<UpsertAdminMyDocumentScoreResponse>(
    `/admin/applications/${applicationId}/document-scores/me`,
    payload,
  );
  return response.data;
}

export async function getAdminDocumentScoresDetail(
  applicationId: number,
): Promise<AdminDocumentScoresDetailResponse> {
  const response = await apiClient.get<AdminDocumentScoresDetailResponse>(
    `/admin/applications/${applicationId}/document-scores`,
  );
  return response.data;
}

export async function postAdminDocumentPendingDecision(
  payload: AdminDocumentPendingDecisionRequest,
): Promise<AdminDocumentPendingDecisionResponse> {
  const response = await apiClient.post<AdminDocumentPendingDecisionResponse>(
    "/admin/document/pending-decision",
    payload,
  );
  return response.data;
}

export async function postAdminDocumentFinalize(
  payload: AdminDocumentFinalizeRequest,
): Promise<AdminDocumentFinalizeResponse> {
  const response = await apiClient.post<AdminDocumentFinalizeResponse>(
    "/admin/document/finalize",
    payload,
  );
  return response.data;
}

export async function getMyAdminInterviewScore(
  applicationId: number,
): Promise<AdminMyInterviewScoreResponse> {
  const response = await apiClient.get<AdminMyInterviewScoreResponse>(
    `/admin/interviews/${applicationId}/score/me`,
  );
  return response.data;
}

export async function upsertMyAdminInterviewScore(
  applicationId: number,
  payload: UpsertAdminMyInterviewScoreRequest,
): Promise<UpsertAdminMyInterviewScoreResponse> {
  const response = await apiClient.put<UpsertAdminMyInterviewScoreResponse>(
    `/admin/interviews/${applicationId}/score/me`,
    payload,
  );
  return response.data;
}

export async function getAdminInterviewScoreDetail(
  applicationId: number,
): Promise<AdminInterviewScoreDetailResponse> {
  const response = await apiClient.get<AdminInterviewScoreDetailResponse>(
    `/admin/interviews/${applicationId}/score`,
  );
  return response.data;
}

export async function postAdminFinalPendingDecision(
  payload: AdminFinalPendingDecisionRequest,
): Promise<AdminFinalPendingDecisionResponse> {
  const response = await apiClient.post<AdminFinalPendingDecisionResponse>(
    "/admin/final/pending-decision",
    payload,
  );
  return response.data;
}

export async function postAdminFinalFinalize(
  payload: AdminFinalFinalizeRequest,
): Promise<AdminFinalFinalizeResponse> {
  const response = await apiClient.post<AdminFinalFinalizeResponse>(
    "/admin/final/finalize",
    payload,
  );
  return response.data;
}

export async function getAdminUsers(): Promise<AdminUsersListResponse> {
  const response = await apiClient.get<AdminUsersListResponse>("/admin/users");
  return response.data;
}

export async function getRecruitments(
  query: AdminRecruitmentListQuery = {},
): Promise<AdminRecruitmentListResponse> {
  const response = await apiClient.get<AdminRecruitmentListResponse>(
    "/recruitments",
    { params: query },
  );
  return response.data;
}

export async function getAdminUserDetail(
  loginId: string,
): Promise<AdminUserDetailResponse> {
  const response = await apiClient.get<AdminUserDetailResponse>(
    `/admin/users/${encodeURIComponent(loginId)}`,
  );
  return response.data;
}

export async function getAdminNotices(
  query: AdminNoticeListQuery,
): Promise<AdminNoticeListResponse> {
  const response = await apiClient.get<AdminNoticeListResponse>("/notice", {
    params: query,
  });
  return response.data;
}

export async function getAdminNoticeDetail(
  noticeId: number,
): Promise<AdminNoticeDetailResponse> {
  const response = await apiClient.get<AdminNoticeDetailResponse>(
    `/notice/${noticeId}`,
  );
  return response.data;
}

export async function createAdminNotice(
  payload: CreateAdminNoticeRequest,
): Promise<UpsertAdminNoticeResponse> {
  const response = await apiClient.post<UpsertAdminNoticeResponse>(
    "/notice",
    payload,
  );
  return response.data;
}

export async function updateAdminNotice(
  noticeId: number,
  query: {
    title: string;
    content: string;
    category?: string;
    part?: string;
  },
  files: File[] = [],
): Promise<UpsertAdminNoticeResponse> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("file", file);
  });

  const response = await apiClient.put<UpsertAdminNoticeResponse>(
    `/notice/${noticeId}`,
    formData,
    { params: query },
  );
  return response.data;
}

export async function deleteAdminNotice(noticeId: number): Promise<string> {
  const response = await apiClient.delete<string>(`/notice/${noticeId}`);
  return response.data;
}

export async function restoreAdminNotice(noticeId: number): Promise<string> {
  const response = await apiClient.post<string>(`/notice/${noticeId}/restore`);
  return response.data;
}

export async function uploadAdminNoticeFiles(
  noticeId: number,
  files: File[],
): Promise<string> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await apiClient.post<string>(
    `/notice/${noticeId}/files`,
    formData,
  );
  return response.data;
}

export async function deleteAdminNoticeFile(
  noticeId: number,
  fileId: number,
): Promise<string> {
  const response = await apiClient.delete<string>(
    `/notice/${noticeId}/files/${fileId}`,
  );
  return response.data;
}
