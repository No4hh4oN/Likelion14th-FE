import { apiClient } from "@/lib/axios";
import { normalizeUploadFileForMultipart } from "@/lib/uploadFile";
import type {
  AttendanceItem,
  AttendanceSaveRequest,
  ProjectDetail,
  ProjectListItem,
  ProjectStatusItem,
  ProjectTrack,
  SubmissionDetail,
  Track,
} from "./types";

function toMultipartFormData(request: unknown, files: File[] = []): FormData {
  const formData = new FormData();
  formData.append(
    "request",
    new Blob([JSON.stringify(request)], { type: "application/json" }),
  );

  files.forEach((file) => {
    formData.append("files", normalizeUploadFileForMultipart(file));
  });

  return formData;
}

export async function getProjects(track?: ProjectTrack): Promise<ProjectListItem[]> {
  const response = await apiClient.get<ProjectListItem[]>("/projects", {
    params: track ? { track } : undefined,
  });
  return response.data;
}

export async function getProjectDetail(projectId: number): Promise<ProjectDetail> {
  const response = await apiClient.get<ProjectDetail>(`/projects/${projectId}`);
  return response.data;
}

export async function createProject(request: unknown, files: File[] = []): Promise<string> {
  const payload = toMultipartFormData(request, files);
  const response = await apiClient.post<string>("/projects", payload);
  return response.data;
}

export async function updateProject(
  projectId: number,
  request: unknown,
  files: File[] = [],
): Promise<string> {
  const payload = toMultipartFormData(request, files);
  const response = await apiClient.put<string>(`/projects/${projectId}`, payload);
  return response.data;
}

export async function deleteProject(projectId: number): Promise<string> {
  const response = await apiClient.delete<string>(`/projects/${projectId}`);
  return response.data;
}

export async function submitProject(
  projectId: number,
  request: unknown,
  files: File[] = [],
): Promise<string> {
  const payload = toMultipartFormData(request, files);
  const response = await apiClient.post<string>(`/projects/${projectId}/submit`, payload);
  return response.data;
}

export async function updateProjectSubmission(
  projectId: number,
  request: unknown,
  files: File[] = [],
): Promise<string> {
  const payload = toMultipartFormData(request, files);
  const response = await apiClient.put<string>(`/projects/${projectId}/submit`, payload);
  return response.data;
}

export async function deleteProjectSubmission(projectId: number): Promise<string> {
  const response = await apiClient.delete<string>(`/projects/${projectId}/submit`);
  return response.data;
}

export async function evaluateSubmission(
  submissionId: number,
  payload: { approved: boolean; rejectReason?: string },
): Promise<string> {
  const response = await apiClient.post<string>(
    `/projects/submissions/${submissionId}/evaluate`,
    payload,
  );
  return response.data;
}

export async function getProjectStatus(projectId: number): Promise<ProjectStatusItem[]> {
  const response = await apiClient.get<ProjectStatusItem[]>(
    `/projects/${projectId}/status`,
  );
  return response.data;
}

export async function getSubmissionDetail(
  submissionId: number,
): Promise<SubmissionDetail> {
  const response = await apiClient.get<SubmissionDetail>(
    `/projects/submissions/${submissionId}`,
  );
  return response.data;
}

export async function getAttendance(params: {
  date: string;
  track: Track;
}): Promise<AttendanceItem[]> {
  const response = await apiClient.get<AttendanceItem[]>("/attendance", {
    params,
  });
  return response.data;
}

export async function saveAttendance(payload: AttendanceSaveRequest): Promise<string> {
  const response = await apiClient.post<string>("/attendance", payload);
  return response.data;
}

