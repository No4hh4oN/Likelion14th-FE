"use client";

import { useMemo, useState } from "react";
import type {
  AdminInterviewCandidateListItem,
  AdminInterviewCandidateListResponse,
} from "../type";

type SortDirection = "asc" | "desc";
type SortKey =
  | "rowNumber"
  | "name"
  | "department"
  | "studentNoPrefix"
  | "applyPart"
  | "enrollment"
  | "slotStartAt"
  | "docAvgScore";

type InterviewCandidateTableProps = {
  result: AdminInterviewCandidateListResponse;
  isLoading: boolean;
  hasRecruitmentId: boolean;
  selectedApplicationId?: number | null;
  compact?: boolean;
  onSelectApplication?: (applicationId: number) => void;
};

type SortableItem = AdminInterviewCandidateListItem & {
  rowNumber: number;
};

function formatPart(value: string) {
  if (value === "FRONTEND") return "FRONTEND";
  if (value === "BACKEND") return "BACKEND";
  if (value === "AI_ML") return "AI / ML";
  if (value === "PM_DESIGN") return "PM / DESIGN";
  return value;
}

function formatEnrollment(value: string) {
  const upper = value?.toUpperCase?.() ?? "";
  if (upper === "ENROLLED") return "재학";
  if (upper === "LEAVE") return "휴학";
  if (upper === "GRADUATED") return "졸업";
  return value ?? "-";
}

function formatInterviewSlot(startAt?: string | null) {
  if (!startAt) return "-";

  const date = new Date(startAt);
  if (Number.isNaN(date.getTime())) return "-";

  const formatter = new Intl.DateTimeFormat("ko-KR", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Seoul",
  });
  const parts = formatter.formatToParts(date);
  const valueByType = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  ) as Record<string, string>;

  return (
    [valueByType.year, valueByType.month, valueByType.day].join(".") +
    ` ${valueByType.hour}:${valueByType.minute}`
  );
}

function getEnrollmentSortValue(item: AdminInterviewCandidateListItem) {
  return `${String(item.grade).padStart(2, "0")}-${formatEnrollment(item.enrollment)}`;
}

function compareNullable(
  left: string | number | null | undefined,
  right: string | number | null | undefined,
  direction: SortDirection,
) {
  const leftMissing = left === null || left === undefined || left === "";
  const rightMissing = right === null || right === undefined || right === "";

  if (leftMissing && rightMissing) return 0;
  if (leftMissing) return 1;
  if (rightMissing) return -1;

  if (typeof left === "number" && typeof right === "number") {
    return direction === "asc" ? left - right : right - left;
  }

  const normalizedLeft = String(left);
  const normalizedRight = String(right);
  return direction === "asc"
    ? normalizedLeft.localeCompare(normalizedRight, "ko-KR")
    : normalizedRight.localeCompare(normalizedLeft, "ko-KR");
}

function getSortLabel(
  activeKey: SortKey,
  activeDirection: SortDirection,
  columnKey: SortKey,
) {
  if (activeKey !== columnKey) {
    return "정렬 안 됨";
  }

  return activeDirection === "asc" ? "오름차순 정렬" : "내림차순 정렬";
}

function SortIndicator({
  active,
  direction,
}: {
  active: boolean;
  direction: SortDirection;
}) {
  return (
    <span className="ml-1.5 inline-flex h-4 w-3 flex-col items-center justify-center text-[#8a90a0] cursor-pointer">
      <svg
        viewBox="0 0 8 5"
        className={`h-1.5 w-2 transition-opacity ${
          active && direction === "asc"
            ? "opacity-100 text-main-1"
            : "opacity-45"
        }`}
        aria-hidden="true"
      >
        <path d="M4 0L8 5H0L4 0Z" fill="currentColor" />
      </svg>
      <svg
        viewBox="0 0 8 5"
        className={`mt-0.5 h-1.5 w-2 transition-opacity ${
          active && direction === "desc"
            ? "opacity-100 text-main-1"
            : "opacity-45"
        }`}
        aria-hidden="true"
      >
        <path d="M4 5L0 0H8L4 5Z" fill="currentColor" />
      </svg>
    </span>
  );
}

function SortableHeader({
  label,
  columnKey,
  sortKey,
  sortDirection,
  onToggle,
  className,
}: {
  label: string;
  columnKey: SortKey;
  sortKey: SortKey;
  sortDirection: SortDirection;
  onToggle: (key: SortKey) => void;
  className?: string;
}) {
  const isActive = sortKey === columnKey;
  const ariaSort = isActive
    ? sortDirection === "asc"
      ? "ascending"
      : "descending"
    : "none";

  return (
    <th className={className} aria-sort={ariaSort}>
      <button
        type="button"
        onClick={() => onToggle(columnKey)}
        className="inline-flex items-center gap-0 text-left font-semibold text-gray-2 transition-colors hover:text-white"
        aria-label={`${label} ${getSortLabel(sortKey, sortDirection, columnKey)}`}
      >
        <span>{label}</span>
        <SortIndicator
          active={isActive}
          direction={isActive ? sortDirection : "asc"}
        />
      </button>
    </th>
  );
}

