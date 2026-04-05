"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  createCalendarEvent,
  deleteCalendarEvent,
  getCalendarEventDetail,
  getCalendarEvents,
  getProjectList,
  updateCalendarEvent,
} from "../api";
import {
  buildCalendarCells,
  buildCalendarRange,
  formatDateTimeInputValue,
  formatDateTimeLabel,
  formatDateTimeRangeLabel,
  formatDday,
  formatMonthDay,
  formatYearMonthLabel,
  getDateKeysBetween,
  isOverlappingDisplayMonth,
  moveDisplayMonth,
  parseCalendarDateParts,
  toApiDateTimeValue,
  toDateKey,
  toDaySerial,
  toKstDateParts,
  toTimestamp,
  WEEKDAY_LABELS,
  type DisplayMonth,
  type KstDateParts,
} from "../calendarUtils";
import type {
  CalendarEventSummary,
  CalendarTrack,
  CalendarTrackFilter,
  MyPageUser,
  ProjectListItem,
} from "../types";

/** 우측 요약 카드에 노출할 최대 일정 개수입니다. */
const MAX_EVENT_LIST_SIZE = 5;
const MAX_CALENDAR_TOOLTIP_ITEMS = 2;

/** 일정 생성 및 수정에 사용할 트랙 옵션 목록입니다. */
const CALENDAR_TRACK_OPTIONS: { value: CalendarTrack; label: string }[] = [
  { value: "FRONTEND", label: "FRONTEND" },
  { value: "BACKEND", label: "BACKEND" },
  { value: "AI_ML", label: "AI_ML" },
  { value: "PM_DESIGN", label: "PM_DESIGN" },
  { value: "COMMON", label: "COMMON" },
];

/** 운영진이 목록을 좁혀 볼 때 사용할 필터 옵션 목록입니다. */
const STAFF_TRACK_FILTER_OPTIONS: {
  value: CalendarTrackFilter;
  label: string;
}[] = [
  { value: "ALL", label: "전체" },
  { value: "FRONTEND", label: "FRONTEND" },
  { value: "BACKEND", label: "BACKEND" },
  { value: "AI_ML", label: "AI_ML" },
  { value: "PM_DESIGN", label: "PM_DESIGN" },
  { value: "COMMON", label: "COMMON" },
];

type ScheduleFormState = {
  title: string;
  content: string;
  track: CalendarTrack;
  startAt: string;
  endAt: string;
};

type ScheduleEventItem = {
  id: number;
  title: string;
  content: string;
  track: CalendarTrack | string;
  startAt: string;
  endAt: string;
  startParts: KstDateParts;
  endParts: KstDateParts;
  startDaySerial: number;
  endDaySerial: number;
  createdAt: string;
  updatedAt: string;
};

type HomeworkEventItem = {
  id: string;
  title: string;
  dateParts: KstDateParts;
  dateKey: string;
  daySerial: number;
};

type TodayEventItem = {
  id: string;
  type: "SCHEDULE" | "HOMEWORK";
  title: string;
  subtitle: string;
  sortTimestamp: number;
};

type SelectedScheduleMeta = {
  status: string;
  createdAt: string;
  updatedAt: string;
};

type MyCalendarSectionProps = {
  user: MyPageUser;
};

/**
 * 문자열이 캘린더 API에서 허용하는 트랙 값인지 검사합니다.
 */
function isCalendarTrack(
  value: string | null | undefined,
): value is CalendarTrack {
  return (
    value === "FRONTEND" ||
    value === "BACKEND" ||
    value === "AI_ML" ||
    value === "PM_DESIGN" ||
    value === "COMMON"
  );
}

/**
 * 트랙 enum 값을 화면 표시용 라벨로 변환합니다.
 */
function getTrackLabel(track: CalendarTrackFilter | string): string {
  if (track === "ALL") {
    return "전체 일정";
  }

  if (track === "COMMON") {
    return "공통 일정";
  }

  return track;
}

/**
 * 트랙 뱃지 색상을 반환합니다.
 */
function getTrackBadgeClassName(track: CalendarTrack | string): string {
  switch (track) {
    case "FRONTEND":
      return "border-[#6DA7FF]/40 bg-[#6DA7FF]/15 text-[#8BB9FF]";
    case "BACKEND":
      return "border-[#82D29B]/40 bg-[#82D29B]/15 text-[#99E0B0]";
    case "AI_ML":
      return "border-[#E2A869]/40 bg-[#E2A869]/15 text-[#F2BC82]";
    case "PM_DESIGN":
      return "border-[#E88AAF]/40 bg-[#E88AAF]/15 text-[#F3A6C2]";
    case "COMMON":
      return "border-white/20 bg-white/10 text-white/80";
    default:
      return "border-white/20 bg-white/10 text-white/80";
  }
}

/**
 * 로그인 사용자에게 연결된 기본 캘린더 트랙을 반환합니다.
 */
function resolveUserCalendarTrack(user: MyPageUser): CalendarTrack | null {
  return isCalendarTrack(user.track) ? user.track : null;
}

/**
 * 마이페이지 최초 진입 시 사용할 캘린더 필터를 결정합니다.
 */
