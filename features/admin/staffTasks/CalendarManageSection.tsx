"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  createAdminCalendarEvent,
  deleteAdminCalendarEvent,
  getAdminCalendarEvents,
} from "../api";
import type {
  AdminCalendarEventSummary,
  AdminCalendarTrack,
  AdminCalendarTrackFilter,
} from "../type";
import {
  formatDateTimeLabel,
  formatDateTimeRangeLabel,
  formatYearMonthLabel,
  getDaysInMonth,
  moveDisplayMonth,
  toApiDateTimeValue,
  toDateKey,
  toKstDateParts,
  type DisplayMonth,
} from "@/features/public/mypage/calendarUtils";

/** 트랙 필터 드롭다운에 표시할 선택지입니다. */
const TRACK_FILTER_OPTIONS: {
  value: AdminCalendarTrackFilter;
  label: string;
}[] = [
  { value: "ALL", label: "전체" },
  { value: "FRONTEND", label: "FRONTEND" },
  { value: "BACKEND", label: "BACKEND" },
  { value: "AI_ML", label: "AI_ML" },
  { value: "PM_DESIGN", label: "PM_DESIGN" },
  { value: "COMMON", label: "COMMON" },
];

/** 일정 생성 폼에서 사용할 트랙 선택지입니다. */
const CREATE_TRACK_OPTIONS: { value: AdminCalendarTrack; label: string }[] = [
  { value: "FRONTEND", label: "FRONTEND" },
  { value: "BACKEND", label: "BACKEND" },
  { value: "AI_ML", label: "AI_ML" },
  { value: "PM_DESIGN", label: "PM_DESIGN" },
  { value: "COMMON", label: "COMMON" },
];

type CalendarCreateFormState = {
  title: string;
  content: string;
  track: AdminCalendarTrack;
  startAt: string;
  endAt: string;
};

/**
 * 트랙 enum 값을 화면용 라벨로 바꿉니다.
 */
function getTrackLabel(track: AdminCalendarTrackFilter | string): string {
  if (track === "ALL") {
    return "전체 일정";
  }

  if (track === "COMMON") {
    return "공통 일정";
  }

  return track;
}

/**
 * 트랙 뱃지 스타일을 반환합니다.
 */
