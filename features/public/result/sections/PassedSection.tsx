"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import type { InterviewReservation, InterviewSlot } from "../type";

type PassedSectionProps = {
  slots: InterviewSlot[];
  reservation: InterviewReservation | null;
  canReserve: boolean;
  isReserving: boolean;
  reserveErrorMessage: string;
  reserveSuccessMessage: string;
  onReserve: (slotId: number) => Promise<void>;
};

const DATE_WITH_TZ_PATTERN = /(Z|[+-]\d{2}:\d{2})$/;
const KST_DATE_TIME_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const parseDateWithKstFallback = (value: string) => {
  const normalized = DATE_WITH_TZ_PATTERN.test(value)
    ? value
    : `${value}+09:00`;
  return new Date(normalized);
};

const getPart = (
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes,
) => parts.find((part) => part.type === type)?.value ?? "";

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

const toDayKey = (value: string) => {
  const { year, month, day } = getKstDateTimeParts(value);
  return `${year}-${month}-${day}`;
};

const formatTime = (value: string) => {
  const { hour, minute } = getKstDateTimeParts(value);
  return `${hour}:${minute}`;
};

const formatMonthLabel = (dayKey: string | null) => {
  if (!dayKey) {
    return "-";
  }

  const month = Number(dayKey.split("-")[1]);
  return `${month}월`;
};

const formatDayLabel = (dayKey: string) => `${Number(dayKey.split("-")[2])}`;

const getSlotLabel = (slot: InterviewSlot) =>
  `${formatTime(slot.startAt)}-${formatTime(slot.endAt)}`;

