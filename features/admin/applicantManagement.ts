import type {
  AdminApplicationStatus,
  AdminApplyPart,
  AdminEvaluationFilter,
} from "./type";

export type ExtendedAdminApplicationStatus = AdminApplicationStatus;

export type AdminApplicationsListView =
  | "DOCUMENT_APPLICANTS"
  | "DOCUMENT_PENDING";

export type AdminInterviewsListView =
  | "INTERVIEW_CANDIDATES"
  | "FINAL_PENDING"
  | "FINAL_PASSED";

export type AdminApplicantListView =
  | AdminApplicationsListView
  | AdminInterviewsListView;

type ApplicantManagementViewMeta = {
  label: string;
  pageTitle: string;
  path: string;
  viewParam?: string;
};

const APPLICANT_MANAGEMENT_VIEW_META: Record<
  AdminApplicantListView,
  ApplicantManagementViewMeta
> = {
  DOCUMENT_APPLICANTS: {
    label: "서류 지원자 목록",
    pageTitle: "서류 지원자 목록",
    path: "/admin/applications",
  },
  DOCUMENT_PENDING: {
    label: "서류 예비 합격자 목록",
    pageTitle: "서류 예비 합격자 목록",
    path: "/admin/applications",
    viewParam: "document-pending",
  },
  INTERVIEW_CANDIDATES: {
    label: "서류 합격자 목록",
    pageTitle: "서류 합격자 목록",
    path: "/admin/interviews/candidates",
  },
  FINAL_PENDING: {
    label: "최종 예비 합격자 목록",
    pageTitle: "최종 예비 합격자 목록",
    path: "/admin/interviews/candidates",
    viewParam: "final-pending",
  },
  FINAL_PASSED: {
    label: "최종 합격자 목록",
    pageTitle: "최종 합격자 목록",
    path: "/admin/interviews/candidates",
    viewParam: "final-passed",
  },
};

export const APPLICANT_MANAGEMENT_NAV_ORDER: AdminApplicantListView[] = [
  "DOCUMENT_APPLICANTS",
  "DOCUMENT_PENDING",
  "INTERVIEW_CANDIDATES",
  "FINAL_PENDING",
  "FINAL_PASSED",
];

export function getApplicationsListView(
  value: string | null | undefined,
): AdminApplicationsListView {
  return value === "document-pending" ? "DOCUMENT_PENDING" : "DOCUMENT_APPLICANTS";
}

export function getInterviewsListView(
  value: string | null | undefined,
): AdminInterviewsListView {
  if (value === "final-pending") return "FINAL_PENDING";
  if (value === "final-passed") return "FINAL_PASSED";
  return "INTERVIEW_CANDIDATES";
}

export function getApplicantManagementViewMeta(view: AdminApplicantListView) {
  return APPLICANT_MANAGEMENT_VIEW_META[view];
}

export function getFixedStatusForView(
  view: AdminApplicantListView,
): ExtendedAdminApplicationStatus | undefined {
  if (view === "FINAL_PASSED") {
    return "FINAL_PASSED";
  }

  return undefined;
}

export function buildApplicantManagementHref(
  view: AdminApplicantListView,
  options: {
    recruitmentId?: number | null;
    part?: "ALL" | AdminApplyPart | null;
    status?: "ALL" | ExtendedAdminApplicationStatus | null;
    evaluationFilter?: AdminEvaluationFilter | null;
  } = {},
) {
  const meta = getApplicantManagementViewMeta(view);
  const params = new URLSearchParams();

  if (meta.viewParam) {
    params.set("view", meta.viewParam);
  }

  if (options.recruitmentId) {
    params.set("recruitmentId", String(options.recruitmentId));
  }

  if (
    options.part &&
    options.part !== "ALL" &&
    (view === "DOCUMENT_APPLICANTS" || view === "FINAL_PASSED")
  ) {
    params.set("part", options.part);
  }

  if (view === "DOCUMENT_APPLICANTS" && options.status && options.status !== "ALL") {
    params.set("status", options.status);
  }

  if (options.evaluationFilter && options.evaluationFilter !== "ALL") {
    params.set("evaluation", options.evaluationFilter);
  }

  const query = params.toString();
  return `${meta.path}${query ? `?${query}` : ""}`;
}