function getTrackBadgeClassName(track: AdminCalendarTrack | string): string {
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
 * 현재 표시 중인 월을 기준으로 일정 조회 범위를 계산합니다.
 */
function buildMonthQuery(displayMonth: DisplayMonth): {
  from: string;
  to: string;
} {
  const dateKey = toDateKey({
    year: displayMonth.year,
    month: displayMonth.month,
    day: 1,
  });
  const lastDay = getDaysInMonth(displayMonth.year, displayMonth.month);

  return {
    from: `${dateKey}T00:00:00`,
    to: `${displayMonth.year}-${String(displayMonth.month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}T23:59:59`,
  };
}

/**
 * 일정 생성 폼의 기본값을 만듭니다.
 */
function buildDefaultFormState(
  track: AdminCalendarTrack,
  todayDateKey: string,
): CalendarCreateFormState {
  return {
    title: "",
    content: "",
    track,
    startAt: `${todayDateKey}T18:00`,
    endAt: `${todayDateKey}T20:00`,
  };
}

export default function CalendarManageSection() {
  const todayParts = useMemo(() => toKstDateParts(new Date()), []);
  const todayDateKey = useMemo(() => toDateKey(todayParts), [todayParts]);

  const [displayMonth, setDisplayMonth] = useState<DisplayMonth>({
    year: todayParts.year,
    month: todayParts.month,
  });
  const [trackFilter, setTrackFilter] =
    useState<AdminCalendarTrackFilter>("ALL");
  const [formState, setFormState] = useState<CalendarCreateFormState>(() =>
    buildDefaultFormState("COMMON", todayDateKey),
  );
  const [rows, setRows] = useState<AdminCalendarEventSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const monthQuery = useMemo(
    () => buildMonthQuery(displayMonth),
    [displayMonth],
  );

  const canSubmit = useMemo(
    () =>
      formState.title.trim().length > 0 &&
      formState.content.trim().length > 0 &&
      formState.startAt.trim().length > 0 &&
      formState.endAt.trim().length > 0,
    [formState.content, formState.endAt, formState.startAt, formState.title],
  );

  /**
   * 현재 월과 트랙 조건에 맞는 일정 목록을 조회합니다.
   */
  const load = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await getAdminCalendarEvents({
        from: monthQuery.from,
        to: monthQuery.to,
        track: trackFilter === "ALL" ? undefined : trackFilter,
      });

      const nextRows = [...response.events].sort(
        (a, b) => Date.parse(a.startAt) - Date.parse(b.startAt),
      );

      setRows(nextRows);
    } catch {
      setRows([]);
      setErrorMessage("일정 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [monthQuery.from, monthQuery.to, trackFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  /**
   * 일정 생성 후 입력 폼을 비웁니다.
   */
  const resetForm = () => {
    setFormState((prev) => buildDefaultFormState(prev.track, todayDateKey));
  };

  /**
   * 새 일정을 생성합니다.
   */
  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit || isSubmitting) {
      return;
    }

    const normalizedStartAt = toApiDateTimeValue(formState.startAt);
    const normalizedEndAt = toApiDateTimeValue(formState.endAt);

    if (normalizedStartAt > normalizedEndAt) {
      setErrorMessage("종료 일시는 시작 일시보다 빠를 수 없습니다.");
      setSuccessMessage("");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await createAdminCalendarEvent({
        title: formState.title.trim(),
        content: formState.content.trim(),
        track: formState.track,
        startAt: normalizedStartAt,
        endAt: normalizedEndAt,
      });

      setSuccessMessage(response.result || "일정을 생성했습니다.");
      resetForm();
      await load();
    } catch {
      setErrorMessage("일정 생성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 목록에 있는 일정을 삭제합니다.
   * @param eventId 삭제할 일정 Id
   */
  const handleDelete = async (eventId: number) => {
    if (
      isSubmitting ||
      !confirm("이 일정을 삭제할까요? 삭제 후 마이페이지 목록에서도 사라집니다.")
    ) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await deleteAdminCalendarEvent(eventId);
      setSuccessMessage(response.result || "일정을 삭제했습니다.");
      await load();
    } catch {
      setErrorMessage("일정 삭제에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="staff-calendar-manage"
      className="rounded-xl border border-[#43485a] bg-[#363c4a] p-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">캘린더 일정 관리</h2>
          <p className="mt-1 text-sm text-gray-4">
            마이페이지 캘린더에 노출되는 일정을 생성하고, 월별 목록에서 바로 삭제할 수 있습니다.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-lg bg-[#485165] px-4 py-2 text-sm font-semibold"
        >
          목록 새로고침
        </button>
      </div>

      {(errorMessage || successMessage) && (
        <div className="mt-3 space-y-1">
          {errorMessage ? (
            <p className="text-sm text-[#ff9ea8]">{errorMessage}</p>
          ) : null}
          {successMessage ? (
            <p className="text-sm text-[#8fd3ff]">{successMessage}</p>
          ) : null}
        </div>
      )}

      <div className="mt-5 grid gap-4 xl:grid-cols-[380px_1fr]">
        <form
          onSubmit={handleCreate}
          className="rounded-xl border border-[#4a5061] bg-[#2f3440] p-4"
        >
          <h3 className="text-base font-semibold">새 일정 작성</h3>
          <p className="mt-1 text-xs text-gray-4">
            일정 제목, 설명, 트랙, 시작/종료 시간을 입력해 즉시 등록합니다.
          </p>

          <select
            value={formState.track}
            onChange={(event) =>
              setFormState((prev) => ({
                ...prev,
                track: event.target.value as AdminCalendarTrack,
              }))
            }
            className="mt-3 h-11 w-full rounded-md border border-[#5d6478] bg-[#454c5d] px-3 text-sm outline-none"
          >
            {CREATE_TRACK_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <input
            value={formState.title}
            onChange={(event) =>
              setFormState((prev) => ({
                ...prev,
                title: event.target.value,
              }))
            }
            placeholder="일정 제목"
            className="mt-3 h-11 w-full rounded-md border border-[#5d6478] bg-[#454c5d] px-3 text-sm outline-none"
          />

          <textarea
            value={formState.content}
            onChange={(event) =>
              setFormState((prev) => ({
                ...prev,
                content: event.target.value,
              }))
            }
            rows={5}
            placeholder="일정 설명"
            className="mt-3 w-full rounded-md border border-[#5d6478] bg-[#454c5d] p-3 text-sm outline-none"
          />

          <div className="mt-3 grid gap-3">
            <label className="space-y-1">
              <span className="block text-xs text-gray-4">시작 일시</span>
              <input
                type="datetime-local"
                value={formState.startAt}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    startAt: event.target.value,
                  }))
                }
                className="h-11 w-full rounded-md border border-[#5d6478] bg-[#454c5d] px-3 text-sm outline-none"
              />
            </label>

            <label className="space-y-1">
              <span className="block text-xs text-gray-4">종료 일시</span>
              <input
                type="datetime-local"
                value={formState.endAt}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    endAt: event.target.value,
                  }))
                }
                className="h-11 w-full rounded-md border border-[#5d6478] bg-[#454c5d] px-3 text-sm outline-none"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={!canSubmit || isSubmitting}
            className="mt-4 rounded-lg bg-main-1 px-5 py-2 text-sm font-semibold disabled:opacity-60"
          >
            {isSubmitting ? "처리 중..." : "일정 생성"}
          </button>
        </form>

        <section className="rounded-xl border border-[#4a5061] bg-[#2f3440] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold">
                {formatYearMonthLabel(displayMonth)} 일정 목록
              </h3>
              <p className="mt-1 text-xs text-gray-4">
                {getTrackLabel(trackFilter)} · {rows.length.toLocaleString("ko-KR")}건
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setDisplayMonth((prev) => moveDisplayMonth(prev, -1))
                }
                className="rounded-md bg-[#485165] px-3 py-2 text-xs font-semibold"
              >
                이전 달
              </button>
              <button
                type="button"
                onClick={() =>
                  setDisplayMonth((prev) => moveDisplayMonth(prev, 1))
                }
                className="rounded-md bg-[#485165] px-3 py-2 text-xs font-semibold"
              >
                다음 달
              </button>
              <select
                value={trackFilter}
                onChange={(event) =>
                  setTrackFilter(
                    event.target.value as AdminCalendarTrackFilter,
                  )
                }
                className="h-10 rounded-md border border-[#5d6478] bg-[#454c5d] px-3 text-xs outline-none"
              >
                {TRACK_FILTER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isLoading ? (
            <p className="mt-4 text-sm text-gray-4">불러오는 중...</p>
          ) : null}

          {!isLoading && rows.length === 0 ? (
            <p className="mt-4 text-sm text-gray-4">
              선택한 조건에 해당하는 일정이 없습니다.
            </p>
          ) : null}

          {rows.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {rows.map((item) => (
                <li
                  key={item.id}
                  className="rounded-lg border border-[#43485a] bg-[#3a4150] px-3 py-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getTrackBadgeClassName(
                            item.track,
                          )}`}
                        >
                          {getTrackLabel(item.track)}
                        </span>
                        <span className="text-xs text-gray-4">
                          {formatDateTimeRangeLabel(item.startAt, item.endAt)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-semibold">{item.title}</p>
                      <p className="mt-1 whitespace-pre-wrap text-xs text-gray-3">
                        {item.content}
                      </p>
                      <p className="mt-2 text-[11px] text-gray-4">
                        등록: {formatDateTimeLabel(item.createdAt)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => void handleDelete(item.id)}
                      disabled={isSubmitting}
                      className="rounded-md bg-[#a63f4a] px-3 py-2 text-xs font-semibold disabled:opacity-60"
                    >
                      삭제
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </div>
    </section>
  );
}
