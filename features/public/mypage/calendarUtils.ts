"use client";

/** 캘린더와 날짜 표시에 사용할 한국 표준시 타임존입니다. */
export const KST_TIME_ZONE = "Asia/Seoul";

/** 날짜를 일 단위 serial 값으로 계산할 때 사용하는 밀리초 상수입니다. */
export const DAY_MS = 24 * 60 * 60 * 1000;

/** 월요일 시작 기준 캘린더 헤더 라벨입니다. */
export const WEEKDAY_LABELS = [
  "월",
  "화",
  "수",
  "목",
  "금",
  "토",
  "일",
] as const;

const KST_DATE_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: KST_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

type DatePartType = "year" | "month" | "day";

export type KstDateParts = {
  year: number;
  month: number;
  day: number;
};

export type DisplayMonth = {
  year: number;
  month: number;
};

export type DayMarker = "none" | "today" | "schedule" | "homework";

export type CalendarCell = {
  day: number | null;
  dateKey: string | null;
  marker: DayMarker;
  weekdayIndex: number;
};

/**
 * `Intl.DateTimeFormatPart[]`에서 원하는 숫자 파트를 꺼냅니다.
 */
function getDatePart(
  parts: Intl.DateTimeFormatPart[],
  type: DatePartType,
): number {
  return Number(parts.find((part) => part.type === type)?.value ?? "0");
}

/**
 * Date 객체를 한국 표준시 기준의 연,월,일 구조로 변환합니다.
 */
export function toKstDateParts(value: Date): KstDateParts {
  const parts = KST_DATE_FORMATTER.formatToParts(value);
  return {
    year: getDatePart(parts, "year"),
    month: getDatePart(parts, "month"),
    day: getDatePart(parts, "day"),
  };
}

/**
 * API 날짜 문자열을 캘린더 계산용 연,월,일 구조로 파싱합니다.
 */
export function parseCalendarDateParts(value: string): KstDateParts | null {
  const directMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})T/);
  if (directMatch) {
    return {
      year: Number(directMatch[1]),
      month: Number(directMatch[2]),
      day: Number(directMatch[3]),
    };
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return toKstDateParts(parsed);
}

/**
 * 날짜 구조체를 `YYYY-MM-DD` 키로 변환합니다.
 */