function resolveDefaultCalendarFilter(user: MyPageUser): CalendarTrackFilter {
  if (user.role === "운영진") {
    return "ALL";
  }

  return resolveUserCalendarTrack(user) ?? "COMMON";
}

/**
 * 일정 생성 폼의 기본 트랙 값을 계산합니다.
 */
function resolveDefaultFormTrack(
  user: MyPageUser,
  filter: CalendarTrackFilter,
): CalendarTrack {
  if (filter !== "ALL") {
    return filter;
  }

  return resolveUserCalendarTrack(user) ?? "COMMON";
}

/**
 * 새 일정 작성 시 사용할 기본 폼 값을 생성합니다.
 */
function buildDefaultScheduleFormState(
  track: CalendarTrack,
  todayDateKey: string,
): ScheduleFormState {
  return {
    title: "",
    content: "",
    track,
    startAt: `${todayDateKey}T18:00`,
    endAt: `${todayDateKey}T20:00`,
  };
}

/**
 * 캘린더 목록 응답을 화면 표시용 일정 구조로 변환합니다.
 */
function mapCalendarSummaryToScheduleEvent(
  item: CalendarEventSummary,
): ScheduleEventItem | null {
  const startParts = parseCalendarDateParts(item.startAt);
  const endParts = parseCalendarDateParts(item.endAt);

  if (!startParts || !endParts) {
    return null;
  }

  const startDaySerial = toDaySerial(startParts);
  const endDaySerial = Math.max(startDaySerial, toDaySerial(endParts));

  return {
    id: item.id,
    title: item.title,
    content: item.content,
    track: item.track,
    startAt: item.startAt,
    endAt: item.endAt,
    startParts,
    endParts,
    startDaySerial,
    endDaySerial,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

/**
 * 과제 API 응답을 마감일 전용 캘린더 항목으로 변환합니다.
 */
function mapProjectToHomeworkEvent(
  project: ProjectListItem,
): HomeworkEventItem | null {
  const dateParts = parseCalendarDateParts(project.deadline);

  if (!dateParts) {
    return null;
  }

  return {
    id: `homework-${project.id}-${toDateKey(dateParts)}`,
    title: project.title,
    dateParts,
    dateKey: toDateKey(dateParts),
    daySerial: toDaySerial(dateParts),
  };
}

export default function MyCalendarSection({ user }: MyCalendarSectionProps) {
  const isStaff = user.role === "운영진";
  const todayParts = useMemo(() => toKstDateParts(new Date()), []);
  const todayDateKey = useMemo(() => toDateKey(todayParts), [todayParts]);
  const todayDaySerial = useMemo(() => toDaySerial(todayParts), [todayParts]);

  const [displayMonth, setDisplayMonth] = useState<DisplayMonth>({
    year: todayParts.year,
    month: todayParts.month,
  });

  const [calendarTrackFilter, setCalendarTrackFilter] =
    useState<CalendarTrackFilter>(() => resolveDefaultCalendarFilter(user));
  const [scheduleItems, setScheduleItems] = useState<ScheduleEventItem[]>([]);
  const [homeworkItems, setHomeworkItems] = useState<HomeworkEventItem[]>([]);
  const [isScheduleLoading, setIsScheduleLoading] = useState(true);
  const [scheduleErrorMessage, setScheduleErrorMessage] = useState("");
  const [isHomeworkLoading, setIsHomeworkLoading] = useState(true);
  const [homeworkErrorMessage, setHomeworkErrorMessage] = useState("");
  const [calendarRefreshKey, setCalendarRefreshKey] = useState(0);

  const resolvedDefaultCalendarFilter = useMemo(
    () => resolveDefaultCalendarFilter(user),
    [user],
  );
  const resolvedUserCalendarTrack = useMemo(
    () => resolveUserCalendarTrack(user),
    [user],
  );
  const initialFormTrack = useMemo(
    () => resolveDefaultFormTrack(user, resolvedDefaultCalendarFilter),
    [resolvedDefaultCalendarFilter, user],
  );
  const [formState, setFormState] = useState<ScheduleFormState>(() =>
    buildDefaultScheduleFormState(initialFormTrack, todayDateKey),
  );
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [selectedScheduleMeta, setSelectedScheduleMeta] =
    useState<SelectedScheduleMeta | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [managementErrorMessage, setManagementErrorMessage] = useState("");
  const [managementSuccessMessage, setManagementSuccessMessage] = useState("");

  const defaultFormTrack = useMemo(
    () => resolveDefaultFormTrack(user, calendarTrackFilter),
    [calendarTrackFilter, user],
  );
  const calendarRange = useMemo(
    () => buildCalendarRange(displayMonth, todayParts),
    [displayMonth, todayParts],
  );
  const calendarQueryTrack = useMemo(
    () => (calendarTrackFilter === "ALL" ? undefined : calendarTrackFilter),
    [calendarTrackFilter],
  );

  /**
   * 일정 생성 폼을 기본 상태로 되돌립니다.
   */
  const resetScheduleForm = useCallback(() => {
    setEditingEventId(null);
    setSelectedScheduleMeta(null);
    setFormState(buildDefaultScheduleFormState(defaultFormTrack, todayDateKey));
    setManagementErrorMessage("");
    setManagementSuccessMessage("");
  }, [defaultFormTrack, todayDateKey]);

  /**
   * 캘린더 목록을 다시 조회하도록 갱신 키를 올립니다.
   */
  const refreshCalendar = useCallback(() => {
    setCalendarRefreshKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    setCalendarTrackFilter(resolvedDefaultCalendarFilter);
  }, [resolvedDefaultCalendarFilter]);

  useEffect(() => {
    if (editingEventId !== null) {
      return;
    }

    setFormState((prev) => ({
      ...prev,
      track: defaultFormTrack,
    }));
  }, [defaultFormTrack, editingEventId]);

  useEffect(() => {
    let isMounted = true;

    const fetchScheduleEvents = async () => {
      setIsScheduleLoading(true);
      setScheduleErrorMessage("");

      try {
        const response = await getCalendarEvents({
          from: calendarRange.from,
          to: calendarRange.to,
          track: calendarQueryTrack,
        });

        if (!isMounted) {
          return;
        }

        const nextItems = response.events
          .map(mapCalendarSummaryToScheduleEvent)
          .filter((item): item is ScheduleEventItem => item !== null)
          .sort((a, b) => toTimestamp(a.startAt) - toTimestamp(b.startAt));

        setScheduleItems(nextItems);
      } catch {
        if (!isMounted) {
          return;
        }

        setScheduleItems([]);
        setScheduleErrorMessage(
          "일정을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.",
        );
      } finally {
        if (isMounted) {
          setIsScheduleLoading(false);
        }
      }
    };

    void fetchScheduleEvents();

    return () => {
      isMounted = false;
    };
  }, [
    calendarQueryTrack,
    calendarRange.from,
    calendarRange.to,
    calendarRefreshKey,
  ]);

  useEffect(() => {
    let isMounted = true;

    const fetchHomeworkEvents = async () => {
      setIsHomeworkLoading(true);
      setHomeworkErrorMessage("");

      const requests = [getProjectList()];
      const userTrack = resolvedUserCalendarTrack;

      if (userTrack && userTrack !== "COMMON") {
        requests.push(getProjectList({ track: userTrack }));
      }

      try {
        const results = await Promise.allSettled(requests);

        if (!isMounted) {
          return;
        }

        const mergedMap = new Map<number, ProjectListItem>();
        let successCount = 0;

        results.forEach((result) => {
          if (result.status !== "fulfilled") {
            return;
          }

          successCount += 1;
          result.value.forEach((projectItem) => {
            if (String(projectItem.status).toUpperCase() === "INACTIVE") {
              return;
            }

            mergedMap.set(projectItem.id, projectItem);
          });
        });

        const nextItems = Array.from(mergedMap.values())
          .map(mapProjectToHomeworkEvent)
          .filter((item): item is HomeworkEventItem => item !== null)
          .sort((a, b) => a.daySerial - b.daySerial);

        setHomeworkItems(nextItems);

        if (successCount === 0) {
          setHomeworkErrorMessage(
            "과제 일정을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.",
          );
        }
      } catch {
        if (!isMounted) {
          return;
        }

        setHomeworkItems([]);
        setHomeworkErrorMessage(
          "과제 일정을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.",
        );
      } finally {
        if (isMounted) {
          setIsHomeworkLoading(false);
        }
      }
    };

    void fetchHomeworkEvents();

    return () => {
      isMounted = false;
    };
  }, [resolvedUserCalendarTrack]);

  const canSubmitScheduleForm = useMemo(
    () =>
      formState.title.trim().length > 0 &&
      formState.content.trim().length > 0 &&
      formState.startAt.trim().length > 0 &&
      formState.endAt.trim().length > 0,
    [formState.content, formState.endAt, formState.startAt, formState.title],
  );

  const scheduleItemsByDateKey = useMemo(() => {
    const groupedItems = new Map<string, ScheduleEventItem[]>();

    scheduleItems.forEach((item) => {
      getDateKeysBetween(item.startDaySerial, item.endDaySerial).forEach(
        (dateKey) => {
          const existingItems = groupedItems.get(dateKey);

          if (existingItems) {
            existingItems.push(item);
            return;
          }

          groupedItems.set(dateKey, [item]);
        },
      );
    });

    groupedItems.forEach((items) => {
      items.sort((a, b) => toTimestamp(a.startAt) - toTimestamp(b.startAt));
    });

    return groupedItems;
  }, [scheduleItems]);

  const scheduleDateKeys = useMemo(() => {
    return new Set(scheduleItemsByDateKey.keys());
  }, [scheduleItemsByDateKey]);

  const homeworkItemsByDateKey = useMemo(() => {
    const groupedItems = new Map<string, HomeworkEventItem[]>();

    homeworkItems.forEach((item) => {
      const existingItems = groupedItems.get(item.dateKey);

      if (existingItems) {
        existingItems.push(item);
        return;
      }

      groupedItems.set(item.dateKey, [item]);
    });

    return groupedItems;
  }, [homeworkItems]);

  const homeworkDateKeys = useMemo(
    () => new Set(homeworkItems.map((item) => item.dateKey)),
    [homeworkItems],
  );

  const calendarCells = useMemo(
    () =>
      buildCalendarCells(
        displayMonth,
        todayDateKey,
        scheduleDateKeys,
        homeworkDateKeys,
      ),
    [displayMonth, homeworkDateKeys, scheduleDateKeys, todayDateKey],
  );

  const todayEvents = useMemo<TodayEventItem[]>(() => {
    const todayScheduleItems = scheduleItems
      .filter(
        (item) =>
          item.startDaySerial <= todayDaySerial &&
          item.endDaySerial >= todayDaySerial,
      )
      .map((item) => ({
        id: `schedule-${item.id}`,
        type: "SCHEDULE" as const,
        title: item.title,
        subtitle: `${getTrackLabel(item.track)} · ${formatDateTimeRangeLabel(
          item.startAt,
          item.endAt,
        )}`,
        sortTimestamp: toTimestamp(item.startAt),
      }));

    const todayHomeworkItems = homeworkItems
      .filter((item) => item.daySerial === todayDaySerial)
      .map((item) => ({
        id: item.id,
        type: "HOMEWORK" as const,
        title: item.title,
        subtitle: `과제 마감 · ${formatMonthDay(item.dateParts)}`,
        sortTimestamp: item.daySerial * 1000,
      }));

    return [...todayScheduleItems, ...todayHomeworkItems].sort(
      (a, b) => a.sortTimestamp - b.sortTimestamp,
    );
  }, [homeworkItems, scheduleItems, todayDaySerial]);

  const upcomingScheduleEvents = useMemo(
    () =>
      scheduleItems
        .filter((item) => item.endDaySerial >= todayDaySerial)
        .slice(0, MAX_EVENT_LIST_SIZE),
    [scheduleItems, todayDaySerial],
  );

  const upcomingHomeworkEvents = useMemo(
    () =>
      homeworkItems
        .filter((item) => item.daySerial >= todayDaySerial)
        .slice(0, MAX_EVENT_LIST_SIZE),
    [homeworkItems, todayDaySerial],
  );

  const displayMonthScheduleEvents = useMemo(
    () =>
      scheduleItems.filter((item) =>
        isOverlappingDisplayMonth(
          item.startDaySerial,
          item.endDaySerial,
          displayMonth,
        ),
      ),
    [displayMonth, scheduleItems],
  );

  /**
   * 선택한 일정을 상세 조회해 수정 폼에 주입합니다.
   * @param eventId 수정할 일정 Id
   */
  const handleStartEdit = async (eventId: number) => {
    if (!isStaff || isMutating) {
      return;
    }

    setIsDetailLoading(true);
    setManagementErrorMessage("");
    setManagementSuccessMessage("");

    try {
      const response = await getCalendarEventDetail(eventId);

      setEditingEventId(response.id);
      setSelectedScheduleMeta({
        status: response.status,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
      });
      setFormState({
        title: response.title,
        content: response.content,
        track: isCalendarTrack(response.track)
          ? response.track
          : defaultFormTrack,
        startAt: formatDateTimeInputValue(response.startAt),
        endAt: formatDateTimeInputValue(response.endAt),
      });
    } catch {
      setManagementErrorMessage(
        "일정 상세를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.",
      );
    } finally {
      setIsDetailLoading(false);
    }
  };

  /**
   * 일정 생성 또는 수정 요청을 처리합니다.
   */
  const handleSubmitSchedule = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isStaff || isMutating || !canSubmitScheduleForm) {
      return;
    }

    const normalizedStartAt = toApiDateTimeValue(formState.startAt);
    const normalizedEndAt = toApiDateTimeValue(formState.endAt);

    if (normalizedStartAt > normalizedEndAt) {
      setManagementErrorMessage("종료 일시는 시작 일시보다 빠를 수 없습니다.");
      setManagementSuccessMessage("");
      return;
    }

    setIsMutating(true);
    setManagementErrorMessage("");
    setManagementSuccessMessage("");

    try {
      const payload = {
        title: formState.title.trim(),
        content: formState.content.trim(),
        track: formState.track,
        startAt: normalizedStartAt,
        endAt: normalizedEndAt,
      };

      const response =
        editingEventId === null
          ? await createCalendarEvent(payload)
          : await updateCalendarEvent(editingEventId, payload);

      const nextSuccessMessage =
        response.result ||
        (editingEventId === null
          ? "일정을 생성했습니다."
          : "일정을 수정했습니다.");
      resetScheduleForm();
      setManagementSuccessMessage(nextSuccessMessage);
      refreshCalendar();
    } catch {
      setManagementErrorMessage(
        editingEventId === null
          ? "일정 생성에 실패했습니다."
          : "일정 수정에 실패했습니다.",
      );
    } finally {
      setIsMutating(false);
    }
  };

  /**
   * 선택한 일정을 삭제하고 목록을 새로고침합니다.
   * @param eventId 삭제할 일정 Id
   */
  const handleDeleteSchedule = async (eventId: number) => {
    if (
      !isStaff ||
      isMutating ||
      !confirm("이 일정을 삭제할까요? 삭제 후에는 목록에서 숨겨집니다.")
    ) {
      return;
    }

    setIsMutating(true);
    setManagementErrorMessage("");
    setManagementSuccessMessage("");

    try {
      const response = await deleteCalendarEvent(eventId);

      if (editingEventId === eventId) {
        resetScheduleForm();
      }

      setManagementSuccessMessage(response.result || "일정을 삭제했습니다.");
      refreshCalendar();
    } catch {
      setManagementErrorMessage("일정 삭제에 실패했습니다.");
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <div className="space-y-8">
      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-[24px] font-bold text-white">
              멋쟁이사자처럼 일정
            </h3>
          </div>

          {isStaff ? (
            <label className="flex items-center gap-2 text-[12px] text-white/70">
              <span>표시 트랙</span>
              <select
                value={calendarTrackFilter}
                onChange={(event) =>
                  setCalendarTrackFilter(
                    event.target.value as CalendarTrackFilter,
                  )
                }
                className="h-10 rounded-md border border-white/10 bg-[#363944] px-3 text-[12px] text-white outline-none"
              >
                {STAFF_TRACK_FILTER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <p className="text-[12px] text-white/55">
              {getTrackLabel(calendarTrackFilter)}
            </p>
          )}
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div className="rounded-[8px] bg-[#4A4E5A] p-4">
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() =>
                  setDisplayMonth((prev) => moveDisplayMonth(prev, -1))
                }
                className="rounded px-2 py-1 text-white/70 transition-colors hover:bg-white/10"
                aria-label="이전 달"
              >
                &lt;
              </button>
              <div className="text-center">
                <p className="text-[12px] text-white/55">
                  {formatYearMonthLabel(displayMonth)}
                </p>
                <p className="mt-1 text-[26px] font-semibold text-white">
                  {displayMonth.month}월
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setDisplayMonth((prev) => moveDisplayMonth(prev, 1))
                }
                className="rounded px-2 py-1 text-white/70 transition-colors hover:bg-white/10"
                aria-label="다음 달"
              >
                &gt;
              </button>
            </div>

            <div className="grid grid-cols-7 gap-y-2 text-center text-[12px] text-white/45">
              {WEEKDAY_LABELS.map((label, index) => (
                <span
                  key={label}
                  className={
                    index === 5
                      ? "text-[#6DA7FF]"
                      : index === 6
                        ? "text-[#FF7F7F]"
                        : undefined
                  }
                >
                  {label}
                </span>
              ))}
            </div>

            <div className="mt-2 grid grid-cols-7 gap-y-1 text-center">
              {calendarCells.map((cell, index) => {
                if (cell.day === null) {
                  return <span key={`empty-${index}`} className="h-8" />;
                }

                const scheduleTooltipItems = cell.dateKey
                  ? (scheduleItemsByDateKey.get(cell.dateKey) ?? [])
                  : [];
                const homeworkTooltipItems = cell.dateKey
                  ? (homeworkItemsByDateKey.get(cell.dateKey) ?? [])
                  : [];
                const calendarTooltipItems = [
                  ...scheduleTooltipItems.map((item) => ({
                    id: `schedule-${item.id}`,
                    type: "SCHEDULE" as const,
                    title: item.title,
                    description: item.content.trim() || "설명이 없습니다.",
                  })),
                  ...homeworkTooltipItems.map((item) => ({
                    id: item.id,
                    type: "HOMEWORK" as const,
                    title: item.title,
                    description: `과제 마감일 · ${formatMonthDay(item.dateParts)}`,
                  })),
                ];
                const hasCalendarTooltip = calendarTooltipItems.length > 0;
                const tooltipItems = calendarTooltipItems.slice(
                  0,
                  MAX_CALENDAR_TOOLTIP_ITEMS,
                );
                const extraTooltipItemCount = Math.max(
                  0,
                  calendarTooltipItems.length - MAX_CALENDAR_TOOLTIP_ITEMS,
                );
                const markerClassName =
                  cell.marker === "today"
                    ? "bg-main-1 text-white"
                    : cell.marker === "schedule"
                      ? "bg-green-1 text-white"
                      : cell.marker === "homework"
                        ? "bg-main-3 text-white"
                        : "text-white/90";

                const weekdayTextClassName =
                  cell.marker !== "none"
                    ? ""
                    : cell.weekdayIndex === 5
                      ? "text-[#6DA7FF]"
                      : cell.weekdayIndex === 6
                        ? "text-[#FF7F7F]"
                        : "";
                const rowIndex = Math.floor(index / 7);
                const shouldShowTooltipBelow = rowIndex < 2;
                const tooltipVerticalClassName = shouldShowTooltipBelow
                  ? "top-full mt-2"
                  : "bottom-full mb-2";
                const tooltipHorizontalClassName =
                  cell.weekdayIndex <= 1
                    ? "left-0"
                    : cell.weekdayIndex >= 5
                      ? "right-0"
                      : "left-1/2 -translate-x-1/2";
                const tooltipArrowVerticalClassName = shouldShowTooltipBelow
                  ? "-top-1.5"
                  : "-bottom-1.5";
                const tooltipArrowHorizontalClassName =
                  cell.weekdayIndex <= 1
                    ? "left-3"
                    : cell.weekdayIndex >= 5
                      ? "right-3"
                      : "left-1/2 -translate-x-1/2";

                return (
                  <span
                    key={cell.dateKey}
                    className={`group relative mx-auto flex h-8 w-8 items-center justify-center ${hasCalendarTooltip ? "cursor-help" : ""}`}
                    tabIndex={hasCalendarTooltip ? 0 : undefined}
                    aria-describedby={
                      hasCalendarTooltip
                        ? `calendar-schedule-tooltip-${cell.dateKey}`
                        : undefined
                    }
                  >
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-medium transition-shadow group-focus-within:ring-2 group-focus-within:ring-[#82D29B]/60 ${markerClassName} ${weekdayTextClassName}`}
                    >
                      {cell.day}
                    </span>
                    {hasCalendarTooltip ? (
                      <span
                        id={`calendar-schedule-tooltip-${cell.dateKey}`}
                        role="tooltip"
                        className={`pointer-events-none invisible absolute z-20 w-[200px] rounded-[10px] border border-[#82D29B]/35 bg-[#262B34]/96 px-3 py-2 text-left opacity-0 shadow-[0_12px_30px_rgba(0,0,0,0.34)] transition-all duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 lg:w-[220px] ${tooltipVerticalClassName} ${tooltipHorizontalClassName}`}
                      >
                        <span
                          className={`absolute h-3 w-3 rotate-45 border border-[#82D29B]/35 bg-[#262B34]/96 ${tooltipArrowVerticalClassName} ${tooltipArrowHorizontalClassName}`}
                        />
                        <span className="relative block">
                          {tooltipItems.map((item, tooltipIndex) => (
                            <span
                              key={item.id}
                              className={`block ${tooltipIndex > 0 ? "mt-2 border-t border-white/10 pt-2" : ""}`}
                            >
                              <span className="flex items-center gap-2">
                                <span
                                  className={`inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${
                                    item.type === "SCHEDULE"
                                      ? "bg-[#82D29B]/15 text-[#99E0B0]"
                                      : "bg-main-3/15 text-main-3"
                                  }`}
                                >
                                  {item.type === "SCHEDULE" ? "일정" : "과제"}
                                </span>
                                <span className="line-clamp-1 block text-[11px] font-semibold text-white">
                                  {item.title}
                                </span>
                              </span>
                              <span className="mt-1 line-clamp-2 block break-words text-[10px] leading-[1.45] text-white/72">
                                {item.description}
                              </span>
                            </span>
                          ))}
                          {extraTooltipItemCount > 0 ? (
                            <span className="mt-2 block border-t border-white/10 pt-2 text-[10px] font-medium text-[#99E0B0]">
                              외 {extraTooltipItemCount}개 일정
                            </span>
                          ) : null}
                        </span>
                      </span>
                    ) : null}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <div className="rounded-[8px] bg-[#4A4E5A] px-4 py-3">
              <p className="text-[14px] font-semibold text-white/85">
                TODAY
                <span className="ml-2 inline-block h-2 w-2 rounded-full bg-main-1" />
              </p>
              <div className="mt-2 rounded-[5px] bg-white/20 px-3 py-2 text-[12px] text-white/85">
                {isScheduleLoading || isHomeworkLoading ? (
                  <p>일정을 불러오는 중입니다.</p>
                ) : todayEvents.length === 0 ? (
                  scheduleErrorMessage || homeworkErrorMessage ? (
                    <p>오늘 일정을 완전히 불러오지 못했습니다.</p>
                  ) : (
                    <p>오늘 일정은 없습니다.</p>
                  )
                ) : (
                  <ul className="space-y-2">
                    {todayEvents.map((eventItem) => (
                      <li key={eventItem.id}>
                        <div className="flex items-start gap-2">
                          <span
                            className={`mt-[2px] inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              eventItem.type === "SCHEDULE"
                                ? "bg-green-1/20 text-green-1"
                                : "bg-main-3/20 text-main-3"
                            }`}
                          >
                            {eventItem.type === "SCHEDULE" ? "일정" : "과제"}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-white">
                              {eventItem.title}
                            </p>
                            <p className="mt-0.5 text-[11px] text-white/70">
                              {eventItem.subtitle}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="rounded-[8px] bg-[#4A4E5A] px-4 py-3">
              <p className="text-[14px] font-semibold text-white/85">
                Schedule
                <span className="ml-2 inline-block h-2 w-2 rounded-full bg-green-1" />
              </p>
              <ul className="mt-2 space-y-1.5">
                {isScheduleLoading ? (
                  <li className="rounded-[5px] bg-white/20 px-3 py-2 text-[12px] text-white/70">
                    일정을 불러오는 중입니다.
                  </li>
                ) : scheduleErrorMessage ? (
                  <li className="rounded-[5px] bg-[#6a3640]/40 px-3 py-2 text-[12px] text-[#ffb0bc]">
                    {scheduleErrorMessage}
                  </li>
                ) : upcomingScheduleEvents.length > 0 ? (
                  upcomingScheduleEvents.map((eventItem) => (
                    <li
                      key={eventItem.id}
                      className="rounded-[5px] bg-white/20 px-3 py-2 text-[12px] text-white/85"
                    >
                      <div className="flex justify-between items-center gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getTrackBadgeClassName(
                                eventItem.track,
                              )}`}
                            >
                              {getTrackLabel(eventItem.track)}
                            </span>
                          </div>
                          <p className="mt-1 truncate font-semibold text-white">
                            {eventItem.title}
                          </p>
                          <p className="mt-0.5 text-[11px] text-white/70">
                            {formatDateTimeRangeLabel(
                              eventItem.startAt,
                              eventItem.endAt,
                            )}
                          </p>
                        </div>
                        <span className="shrink-0 text-[16px] text-white/70">
                          {formatDday(eventItem.startDaySerial, todayDaySerial)}
                        </span>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="rounded-[5px] bg-white/20 px-3 py-2 text-[12px] text-white/70">
                    등록된 일정이 없습니다.
                  </li>
                )}
              </ul>
            </div>

            <div className="rounded-[8px] bg-[#4A4E5A] px-4 py-3">
              <p className="text-[14px] font-semibold text-white/85">
                Homework
                <span className="ml-2 inline-block h-2 w-2 rounded-full bg-main-3" />
              </p>
              <ul className="mt-2 space-y-1.5">
                {isHomeworkLoading ? (
                  <li className="rounded-[5px] bg-white/20 px-3 py-2 text-[12px] text-white/70">
                    과제 일정을 불러오는 중입니다.
                  </li>
                ) : homeworkErrorMessage ? (
                  <li className="rounded-[5px] bg-[#6a3640]/40 px-3 py-2 text-[12px] text-[#ffb0bc]">
                    {homeworkErrorMessage}
                  </li>
                ) : upcomingHomeworkEvents.length > 0 ? (
                  upcomingHomeworkEvents.map((eventItem) => (
                    <li
                      key={eventItem.id}
                      className="rounded-[5px] bg-white/20 px-3 py-2 text-[12px] text-white/85"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <span className="text-white/70">
                            {formatMonthDay(eventItem.dateParts)}
                          </span>
                          <p className="mt-1 truncate font-semibold text-white">
                            {eventItem.title}
                          </p>
                          <p className="mt-0.5 text-[11px] text-white/70">
                            과제 마감일
                          </p>
                        </div>
                        <span className="shrink-0 text-[16px] text-white/70">
                          {formatDday(eventItem.daySerial, todayDaySerial)}
                        </span>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="rounded-[5px] bg-white/20 px-3 py-2 text-[12px] text-white/70">
                    등록된 과제 마감일이 없습니다.
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {isStaff ? (
        <section>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-[24px] font-bold text-white">
                운영진 일정 관리
              </h3>
              <p className="mt-1 text-[12px] text-white/55">
                현재 월 일정 목록을 보면서 새 일정을 생성하거나 기존 일정을
                수정할 수 있습니다.
              </p>
            </div>
            <button
              type="button"
              onClick={refreshCalendar}
              className="rounded-md border border-white/10 bg-[#363944] px-3 py-2 text-[12px] font-semibold text-white transition hover:bg-[#414451]"
            >
              목록 새로고침
            </button>
          </div>

          <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
            <form
              onSubmit={handleSubmitSchedule}
              className="rounded-[8px] border border-white/10 bg-[#363944] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h4 className="text-[18px] font-semibold text-white">
                    {editingEventId === null
                      ? "일정 생성"
                      : `일정 수정 #${editingEventId}`}
                  </h4>
                  <p className="mt-1 text-[12px] text-white/55">
                    트랙, 시간, 설명을 입력해 마이페이지 캘린더에 반영합니다.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={resetScheduleForm}
                  disabled={isMutating || isDetailLoading}
                  className="rounded-md border border-white/10 bg-[#414451] px-3 py-2 text-[12px] font-semibold text-white disabled:opacity-60"
                >
                  새 일정 작성
                </button>
              </div>

              {managementErrorMessage ? (
                <p className="mt-3 text-[12px] text-[#ff9ea8]">
                  {managementErrorMessage}
                </p>
              ) : null}
              {managementSuccessMessage ? (
                <p className="mt-3 text-[12px] text-[#8fd3ff]">
                  {managementSuccessMessage}
                </p>
              ) : null}
              {isDetailLoading ? (
                <p className="mt-3 text-[12px] text-white/70">
                  일정 상세를 불러오는 중입니다.
                </p>
              ) : null}

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <select
                  value={formState.track}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      track: event.target.value as CalendarTrack,
                    }))
                  }
                  disabled={isMutating || isDetailLoading}
                  className="h-11 rounded-md border border-white/10 bg-[#2d3037] px-3 text-sm text-white outline-none disabled:opacity-60"
                >
                  {CALENDAR_TRACK_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="flex items-center rounded-md border border-white/10 bg-[#2d3037] px-3 text-[12px] text-white/55">
                  현재 보기: {getTrackLabel(calendarTrackFilter)}
                </div>
              </div>

              <input
                value={formState.title}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    title: event.target.value,
                  }))
                }
                disabled={isMutating || isDetailLoading}
                placeholder="일정 제목"
                className="mt-3 h-11 w-full rounded-md border border-white/10 bg-[#2d3037] px-3 text-sm text-white outline-none disabled:opacity-60"
              />

              <textarea
                value={formState.content}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    content: event.target.value,
                  }))
                }
                disabled={isMutating || isDetailLoading}
                rows={5}
                placeholder="일정 설명"
                className="mt-3 w-full rounded-md border border-white/10 bg-[#2d3037] p-3 text-sm text-white outline-none disabled:opacity-60"
              />

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <label className="space-y-1">
                  <span className="block text-[12px] text-white/60">
                    시작 일시
                  </span>
                  <input
                    type="datetime-local"
                    value={formState.startAt}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        startAt: event.target.value,
                      }))
                    }
                    disabled={isMutating || isDetailLoading}
                    className="h-11 w-full rounded-md border border-white/10 bg-[#2d3037] px-3 text-sm text-white outline-none disabled:opacity-60"
                  />
                </label>

                <label className="space-y-1">
                  <span className="block text-[12px] text-white/60">
                    종료 일시
                  </span>
                  <input
                    type="datetime-local"
                    value={formState.endAt}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        endAt: event.target.value,
                      }))
                    }
                    disabled={isMutating || isDetailLoading}
                    className="h-11 w-full rounded-md border border-white/10 bg-[#2d3037] px-3 text-sm text-white outline-none disabled:opacity-60"
                  />
                </label>
              </div>

              {selectedScheduleMeta ? (
                <p className="mt-3 text-[12px] text-white/55">
                  상태: {selectedScheduleMeta.status} | 생성:{" "}
                  {formatDateTimeLabel(selectedScheduleMeta.createdAt)} | 수정:{" "}
                  {formatDateTimeLabel(selectedScheduleMeta.updatedAt)}
                </p>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={
                    isMutating || isDetailLoading || !canSubmitScheduleForm
                  }
                  className="rounded-lg bg-main-1 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {isMutating
                    ? "처리 중..."
                    : editingEventId === null
                      ? "일정 생성"
                      : "일정 수정"}
                </button>

                {editingEventId !== null ? (
                  <button
                    type="button"
                    onClick={() => void handleDeleteSchedule(editingEventId)}
                    disabled={isMutating || isDetailLoading}
                    className="rounded-lg bg-[#a63f4a] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    일정 삭제
                  </button>
                ) : null}
              </div>
            </form>

            <section className="rounded-[8px] border border-white/10 bg-[#363944] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h4 className="text-[18px] font-semibold text-white">
                    {formatYearMonthLabel(displayMonth)} 일정 목록
                  </h4>
                  <p className="mt-1 text-[12px] text-white/55">
                    {getTrackLabel(calendarTrackFilter)} ·{" "}
                    {displayMonthScheduleEvents.length.toLocaleString("ko-KR")}
                    건
                  </p>
                </div>
              </div>

              {isScheduleLoading ? (
                <p className="mt-4 text-[13px] text-white/70">
                  일정 목록을 불러오는 중입니다.
                </p>
              ) : scheduleErrorMessage ? (
                <p className="mt-4 text-[13px] text-[#ff9ea8]">
                  {scheduleErrorMessage}
                </p>
              ) : displayMonthScheduleEvents.length === 0 ? (
                <p className="mt-4 text-[13px] text-white/70">
                  이 달에는 등록된 일정이 없습니다.
                </p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {displayMonthScheduleEvents.map((eventItem) => (
                    <li
                      key={eventItem.id}
                      className={`rounded-[8px] border px-3 py-3 ${
                        editingEventId === eventItem.id
                          ? "border-main-1 bg-main-1/10"
                          : "border-white/10 bg-[#2d3037]"
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getTrackBadgeClassName(
                                eventItem.track,
                              )}`}
                            >
                              {getTrackLabel(eventItem.track)}
                            </span>
                            <span className="text-[11px] text-white/55">
                              {formatDateTimeRangeLabel(
                                eventItem.startAt,
                                eventItem.endAt,
                              )}
                            </span>
                          </div>
                          <p className="mt-2 font-semibold text-white">
                            {eventItem.title}
                          </p>
                          <p className="mt-1 whitespace-pre-wrap text-[12px] text-white/70">
                            {eventItem.content}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => void handleStartEdit(eventItem.id)}
                            disabled={isMutating}
                            className="rounded-md border border-white/10 bg-[#414451] px-3 py-2 text-[12px] font-semibold text-white disabled:opacity-60"
                          >
                            수정 불러오기
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              void handleDeleteSchedule(eventItem.id)
                            }
                            disabled={isMutating}
                            className="rounded-md bg-[#a63f4a] px-3 py-2 text-[12px] font-semibold text-white disabled:opacity-60"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </section>
      ) : null}
    </div>
  );
}
