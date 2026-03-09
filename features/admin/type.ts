export type AdminApplyPart = "FRONTEND" | "BACKEND" | "AI_ML" | "PM_DESIGN";

export type AdminApplicationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "DOC_PASSED"
  | "DOC_FAILED"
  | "FINAL_PASSED"
  | "FINAL_FAILED";

export type AdminApplicationListItem = {
  applicationId: number;
  applyPart: AdminApplyPart | string;
  status: AdminApplicationStatus | string;
  submittedAt: string;
  docAvgScore: number | null;
  department: string;
  studentNoPrefix: string;
  grade: number;
  enrollment: string;
};

export type AdminApplicationListResponse = {
  items: AdminApplicationListItem[];
  page: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
};

export type AdminApplicationListQuery = {
  recruitmentId: number;
  part?: AdminApplyPart;
  status?: AdminApplicationStatus;
  page?: number;
  size?: number;
  sort?: string;
};

export type AdminInterviewCandidateListQuery = {
  recruitmentId: number;
  part?: AdminApplyPart;
  page?: number;
  size?: number;
  sort?: string;
};

export type AdminApplicationAnswer = {
  questionId: number;
  content: string;
  answer: string;
};

export type AdminApplicationFile = {
  fileId: number;
  originalName: string;
  size: number;
  url: string;
};

export type AdminApplicationDetailResponse = {
  applicationId: number;
  recruitmentId: number;
  applyPart: AdminApplyPart | string;
  status: AdminApplicationStatus | string;
  submittedAt: string;
  portfolioUrl: string | null;
  applicant: {
    department: string;
    studentNoPrefix: string;
    grade: number;
    enrollment: string;
  };
  answers: AdminApplicationAnswer[];
  files: AdminApplicationFile[];
  docAvgScore: number | null;
};

export type AdminInterviewCandidateListResponse = AdminApplicationListResponse;
export type AdminInterviewCandidateDetailResponse = AdminApplicationDetailResponse;

export type AdminDocumentScoreItem = {
  questionId: number;
  score: number;
};

export type AdminMyDocumentScoreResponse = {
  exists: boolean;
  scores: AdminDocumentScoreItem[];
  comment: string;
};

export type UpsertAdminMyDocumentScoreRequest = {
  scores: AdminDocumentScoreItem[];
  comment: string | null;
};

export type UpsertAdminMyDocumentScoreResponse = {
  ok: boolean;
};

export type AdminDocumentScoreReview = {
  reviewer: {
    profileImageUrl: string;
    name: string;
    part: string;
  };
  scores: AdminDocumentScoreItem[];
  total: number;
  comment: string;
};

export type AdminDocumentScoresDetailResponse = {
  applicationId: number;
  average: number;
  reviewCount: number;
  canViewOthersScores: boolean;
  reviews: AdminDocumentScoreReview[];
};

export type AdminDocumentPendingDecisionRequest = {
  recruitmentId: number;
  passIds: number[];
  failIds: number[];
};

export type AdminDocumentPendingDecisionResponse = {
  ok: boolean;
};

export type AdminDocumentFinalizeRequest = {
  recruitmentId: number;
};

export type AdminDocumentFinalizeResponse = {
  ok: boolean;
  finalizedCount: number;
};

export type AdminMyInterviewScoreResponse = {
  exists: boolean;
  score: number;
  comment: string;
};

export type UpsertAdminMyInterviewScoreRequest = {
  score: number;
  comment: string;
};

export type UpsertAdminMyInterviewScoreResponse = {
  ok: boolean;
};

export type AdminInterviewScoreReview = {
  reviewerUserUuid: string;
  score: number;
  comment: string;
};

export type AdminInterviewScoreDetailResponse = {
  applicationId: number;
  average: number;
  reviewCount: number;
  canViewOthersScores: boolean;
  reviews: AdminInterviewScoreReview[];
};

export type AdminFinalPendingDecisionRequest = {
  recruitmentId: number;
  passIds: number[];
  failIds: number[];
};

export type AdminFinalPendingDecisionResponse = {
  ok: boolean;
};

export type AdminFinalFinalizeRequest = {
  recruitmentId: number;
};

export type AdminFinalFinalizeResponse = {
  ok: boolean;
  finalizedCount: number;
};

export type AdminUserListItem = {
  profileImageUrl: string;
  loginId: string;
  name: string;
  department: string;
  studentNo: string;
  level: string;
};

export type AdminUsersListResponse = {
  totalCount: number;
  users: AdminUserListItem[];
};

export type AdminUserDetail = {
  loginId: string;
  name: string;
  department: string;
  studentNo: string;
  grade: number;
  enrollmentStatus: string;
  birthDate: string;
  phone: string;
  withdrawalStatus: string;
  email: string;
  generation: number;
  level: string;
  track: string;
  position: string;
};

export type AdminUserDetailResponse = {
  user: AdminUserDetail;
};

export type AdminRecruitmentListItem = {
  recruitmentId: number;
  generation: number;
  title: string;
  phaseType: string;
  docStartAt: string;
  docEndAt: string;
};

export type AdminRecruitmentListResponse = {
  items: AdminRecruitmentListItem[];
  page: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
};

export type AdminRecruitmentListQuery = {
  page?: number;
  size?: number;
  sort?: string;
};

export type AdminNoticeCategory = "NOTICE" | "SESSION_DATA" | string;
export type AdminNoticePart =
  | "FRONTEND"
  | "BACKEND"
  | "AI_ML"
  | "PM_DESIGN"
  | "ETC"
  | string;

export type AdminNoticeListItem = {
  noticeId: number;
  title: string;
  category: AdminNoticeCategory;
  part: AdminNoticePart;
  createdAt: string;
  fileCount: number;
};

export type AdminNoticeListResponse = {
  noticeList: AdminNoticeListItem[];
  totalPages: number;
  totalElements: number;
};

export type AdminNoticeListQuery = {
  page?: number;
  size?: number;
  category?: "NOTICE" | "SESSION_DATA";
  part?: "FRONTEND" | "BACKEND" | "AI_ML" | "PM_DESIGN" | "ETC";
};

export type AdminNoticeFile = {
  fileId: number;
  originalFileName: string;
  fileUrl: string;
};

export type AdminNotice = {
  noticeId: number;
  userId: number;
  title: string;
  content: string;
  category: AdminNoticeCategory;
  noticePart: AdminNoticePart;
  status: "ACTIVE" | "INACTIVE" | string;
  createdAt: string;
  updatedAt: string;
};

export type AdminNoticeDetailResponse = {
  notice: AdminNotice;
  files: AdminNoticeFile[];
};

export type CreateAdminNoticeRequest = {
  title: string;
  content: string;
  category: "NOTICE" | "SESSION_DATA";
  part: "FRONTEND" | "BACKEND" | "AI_ML" | "PM_DESIGN" | "ETC";
};

export type UpsertAdminNoticeResponse = {
  result: string;
  noticeId: number;
  createdAt?: string;
  updatedAt?: string;
};
