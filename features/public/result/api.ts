import { apiClient } from "@/lib/axios";
import type { RecruitmentDetailResponse } from "./type";

/**
 * 모집 정보를 조회합니다.
 */
export async function getRecruitmentInfo(
  recruitmentId: number,
): Promise<RecruitmentDetailResponse> {
  const response = await apiClient.get<RecruitmentDetailResponse>(
    `/recruitments/${recruitmentId}`,
  );
  return response.data;
}
