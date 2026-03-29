import { apiClient } from "@/lib/axios";
import type {
  CommonSpaceAssignmentListQuery,
  CommonSpaceAssignmentMySubmissionApiResponse,
  CommonSpaceAssignmentProjectListApiItem,
} from "./types";
import { mapCommonSpacePartIdToAssignmentTrack } from "./adapter";

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
