"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getNoticeList, getProjectList, getQnaList } from "../api";
import type { MyPageUser, ProjectListItem } from "../types";

const POSTS_PAGE_SIZE = 6;
const MAX_FETCH_SIZE = 100;
const MAX_EVENT_LIST_SIZE = 5;
const KST_TIME_ZONE = "Asia/Seoul";
const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"] as const;

const KST_DATE_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: KST_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

type KstDateParts = {
  year: number;
  month: number;
  day: number;
};

type ActivityPostCategory = "질의응답" | "커뮤니티";

type ActivityPostItem = {
  id: string;
  category: ActivityPostCategory;
  title: string;
  createdAt: string;
  href: string;
};

type EventType = "SCHEDULE" | "HOMEWORK";

type CalendarEvent = {
  id: string;
  type: EventType;
  title: string;
  dateParts: KstDateParts;
  dateKey: string;
  daySerial: number;
};

type DisplayMonth = {
  year: number;
  month: number;
};

type DayMarker = "none" | "today" | "schedule" | "homework";

type CalendarCell = {
  day: number | null;
  dateKey: string | null;
  marker: DayMarker;
  weekdayIndex: number;
};

function getDatePart(
  parts: Intl.DateTimeFormatPart[],
  type: "year" | "month" | "day",
): number {
  return Number(parts.find((part) => part.type === type)?.value ?? "0");
}

function toKstDateParts(value: Date): KstDateParts {
  const parts = KST_DATE_FORMATTER.formatToParts(value);
  return {
    year: getDatePart(parts, "year"),
    month: getDatePart(parts, "month"),
    day: getDatePart(parts, "day"),
  };
}

function parseKstDateParts(value: string): KstDateParts | null {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return toKstDateParts(parsed);
}

