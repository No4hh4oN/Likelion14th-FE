import type { ApplicationRecord, AuthStatus, MyPageUser } from "./types";

// TODO: 로그인 기능 연동 후 세션/권한 정보를 실제 인증 데이터로 교체하세요.
export const MOCK_AUTH_STATUS: AuthStatus = "authenticated";

export const MOCK_USER: MyPageUser = {
  name: "스텔레",
  major: "은하열차팀",
  generation: "5학번",
  role: "운영진",
};

// TODO: 지원 내역 API 연동 시 서버 응답으로 교체하세요.
export const MOCK_APPLICATION_HISTORY: ApplicationRecord[] = [
  {
    id: 1,
    generation: "14기",
    type: "서류",
    appliedAt: "25.03.14. 16:32",
    updatedAt: "25.03.15. 17:36",
    interviewAt: null,
    isWithinEditPeriod: true,
    result: "합격",
  },
  {
    id: 2,
    generation: "14기",
    type: "면접",
    appliedAt: null,
    updatedAt: null,
    interviewAt: "25.03.19. 11:00",
    isWithinEditPeriod: false,
    result: "대기",
  },
];
