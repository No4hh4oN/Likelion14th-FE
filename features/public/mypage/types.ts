export type UserRole = "게스트" | "아기사자" | "운영진";
export type AuthStatus = "authenticated" | "unauthenticated";
export type MyPageTab = "내 정보" | "지원";
export type MyPageSection = "profile" | "edit" | "history";

export type MyPageUser = {
  name: string;
  major: string;
  generation: string;
  role: UserRole;
};

export type ApplicationType = "서류" | "면접";
export type ApplicationResult = "대기" | "합격" | "불합격";

type ApplicationBase = {
  id: number;
  generation: string;
  type: ApplicationType;
  result: ApplicationResult;
};

export type DocumentApplicationRecord = ApplicationBase & {
  type: "서류";
  appliedAt: string;
  updatedAt: string | null;
  interviewAt: null;
  isWithinEditPeriod: boolean;
};

export type InterviewApplicationRecord = ApplicationBase & {
  type: "면접";
  appliedAt: null;
  updatedAt: null;
  interviewAt: string | null;
  isWithinEditPeriod: false;
};

export type ApplicationRecord =
  | DocumentApplicationRecord
  | InterviewApplicationRecord;
