"use client";

import { useCallback, useEffect, useState } from "react";
import BabyLionsShell from "./BabyLionsShell";
import { getAttendance, saveAttendance } from "./api";
import type { AttendanceItem, AttendanceStatus, Track } from "./types";
import { selectedDateCheckedAtString, TRACK_OPTIONS, todayKstString } from "./utils";

const ATTENDANCE_STATUS_OPTIONS: AttendanceStatus[] = [
  "PRESENT",
  "LATE",
  "ABSENT",
  "EXCUSED",
];

const ATTENDANCE_STATUS_LABEL: Record<AttendanceStatus, string> = {
  PRESENT: "출석",
  LATE: "지각",
  ABSENT: "결석",
  EXCUSED: "공결",
};

export default function BabyLionsAttendancePage() {
  const [date, setDate] = useState(todayKstString());
  const [track, setTrack] = useState<Track>("FRONTEND");
  const [rows, setRows] = useState<AttendanceItem[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    if (!date || !track) return;
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await getAttendance({ date, track });
      setRows(response);
    } catch {
      setError("출석부를 불러오지 못했습니다.");
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  }, [date, track]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleChangeStatus = (userId: number, status: AttendanceStatus) => {
    setRows((prev) => {
      return prev.map((item) => (item.userId === userId ? { ...item, status } : item));
    });
  };

  const handleSave = async () => {
    if (isSaving) return;
    const payload = {
      checkedAt: selectedDateCheckedAtString(date),
      attendanceDate: date,
      users: rows.map((item) => ({ loginId: item.loginId, status: item.status })),
    };

    setIsSaving(true);
    setError("");
    setMessage("");
    try {
      const responseMessage = await saveAttendance(payload);
      setMessage(responseMessage || "출석 상태를 저장했습니다.");
    } catch {
      setError("출석 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <BabyLionsShell
      title="출석 관리"
      description="날짜/트랙별 출석부 조회 후 상태를 저장합니다."
      actions={
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-lg bg-[#485165] px-4 py-2 text-sm font-semibold"
        >
          조회
        </button>
      }
    >
      <div className="space-y-6">
        <section className="rounded-xl border border-[#43485a] bg-[#363c4a] p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="h-11 rounded-md border border-[#5d6478] bg-[#454c5d] px-3 text-sm outline-none focus:border-main-1"
            />
            <select
              value={track}
              onChange={(event) => setTrack(event.target.value as Track)}
              className="h-11 rounded-md border border-[#5d6478] bg-[#454c5d] px-3 text-sm outline-none focus:border-main-1"
            >
              {TRACK_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => void load()}
              className="h-11 rounded-lg bg-main-1 px-4 text-sm font-semibold"
            >
              출석 조회
            </button>
          </div>

          {error && <p className="mt-3 text-sm text-[#ff9ea8]">{error}</p>}
          {message && <p className="mt-3 text-sm text-[#8fd3ff]">{message}</p>}
        </section>

        <section className="rounded-xl border border-[#43485a] bg-[#363c4a] p-4">
          <h2 className="text-lg font-semibold">출석부</h2>
          {isLoading && <p className="mt-3 text-sm text-gray-4">불러오는 중...</p>}

          {!isLoading && rows.length === 0 && (
            <p className="mt-3 text-sm text-gray-4">아기사자로 등록된 학생이 없습니다.</p>
          )}

          {rows.length > 0 && (
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-gray-3">
                  <tr className="border-b border-[#4a5061]">
                    <th className="px-3 py-2">학번</th>
                    <th className="px-3 py-2">이름</th>
                    <th className="px-3 py-2 text-center">출석</th>
                    <th className="px-3 py-2 text-center">지각</th>
                    <th className="px-3 py-2 text-center">결석</th>
                    <th className="px-3 py-2 text-center">공결</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((item) => (
                    <tr key={item.userId} className="border-b border-[#41485a] text-gray-2">
                      <td className="px-3 py-2">{item.studentNo}</td>
                      <td className="px-3 py-2">{item.name}</td>
                      {ATTENDANCE_STATUS_OPTIONS.map((status) => {
                        const active = item.status === status;
                        const activeClassByStatus: Record<AttendanceStatus, string> = {
                          PRESENT: "border-[#18a35a] bg-[#18a35a] text-white",
                          LATE: "border-[#d39c1a] bg-[#d39c1a] text-white",
                          ABSENT: "border-[#c74a53] bg-[#c74a53] text-white",
                          EXCUSED: "border-[#2f78d8] bg-[#2f78d8] text-white",
                        };
                        return (
                          <td key={status} className="px-3 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleChangeStatus(item.userId, status)}
                              aria-pressed={active}
                              title={ATTENDANCE_STATUS_LABEL[status]}
                              className={`h-8 min-w-14 rounded-md border px-2 text-xs font-semibold transition ${
                                active
                                  ? activeClassByStatus[status]
                                  : "border-[#5d6478] bg-[#454c5d] text-gray-3 hover:border-main-1"
                              }`}
                            >
                              {ATTENDANCE_STATUS_LABEL[status]}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || rows.length === 0}
            className="rounded-lg bg-main-1 px-5 py-2 text-sm font-semibold disabled:opacity-60"
          >
            {isSaving ? "저장 중..." : "출석 저장"}
          </button>
        </div>
      </div>
    </BabyLionsShell>
  );
}

