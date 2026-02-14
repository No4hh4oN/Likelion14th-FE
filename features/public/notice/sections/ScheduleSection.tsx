import React from "react";
import clsx from "clsx";

type DayType =
  | "disabled"
  | "blue-start"
  | "blue-mid"
  | "blue-end"
  | "dark-start"
  | "dark-mid"
  | "dark-end"
  | "orange";

/** 이벤트 id
 * - document: 서류 모집
 * - documentResult: 서류 결과 발표
 * - interview: 면접
 * - finalResult: 최종 결과 발표
 */
type EventId = "document" | "documentResult" | "interview" | "finalResult";

interface CalendarDay {
  label: number | string;
  type: DayType;
  calloutId?: EventId;
}

/** 일정 이벤트 정보 타입
 * - id: EventId (document, documentResult, interview, finalResult)
 * - title: 이벤트 제목
 * - dateText: 이벤트 날짜 텍스트
 */
interface ScheduleEvent {
  id: EventId;
  title: string;
  dateText: string;
}

const WEEK_DAYS = ["일", "월", "화", "수", "목", "금", "토"];

const SCHEDULE_EVENTS: ScheduleEvent[] = [
  { id: "document", title: "서류 모집", dateText: "2/23(월) - 3/12(목)" },
  { id: "documentResult", title: "서류 결과 발표", dateText: "3/13(금) 10:00" },
  { id: "interview", title: "면접", dateText: "3/15(일) - 3/17(화)" },
  { id: "finalResult", title: "최종 결과 발표", dateText: "3/18(수) 10:00" },
];

/** 달력 날짜 데이터 하드코딩 */
const CALENDAR_DAYS: CalendarDay[] = [
  { label: 22, type: "disabled" },
  { label: 23, type: "blue-start" },
  { label: 24, type: "blue-mid" },
  { label: 25, type: "blue-mid" },
  { label: 26, type: "blue-mid" },
  { label: 27, type: "blue-mid" },
  { label: 28, type: "blue-end" },

  { label: "3/1", type: "blue-start", calloutId: "document" },
  { label: 2, type: "blue-mid" },
  { label: 3, type: "blue-mid" },
  { label: 4, type: "blue-mid" },
  { label: 5, type: "blue-mid" },
  { label: 6, type: "blue-mid" },
  { label: 7, type: "blue-end" },

  { label: 8, type: "blue-start" },
  { label: 9, type: "blue-mid" },
  { label: 10, type: "blue-mid" },
  { label: 11, type: "blue-mid" },
  { label: 12, type: "blue-end" },
  { label: 13, type: "orange", calloutId: "documentResult" },
  { label: 14, type: "disabled" },

  { label: 15, type: "dark-start", calloutId: "interview" },
  { label: 16, type: "dark-mid" },
  { label: 17, type: "dark-end" },
  { label: 18, type: "orange", calloutId: "finalResult" },
  { label: 19, type: "disabled" },
  { label: 20, type: "disabled" },
  { label: 21, type: "disabled" },
];

/** 날짜셀 타입별 스타일 */
const DAY_CLASS_BY_TYPE: Record<DayType, string> = {
  "blue-start": "bg-main-1 text-white rounded-l-full ml-0.5",
  "blue-mid": "bg-main-1 text-white",
  "blue-end": "bg-main-1 text-white rounded-r-full mr-0.5",
  "dark-start": "bg-main-2 text-white rounded-l-full ml-0.5",
  "dark-mid": "bg-main-2 text-white",
  "dark-end": "bg-main-2 text-white rounded-r-full mr-0.5",
  orange:
    "mx-auto h-[30px] w-[30px] rounded-full bg-main-3 text-main-2 sm:h-11 sm:w-11 lg:h-[80px] lg:w-[80px]",
  disabled: "text-gray-4",
};

/** 이벤트별 스타일
 * - title: 제목 색상
 * - dot: 점 색상
 * - line: 선 색상
 * - date: 날짜 텍스트 색상
 */
const EVENT_CLASS_BY_ID: Record<
  EventId,
  { title: string; dot: string; line: string; date: string }
> = {
  document: {
    title: "text-main-1",
    dot: "bg-main-1",
    line: "border-main-1/60",
    date: "text-gray-5 lg:text-main-1/80",
  },
  documentResult: {
    title: "text-main-3",
    dot: "bg-main-3",
    line: "border-main-3/70",
    date: "text-gray-5 lg:text-main-3/80",
  },
  interview: {
    title: "text-main-2",
    dot: "bg-main-2",
    line: "border-main-2/70",
    date: "text-gray-5 lg:text-main-2/80",
  },
  finalResult: {
    title: "text-main-3",
    dot: "bg-main-3",
    line: "border-main-3/70",
    date: "text-gray-5 lg:text-main-3/80",
  },
};

/** 날짜셀 기본 공통 스타일 */
const getDayClassName = (type: DayType) => {
  return clsx(
    "relative z-10 flex h-[30px] items-center justify-center text-[14px] font-medium lg:h-[80px] lg:text-[36px]",
    DAY_CLASS_BY_TYPE[type],
  );
};

interface DesktopOrangeCalloutProps {
  event: ScheduleEvent;
  horizontalWidthClassName: string;
  verticalHeightClassName: string;
  labelClassName: string;
}

