import { apiClient, clearAccessToken } from "@/lib/axios";
import type {
  ApplicationHistoryApiResponse,
  DashboardItem,
  MyPageUserApiResponse,
  NoticeCategory,
  NoticeListApiResponse,
  ProjectListItem,
  QnaListApiResponse,
  RecruitmentDetailItem,
  UpdateMyProfileImageResponse,
  UpdateMyProfileRequest,
  UpdateMyProfileResponse,
  UserTrack,
  WithdrawMeResponse,
} from "./types";

/**
 * SSO 정보와 홈페이지 프로필, 권한 정보를 함께 반환합니다.
 */
export async function getMyProfile(): Promise<MyPageUserApiResponse> {
  const response = await apiClient.get<MyPageUserApiResponse>("/users/me");
  return response.data;
}

/**
 * 본인 지원서 목록을 조회합니다.
 */
export async function getMyApplicationHistory(): Promise<ApplicationHistoryApiResponse> {
  const response =
    await apiClient.get<ApplicationHistoryApiResponse>("/applications");
  return response.data;
}

/**
 * 지원 상태/서류 결과/면접 예약 상태를 요약합니다.
 * @param recruitmentId 모집 Id
 */
export async function getDashboard(
  recruitmentId: number,
): Promise<DashboardItem> {
  const response = await apiClient.get<DashboardItem>(
    `/me/recruitments/${recruitmentId}/dashboard`,
  );
  return response.data;
}

/**
 * 모집 상세를 조회합니다.
 */
export async function getRecruitmentDetail(
  recruitmentId: number,
): Promise<RecruitmentDetailItem> {
  const response = await apiClient.get<RecruitmentDetailItem>(
    `/recruitments/${recruitmentId}`,
  );
  return response.data;
}

/**
 * 내 정보(email/newPassword/phone)를 수정합니다.
 */
export async function updateMyProfile(
  payload: UpdateMyProfileRequest,
): Promise<UpdateMyProfileResponse> {
  const response = await apiClient.patch<UpdateMyProfileResponse>(
    "/users/me",
    payload,
  );
  return response.data;
}

/**
 * 로그인한 사용자 기준으로 프로필 이미지를 교체합니다.
 */
export async function updateMyProfileImage(
  profileImage: File,
): Promise<UpdateMyProfileImageResponse> {
  const formData = new FormData();
  formData.append("profileImage", profileImage);

  const response = await apiClient.post<UpdateMyProfileImageResponse>(
    "/users/me/profile-image",
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
 * 로그인한 사용자를 탈퇴 처리합니다.
 */
export async function withdrawMe(): Promise<WithdrawMeResponse> {
  const response = await apiClient.delete<WithdrawMeResponse>("/users/me");
  clearAccessToken();
  return response.data;
}

type GetQnaListParams = {
  page?: number;
  size?: number;
  part?: UserTrack;
};

/**
 * 커뮤니티 질문 목록을 조회합니다.
 */
export async function getQnaList(
  params: GetQnaListParams = {},
): Promise<QnaListApiResponse> {
  const response = await apiClient.get<QnaListApiResponse>("/community/qna", {
    params,
  });
  return response.data;
}

type GetNoticeListParams = {
  page?: number;
  size?: number;
  category?: NoticeCategory;
  part?: UserTrack;
};

/**
 * 공지/세션 자료 목록을 조회합니다.
 */
export async function getNoticeList(
  params: GetNoticeListParams = {},
): Promise<NoticeListApiResponse> {
  const response = await apiClient.get<NoticeListApiResponse>("/notice", {
    params,
  });
  return response.data;
}

type GetProjectListParams = {
  track?: UserTrack;
};

/**
 * 과제 목록을 조회합니다.
 */
export async function getProjectList(
  params: GetProjectListParams = {},
): Promise<ProjectListItem[]> {
  const response = await apiClient.get<ProjectListItem[]>("/projects", {
    params,
  });
  return response.data;
}
