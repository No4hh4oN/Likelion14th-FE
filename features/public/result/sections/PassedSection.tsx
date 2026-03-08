"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import type { InterviewReservation, InterviewSlot } from "../type";

/**
 * 서류 합격 후 면접 일정을 선택하는 섹션에서 사용하는 props입니다.
 */
type PassedSectionProps = {
  slots: InterviewSlot[];
  reservation: InterviewReservation | null;
  canReserve: boolean;
  isReserving: boolean;
  reserveErrorMessage: string;
  reserveSuccessMessage: string;
  onReserve: (slotId: number) => Promise<void>;
};

/**
 * 서버 시간이 타임존 없이 내려오는 경우 KST로 보정하기 위한 패턴입니다.
 */
const DATE_WITH_TZ_PATTERN = /(Z|[+-]\d{2}:\d{2})$/;

/**
 * 면접 슬롯을 한국 시간 기준으로 화면에 표시하기 위한 포맷터입니다.
 */
const KST_DATE_TIME_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/**
 * 타임존 정보가 없는 날짜 문자열을 KST로 간주해 Date 객체로 변환합니다.
 *
 * @param value 서버에서 내려준 날짜 문자열
 * @returns KST 기준으로 해석 가능한 Date 객체
 */
const parseDateWithKstFallback = (value: string) => {
  const normalized = DATE_WITH_TZ_PATTERN.test(value)
    ? value
    : `${value}+09:00`;
  return new Date(normalized);
};

/**
 * Intl 포맷 결과에서 원하는 타입의 값을 꺼냅니다.
 *
 * @param parts formatToParts 결과 배열
 * @param type 추출할 파트 타입
 * @returns 해당 타입의 문자열 값
 */
const getPart = (
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes,
) => parts.find((part) => part.type === type)?.value ?? "";

/**
 * 면접 슬롯 날짜를 연/월/일/시/분 단위 문자열로 분해합니다.
 *
 * @param value 서버 날짜 문자열
 * @returns KST 기준 날짜 파트
 */
const getKstDateTimeParts = (value: string) => {
  const parts = KST_DATE_TIME_FORMATTER.formatToParts(
    parseDateWithKstFallback(value),
  );

  return {
    year: getPart(parts, "year"),
    month: getPart(parts, "month"),
    day: getPart(parts, "day"),
    hour: getPart(parts, "hour"),
    minute: getPart(parts, "minute"),
  };
};

/**
 * 슬롯 시작 시각을 `YYYY-MM-DD` 형식의 키로 변환합니다.
 *
 * @param value 서버 날짜 문자열
 * @returns 일 단위 식별 키
 */
const toDayKey = (value: string) => {
  const { year, month, day } = getKstDateTimeParts(value);
  return `${year}-${month}-${day}`;
};

/**
 * 슬롯 시간을 `HH:mm` 형식으로 표시합니다.
 *
 * @param value 서버 날짜 문자열
 * @returns 시/분 문자열
 */
const formatTime = (value: string) => {
  const { hour, minute } = getKstDateTimeParts(value);
  return `${hour}:${minute}`;
};

/**
 * 일자 키에서 월 단위 키(`YYYY-MM`)를 추출합니다.
 *
 * @param dayKey 일 단위 키
 * @returns 월 단위 키
 */
const toMonthKey = (dayKey: string) => dayKey.slice(0, 7);

/**
 * 현재 보고 있는 달의 제목 문자열을 생성합니다.
 *
 * @param dayKey 월 정보를 포함한 날짜 키
 * @returns `N월` 형식의 문자열
 */
const formatMonthLabel = (dayKey: string | null) => {
  if (!dayKey) {
    return "-";
  }

  const month = Number(dayKey.split("-")[1]);
  return `${month}월`;
};

/**
 * 일자 키에서 화면에 표시할 숫자 일자를 추출합니다.
 *
 * @param dayKey 일 단위 키
 * @returns 날짜 숫자 문자열
 */
const formatDayLabel = (dayKey: string) => `${Number(dayKey.split("-")[2])}`;

/**
 * 달력 계산을 위해 일자 키를 Date 객체로 변환합니다.
 *
 * @param dayKey `YYYY-MM-DD` 형식의 일자 키
 * @returns UTC 계산이 가능한 Date 객체
 */
const parseDayKeyToDate = (dayKey: string) =>
  new Date(`${dayKey}T12:00:00+09:00`);