export function toDateKey(parts: KstDateParts): string {
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(
    parts.day,
  ).padStart(2, "0")}`;
}

/**
 * 날짜를 일 단위 정수 값으로 변환해 D-day나 기간 계산에 사용합니다.
 */
export function toDaySerial(parts: KstDateParts): number {
  return Math.floor(Date.UTC(parts.year, parts.month - 1, parts.day) / DAY_MS);
}

/**
 * 연,월 정보에 해당하는 마지막 날짜를 반환합니다.
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/**
 * 월요일 시작 기준으로 해당 날짜의 요일 인덱스를 계산합니다.
 */
export function getMondayFirstWeekday(
  year: number,
  month: number,
  day = 1,
): number {
  const sundayFirstWeekday = new Date(
    Date.UTC(year, month - 1, day),
  ).getUTCDay();
  return (sundayFirstWeekday + 6) % 7;
}

/**
 * 숫자 월을 `3월` 형태로 출력합니다.
 */
export function formatMonthLabel(month: number): string {
  return `${month}월`;
}

/**
 * 표시 중인 월을 `2026년 3월` 형태로 출력합니다.
 */
export function formatYearMonthLabel(displayMonth: DisplayMonth): string {
  return `${displayMonth.year}년 ${displayMonth.month}월`;
}

/**
 * 일정 리스트에 쓸 `3. 08` 형태의 날짜 라벨을 만듭니다.
 */
export function formatMonthDay(parts: KstDateParts): string {
  return `${parts.month}. ${String(parts.day).padStart(2, "0")}`;
}

/**
 * 일정 남은 날짜를 D-day 포맷으로 변환합니다.
 */
export function formatDday(daySerial: number, todaySerial: number): string {
  const diff = daySerial - todaySerial;
  if (diff === 0) {
    return "D-Day";
  }
  if (diff > 0) {
    return `D-${diff}`;
  }
  return `D+${Math.abs(diff)}`;
}

/**
 * 날짜 문자열을 `YYYY-MM-DDTHH:mm` 형태의 입력값으로 변환합니다.
 */
export function formatDateTimeInputValue(value: string): string {
  const directMatch = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/,
  );
  if (directMatch) {
    return `${directMatch[1]}-${directMatch[2]}-${directMatch[3]}T${directMatch[4]}:${directMatch[5]}`;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const dateParts = KST_DATE_FORMATTER.formatToParts(parsed);
  const year = String(getDatePart(dateParts, "year"));
  const month = String(getDatePart(dateParts, "month")).padStart(2, "0");
  const day = String(getDatePart(dateParts, "day")).padStart(2, "0");
  const timeLabel = new Intl.DateTimeFormat("en-GB", {
    timeZone: KST_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(parsed);

  return `${year}-${month}-${day}T${timeLabel}`;
}

/**
 * `datetime-local` 입력값을 API 요청용 `YYYY-MM-DDTHH:mm:ss` 포맷으로 맞춥니다.
 */
export function toApiDateTimeValue(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed)) {
    return `${trimmed}:00`;
  }

  return trimmed;
}

/**
 * 날짜 문자열을 한국어 일시 라벨로 출력합니다.
 */
export function formatDateTimeLabel(value: string): string {
  const directMatch = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/,
  );
  if (directMatch) {
    return `${directMatch[1]}.${directMatch[2]}.${directMatch[3]} ${directMatch[4]}:${directMatch[5]}`;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: KST_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(parsed);
}

/**
 * 일정 시간대를 `3. 08 18:00 - 20:00` 형태로 출력합니다.
 */
export function formatDateTimeRangeLabel(
  startAt: string,
  endAt: string,
): string {
  const startMatch = startAt.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/,
  );
  const endMatch = endAt.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);

  if (startMatch && endMatch) {
    const startDateLabel = `${Number(startMatch[2])}. ${startMatch[3]}`;
    const sameDate =
      startMatch[1] === endMatch[1] &&
      startMatch[2] === endMatch[2] &&
      startMatch[3] === endMatch[3];

    if (sameDate) {
      return `${startDateLabel} ${startMatch[4]}:${startMatch[5]} - ${endMatch[4]}:${endMatch[5]}`;
    }

    return `${startDateLabel} ${startMatch[4]}:${startMatch[5]} - ${Number(endMatch[2])}. ${endMatch[3]} ${endMatch[4]}:${endMatch[5]}`;
  }

  return `${formatDateTimeLabel(startAt)} - ${formatDateTimeLabel(endAt)}`;
}

/**
 * 현재 보고 있는 월을 앞뒤로 이동합니다.
 */
export function moveDisplayMonth(
  displayMonth: DisplayMonth,
  delta: number,
): DisplayMonth {
  const nextMonth = displayMonth.month + delta;
  if (nextMonth < 1) {
    return {
      year: displayMonth.year - 1,
      month: 12,
    };
  }

  if (nextMonth > 12) {
    return {
      year: displayMonth.year + 1,
      month: 1,
    };
  }

  return {
    year: displayMonth.year,
    month: nextMonth,
  };
}

/**
 * 지정한 월과 오늘 날짜를 기준으로 캘린더 조회 범위를 구성합니다.
 */
export function buildCalendarRange(
  displayMonth: DisplayMonth,
  todayParts: KstDateParts,
): { from: string; to: string } {
  const fromYear = Math.min(displayMonth.year, todayParts.year);
  const toYear = Math.max(displayMonth.year, todayParts.year + 1);

  return {
    from: `${fromYear}-01-01T00:00:00`,
    to: `${toYear}-12-31T23:59:59`,
  };
}

/**
 * 일 단위 serial 값을 다시 연,월,일 구조로 변환합니다.
 */
export function fromDaySerial(daySerial: number): KstDateParts {
  const date = new Date(daySerial * DAY_MS);
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

/**
 * 시작일과 종료일 사이의 날짜 키를 모두 반환합니다.
 */
export function getDateKeysBetween(
  startSerial: number,
  endSerial: number,
): string[] {
  const result: string[] = [];
  for (let serial = startSerial; serial <= endSerial; serial += 1) {
    result.push(toDateKey(fromDaySerial(serial)));
  }
  return result;
}

/**
 * 해당 일정이 특정 월과 겹치는지 검사합니다.
 */
export function isOverlappingDisplayMonth(
  startSerial: number,
  endSerial: number,
  displayMonth: DisplayMonth,
): boolean {
  const monthStartSerial = toDaySerial({
    year: displayMonth.year,
    month: displayMonth.month,
    day: 1,
  });
  const monthEndSerial = toDaySerial({
    year: displayMonth.year,
    month: displayMonth.month,
    day: getDaysInMonth(displayMonth.year, displayMonth.month),
  });

  return startSerial <= monthEndSerial && endSerial >= monthStartSerial;
}

/**
 * 현재 월에 표시할 캘린더 셀 데이터를 생성합니다.
 */
export function buildCalendarCells(
  displayMonth: DisplayMonth,
  todayDateKey: string,
  scheduleDateKeys: Set<string>,
  homeworkDateKeys: Set<string>,
): CalendarCell[] {
  const leadingEmptyDays = getMondayFirstWeekday(
    displayMonth.year,
    displayMonth.month,
  );
  const totalDays = getDaysInMonth(displayMonth.year, displayMonth.month);
  const cells: CalendarCell[] = [];

  for (let index = 0; index < leadingEmptyDays; index += 1) {
    cells.push({
      day: null,
      dateKey: null,
      marker: "none",
      weekdayIndex: index,
    });
  }

  for (let day = 1; day <= totalDays; day += 1) {
    const offsetIndex = leadingEmptyDays + day - 1;
    const dateKey = toDateKey({
      year: displayMonth.year,
      month: displayMonth.month,
      day,
    });

    let marker: DayMarker = "none";
    if (dateKey === todayDateKey) {
      marker = "today";
    } else if (scheduleDateKeys.has(dateKey)) {
      marker = "schedule";
    } else if (homeworkDateKeys.has(dateKey)) {
      marker = "homework";
    }

    cells.push({
      day,
      dateKey,
      marker,
      weekdayIndex: offsetIndex % 7,
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({
      day: null,
      dateKey: null,
      marker: "none",
      weekdayIndex: cells.length % 7,
    });
  }

  return cells;
}

/**
 * 날짜 문자열을 정렬용 timestamp 값으로 변환합니다.
 */
export function toTimestamp(value: string): number {
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}