function toDateKey(parts: KstDateParts): string {
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(
    parts.day,
  ).padStart(2, "0")}`;
}

function toDaySerial(parts: KstDateParts): number {
  return Math.floor(Date.UTC(parts.year, parts.month - 1, parts.day) / DAY_MS);
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function getMondayFirstWeekday(year: number, month: number, day = 1): number {
  const sundayFirstWeekday = new Date(
    Date.UTC(year, month - 1, day),
  ).getUTCDay();
  return (sundayFirstWeekday + 6) % 7;
}

function toMonthLabel(month: number): string {
  return `${month}월`;
}

function formatMonthDay(parts: KstDateParts): string {
  return `${parts.month}. ${String(parts.day).padStart(2, "0")}`;
}

function formatDday(daySerial: number, todaySerial: number): string {
  const diff = daySerial - todaySerial;
  if (diff === 0) {
    return "D-Day";
  }
  if (diff > 0) {
    return `D-${diff}`;
  }
  return `D+${Math.abs(diff)}`;
}

function buildPostPageTokens(
  currentPage: number,
  totalPages: number,
): string[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => String(index + 1));
  }

  const tokens: string[] = ["1"];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) {
    tokens.push("...");
  }

  for (let page = start; page <= end; page += 1) {
    tokens.push(String(page));
  }

  if (end < totalPages - 1) {
    tokens.push("...");
  }

  tokens.push(String(totalPages));
  return tokens;
}

function getCalendarEvents(projects: ProjectListItem[]): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  projects.forEach((project) => {
    const startDateParts = parseKstDateParts(project.startDate);
    if (startDateParts) {
      events.push({
        id: `schedule-${project.id}-${toDateKey(startDateParts)}`,
        type: "SCHEDULE",
        title: project.title,
        dateParts: startDateParts,
        dateKey: toDateKey(startDateParts),
        daySerial: toDaySerial(startDateParts),
      });
    }

    const deadlineDateParts = parseKstDateParts(project.deadline);
    if (deadlineDateParts) {
      events.push({
        id: `homework-${project.id}-${toDateKey(deadlineDateParts)}`,
        type: "HOMEWORK",
        title: project.title,
        dateParts: deadlineDateParts,
        dateKey: toDateKey(deadlineDateParts),
        daySerial: toDaySerial(deadlineDateParts),
      });
    }
  });

  return events.sort((a, b) => a.daySerial - b.daySerial);
}

function getCalendarCells(
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

type MyActivityTabProps = {
  user: MyPageUser;
};

export default function MyActivityTab({ user }: MyActivityTabProps) {
  const router = useRouter();
  const [postItems, setPostItems] = useState<ActivityPostItem[]>([]);
  const [isPostsLoading, setIsPostsLoading] = useState(true);
  const [postsErrorMessage, setPostsErrorMessage] = useState("");
  const [postPage, setPostPage] = useState(1);

  const [projectItems, setProjectItems] = useState<ProjectListItem[]>([]);
  const [isScheduleLoading, setIsScheduleLoading] = useState(true);
  const [scheduleErrorMessage, setScheduleErrorMessage] = useState("");

  const todayParts = useMemo(() => toKstDateParts(new Date()), []);
  const todayDateKey = useMemo(() => toDateKey(todayParts), [todayParts]);
  const todayDaySerial = useMemo(() => toDaySerial(todayParts), [todayParts]);

  const [displayMonth, setDisplayMonth] = useState<DisplayMonth>({
    year: todayParts.year,
    month: todayParts.month,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchActivityPosts = async () => {
      setIsPostsLoading(true);
      setPostsErrorMessage("");

      try {
        const [qnaResult, noticeResult] = await Promise.allSettled([
          getQnaList({
            page: 0,
            size: MAX_FETCH_SIZE,
            part: user.track && user.track !== "ETC" ? user.track : undefined,
          }),
          getNoticeList({
            page: 0,
            size: MAX_FETCH_SIZE,
            part: user.track && user.track !== "ETC" ? user.track : undefined,
          }),
        ]);

        if (!isMounted) {
          return;
        }

        const nextItems: ActivityPostItem[] = [];

        if (qnaResult.status === "fulfilled") {
          qnaResult.value.qnaList.forEach((qnaItem) => {
            nextItems.push({
              id: `qna-${qnaItem.qnaId}`,
              category: "질의응답",
              title: qnaItem.title,
              createdAt: qnaItem.updatedAt || qnaItem.createdAt,
              href: `/community/qna/${qnaItem.qnaId}`,
            });
          });
        }

        if (noticeResult.status === "fulfilled") {
          noticeResult.value.noticeList.forEach((noticeItem) => {
            nextItems.push({
              id: `notice-${noticeItem.noticeId}`,
              category: "커뮤니티",
              title: noticeItem.title,
              createdAt: noticeItem.createdAt,
              href: `/notice/${noticeItem.noticeId}`,
            });
          });
        }

        nextItems.sort(
          (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
        );

        setPostItems(nextItems);
        setPostPage(1);

        if (
          qnaResult.status === "rejected" &&
          noticeResult.status === "rejected"
        ) {
          setPostsErrorMessage(
            "게시글을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.",
          );
        }
      } catch {
        if (!isMounted) {
          return;
        }
        setPostItems([]);
        setPostsErrorMessage(
          "게시글을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.",
        );
      } finally {
        if (isMounted) {
          setIsPostsLoading(false);
        }
      }
    };

    fetchActivityPosts();

    return () => {
      isMounted = false;
    };
  }, [user.track]);

  useEffect(() => {
    let isMounted = true;

    const fetchProjectSchedule = async () => {
      setIsScheduleLoading(true);
      setScheduleErrorMessage("");

      const requests = [getProjectList()];
      if (user.track && user.track !== "ETC") {
        requests.push(getProjectList({ track: user.track }));
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
            const normalizedStatus = String(projectItem.status).toUpperCase();
            if (normalizedStatus === "INACTIVE") {
              return;
            }
            mergedMap.set(projectItem.id, projectItem);
          });
        });

        setProjectItems(Array.from(mergedMap.values()));

        if (successCount === 0) {
          setScheduleErrorMessage(
            "일정을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.",
          );
        }
      } catch {
        if (!isMounted) {
          return;
        }
        setProjectItems([]);
        setScheduleErrorMessage(
          "일정을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.",
        );
      } finally {
        if (isMounted) {
          setIsScheduleLoading(false);
        }
      }
    };

    fetchProjectSchedule();

    return () => {
      isMounted = false;
    };
  }, [user.track]);

  const totalPostPages = Math.max(
    1,
    Math.ceil(postItems.length / POSTS_PAGE_SIZE),
  );

  useEffect(() => {
    if (postPage > totalPostPages) {
      setPostPage(totalPostPages);
    }
  }, [postPage, totalPostPages]);

  const pagedPostItems = useMemo(() => {
    const startIndex = (postPage - 1) * POSTS_PAGE_SIZE;
    return postItems.slice(startIndex, startIndex + POSTS_PAGE_SIZE);
  }, [postItems, postPage]);

  const postPageTokens = useMemo(
    () => buildPostPageTokens(postPage, totalPostPages),
    [postPage, totalPostPages],
  );

  const calendarEvents = useMemo(
    () => getCalendarEvents(projectItems),
    [projectItems],
  );

  const scheduleEvents = useMemo(
    () =>
      calendarEvents
        .filter((item) => item.type === "SCHEDULE")
        .sort((a, b) => a.daySerial - b.daySerial),
    [calendarEvents],
  );

  const homeworkEvents = useMemo(
    () =>
      calendarEvents
        .filter((item) => item.type === "HOMEWORK")
        .sort((a, b) => a.daySerial - b.daySerial),
    [calendarEvents],
  );

  const scheduleDateKeys = useMemo(
    () => new Set(scheduleEvents.map((item) => item.dateKey)),
    [scheduleEvents],
  );

  const homeworkDateKeys = useMemo(
    () => new Set(homeworkEvents.map((item) => item.dateKey)),
    [homeworkEvents],
  );

  const calendarCells = useMemo(
    () =>
      getCalendarCells(
        displayMonth,
        todayDateKey,
        scheduleDateKeys,
        homeworkDateKeys,
      ),
    [displayMonth, todayDateKey, scheduleDateKeys, homeworkDateKeys],
  );

  const todayEvents = useMemo(
    () => calendarEvents.filter((item) => item.dateKey === todayDateKey),
    [calendarEvents, todayDateKey],
  );

  const upcomingScheduleEvents = useMemo(
    () =>
      scheduleEvents
        .filter((item) => item.daySerial >= todayDaySerial)
        .slice(0, MAX_EVENT_LIST_SIZE),
    [scheduleEvents, todayDaySerial],
  );

  const upcomingHomeworkEvents = useMemo(
    () =>
      homeworkEvents
        .filter((item) => item.daySerial >= todayDaySerial)
        .slice(0, MAX_EVENT_LIST_SIZE),
    [homeworkEvents, todayDaySerial],
  );

  const handlePostRowClick = (href: string) => {
    router.push(href);
  };

  const moveMonth = (delta: number) => {
    setDisplayMonth((prev) => {
      const nextMonth = prev.month + delta;
      if (nextMonth < 1) {
        return {
          year: prev.year - 1,
          month: 12,
        };
      }
      if (nextMonth > 12) {
        return {
          year: prev.year + 1,
          month: 1,
        };
      }
      return {
        year: prev.year,
        month: nextMonth,
      };
    });
  };

  return (
    <div className="mt-6 space-y-8">
      <section>
        <h3 className="text-[24px] font-bold text-white">내가 쓴 글</h3>
        <div className="mt-3 rounded-[8px] border border-white/10 bg-[#363944]">
          <div className="grid grid-cols-[120px_minmax(0,1fr)] border-b border-white/10 px-4 py-3 text-[12px] text-white/55 lg:text-[13px]">
            <span className="font-medium">카테고리</span>
            <span className="font-medium">제목</span>
          </div>

          {isPostsLoading ? (
            <p className="px-4 py-8 text-center text-[13px] text-white/70">
              게시글을 불러오는 중입니다.
            </p>
          ) : null}

          {!isPostsLoading && postsErrorMessage ? (
            <p className="px-4 py-8 text-center text-[13px] text-[#ff9ea8]">
              {postsErrorMessage}
            </p>
          ) : null}

          {!isPostsLoading &&
          !postsErrorMessage &&
          pagedPostItems.length === 0 ? (
            <p className="px-4 py-8 text-center text-[13px] text-white/70">
              표시할 게시글이 없습니다.
            </p>
          ) : null}

          {!isPostsLoading && !postsErrorMessage ? (
            <ul>
              {pagedPostItems.map((postItem) => (
                <li
                  key={postItem.id}
                  className="border-b border-white/5 last:border-b-0"
                >
                  <button
                    type="button"
                    onClick={() => handlePostRowClick(postItem.href)}
                    className="grid w-full grid-cols-[120px_minmax(0,1fr)] items-center px-4 py-3 text-left text-[12px] transition-colors hover:bg-white/5 lg:text-[13px]"
                  >
                    <span className="text-white/75">{postItem.category}</span>
                    <span className="truncate text-white/90">
                      {postItem.title}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {!isPostsLoading && !postsErrorMessage && postItems.length > 0 ? (
          <div className="mt-4 flex items-center justify-center gap-2 text-[12px] text-white/65">
            <button
              type="button"
              onClick={() => setPostPage((prev) => Math.max(prev - 1, 1))}
              disabled={postPage === 1}
              className="rounded px-2 py-1 disabled:opacity-35"
            >
              이전
            </button>

            {postPageTokens.map((token, index) => {
              if (token === "...") {
                return (
                  <span key={`${token}-${index}`} className="px-1">
                    ...
                  </span>
                );
              }

              const pageNumber = Number(token);
              const isActivePage = pageNumber === postPage;

              return (
                <button
                  key={token}
                  type="button"
                  onClick={() => setPostPage(pageNumber)}
                  className={`h-7 min-w-7 rounded px-2 ${
                    isActivePage
                      ? "bg-main-1 font-semibold text-white"
                      : "text-white/65 hover:bg-white/10"
                  }`}
                >
                  {token}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() =>
                setPostPage((prev) => Math.min(prev + 1, totalPostPages))
              }
              disabled={postPage >= totalPostPages}
              className="rounded px-2 py-1 disabled:opacity-35"
            >
              다음
            </button>
          </div>
        ) : null}
      </section>

      <section>
        <h3 className="text-[24px] font-bold text-white">
          멋쟁이 사자처럼 일정
        </h3>
        <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div className="rounded-[8px] bg-[#4A4E5A] p-4">
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => moveMonth(-1)}
                className="rounded px-2 py-1 text-white/70 transition-colors hover:bg-white/10"
                aria-label="이전 달"
              >
                &lt;
              </button>
              <p className="text-[26px] font-semibold text-white">
                {toMonthLabel(displayMonth.month)}
              </p>
              <button
                type="button"
                onClick={() => moveMonth(1)}
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

                return (
                  <span
                    key={cell.dateKey}
                    className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-medium ${markerClassName} ${weekdayTextClassName}`}
                  >
                    {cell.day}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <div className="rounded-[8px] bg-[#4A4E5A] px-4 py-3">
              <p className="text-[14px] font-semibold text-white/85">TODAY</p>
              <div className="mt-2 rounded-[5px] bg-white/20 px-3 py-2 text-[12px] text-white/85">
                {isScheduleLoading ? (
                  <p>일정을 불러오는 중입니다.</p>
                ) : todayEvents.length === 0 ? (
                  <p>오늘 일정은 없습니다.</p>
                ) : (
                  <ul className="space-y-1">
                    {todayEvents.map((eventItem) => (
                      <li key={eventItem.id}>
                        {eventItem.type === "SCHEDULE" ? "일정" : "과제"} ·{" "}
                        {eventItem.title}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="rounded-[8px] bg-[#4A4E5A] px-4 py-3">
              <p className="text-[14px] font-semibold text-white/85">
                Schedule
              </p>
              <ul className="mt-2 space-y-1.5">
                {upcomingScheduleEvents.length > 0 ? (
                  upcomingScheduleEvents.map((eventItem) => (
                    <li
                      key={eventItem.id}
                      className="grid grid-cols-[60px_minmax(0,1fr)_46px] items-center gap-2 rounded-[5px] bg-white/20 px-3 py-1.5 text-[12px] text-white/85"
                    >
                      <span>{formatMonthDay(eventItem.dateParts)}</span>
                      <span className="truncate">{eventItem.title}</span>
                      <span className="text-right text-white/70">
                        {formatDday(eventItem.daySerial, todayDaySerial)}
                      </span>
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
              </p>
              <ul className="mt-2 space-y-1.5">
                {upcomingHomeworkEvents.length > 0 ? (
                  upcomingHomeworkEvents.map((eventItem) => (
                    <li
                      key={eventItem.id}
                      className="grid grid-cols-[60px_minmax(0,1fr)_46px] items-center gap-2 rounded-[5px] bg-white/20 px-3 py-1.5 text-[12px] text-white/85"
                    >
                      <span>{formatMonthDay(eventItem.dateParts)}</span>
                      <span className="truncate">{eventItem.title}</span>
                      <span className="text-right text-white/70">
                        {formatDday(eventItem.daySerial, todayDaySerial)}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="rounded-[5px] bg-white/20 px-3 py-2 text-[12px] text-white/70">
                    등록된 과제 마감일이 없습니다.
                  </li>
                )}
              </ul>
            </div>

            {!isScheduleLoading && scheduleErrorMessage ? (
              <p className="text-center text-[12px] text-[#ff9ea8]">
                {scheduleErrorMessage}
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