/**
 * Date 객체를 다시 일자 키로 변환합니다.
 *
 * @param date 계산에 사용된 Date 객체
 * @returns `YYYY-MM-DD` 형식의 일자 키
 */
const formatDayKey = (date: Date) => {
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * 기준 일자에서 지정한 일수만큼 이동한 키를 계산합니다.
 *
 * @param dayKey 기준 일자 키
 * @param amount 더하거나 뺄 일수
 * @returns 이동 후 일자 키
 */
const addDays = (dayKey: string, amount: number) => {
  const date = parseDayKeyToDate(dayKey);
  date.setUTCDate(date.getUTCDate() + amount);
  return formatDayKey(date);
};

/**
 * 특정 월의 첫째 날 키를 생성합니다.
 *
 * @param monthKey `YYYY-MM` 형식의 월 키
 * @returns 해당 월 1일의 일자 키
 */
const getMonthStartDayKey = (monthKey: string) => `${monthKey}-01`;

/**
 * 일자 키가 한국 시간 기준으로 무슨 요일인지 계산합니다.
 *
 * @param dayKey `YYYY-MM-DD` 형식의 일자 키
 * @returns `Date.getUTCDay()` 기준 요일 인덱스
 */
const getWeekdayFromDayKey = (dayKey: string) =>
  parseDayKeyToDate(dayKey).getUTCDay();

/**
 * 월 달력 렌더링에 필요한 첫 셀의 시작 일자를 계산합니다.
 * 월요일 시작 달력을 기준으로 이전 달 날짜까지 포함합니다.
 *
 * @param monthKey `YYYY-MM` 형식의 월 키
 * @returns 달력 첫 셀에 배치할 일자 키
 */
const getCalendarStartDayKey = (monthKey: string) => {
  const monthStartDayKey = getMonthStartDayKey(monthKey);
  const firstWeekday = parseDayKeyToDate(monthStartDayKey).getUTCDay();
  const offsetFromMonday = firstWeekday === 0 ? 6 : firstWeekday - 1;
  return addDays(monthStartDayKey, -offsetFromMonday);
};

/**
 * 시간 선택 버튼에 표시할 슬롯 라벨을 생성합니다.
 *
 * @param slot 면접 슬롯 정보
 * @returns `HH:mm-HH:mm` 형식의 문자열
 */
const getSlotLabel = (slot: InterviewSlot) => `${formatTime(slot.startAt)}`;

/**
 * 달력 헤더에 표시할 요일 라벨 목록입니다.
 */
const WEEKDAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"] as const;

/**
 * 서류 합격자에게 면접 일정을 선택하게 하는 화면입니다.
 *
 * @param props 면접 슬롯 목록, 예약 상태, 예약 액션 등 화면에 필요한 값
 * @returns 면접 시간 선택 섹션
 */
export default function PassedSection({
  slots,
  reservation,
  canReserve,
  isReserving,
  reserveErrorMessage,
  reserveSuccessMessage,
  onReserve,
}: PassedSectionProps) {
  /**
   * 슬롯 목록을 날짜별로 묶어 달력과 시간 선택 UI에서 재사용합니다.
   */
  const slotsByDay = useMemo(() => {
    const grouped: Record<string, InterviewSlot[]> = {};

    slots.forEach((slot) => {
      const dayKey = toDayKey(slot.startAt);
      if (!grouped[dayKey]) {
        grouped[dayKey] = [];
      }
      grouped[dayKey].push(slot);
    });

    Object.values(grouped).forEach((bucket) => {
      bucket.sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt));
    });

    return grouped;
  }, [slots]);

  const reservationDayKey = reservation ? toDayKey(reservation.startAt) : null;
  /**
   * 실제 슬롯이 존재하는 모든 날짜 키 목록입니다.
   */
  const dayKeys = useMemo(() => {
    const keys = new Set<string>();

    Object.keys(slotsByDay).forEach((dayKey) => {
      keys.add(dayKey);
    });

    if (reservationDayKey) {
      keys.add(reservationDayKey);
    }

    return Array.from(keys).sort((a, b) => a.localeCompare(b));
  }, [reservationDayKey, slotsByDay]);

  /**
   * 슬롯이 존재하는 월만 추려 월 이동에 사용합니다.
   */
  const monthKeys = useMemo(() => {
    const keys = new Set<string>();
    dayKeys.forEach((dayKey) => {
      keys.add(toMonthKey(dayKey));
    });
    return Array.from(keys).sort((a, b) => a.localeCompare(b));
  }, [dayKeys]);

  const firstDayWithSlot =
    dayKeys.find((key) => (slotsByDay[key] ?? []).length > 0) ??
    dayKeys[0] ??
    null;
  const initialMonthKey = firstDayWithSlot
    ? toMonthKey(firstDayWithSlot)
    : null;
  /**
   * 월을 바꿨을 때 자동 선택할 첫 예약 가능 날짜를 찾기 위한 매핑입니다.
   */
  const firstSelectableDayByMonth = useMemo(() => {
    const mapping: Record<string, string> = {};

    dayKeys.forEach((dayKey) => {
      const monthKey = toMonthKey(dayKey);
      if (!mapping[monthKey]) {
        mapping[monthKey] = dayKey;
      }
    });

    return mapping;
  }, [dayKeys]);

  const [manualSelectedDayKey, setManualSelectedDayKey] = useState<
    string | null
  >(null);
  const [viewedMonthKey, setViewedMonthKey] = useState<string | null>(
    reservationDayKey ? toMonthKey(reservationDayKey) : initialMonthKey,
  );
  const [manualSelectedSlotId, setManualSelectedSlotId] = useState<
    number | null
  >(null);
  const feedbackMessageRef = useRef<HTMLParagraphElement | null>(null);

  /**
   * 실제로 우측 시간 목록을 구성할 기준 날짜입니다.
   * 예약이 있으면 예약 날짜를 우선합니다.
   */
  const selectedDayKey =
    reservationDayKey ?? manualSelectedDayKey ?? firstDayWithSlot;
  /**
   * 현재 선택한 날짜에 속한 면접 슬롯 목록입니다.
   */
  const daySlots = useMemo(
    () => (selectedDayKey ? (slotsByDay[selectedDayKey] ?? []) : []),
    [selectedDayKey, slotsByDay],
  );
  const monthLabel = formatMonthLabel(
    viewedMonthKey
      ? `${viewedMonthKey}-01`
      : (selectedDayKey ?? firstDayWithSlot),
  );
  const currentMonthIndex = viewedMonthKey
    ? monthKeys.indexOf(viewedMonthKey)
    : -1;
  const canGoPrevMonth = currentMonthIndex > 0;
  const canGoNextMonth =
    currentMonthIndex >= 0 && currentMonthIndex < monthKeys.length - 1;
  /**
   * 현재 선택한 면접 일정의 장소 안내 이미지 경로입니다.
   * 일요일 예약은 `2.webp`, 월/화 예약은 `1.webp`를 사용합니다.
   */
  const selectedLocationImage = useMemo(() => {
    if (!selectedDayKey) {
      return {
        src: "/images/passedSection/1.webp",
        alt: "월요일 또는 화요일 면접 장소 안내 이미지",
      };
    }

    const isSunday = getWeekdayFromDayKey(selectedDayKey) === 0;

    return isSunday
      ? {
          src: "/images/passedSection/2.webp",
          alt: "일요일 면접 장소 안내 이미지",
        }
      : {
          src: "/images/passedSection/1.webp",
          alt: "월요일 또는 화요일 면접 장소 안내 이미지",
        };
  }, [selectedDayKey]);
  /**
   * 슬롯 목록에서 요일 그룹별 대표 장소명을 추출합니다.
   * 월/화는 같은 장소를 사용하고, 일요일은 별도 장소를 사용합니다.
   */
  const locationByInterviewDay = useMemo(() => {
    const getLocationByWeekdays = (
      targetWeekdays: number[],
      fallbackLocation: string,
    ) => {
      const matchedSlot = slots.find((slot) => {
        if (!slot.location?.trim()) {
          return false;
        }

        return targetWeekdays.includes(
          getWeekdayFromDayKey(toDayKey(slot.startAt)),
        );
      });

      return matchedSlot?.location?.trim() ?? fallbackLocation;
    };

    return {
      weekday: getLocationByWeekdays([1, 2], "삼육대학교 학생회관 304호"),
      sunday: getLocationByWeekdays([0], "삼육대학교 도서관 스터디룸 304호"),
    };
  }, [slots]);
  /**
   * 좌측 달력 6주 뷰에 렌더링할 셀 목록입니다.
   */
  const calendarDays = useMemo(() => {
    if (!viewedMonthKey) {
      return [];
    }

    const startDayKey = getCalendarStartDayKey(viewedMonthKey);

    return Array.from({ length: 42 }, (_, index) => {
      const dayKey = addDays(startDayKey, index);
      const isCurrentMonth = toMonthKey(dayKey) === viewedMonthKey;
      const isSelectable =
        isCurrentMonth && (slotsByDay[dayKey] ?? []).length > 0;

      return {
        dayKey,
        dayLabel: formatDayLabel(dayKey),
        isCurrentMonth,
        isSelectable,
        isSelected: selectedDayKey === dayKey,
      };
    });
  }, [selectedDayKey, slotsByDay, viewedMonthKey]);

  /**
   * 현재 날짜에서 기본 선택되어야 할 슬롯 ID입니다.
   * 사용자가 직접 고른 슬롯이 없으면 첫 예약 가능 슬롯을 선택합니다.
   */
  const selectedSlotId = useMemo(() => {
    if (reservation) {
      return reservation.slotId;
    }

    if (
      manualSelectedSlotId !== null &&
      daySlots.some((slot) => slot.slotId === manualSelectedSlotId)
    ) {
      return manualSelectedSlotId;
    }

    const firstSelectableSlot = daySlots.find((slot) => {
      if (slot.closed || !slot.available) {
        return false;
      }

      return slot.remainingCount === null || slot.remainingCount > 0;
    });

    return firstSelectableSlot?.slotId ?? null;
  }, [daySlots, manualSelectedSlotId, reservation]);

  /**
   * 현재 선택된 슬롯을 서버에 예약 확정 요청합니다.
   */
  const onClickReserve = async () => {
    if (!selectedSlotId || isReserving || reservation || !canReserve) {
      return;
    }

    await onReserve(selectedSlotId);
  };

  /**
   * 달력 월 이동 시 기준 월과 기본 선택 날짜를 함께 갱신합니다.
   *
   * @param direction 이전 달(-1) 또는 다음 달(1)
   */
  const moveMonth = (direction: -1 | 1) => {
    if (!viewedMonthKey) {
      return;
    }

    const nextMonthKey = monthKeys[currentMonthIndex + direction];
    if (!nextMonthKey) {
      return;
    }

    setViewedMonthKey(nextMonthKey);
    setManualSelectedDayKey(firstSelectableDayByMonth[nextMonthKey] ?? null);
    setManualSelectedSlotId(null);
  };

  /**
   * 예약 에러가 발생하면 피드백 메시지 영역으로 스크롤해 사용자가 즉시 원인을 확인하게 합니다.
   */
  useEffect(() => {
    if (!reserveErrorMessage || !feedbackMessageRef.current) {
      return;
    }

    feedbackMessageRef.current.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    feedbackMessageRef.current.focus({ preventScroll: true });
  }, [reserveErrorMessage]);

  return (
    <section className="min-h-screen bg-background px-4 pb-24 pt-10 text-white lg:px-6 lg:pt-16">
      <div className="mx-auto w-full max-w-[1440px] pt-36">
        <h1 className="text-center leading-[1.27] text-[24px] font-bold lg:text-[48px]">
          <span className="block text-main-3">LIKELION at SYU 14th</span>
          <span className="block text-white-1">
            아기사자 1차 모집 결과 발표
          </span>
        </h1>

        <div className="z-0 mt-12 lg:mt-20 mx-auto w-[110px] lg:w-[167px]">
          <Image
            src="/images/lions/peek.webp"
            alt="라이언 빼꼼"
            width={476}
            height={408}
            className="h-auto w-full object-contain"
          />
        </div>

        <div className="mx-auto w-full rounded-[14px] bg-gray-7 px-6 py-7 text-center text-[14px] text-gray-3 lg:px-12 lg:py-9 lg:text-[24px]">
          귀하께서는 멋쟁이사자처럼 삼육대학교 14기 아기사자 모집에{" "}
          <span className="text-main-1">1차 합격</span>하셨음을 안내드립니다.
          <br />
          <br className="block lg:hidden" />
          아래 내용을 확인하신 후, 면접 일정을 선택해 주시기 바랍니다.
        </div>

        <div className="mt-18.25 lg:mt-30.5">
          <h2 className="text-[22px] font-bold text-center lg:text-left lg:text-[32px]">
            면접 시간
          </h2>
          <div className="mt-5 grid gap-5 lg:mt-9 lg:grid-cols-[482px_minmax(0,1fr)]">
            <div className="rounded-[10px] bg-gray-7 px-6 py-5 lg:px-6 lg:py-7.5">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => moveMonth(-1)}
                  disabled={!canGoPrevMonth || Boolean(reservation)}
                  className={clsx(
                    "flex h-9 w-9 items-center justify-center rounded-full text-[24px] text-white/55 transition",
                    canGoPrevMonth && !reservation
                      ? "hover:bg-white/8 hover:text-white/80"
                      : "cursor-not-allowed text-white/20",
                  )}
                  aria-label="이전 달"
                >
                  ‹
                </button>
                <span className="text-[18px] lg:text-[30px] font-bold text-white">
                  {monthLabel}
                </span>
                <button
                  type="button"
                  onClick={() => moveMonth(1)}
                  disabled={!canGoNextMonth || Boolean(reservation)}
                  className={clsx(
                    "flex h-9 w-9 items-center justify-center rounded-full lg:text-[24px] text-white/55 transition",
                    canGoNextMonth && !reservation
                      ? "hover:bg-white/8 hover:text-white/80"
                      : "cursor-not-allowed text-white/20",
                  )}
                  aria-label="다음 달"
                >
                  ›
                </button>
              </div>

              <div className="mt-6 grid grid-cols-7 text-center text-[14px] lg:text-[24px] font-semibold">
                {WEEKDAY_LABELS.map((dayName, index) => (
                  <span
                    key={dayName}
                    className={clsx(
                      "py-1",
                      index === 5
                        ? "text-main-1"
                        : index === 6
                          ? "text-red-1"
                          : "text-gray-5",
                    )}
                  >
                    {dayName}
                  </span>
                ))}
              </div>

              <div className="mt-5 grid grid-cols-7 gap-y-3 text-center">
                {calendarDays.map((calendarDay) => (
                  <button
                    key={calendarDay.dayKey}
                    type="button"
                    onClick={() => {
                      if (!calendarDay.isSelectable) {
                        return;
                      }
                      setManualSelectedDayKey(calendarDay.dayKey);
                      setManualSelectedSlotId(null);
                    }}
                    disabled={
                      !calendarDay.isSelectable ||
                      Boolean(reservation) ||
                      !canReserve
                    }
                    className={clsx(
                      "mx-auto flex h-10 w-10 items-center justify-center rounded-full text-[14px] lg:text-[24px] font-light transition",
                      !calendarDay.isCurrentMonth && "text-gray-6/50",
                      calendarDay.isCurrentMonth &&
                        !calendarDay.isSelectable &&
                        "text-gray-6",
                      calendarDay.isSelectable &&
                        !calendarDay.isSelected &&
                        "text-white-1 font-semibold hover:bg-white/8",
                      calendarDay.isSelected &&
                        "bg-main-1 font-semibold text-white shadow-[0_0_0_4px_rgba(36,146,255,0.16)]",
                      (!calendarDay.isSelectable ||
                        reservation ||
                        !canReserve) &&
                        "cursor-not-allowed",
                    )}
                  >
                    {calendarDay.dayLabel}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[14px]">
              <div className="min-h-[182px] rounded-[12px] bg-gray-7 p-8 lg:min-h-[300px]">
                <div className="flex flex-wrap gap-2">
                  {daySlots.length === 0 ? (
                    <p className="text-[16px] text-white/55">
                      선택 가능한 면접 시간이 없습니다.
                    </p>
                  ) : (
                    daySlots.map((slot) => {
                      const selected = selectedSlotId === slot.slotId;
                      const disabled =
                        !canReserve ||
                        Boolean(reservation) ||
                        !slot.available ||
                        slot.closed ||
                        (slot.remainingCount !== null &&
                          slot.remainingCount <= 0);

                      return (
                        <button
                          key={slot.slotId}
                          type="button"
                          onClick={() => setManualSelectedSlotId(slot.slotId)}
                          disabled={disabled}
                          className={clsx(
                            "rounded-full px-5 py-2 text-[14px] lg:text-[22px] font-light transition",
                            disabled
                              ? "cursor-not-allowed border-0 bg-gray-6 text-gray-5"
                              : selected
                                ? "bg-main-1 text-white-1"
                                : "border border-white-1 text-white-1 hover:bg-main-1/30",
                          )}
                        >
                          {getSlotLabel(slot)}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <ul className="mt-2.5 px-0 lg:px-3.25 lg:mt-6 leading-[1.7] text-[12px] text-gray-5 lg:text-[16px]">
                {daySlots.length === 0 ? (
                  <li>*면접 가능 일정이 열리면 이 영역에 시간이 표시됩니다.</li>
                ) : (
                  <>
                    <li>*면접 시간은 선착순입니다.</li>
                    <li>
                      *면접 시간은 반드시 엄수해 주시기 바라며, 10분 이상 지각
                      시 자동 탈락 처리됩니다.
                    </li>
                    <li>
                      *관련 문의는 멋쟁이사자처럼 삼육대학교 카카오톡 채널을
                      통해 문의 바랍니다. (면접 질문 문의 제외)
                    </li>
                    <li>*한 번 선택한 면접 시간은 변경이 어렵습니다.</li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {(reserveErrorMessage || reserveSuccessMessage) && (
            <p
              ref={feedbackMessageRef}
              tabIndex={-1}
              className={clsx(
                "mt-4 scroll-mt-28 text-[16px] font-medium outline-none",
                reserveErrorMessage ? "text-[#FF8E9A]" : "text-[#8DC0FF]",
              )}
            >
              {reserveErrorMessage || reserveSuccessMessage}
            </p>
          )}

          {!reserveErrorMessage &&
            !reserveSuccessMessage &&
            !canReserve &&
            !reservation && (
              <p className="mt-4 text-[16px] font-medium text-[#FFD9A0]">
                현재 면접 일정 선택 기간이 아닙니다.
              </p>
            )}
        </div>

        <div className="mt-26.5 lg:mt-49.25">
          <h2 className="text-[26px] text-center font-bold lg:text-left lg:text-[42px]">
            면접 장소
          </h2>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1.05fr]">
            <div className="relative w-[322px] h-[225px] overflow-hidden mx-auto lg:ml-auto rounded-[12px] bg-[#DEE3EC] lg:w-[563px] lg:h-[389px] ">
              <Image
                src={selectedLocationImage.src}
                alt={selectedLocationImage.alt}
                fill
                className="object-cover"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="rounded-full bg-gray-7 w-25 lg:w-43.25 text-center py-3 text-[16px] lg:py-4.5 lg:text-[24px] font-bold text-main-3">
                  월/화 면접
                </span>
                <p className="text-[14px] font-semibold text-white-1 lg:text-[24px]">
                  {locationByInterviewDay.weekday}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <span className="rounded-full bg-gray-7 w-25 lg:w-43.25 text-center py-3 text-[16px] lg:py-4.5 lg:text-[24px] font-bold text-main-3">
                  일 면접
                </span>
                <p className="text-[14px] font-semibold text-white-1 lg:text-[24px]">
                  {locationByInterviewDay.sunday}
                </p>
              </div>

              <ul className="ml-0 lg:ml-2.75 leading-[1.7] text-[12px] text-gray-5 font-light lg:text-[16px]">
                <li>*면접 시작 5분 전까지 도착해 주시기 바랍니다.</li>
                <li>
                  *도착 후 대기 공간(학생회관:2층/도서관:1층)에서 대기해 주시면
                  안내 도와드리겠습니다.
                </li>
                <li>*면접 예상 소요 시간은 약 10분입니다.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 flex justify-center">
          <button
            type="button"
            onClick={onClickReserve}
            disabled={
              !selectedSlotId ||
              isReserving ||
              Boolean(reservation) ||
              !canReserve
            }
            className={clsx(
              "rounded-full px-8.75 py-4.5 text-[14px] lg:px-37.5 lg:py-6 lg:text-[24px] font-bold transition cursor-pointer",
              !selectedSlotId || isReserving || reservation || !canReserve
                ? "cursor-not-allowed bg-[#4A4F60] text-white/45"
                : "bg-main-1 text-white hover:bg-[#3A79D7]",
            )}
          >
            {reservation
              ? "면접 일정 선택 완료"
              : !canReserve
                ? "선택 기간 아님"
                : isReserving
                  ? "저장 중..."
                  : "면접 일정 확정"}
          </button>
        </div>
      </div>
    </section>
  );
}
