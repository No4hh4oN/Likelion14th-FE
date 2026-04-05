"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { getMyAttendance, getMyAttendanceByDate } from "../api";
import type {
  AttendanceStatus,
  MyAttendanceByDateResponse,
  MyAttendanceItem,
  MyPageUser,
} from "../types";

type MyAttendanceTabProps = {
  user: MyPageUser;
};

type AttendanceSummaryCardItem = {
  /** 카드 제목 */
  label: string;
  /** 집계 개수 */
  count: number;
  /** 카드 강조 색상 */
  accentClassName: string;
};

const ATTENDANCE_STATUS_LABEL: Record<AttendanceStatus, string> = {
  PRESENT: "출석",
  LATE: "지각",
  ABSENT: "결석",
  EXCUSED: "공결",
};

const ATTENDANCE_STATUS_CLASS_NAME: Record<AttendanceStatus, string> = {
  PRESENT: "border-[#18a35a]/40 bg-[#18a35a]/15 text-[#8EE2A0]",
  LATE: "border-[#d39c1a]/40 bg-[#d39c1a]/15 text-[#FFD27A]",
  ABSENT: "border-[#c74a53]/40 bg-[#c74a53]/15 text-[#FF9EA8]",
  EXCUSED: "border-[#2f78d8]/40 bg-[#2f78d8]/15 text-[#9CC8FF]",
};

const ATTENDANCE_SUMMARY_CARD_CLASS_NAME: Record<AttendanceStatus, string> = {
  PRESENT: "border-[#18a35a]/30 bg-[#18a35a]/10",
  LATE: "border-[#d39c1a]/30 bg-[#d39c1a]/10",
  ABSENT: "border-[#c74a53]/30 bg-[#c74a53]/10",
  EXCUSED: "border-[#2f78d8]/30 bg-[#2f78d8]/10",
};

/**
 * Date 객체를 `yyyy-mm-dd` 입력값 형식으로 변환합니다.
 */
function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * 출결 조회 기본 기간을 계산합니다.
 * 기본값은 오늘 기준 최근 3개월입니다.
 */
function buildDefaultAttendanceRange(now: Date = new Date()) {
  const toDate = new Date(now);
  const fromDate = new Date(now);
  fromDate.setMonth(fromDate.getMonth() - 3);

  return {
    from: toDateInputValue(fromDate),
    to: toDateInputValue(toDate),
  };
}

/**
 * 출결 날짜를 화면 표시용 `YYYY.MM.DD` 형태로 변환합니다.
 */
function formatAttendanceDateLabel(date: string) {
  return date.replaceAll("-", ".");
}

/**
 * 출결 상태 코드를 한글 라벨로 변환합니다.
 */
function getAttendanceStatusLabel(status?: AttendanceStatus) {
  if (!status) {
    return "미기록";
  }

  return ATTENDANCE_STATUS_LABEL[status];
}

/**
 * 출결 상태 칩 스타일을 반환합니다.
 */
function getAttendanceStatusChipClassName(status?: AttendanceStatus) {
  if (!status) {
    return "border-white/10 bg-white/10 text-white/65";
  }

  return ATTENDANCE_STATUS_CLASS_NAME[status];
}

/**
 * 현재 조회 기간에서 특정 출결 상태의 개수를 계산합니다.
 */
function countAttendanceStatus(
  attendanceItems: MyAttendanceItem[],
  targetStatus: AttendanceStatus,
) {
  return attendanceItems.filter((item) => item.status === targetStatus).length;
}

/**
 * 마이페이지 출결내역 탭을 렌더링합니다.
 */