export default function PassedSection({
  slots,
  reservation,
  canReserve,
  isReserving,
  reserveErrorMessage,
  reserveSuccessMessage,
  onReserve,
}: PassedSectionProps) {
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

  const firstDayWithSlot =
    dayKeys.find((key) => (slotsByDay[key] ?? []).length > 0) ??
    dayKeys[0] ??
    null;

  const [manualSelectedDayKey, setManualSelectedDayKey] = useState<
    string | null
  >(null);
  const [manualSelectedSlotId, setManualSelectedSlotId] = useState<
    number | null
  >(null);

  const selectedDayKey =
    reservationDayKey ?? manualSelectedDayKey ?? firstDayWithSlot;
  const daySlots = useMemo(
    () => (selectedDayKey ? (slotsByDay[selectedDayKey] ?? []) : []),
    [selectedDayKey, slotsByDay],
  );
  const monthLabel = formatMonthLabel(selectedDayKey ?? firstDayWithSlot);

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
      if (slot.closed) {
        return false;
      }

      return slot.remainingCount === null || slot.remainingCount > 0;
    });

    return firstSelectableSlot?.slotId ?? null;
  }, [daySlots, manualSelectedSlotId, reservation]);

  const onClickReserve = async () => {
    if (!selectedSlotId || isReserving || reservation || !canReserve) {
      return;
    }

    await onReserve(selectedSlotId);
  };

  return (
    <section className="min-h-screen bg-background px-4 pb-24 pt-10 text-white lg:px-6 lg:pt-16">
      <div className="mx-auto w-full max-w-[1200px]">
        <h1 className="text-center leading-[1.2]">
          <span className="block text-[34px] font-bold text-main-3 lg:text-[58px]">
            LIKELION at SYU 14th
          </span>
          <span className="mt-2 block text-[32px] font-bold text-white-1 lg:text-[56px]">
            아기사자 1차 모집 결과 발표
          </span>
        </h1>

        <div className="relative mt-8 flex justify-center lg:mt-12">
          <Image
            src="/images/lions/peek.webp"
            alt="합격 안내 라이언"
            width={210}
            height={210}
            className="z-10 h-[120px] w-[120px] lg:h-[170px] lg:w-[170px]"
          />
          <div className="absolute bottom-0 h-16 w-full bg-gradient-to-t from-background to-transparent" />
        </div>

        <div className="mx-auto mt-[-10px] w-full rounded-[20px] bg-[#343740]/90 px-6 py-7 text-center text-[18px] leading-[1.7] text-[#E6EAF2] lg:px-12 lg:py-9 lg:text-[28px]">
          귀교생님께서는 멋쟁이사자처럼 삼육대학교 14기 아기사자 모집에{" "}
          <span className="text-[#69A4FF]">1차 합격</span>하셨음을 안내드립니다.
          <br />
          아래 내용을 확인하신 후, 면접 일정을 선택해 주시기 바랍니다.
        </div>

        <div className="mt-16">
          <h2 className="text-[26px] font-bold lg:text-[42px]">면접 시간</h2>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1.35fr]">
            <div className="rounded-[14px] bg-[#343740] p-5 lg:p-6">
              <div className="flex items-center justify-center">
                <span className="text-[28px] font-bold">{monthLabel}</span>
              </div>

              <div className="mt-4 grid grid-cols-7 text-center text-[16px] text-white/65">
                {["월", "화", "수", "목", "금", "토", "일"].map((dayName) => (
                  <span key={dayName}>{dayName}</span>
                ))}
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                {dayKeys.map((dayKey) => {
                  const hasSlot = (slotsByDay[dayKey] ?? []).length > 0;
                  const selected = selectedDayKey === dayKey;

                  return (
                    <button
                      key={dayKey}
                      type="button"
                      onClick={() => {
                        setManualSelectedDayKey(dayKey);
                        setManualSelectedSlotId(null);
                      }}
                      disabled={!hasSlot || Boolean(reservation) || !canReserve}
                      className={clsx(
                        "h-14 rounded-full text-[24px] font-bold transition",
                        selected
                          ? "bg-main-1 text-white"
                          : "bg-[#454B5B] text-white/75",
                        (!hasSlot || reservation || !canReserve) &&
                          "cursor-not-allowed bg-[#3A3F4E] text-white/35",
                      )}
                    >
                      {formatDayLabel(dayKey)}
                    </button>
                  );
                })}

                {dayKeys.length === 0 && (
                  <p className="col-span-3 text-center text-[15px] text-white/50">
                    선택 가능한 날짜가 없습니다.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-[14px] bg-[#343740] p-5 lg:p-6">
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
                          "rounded-full px-4 py-2 text-[18px] font-semibold transition",
                          selected
                            ? "bg-main-1 text-white"
                            : "bg-[#4A5163] text-white/85",
                          disabled &&
                            "cursor-not-allowed bg-[#3D4353] text-white/35",
                        )}
                      >
                        {getSlotLabel(slot)}
                      </button>
                    );
                  })
                )}
              </div>

              <ul className="mt-5 space-y-1 text-[13px] text-white/60 lg:text-[15px]">
                <li>*면접 시간은 선착순입니다.</li>
                <li>
                  *면접 시간은 반드시 참석해 주시기 바라며, 개인 사정 시 자동
                  불참 처리됩니다.
                </li>
                <li>*한 번 선택한 면접 시간은 변경이 어렵습니다.</li>
              </ul>
            </div>
          </div>

          {(reserveErrorMessage || reserveSuccessMessage) && (
            <p
              className={clsx(
                "mt-4 text-[16px] font-medium",
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

        <div className="mt-14">
          <h2 className="text-[26px] font-bold lg:text-[42px]">면접 장소</h2>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1.05fr]">
            <div className="relative h-[230px] overflow-hidden rounded-[12px] bg-[#DEE3EC] lg:h-[320px]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#c9d4e6,transparent_45%),radial-gradient(circle_at_80%_60%,#b8c6df,transparent_42%),linear-gradient(135deg,#f1f4f9,#d9e0ec)]" />
              <div className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-main-3/90" />
              <span className="absolute left-1/2 top-1/2 mt-4 -translate-x-1/2 text-[12px] font-bold text-[#2A2F3C] lg:text-[15px]">
                삼육대학교
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 rounded-[12px] bg-[#343740] p-4">
                <span className="rounded-full bg-[#4F5567] px-4 py-2 text-[16px] font-bold text-main-3">
                  월/화 면접
                </span>
                <p className="text-[18px] font-semibold text-white/90">
                  삼육대학교 학생회관 304호
                </p>
              </div>

              <div className="flex items-center gap-4 rounded-[12px] bg-[#343740] p-4">
                <span className="rounded-full bg-[#4F5567] px-4 py-2 text-[16px] font-bold text-main-3">
                  일 면접
                </span>
                <p className="text-[18px] font-semibold text-white/90">
                  삼육대학교 도서관 스터디룸 000호
                </p>
              </div>

              <ul className="space-y-1 text-[13px] text-white/60 lg:text-[15px]">
                <li>*면접 시작 5분 전까지 도착해 주시기 바랍니다.</li>
                <li>
                  *도착 후 대기 공간에서 안내를 받고 면접장으로 이동해 주세요.
                </li>
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
              "h-[74px] min-w-[420px] rounded-full px-10 text-[34px] font-bold transition",
              !selectedSlotId || isReserving || reservation || !canReserve
                ? "cursor-not-allowed bg-[#4A4F60] text-white/45"
                : "bg-main-1 text-white hover:bg-[#3A79D7]",
            )}
          >
            {reservation
              ? "2차 면접 일정 선택 완료"
              : !canReserve
                ? "선택 기간 아님"
                : isReserving
                  ? "저장 중..."
                  : "2차 면접 일정 확정"}
          </button>
        </div>
      </div>
    </section>
  );
}
