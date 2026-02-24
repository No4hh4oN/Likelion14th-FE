export type UserRole = "게스트" | "아기사자" | "운영진";
export type MyPageTab = "내 정보" | "과제";
export type MyPageSection = "profile" | "edit" | "history";

export type MyPageUser = {
  name: string;
  major: string;
  generation: string;
  role: UserRole;
  profileImageUrl?: string | null;
};

//==============================================================================

/**
 * 내 정보 통합 조회. SSO 정보와 홈페이지 프로필, 권한 정보를 함께 반환
 */
export type MyPageUserApiResponse = {
  sso: {
    userUuid: string;
    loginId: string;
    email: string;
    ssoRole: string;
    status: string;
    createdAt: string;
  };
  homepage: {
    userUuid: string;
    name: string;
    department: string;
    studentNo: string;
    grade: number;
    enrollment: string; //재학 상태 TODO: enum값 물어보기 (ENROLLED | )
    birthDate: string; //2026-02-23
    phone: string; //01012345678
    status: string; //TODO: enum값 물어보기 (ACTIVE | )
    profileImage: {
      url: string;
      originalFilename: string;
      contentType: string;
      fileSize: number;
      uploadedAt: string; //2026-02-23T14:36:13.229Z
    };
    createdAt: string; //2026-02-23T14:36:13.229Z
    updatedAt: string; //2026-02-23T14:36:13.229Z
  };
  roles: {
    id: number;
    generation: number;
    level: string; //TODO: enum값 물어보기 (OUTSIDER | )
    track: string; //FRONTEND | BACKEND | AI_ML | PM_DESIGN
    position: string; //TODO: enum값 물어보기 (PRESIDENT | )
    active: boolean;
    createdAt: string; //2026-02-23T14:36:13.229Z
    updatedAt: string; //2026-02-23T14:36:13.229Z
  }[];
};

export type ApplicationHistoryStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "DOC_FAILED"
  | "DOC_PASSED"
  | "FINAL_FAILED"
  | "FINAL_PASSED";

export type PhaseType =
  | "DOC_OPEN"
  | "DOC_CLOSED"
  | "INTERVIEW_SELECT"
  | "FINAL_RESULT";

export type ApplyPart = "FRONTEND" | "BACKEND" | "AI_ML" | "PM_DESIGN";

export type ApplicationHistoryItem = {
  applicationId: number;
  recruitmentId: number;
  generation: number;
  applyPart: ApplyPart;
  status: ApplicationHistoryStatus | string;
  submittedAt: string; //2026-02-24T13:52:03.336879
  updatedAt: string; //2026-02-24T13:52:03.336972
  portfolioUrl: string;
  canEdit?: boolean;
  canSubmit?: boolean;
};

export type ApplicationHistoryApiResponse = {
  items: ApplicationHistoryItem[];
  page: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
};

/**
 * 지원자 대시보드. 지원 상태/서류 결과/면접 에약 상태를 요약합니다.
 */
export type DashboardItem = {
  serverTime: string;
  recruitment: {
    recruitmentId: number;
    generation: number;
    title: string;
    phaseType: PhaseType;
    docStartAt: string;
    docEndAt: string;
  };
  myApplication: {
    applicationId: number;
    applyPart: ApplyPart;
    status: ApplicationHistoryStatus;
    canEdit: boolean;
    canSubmit: boolean;
  };
  documentResult: {
    visible: boolean;
    result: string;
  };
  interview: {
    canReserve: boolean;
    myReservation: {
      slotId: number;
      startAt: string;
      endAt: string;
    };
  };
};

export type UpdateMyProfileRequest = {
  email?: string;
  newPassword?: string;
  phone?: string;
};

export type UpdateMyProfileResponse = {
  ok: boolean;
};

export type UpdatedMyProfileImage = {
  url: string;
  originalFilename: string;
  contentType: string;
  fileSize: number;
  uploadedAt: string;
};

export type UpdateMyProfileImageResponse = {
  ok: boolean;
  profileImage: UpdatedMyProfileImage;
};

export type WithdrawMeResponse = {
  ok: boolean;
};