export default function MyAttendanceTab({ user }: MyAttendanceTabProps) {
  const defaultRange = useMemo(() => buildDefaultAttendanceRange(), []);
  /**
   * 기간 조회 시작일 입력값입니다.
   */
  const [fromInput, setFromInput] = useState(defaultRange.from);
  /**
   * 기간 조회 종료일 입력값입니다.
   */
  const [toInput, setToInput] = useState(defaultRange.to);
  /**
   * 실제 목록 조회에 사용 중인 기간입니다.
   */
  const [queryRange, setQueryRange] = useState(defaultRange);
  /**
   * 조회된 출결 목록입니다.
   */
  const [attendanceItems, setAttendanceItems] = useState<MyAttendanceItem[]>([]);
  /**
   * 출결 목록 로딩 여부입니다.
   */
  const [isAttendanceLoading, setIsAttendanceLoading] = useState(true);
  /**
   * 출결 목록 에러 문구입니다.
   */
  const [attendanceErrorMessage, setAttendanceErrorMessage] = useState("");
  /**
   * 날짜별 조회 입력값입니다.
   */
  const [dateInput, setDateInput] = useState(defaultRange.to);
  /**
   * 실제 날짜별 조회에 사용 중인 날짜입니다.
   */
  const [lookupDate, setLookupDate] = useState(defaultRange.to);
  /**
   * 특정 날짜 출결 조회 결과입니다.
   */
  const [attendanceByDate, setAttendanceByDate] =
    useState<MyAttendanceByDateResponse | null>(null);
  /**
   * 날짜별 조회 로딩 여부입니다.
   */
  const [isDateLookupLoading, setIsDateLookupLoading] = useState(true);
  /**
   * 날짜별 조회 에러 문구입니다.
   */
  const [dateLookupErrorMessage, setDateLookupErrorMessage] = useState("");
  /**
   * 출결 목록 조회 시 입력값 검증 에러 문구입니다.
   */
  const [rangeValidationMessage, setRangeValidationMessage] = useState("");

  useEffect(() => {
    if (user.role !== "아기사자") {
      setIsAttendanceLoading(false);
      setIsDateLookupLoading(false);
      return;
    }

    let isMounted = true;

    async function loadAttendanceItems() {
      setIsAttendanceLoading(true);
      setAttendanceErrorMessage("");

      try {
        const nextAttendanceItems = await getMyAttendance(queryRange);

        if (!isMounted) {
          return;
        }

        const sortedAttendanceItems = [...nextAttendanceItems].sort((a, b) =>
          a.date < b.date ? 1 : -1,
        );
        setAttendanceItems(sortedAttendanceItems);
      } catch {
        if (!isMounted) {
          return;
        }

        setAttendanceItems([]);
        setAttendanceErrorMessage(
          "출결 내역을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.",
        );
      } finally {
        if (isMounted) {
          setIsAttendanceLoading(false);
        }
      }
    }

    void loadAttendanceItems();

    return () => {
      isMounted = false;
    };
  }, [queryRange, user.role]);

  useEffect(() => {
    if (user.role !== "아기사자") {
      setAttendanceByDate(null);
      setIsDateLookupLoading(false);
      return;
    }

    let isMounted = true;

    async function loadAttendanceByDate() {
      setIsDateLookupLoading(true);
      setDateLookupErrorMessage("");

      try {
        const nextAttendanceByDate = await getMyAttendanceByDate(lookupDate);

        if (!isMounted) {
          return;
        }

        setAttendanceByDate(nextAttendanceByDate);
      } catch {
        if (!isMounted) {
          return;
        }

        setAttendanceByDate(null);
        setDateLookupErrorMessage(
          "선택한 날짜의 출결 상태를 불러오지 못했습니다.",
        );
      } finally {
        if (isMounted) {
          setIsDateLookupLoading(false);
        }
      }
    }

    void loadAttendanceByDate();

    return () => {
      isMounted = false;
    };
  }, [lookupDate, user.role]);

  /**
   * 출결 상태 요약 카드 데이터입니다.
   */
  const summaryCardItems = useMemo<AttendanceSummaryCardItem[]>(
    () => [
      {
        label: "출석",
        count: countAttendanceStatus(attendanceItems, "PRESENT"),
        accentClassName: ATTENDANCE_SUMMARY_CARD_CLASS_NAME.PRESENT,
      },
      {
        label: "지각",
        count: countAttendanceStatus(attendanceItems, "LATE"),
        accentClassName: ATTENDANCE_SUMMARY_CARD_CLASS_NAME.LATE,
      },
      {
        label: "결석",
        count: countAttendanceStatus(attendanceItems, "ABSENT"),
        accentClassName: ATTENDANCE_SUMMARY_CARD_CLASS_NAME.ABSENT,
      },
      {
        label: "공결",
        count: countAttendanceStatus(attendanceItems, "EXCUSED"),
        accentClassName: ATTENDANCE_SUMMARY_CARD_CLASS_NAME.EXCUSED,
      },
    ],
    [attendanceItems],
  );

  /**
   * 목록 조회 폼 제출을 처리합니다.
   */
  function handleRangeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (fromInput && toInput && fromInput > toInput) {
      setRangeValidationMessage("조회 시작일은 종료일보다 늦을 수 없습니다.");
      return;
    }

    setRangeValidationMessage("");
    setQueryRange({
      from: fromInput,
      to: toInput,
    });
  }

  /**
   * 날짜별 조회 폼 제출을 처리합니다.
   */
  function handleDateLookupSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLookupDate(dateInput);
  }

  /**
   * 목록 행을 눌렀을 때 해당 날짜를 즉시 상세 조회합니다.
   * @param date 선택한 날짜
   */
  function handleAttendanceRowClick(date: string) {
    setDateInput(date);
    setLookupDate(date);
  }

  if (user.role !== "아기사자") {
    return (
      <div className="mt-6 rounded-[10px] border border-white/10 bg-[#363944] px-4 py-8 text-center text-[13px] text-white/70">
        출결내역은 아기사자 계정에서만 확인할 수 있습니다.
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-8">
      <section className="rounded-[10px] border border-white/10 bg-[#363944] p-4 lg:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="text-[24px] font-bold text-white">출결내역</h3>
            <p className="mt-1 text-[12px] text-white/55">
              조회 기간의 출결 현황을 확인하고, 특정 날짜의 상태를 바로 조회할
              수 있습니다.
            </p>
          </div>

          <form
            onSubmit={handleRangeSubmit}
            className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]"
          >
            <input
              type="date"
              value={fromInput}
              onChange={(event) => setFromInput(event.target.value)}
              className="h-11 rounded-md border border-white/10 bg-[#2d3037] px-3 text-sm text-white outline-none"
            />
            <input
              type="date"
              value={toInput}
              onChange={(event) => setToInput(event.target.value)}
              className="h-11 rounded-md border border-white/10 bg-[#2d3037] px-3 text-sm text-white outline-none"
            />
            <button
              type="submit"
              className="h-11 rounded-lg bg-main-1 px-4 text-sm font-semibold text-white"
            >
              조회
            </button>
          </form>
        </div>

        {rangeValidationMessage ? (
          <p className="mt-3 text-[12px] text-[#ff9ea8]">
            {rangeValidationMessage}
          </p>
        ) : null}

        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_320px]">
          <div className="rounded-[8px] border border-white/10 bg-[#2d3037] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[13px] font-semibold text-white/85">
                  조회 기간 요약
                </p>
                <p className="mt-1 text-[12px] text-white/55">
                  {formatAttendanceDateLabel(queryRange.from)} ~{" "}
                  {formatAttendanceDateLabel(queryRange.to)}
                </p>
              </div>
              <span className="text-[12px] text-white/55">
                총 {attendanceItems.length}회
              </span>
            </div>

            {isAttendanceLoading ? (
              <p className="mt-4 text-[13px] text-white/70">
                출결 요약을 불러오는 중입니다.
              </p>
            ) : attendanceErrorMessage ? (
              <p className="mt-4 text-[13px] text-[#ff9ea8]">
                {attendanceErrorMessage}
              </p>
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {summaryCardItems.map((item) => (
                  <div
                    key={item.label}
                    className={`rounded-[8px] border px-4 py-3 ${item.accentClassName}`}
                  >
                    <p className="text-[12px] text-white/60">{item.label}</p>
                    <p className="mt-2 text-[22px] font-bold text-white">
                      {item.count}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[8px] border border-white/10 bg-[#2d3037] p-4">
            <p className="text-[13px] font-semibold text-white/85">
              날짜별 확인
            </p>
            <form
              onSubmit={handleDateLookupSubmit}
              className="mt-3 flex gap-2"
            >
              <input
                type="date"
                value={dateInput}
                onChange={(event) => setDateInput(event.target.value)}
                className="h-11 flex-1 rounded-md border border-white/10 bg-[#23262d] px-3 text-sm text-white outline-none"
              />
              <button
                type="submit"
                className="h-11 rounded-lg bg-[#485165] px-4 text-sm font-semibold text-white"
              >
                확인
              </button>
            </form>

            {isDateLookupLoading ? (
              <p className="mt-4 text-[13px] text-white/70">
                해당 날짜의 상태를 확인하는 중입니다.
              </p>
            ) : dateLookupErrorMessage ? (
              <p className="mt-4 text-[13px] text-[#ff9ea8]">
                {dateLookupErrorMessage}
              </p>
            ) : attendanceByDate ? (
              <div className="mt-4 rounded-[8px] border border-white/10 bg-[#23262d] px-4 py-4">
                <p className="text-[12px] text-white/55">
                  {formatAttendanceDateLabel(attendanceByDate.date)}
                </p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-[14px] font-medium text-white">
                    선택한 날짜의 출결 상태
                  </p>
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-[12px] font-semibold ${getAttendanceStatusChipClassName(
                      attendanceByDate.recorded
                        ? attendanceByDate.status
                        : undefined,
                    )}`}
                  >
                    {attendanceByDate.recorded
                      ? getAttendanceStatusLabel(attendanceByDate.status)
                      : "미기록"}
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-[24px] font-bold text-white">출결 목록</h3>
        <div className="mt-5 rounded-[8px] border border-white/10 bg-[#363944]">
          <div className="flex border-b border-white/10 px-4 py-3 text-[12px] text-white/55 lg:px-5 lg:text-[13px]">
            <span className="flex-1 font-medium">날짜</span>
            <span className="w-[120px] text-right font-medium">상태</span>
          </div>

          {isAttendanceLoading ? (
            <p className="px-4 py-8 text-center text-[13px] text-white/70">
              출결 목록을 불러오는 중입니다.
            </p>
          ) : attendanceErrorMessage ? (
            <p className="px-4 py-8 text-center text-[13px] text-[#ff9ea8]">
              {attendanceErrorMessage}
            </p>
          ) : attendanceItems.length === 0 ? (
            <p className="px-4 py-8 text-center text-[13px] text-white/70">
              조회 기간에 등록된 출결 내역이 없습니다.
            </p>
          ) : (
            <ul>
              {attendanceItems.map((item) => {
                const isSelectedDate = item.date === lookupDate;

                return (
                  <li
                    key={item.date}
                    className="border-b border-white/5 last:border-b-0"
                  >
                    <button
                      type="button"
                      onClick={() => handleAttendanceRowClick(item.date)}
                      className={`flex w-full items-center px-4 py-3 text-left text-[13px] transition-colors lg:px-5 lg:text-[14px] ${
                        isSelectedDate ? "bg-white/5" : "hover:bg-white/5"
                      }`}
                    >
                      <span className="flex-1 text-white/90">
                        {formatAttendanceDateLabel(item.date)}
                      </span>
                      <span
                        className={`inline-flex w-[120px] justify-center rounded-full border px-3 py-1 text-[12px] font-semibold ${getAttendanceStatusChipClassName(
                          item.status,
                        )}`}
                      >
                        {getAttendanceStatusLabel(item.status)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
