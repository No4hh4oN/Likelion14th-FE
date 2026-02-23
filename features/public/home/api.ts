import { apiClient } from "@/lib/axios";
import type { ActiveRecruitmentResponse } from "./types";

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
