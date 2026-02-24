import { apiClient } from "@/lib/axios";
import type {
  ApplicationHistoryApiResponse,
  DashboardItem,
  MyPageUserApiResponse,
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
