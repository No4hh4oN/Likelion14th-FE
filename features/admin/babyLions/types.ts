export type Track = "FRONTEND" | "BACKEND" | "AI_ML" | "PM_DESIGN";

export type ProjectStatus = "ACTIVE" | "INACTIVE" | string;

export type SubmissionStatus =
  | "NOT_SUBMITTED"
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED"
  | string;

export type AttendanceStatus =
  | "PRESENT"
  | "LATE"
  | "ABSENT"
  | "EXCUSED"
  | string;

export type ProjectListItem = {
  id: number;
  title: string;
  description: string;
  track: Track | null;
  startDate: string;
  deadline: string;
  status: ProjectStatus;
};

export type ProjectFile = {
  fileId: number;
  originalFileName: string;
  fileUrl: string;
};

export type ProjectDetail = {
  projectId: number;
  title: string;
  description: string;
  track: Track | null;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  files: ProjectFile[];
};

export type ProjectStatusItem = {
  userId: number;
  name: string;
  status: SubmissionStatus;
  submissionId: number | null;
  profileImageUrl: string | null;
};

export type SubmissionDetail = {
  submissionId: number;
  studentId: number;
  studentName: string;
  studentNo: string;
  content: string;
  fileUrl: string | null;
  status: SubmissionStatus;
  feedback: string | null;
  submittedAt: string;
};

export type AttendanceItem = {
  userId: number;
  loginId: string;
  name: string;
  studentNo: string;
  status: AttendanceStatus;
  profileImageUrl: string | null;
};

export type ProjectUpsertRequest = {
  title: string;
  description: string;
  track: Track | null;
  startDate: string;
  endDate: string;
  deleteFileIds?: number[];
};

export type SubmissionUpsertRequest = {
  content: string;
};

