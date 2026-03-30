import { apiClient } from "@/lib/axios";
import type {
  CommonSpaceAssignmentDetailApiResponse,
  CommonSpaceAssignmentListQuery,
  CommonSpaceAssignmentMySubmissionApiResponse,
  CommonSpaceAssignmentProjectListApiItem,
  CommonSpaceAssignmentSubmissionMutationResult,
  CommonSpaceAssignmentSubmissionRequest,
} from "./types";
import { mapCommonSpacePartIdToAssignmentTrack } from "./adapter";

/**
 * 과제 제출 multipart 요청에 사용할 FormData를 생성한다.
 * 현재 UI는 파일 업로드만 사용하지만, 추후 본문 제출도 바로 연결할 수 있게 request JSON 파트를 유지한다.
 */
function createCommonSpaceAssignmentSubmissionFormData(
  payload: CommonSpaceAssignmentSubmissionRequest,
) {
  const formData = new FormData();

  formData.append(
    "request",
    new Blob([JSON.stringify(payload.request)], {
      type: "application/json",
    }),
  );

  payload.files.forEach((file) => {
    formData.append("files", file);
  });

  return formData;
}

/**
 * 공통 공간 과제 목록을 조회한다.
 * `all` 파트는 track 파라미터를 생략해 공통 과제를 조회한다.
 */
export async function getCommonSpaceAssignmentProjects(
  query: CommonSpaceAssignmentListQuery = {},
): Promise<CommonSpaceAssignmentProjectListApiItem[]> {
  const track = mapCommonSpacePartIdToAssignmentTrack(query.partId ?? "all");

  const response = await apiClient.get<CommonSpaceAssignmentProjectListApiItem[]>(
    "/projects",
    {
      params: track ? { track } : undefined,
    },
  );

  return response.data;
}

/**
 * 로그인한 사용자의 단일 과제 제출 정보를 조회한다.
 */
export async function getCommonSpaceAssignmentMySubmission(projectId: number) {
  const response = await apiClient.get<CommonSpaceAssignmentMySubmissionApiResponse>(
    `/projects/${projectId}/submit`,
  );

  return response.data;
}

/**
 * 공통 공간 단일 과제 상세를 조회한다.
 */
export async function getCommonSpaceAssignmentDetail(projectId: number) {
  const response = await apiClient.get<CommonSpaceAssignmentDetailApiResponse>(
    `/projects/${projectId}`,
  );

  return response.data;
}

/**
 * 공통 공간 과제를 최초 제출한다.
 */
export async function submitCommonSpaceAssignment(
  projectId: number,
  payload: CommonSpaceAssignmentSubmissionRequest,
) {
  const response = await apiClient.post<string>(
    `/projects/${projectId}/submit`,
    createCommonSpaceAssignmentSubmissionFormData(payload),
  );

  return {
    message: response.data,
  } satisfies CommonSpaceAssignmentSubmissionMutationResult;
}

/**
 * 반려된 공통 공간 과제를 수정 제출한다.
 */
export async function updateCommonSpaceAssignmentSubmission(
  projectId: number,
  payload: CommonSpaceAssignmentSubmissionRequest,
) {
  const response = await apiClient.put<string>(
    `/projects/${projectId}/submit`,
    createCommonSpaceAssignmentSubmissionFormData(payload),
  );

  return {
    message: response.data,
  } satisfies CommonSpaceAssignmentSubmissionMutationResult;
}