export default function InterviewCandidateTable({
  result,
  isLoading,
  hasRecruitmentId,
  selectedApplicationId,
  compact = false,
  onSelectApplication,
}: InterviewCandidateTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("rowNumber");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const columnCount = compact ? 5 : 8;

  const sortableItems = useMemo<SortableItem[]>(
    () =>
      result.items.map((item, index) => ({
        ...item,
        rowNumber: result.page.page * result.page.size + index + 1,
      })),
    [result.items, result.page.page, result.page.size],
  );

  const sortedItems = useMemo(() => {
    const nextItems = [...sortableItems];

    nextItems.sort((left, right) => {
      if (sortKey === "rowNumber") {
        return compareNullable(left.rowNumber, right.rowNumber, sortDirection);
      }

      if (sortKey === "name") {
        return compareNullable(left.name, right.name, sortDirection);
      }

      if (sortKey === "department") {
        return compareNullable(
          left.department,
          right.department,
          sortDirection,
        );
      }

      if (sortKey === "studentNoPrefix") {
        return compareNullable(
          left.studentNoPrefix,
          right.studentNoPrefix,
          sortDirection,
        );
      }

      if (sortKey === "applyPart") {
        return compareNullable(
          formatPart(left.applyPart),
          formatPart(right.applyPart),
          sortDirection,
        );
      }

      if (sortKey === "enrollment") {
        return compareNullable(
          getEnrollmentSortValue(left),
          getEnrollmentSortValue(right),
          sortDirection,
        );
      }

      if (sortKey === "slotStartAt") {
        const leftTimestamp = left.slotStartAt
          ? Date.parse(left.slotStartAt)
          : null;
        const rightTimestamp = right.slotStartAt
          ? Date.parse(right.slotStartAt)
          : null;
        return compareNullable(leftTimestamp, rightTimestamp, sortDirection);
      }

      return compareNullable(
        left.docAvgScore,
        right.docAvgScore,
        sortDirection,
      );
    });

    return nextItems;
  }, [sortableItems, sortDirection, sortKey]);

  const handleToggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection("asc");
  };

  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-[#4a4f5b]">
      <table className="min-w-[980px] w-full table-auto text-center text-sm">
        <thead className="bg-[#343843] text-gray-2">
          <tr className="[&>th]:px-3 [&>th]:py-3">
            {!compact && (
              <SortableHeader
                label="No."
                columnKey="rowNumber"
                sortKey={sortKey}
                sortDirection={sortDirection}
                onToggle={handleToggleSort}
                className="min-w-[72px]"
              />
            )}
            <SortableHeader
              label="이름"
              columnKey="name"
              sortKey={sortKey}
              sortDirection={sortDirection}
              onToggle={handleToggleSort}
              className={compact ? "min-w-[110px]" : "min-w-[120px]"}
            />
            {!compact && (
              <SortableHeader
                label="학과"
                columnKey="department"
                sortKey={sortKey}
                sortDirection={sortDirection}
                onToggle={handleToggleSort}
                className="min-w-[190px]"
              />
            )}
            <SortableHeader
              label="학번"
              columnKey="studentNoPrefix"
              sortKey={sortKey}
              sortDirection={sortDirection}
              onToggle={handleToggleSort}
              className="min-w-[110px]"
            />
            <SortableHeader
              label="파트"
              columnKey="applyPart"
              sortKey={sortKey}
              sortDirection={sortDirection}
              onToggle={handleToggleSort}
              className="min-w-[140px]"
            />
            {!compact && (
              <SortableHeader
                label="학적"
                columnKey="enrollment"
                sortKey={sortKey}
                sortDirection={sortDirection}
                onToggle={handleToggleSort}
                className="min-w-[130px]"
              />
            )}
            <SortableHeader
              label="면접 시간"
              columnKey="slotStartAt"
              sortKey={sortKey}
              sortDirection={sortDirection}
              onToggle={handleToggleSort}
              className={compact ? "min-w-[150px]" : "min-w-[170px]"}
            />
            <SortableHeader
              label="서류 평균"
              columnKey="docAvgScore"
              sortKey={sortKey}
              sortDirection={sortDirection}
              onToggle={handleToggleSort}
              className="min-w-[110px]"
            />
          </tr>
        </thead>
        <tbody className="bg-[#2d3037] text-gray-1">
          {isLoading && (
            <tr>
              <td colSpan={columnCount} className="px-3 py-12 text-gray-4">
                불러오는 중입니다.
              </td>
            </tr>
          )}

          {!isLoading && sortedItems.length === 0 && hasRecruitmentId && (
            <tr>
              <td colSpan={columnCount} className="px-3 py-12 text-gray-4">
                조회된 면접 대상자가 없습니다.
              </td>
            </tr>
          )}

          {!isLoading &&
            sortedItems.map((item) => (
              <tr
                key={item.applicationId}
                onClick={() => onSelectApplication?.(item.applicationId)}
                className={`cursor-pointer border-t border-[#4b4f59] transition-colors [&>td]:px-3 [&>td]:py-3 ${
                  selectedApplicationId === item.applicationId
                    ? "bg-[#3a404d]"
                    : "hover:bg-[#3a3f49]"
                }`}
              >
                {!compact && (
                  <td className="whitespace-nowrap">{item.rowNumber}</td>
                )}
                <td className="whitespace-nowrap text-left">{item.name}</td>
                {!compact && (
                  <td className="text-left">{item.department || "-"}</td>
                )}
                <td className="whitespace-nowrap">{item.studentNoPrefix}</td>
                <td className="whitespace-nowrap">
                  {formatPart(item.applyPart)}
                </td>
                {!compact && (
                  <td className="whitespace-nowrap">
                    {item.grade}학년 {formatEnrollment(item.enrollment)}
                  </td>
                )}
                <td className="whitespace-nowrap">
                  {formatInterviewSlot(item.slotStartAt)}
                </td>
                <td className="whitespace-nowrap">
                  {typeof item.docAvgScore === "number"
                    ? item.docAvgScore.toFixed(1)
                    : "-"}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
