export const TRACK_OPTIONS = ["FRONTEND", "BACKEND", "AI_ML", "PM_DESIGN"] as const;

/**
 * 과제 생성/수정 화면에서 선택할 수 있는 API 트랙 옵션입니다.
 * COMMON은 공통공간 전체 과제를 의미합니다.
 */
export const PROJECT_TRACK_OPTIONS = ["COMMON", ...TRACK_OPTIONS] as const;

export function formatDateTime(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Seoul",
  }).format(parsed);
}

export function todayKstString(): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(now);
}

export function selectedDateCheckedAtString(attendanceDate: string): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const timePart = formatter.format(now).replace(",", "").trim();
  const datePart = attendanceDate.replace(/-/g, ".");
  return `${datePart}.${timePart}`;
}

export function toLocalDateTimeInputValue(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(?:\.\d+)?)?$/.test(value)) {
    return value.slice(0, 16);
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  const formatter = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return formatter.format(parsed).replace(" ", "T");
}

export function fromLocalDateTimeInputValue(value: string): string {
  if (!value) return "";

  return value.length === 16 ? `${value}:00` : value;
}

export function parseNumberList(value: string): number[] {
  return value
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isInteger(item) && item > 0);
}

export function fileListToArray(fileList: FileList | null): File[] {
  if (!fileList) return [];
  return Array.from(fileList);
}