/** 결과 발표 L자 어노테이션 그리는 컴포넌트
 * - event: 어떤 이벤트 문구/색을 쓸지 (ScheduleEvent)
 * - horizontalWidthClassName: 가로 점선 길이 클래스
 * - verticalHeightClassName: 세로 점선 길이 클래스
 * - labelClassName: 텍스트 박스 위치 클래스
 */
const DesktopOrangeCallout = ({
  event,
  horizontalWidthClassName,
  verticalHeightClassName,
  labelClassName,
}: DesktopOrangeCalloutProps) => {
  /** 이벤트 id(documentResult, finalResult)로 스타일 프리셋 조회 */
  const eventStyle = EVENT_CLASS_BY_ID[event.id];

  return (
    <div className="pointer-events-none absolute left-1/2 top-full z-20 hidden lg:block">
      <div
        className={clsx(
          "w-0 border-l-2 border-dashed",
          eventStyle.line,
          verticalHeightClassName,
        )}
      />
      <div className="relative">
        <div
          className={clsx(
            "border-t-2 border-dashed",
            eventStyle.line,
            horizontalWidthClassName,
          )}
        />
        <span
          className={clsx(
            "absolute -right-1 -top-[3px] size-2 rounded-full",
            eventStyle.dot,
          )}
        />
        <div className={clsx("absolute w-max text-left", labelClassName)}>
          <p className={clsx("lg:text-[32px] font-bold", eventStyle.title)}>
            {event.title}
          </p>
          <p className={clsx("text-[24px] font-normal", eventStyle.date)}>
            {event.dateText}
          </p>
        </div>
      </div>
    </div>
  );
};

interface DesktopLeftCalloutProps {
  event: ScheduleEvent;
}

const DesktopLeftCallout = ({ event }: DesktopLeftCalloutProps) => {
  const eventStyle = EVENT_CLASS_BY_ID[event.id];

  return (
    <div className="pointer-events-none absolute right-full top-1/2 z-20 hidden w-max translate-x-[2px] -translate-y-1/2 items-center lg:flex">
      <div className="text-right whitespace-nowrap">
        <p className={clsx("text-[32px] font-semibold", eventStyle.title)}>
          {event.title}
        </p>
        <p className={clsx("text-[24px] font-normal", eventStyle.date)}>
          {event.dateText}
        </p>
      </div>
      <div className="ml-5 flex items-center">
        <span className={clsx("size-2 rounded-full", eventStyle.dot)} />
        <div
          className={clsx("w-24 border-t-2 border-dashed", eventStyle.line)}
        />
      </div>
    </div>
  );
};

const ScheduleSection = () => {
  const documentEvent = SCHEDULE_EVENTS[0];
  const documentResultEvent = SCHEDULE_EVENTS[1];
  const interviewEvent = SCHEDULE_EVENTS[2];
  const finalResultEvent = SCHEDULE_EVENTS[3];

  return (
    <section className="w-full bg-foreground pt-[108px] sm:pt-[286px]">
      <div className="mx-auto w-full px-[20px] max-w-[1080px]">
        <h2 className="text-center text-[22px] font-semibold text-background sm:text-4xl">
          14기 아기사자 <span className="text-main-1">모집 일정</span>
        </h2>

        <div className="relative mt-[57px] lg:mt-[96px] lg:px-[158px]">
          <div className="grid grid-cols-7 text-center text-[14px] font-medium text-gray-5 sm:text-[36px]">
            {WEEK_DAYS.map((weekDay) => (
              <div key={weekDay}>{weekDay}</div>
            ))}
          </div>

          <div className="relative mt-[24px] lg:mt-[42px]">
            <div className="grid grid-cols-7 gap-y-[18px] lg:gap-y-[25px] text-center">
              {CALENDAR_DAYS.map((day, index) => (
                <div
                  key={`${day.label}-${index}`}
                  className={getDayClassName(day.type)}
                >
                  {day.label}

                  {day.calloutId === "documentResult" && (
                    <DesktopOrangeCallout
                      event={documentResultEvent}
                      verticalHeightClassName="h-5"
                      horizontalWidthClassName="w-[190px]"
                      labelClassName="left-[calc(100%+14px)] -top-5"
                    />
                  )}

                  {day.calloutId === "finalResult" && (
                    <DesktopOrangeCallout
                      event={finalResultEvent}
                      verticalHeightClassName="h-7"
                      horizontalWidthClassName="w-[64px]"
                      labelClassName="left-[calc(100%+14px)] -top-5"
                    />
                  )}

                  {day.calloutId === "document" && (
                    <DesktopLeftCallout event={documentEvent} />
                  )}

                  {day.calloutId === "interview" && (
                    <DesktopLeftCallout event={interviewEvent} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* 모바일버전 SCHEDULE_EVENTS 정보 */}
        <ul className="mt-10 space-y-4 px-2 lg:hidden">
          {SCHEDULE_EVENTS.map((event) => {
            const eventStyle = EVENT_CLASS_BY_ID[event.id];
            return (
              <li key={event.id} className="flex items-start gap-2">
                <span
                  className={clsx(
                    "mt-2 size-2 shrink-0 rounded-full",
                    eventStyle.dot,
                  )}
                />
                <p className="text-lg leading-tight sm:text-2xl">
                  <span className={clsx("font-semibold", eventStyle.title)}>
                    {event.title}
                  </span>
                  <span
                    className={clsx(
                      "ml-2.5 font-normal text-[14px] text-gray-5",
                      eventStyle.date,
                    )}
                  >
                    {event.dateText}
                  </span>
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

export default ScheduleSection;
