import type { CommonSpacePartId } from "../types";
import type {
  CommonSpaceAssignmentAttachment,
  CommonSpaceAssignmentDetailApiResponse,
  CommonSpaceAssignmentDetailItem,
  CommonSpaceAssignmentFileApiItem,
  CommonSpaceAssignmentApiTrack,
  CommonSpaceAssignmentListItem,
  CommonSpaceAssignmentMySubmissionApiResponse,
  CommonSpaceAssignmentProjectListApiItem,
  CommonSpaceAssignmentSubmissionApiStatus,
} from "./types";

const commonSpacePartIdToAssignmentTrack: Partial<
  Record<CommonSpacePartId, CommonSpaceAssignmentApiTrack>
> = {
  "front-end": "FRONTEND",
  "back-end": "BACKEND",
  "ai-ml": "AI_ML",
  "pm-design": "PM_DESIGN",
};

const assignmentTrackToCommonSpacePartId: Record<
  CommonSpaceAssignmentApiTrack,
  CommonSpacePartId
> = {
  FRONTEND: "front-end",
  BACKEND: "back-end",
  AI_ML: "ai-ml",
  PM_DESIGN: "pm-design",
};

/**
 * 공통공간 파트 식별자를 과제 목록 API의 track 값으로 변환한다.
 * `all`은 공통 과제를 의미하므로 track 파라미터를 생략한다.
 */
export function mapCommonSpacePartIdToAssignmentTrack(
  partId: CommonSpacePartId = "all",
) {
  return commonSpacePartIdToAssignmentTrack[partId];
}

/**
 * 과제 API의 track 값을 공통공간 파트 식별자로 정규화한다.
 * 공통 과제는 null/undefined로 내려올 수 있으므로 all로 되돌린다.
 */
export function mapAssignmentTrackToCommonSpacePartId(
  track?: CommonSpaceAssignmentApiTrack | null,
): CommonSpacePartId {
  if (!track) {
    return "all";
  }

  return assignmentTrackToCommonSpacePartId[track] ?? "all";
}

/**
 * 과제 마감 시각 문자열을 카드 헤더용 형식으로 변환한다.
 */
export function formatAssignmentDeadline(deadlineAt: string) {
  const date = new Date(deadlineAt);

  if (Number.isNaN(date.getTime())) {
    return `마감 ${deadlineAt}`;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `마감 ${year}-${month}-${day}`;
}

/**
 * 제출 API 응답이 없을 때 사용할 기본 제출 상태를 만든다.
 */
function resolveAssignmentSubmissionApiStatus(
  submission?: CommonSpaceAssignmentMySubmissionApiResponse | null,
): CommonSpaceAssignmentSubmissionApiStatus {
  if (submission?.status) {
    return submission.status;
  }

  return submission?.submitted ? "PENDING" : "NOT_SUBMITTED";
}

/**
 * 과제가 이미 마감되었는지 판별한다.
 */
function isAssignmentDeadlinePassed(deadlineAt: string, now: Date) {
  const deadlineDate = new Date(deadlineAt);

  if (Number.isNaN(deadlineDate.getTime())) {
    return false;
  }

  return deadlineDate.getTime() < now.getTime();
}

/**
 * 제출 파일 URL에서 화면용 파일명을 추출한다.
 */
export function getAssignmentFileNameFromUrl(fileUrl?: string) {
  if (!fileUrl) {
    return undefined;
  }

  const normalizedUrl = fileUrl.split("?")[0] ?? fileUrl;
  const fileName = normalizedUrl.split("/").pop();

  return fileName ? decodeURIComponent(fileName) : "제출 파일";
}

/**
 * 제출 API 상태를 카드의 submissionState로 변환한다.
 */
export function toAssignmentSubmissionState(
  submission?: CommonSpaceAssignmentMySubmissionApiResponse | null,
  deadlineAt?: string,
  now: Date = new Date(),
): CommonSpaceAssignmentListItem["submissionState"] {
  const submissionStatus = resolveAssignmentSubmissionApiStatus(submission);

  if (submissionStatus === "REJECTED") {
    return "rejected";
  }

  if (submissionStatus === "PENDING" || submissionStatus === "APPROVED") {
    return "submitted";
  }

  return deadlineAt && isAssignmentDeadlinePassed(deadlineAt, now)
    ? "closed"
    : "notSubmitted";
}

/**
 * 제출 API 상태를 카드의 reviewState로 변환한다.
 */
export function toAssignmentReviewState(
  submission?: CommonSpaceAssignmentMySubmissionApiResponse | null,
) {
  const submissionStatus = resolveAssignmentSubmissionApiStatus(submission);

  if (submissionStatus === "PENDING") {
    return "pending" as const;
  }

  if (submissionStatus === "APPROVED" || submissionStatus === "REJECTED") {
    return "published" as const;
  }

  return "hidden" as const;
}

/**
 * 목록 API 응답과 내 제출 응답을 카드용 과제 아이템으로 변환한다.
 */
export function toCommonSpaceAssignmentListItem(
  project: CommonSpaceAssignmentProjectListApiItem,
  submission?: CommonSpaceAssignmentMySubmissionApiResponse | null,
  now: Date = new Date(),
): CommonSpaceAssignmentListItem {
  const submissionState = toAssignmentSubmissionState(
    submission,
    project.deadline,
    now,
  );
  const reviewState = toAssignmentReviewState(submission);

  return {
    id: project.id,
    title: project.title,
    description: project.description,
    partId: mapAssignmentTrackToCommonSpacePartId(project.track),
    deadlineAt: project.deadline,
    deadline: formatAssignmentDeadline(project.deadline),
    submissionState,
    reviewState,
    bodyMessage:
      submissionState === "notSubmitted"
        ? "아직 과제를 제출하지 않았습니다."
        : submissionState === "closed"
          ? "제출 기간이 종료되었습니다."
          : undefined,
    submissionId: submission?.submissionId,
    submissionFileName: getAssignmentFileNameFromUrl(submission?.fileUrl),
    submissionFileUrl: submission?.fileUrl,
    reviewContent: submission?.feedback,
    canResubmit: submissionState === "rejected",
  };
}

/**
 * 과제 상세 API의 첨부파일 응답을 화면용 데이터로 변환한다.
 */
export function toCommonSpaceAssignmentAttachment(
  file: CommonSpaceAssignmentFileApiItem,
): CommonSpaceAssignmentAttachment {
  return {
    id: file.fileId,
    name: file.originalFileName,
    url: file.fileUrl,
  };
}

/**
 * 과제 상세 API 응답과 제출 응답을 화면용 상세 데이터로 변환한다.
 */
export function toCommonSpaceAssignmentDetailItem(
  detail: CommonSpaceAssignmentDetailApiResponse,
  submission?: CommonSpaceAssignmentMySubmissionApiResponse | null,
  now: Date = new Date(),
): CommonSpaceAssignmentDetailItem {
  const assignment = toCommonSpaceAssignmentListItem(
    {
      id: detail.projectId,
      title: detail.title,
      description: detail.description,
      track: detail.track,
      startDate: detail.startDate,
      deadline: detail.endDate,
      status: detail.status,
    },
    submission,
    now,
  );

  return {
    id: detail.projectId,
    title: detail.title,
    content: detail.description,
    partId: mapAssignmentTrackToCommonSpacePartId(detail.track),
    createdAt: detail.startDate,
    deadlineAt: detail.endDate,
    status: detail.status,
    attachments: detail.files.map(toCommonSpaceAssignmentAttachment),
    assignment,
  };
}
