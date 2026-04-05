"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { buildCommonSpaceAssignmentDetailHref } from "@/features/public/commonSpace/config";
import { commonSpaceAssignmentApiDataSource } from "@/features/public/commonSpace/assignments/source";
import type { CommonSpaceAssignmentListItem } from "@/features/public/commonSpace/assignments/types";
import type { CommonSpacePartId } from "@/features/public/commonSpace/types";
import type { MyPageUser, UserTrack } from "../types";

type MyAssignmentsTabProps = {
  user: MyPageUser;
};

type MyAssignmentsTableRow = {
  /** 과제 식별자 */
  id: number;
  /** 과제명 */
  title: string;
  /** 공통공간 파트 식별자 */
  partId: CommonSpacePartId;
  /** 표시용 파트명 */
  partLabel: string;
  /** 기간 표시 문구 */
  periodLabel: string;
  /** 기간 종료 여부 */
  isEnded: boolean;
  /** 제출여부 버튼 라벨 */
  actionLabel: string;
  /** 제출여부 버튼 스타일 식별자 */
  actionVariant: "submit" | "done" | "missed" | "rejected";
};

/** 지난 과제 목록 페이지 크기입니다. */
const PAST_ASSIGNMENT_PAGE_SIZE = 6;

/**
 * 마이페이지 사용자 트랙을 commonSpace 파트 식별자로 변환합니다.
 */
function mapMyPageTrackToCommonSpacePartId(
  track?: UserTrack | null,
): CommonSpacePartId | null {
  if (track === "FRONTEND") {
    return "front-end";
  }

  if (track === "BACKEND") {
    return "back-end";
  }

  if (track === "AI_ML") {
    return "ai-ml";
  }

  if (track === "PM_DESIGN") {
    return "pm-design";
  }

  return null;
}

/**
 * 공통공간 파트 식별자를 마이페이지 과제 표의 한글 라벨로 변환합니다.
 */
function getAssignmentPartLabel(partId: CommonSpacePartId) {
  if (partId === "all") {
    return "공통 세션";
  }

  if (partId === "front-end") {
    return "프론트엔드";
  }

  if (partId === "back-end") {
    return "백엔드";
  }

  if (partId === "ai-ml") {
    return "AI/ML";
  }

  return "기획/디자인";
}

/**
 * 마감일까지 남은 날짜를 D-Day 형식으로 변환합니다.
 */
function formatAssignmentDday(deadlineAt: string, now: Date = new Date()) {
  const deadlineDate = new Date(deadlineAt);

  if (Number.isNaN(deadlineDate.getTime())) {
    return "-";
  }

  const diffTime = deadlineDate.getTime() - now.getTime();

  if (diffTime < 0) {
    return "종료";
  }

  return `D-${Math.ceil(diffTime / (1000 * 60 * 60 * 24))}`;
}

/**
 * 과제가 현재 진행 중인지 판별합니다.
 */
function isOngoingAssignment(
  assignment: CommonSpaceAssignmentListItem,
  now: Date = new Date(),
) {
  const deadlineDate = new Date(assignment.deadlineAt);

  if (Number.isNaN(deadlineDate.getTime())) {
    return false;
  }

  return deadlineDate.getTime() >= now.getTime();
}

/**
 * 과제 카드 데이터를 마이페이지 표 한 줄 데이터로 변환합니다.
 */
function toMyAssignmentsTableRow(
  assignment: CommonSpaceAssignmentListItem,
  now: Date = new Date(),
): MyAssignmentsTableRow {
  const isEnded = !isOngoingAssignment(assignment, now);
  const periodLabel = isEnded
    ? "종료"
    : formatAssignmentDday(assignment.deadlineAt, now);

  if (!isEnded && assignment.submissionState === "submitted") {
    return {
      id: assignment.id,
      title: assignment.title,
      partId: assignment.partId,
      partLabel: getAssignmentPartLabel(assignment.partId),
      periodLabel,
      isEnded,
      actionLabel: "제출 완료",
      actionVariant: "done",
    };
  }

  if (!isEnded && assignment.submissionState === "rejected") {
    return {
      id: assignment.id,
      title: assignment.title,
      partId: assignment.partId,
      partLabel: getAssignmentPartLabel(assignment.partId),
      periodLabel,
      isEnded,
      actionLabel: "제출하기",
      actionVariant: "submit",
    };
  }

  if (!isEnded) {
    return {
      id: assignment.id,
      title: assignment.title,
      partId: assignment.partId,
      partLabel: getAssignmentPartLabel(assignment.partId),
      periodLabel,
      isEnded,
      actionLabel: "제출하기",
      actionVariant: "submit",
    };
  }

  if (assignment.submissionState === "submitted") {
    return {
      id: assignment.id,
      title: assignment.title,
      partId: assignment.partId,
      partLabel: getAssignmentPartLabel(assignment.partId),
      periodLabel,
      isEnded,
      actionLabel: "제출 완료",
      actionVariant: "done",
    };
  }

  if (assignment.submissionState === "rejected") {
    return {
      id: assignment.id,
      title: assignment.title,
      partId: assignment.partId,
      partLabel: getAssignmentPartLabel(assignment.partId),
      periodLabel,
      isEnded,
      actionLabel: "과제 반려",
      actionVariant: "rejected",
    };
  }

  return {
    id: assignment.id,
    title: assignment.title,
    partId: assignment.partId,
    partLabel: getAssignmentPartLabel(assignment.partId),
    periodLabel,
    isEnded,
    actionLabel: "미제출",
    actionVariant: "missed",
  };
}

/**
 * 제출여부 버튼 스타일을 반환합니다.
 */
function getAssignmentActionClassName(
  variant: MyAssignmentsTableRow["actionVariant"],
) {
  if (variant === "submit") {
    return "bg-main-1 text-white-1 hover:bg-[#178DFF]";
  }

  if (variant === "missed") {
    return "bg-red-1 text-white-1";
  }

  if (variant === "rejected") {
    return "bg-[#FF6A00] text-white-1";
  }

  return "bg-[#586176] text-white-1";
}

/**
 * 지난 과제 페이지네이션 토큰 목록을 계산합니다.
 */
function buildAssignmentPageTokens(currentPage: number, totalPages: number) {
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

/**
 * 마이페이지 과제 탭을 렌더링합니다.
 */
export default function MyAssignmentsTab({ user }: MyAssignmentsTabProps) {
  const router = useRouter();
  /**
   * 화면에 노출할 전체 과제 목록입니다.
   */
  const [assignmentItems, setAssignmentItems] = useState<
    CommonSpaceAssignmentListItem[]
  >([]);
  /**
   * 과제 목록 로딩 여부입니다.
   */
  const [isLoading, setIsLoading] = useState(true);
  /**
   * 과제 목록 에러 문구입니다.
   */
  const [errorMessage, setErrorMessage] = useState("");
  /**
   * 지난 과제 현재 페이지입니다.
   */
  const [pastAssignmentPage, setPastAssignmentPage] = useState(1);

  useEffect(() => {
    let isMounted = true;

    async function loadAssignments() {
      setIsLoading(true);
      setErrorMessage("");

      const requests = [
        commonSpaceAssignmentApiDataSource.getList({ partId: "all" }),
      ];
      const userPartId = mapMyPageTrackToCommonSpacePartId(user.track);

      if (userPartId && userPartId !== "all") {
        requests.push(
          commonSpaceAssignmentApiDataSource.getList({ partId: userPartId }),
        );
      }

      try {
        const results = await Promise.allSettled(requests);

        if (!isMounted) {
          return;
        }

        const mergedMap = new Map<number, CommonSpaceAssignmentListItem>();
        let successCount = 0;

        results.forEach((result) => {
          if (result.status !== "fulfilled") {
            return;
          }

          successCount += 1;
          result.value.items.forEach((assignmentItem) => {
            mergedMap.set(assignmentItem.id, assignmentItem);
          });
        });

        const now = new Date();
        const nextItems = Array.from(mergedMap.values()).sort((a, b) => {
          const aIsOngoing = isOngoingAssignment(a, now);
          const bIsOngoing = isOngoingAssignment(b, now);

          if (aIsOngoing !== bIsOngoing) {
            return aIsOngoing ? -1 : 1;
          }

          return aIsOngoing
            ? Date.parse(a.deadlineAt) - Date.parse(b.deadlineAt)
            : Date.parse(b.deadlineAt) - Date.parse(a.deadlineAt);
        });

        setAssignmentItems(nextItems);
        setPastAssignmentPage(1);

        if (successCount === 0) {
          setErrorMessage(
            "과제 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.",
          );
        }
      } catch {
        if (!isMounted) {
          return;
        }

        setAssignmentItems([]);
        setErrorMessage(
          "과제 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadAssignments();

    return () => {
      isMounted = false;
    };
  }, [user.track]);

  /**
   * 진행 중인 과제 목록입니다.
   */
  const ongoingAssignments = useMemo(
    () => assignmentItems.filter((item) => isOngoingAssignment(item)),
    [assignmentItems],
  );

  /**
   * 지난 과제 목록입니다.
   */
  const pastAssignments = useMemo(
    () => assignmentItems.filter((item) => !isOngoingAssignment(item)),
    [assignmentItems],
  );

  /**
   * 아직 제출하지 않은 진행 중 과제 목록입니다.
   */
  const actionRequiredAssignments = useMemo(
    () =>
      ongoingAssignments.filter(
        (item) => item.submissionState === "notSubmitted",
      ),
    [ongoingAssignments],
  );

  /**
   * 상단 경고 박스에 표시할 대표 과제입니다.
   */
  const highlightedAssignment = useMemo(
    () =>
      [...actionRequiredAssignments].sort(
        (a, b) => Date.parse(a.deadlineAt) - Date.parse(b.deadlineAt),
      )[0] ?? null,
    [actionRequiredAssignments],
  );

  /**
   * 표 렌더링용 진행 중 과제 행 데이터입니다.
   */
  const ongoingRows = useMemo(
    () => ongoingAssignments.map((item) => toMyAssignmentsTableRow(item)),
    [ongoingAssignments],
  );

  /**
   * 표 렌더링용 지난 과제 행 데이터입니다.
   */
  const pastRows = useMemo(
    () => pastAssignments.map((item) => toMyAssignmentsTableRow(item)),
    [pastAssignments],
  );

  /**
   * 지난 과제 총 페이지 수입니다.
   */
  const totalPastAssignmentPages = useMemo(
    () => Math.max(1, Math.ceil(pastRows.length / PAST_ASSIGNMENT_PAGE_SIZE)),
    [pastRows.length],
  );

  useEffect(() => {
    if (pastAssignmentPage > totalPastAssignmentPages) {
      setPastAssignmentPage(totalPastAssignmentPages);
    }
  }, [pastAssignmentPage, totalPastAssignmentPages]);

  /**
   * 현재 페이지에 노출할 지난 과제 행 데이터입니다.
   */
  const pagedPastRows = useMemo(() => {
    const startIndex = (pastAssignmentPage - 1) * PAST_ASSIGNMENT_PAGE_SIZE;
    return pastRows.slice(startIndex, startIndex + PAST_ASSIGNMENT_PAGE_SIZE);
  }, [pastAssignmentPage, pastRows]);

  /**
   * 지난 과제 페이지네이션 토큰입니다.
   */
  const pastAssignmentPageTokens = useMemo(
    () =>
      buildAssignmentPageTokens(pastAssignmentPage, totalPastAssignmentPages),
    [pastAssignmentPage, totalPastAssignmentPages],
  );

  /**
   * 과제 상세 화면으로 이동합니다.
   */
  function moveToAssignmentDetail(
    partId: CommonSpacePartId,
    assignmentId: number,
  ) {
    router.push(buildCommonSpaceAssignmentDetailHref(partId, assignmentId));
  }

  /**
   * 표의 헤더를 렌더링합니다.
   */
  function AssignmentTableHeader() {
    return (
      <div className="flex w-full border-b border-gray-6 text-center px-5 py-2 text-[18px] text-white-1">
        <span className="font-medium flex-2 text-left">과제명</span>
        <span className="font-medium flex-1 hidden lg:block">파트</span>
        <span className="font-medium flex-1 hidden lg:block">기간</span>
        <span className="font-medium flex-1">제출여부</span>
      </div>
    );
  }

  /**
   * 과제 표의 한 줄을 렌더링합니다.
   */
  function AssignmentTableRow({ row }: { row: MyAssignmentsTableRow }) {
    return (
      <li className="flex w-full items-center px-5 py-4 text-[18px] text-white-1 ">
        <button
          type="button"
          onClick={() => moveToAssignmentDetail(row.partId, row.id)}
          className="flex-2 truncate text-left cursor-pointer font-medium transition-colors hover:text-main-1"
        >
          {row.title}
        </button>
        <span className="flex-1 text-white-1 text-center hidden lg:block">
          {row.partLabel}
        </span>
        <span className="flex-1 text-white-1 text-center hidden lg:block">
          {row.periodLabel}
        </span>
        <div className="flex-1 flex justify-center">
          <button
            type="button"
            onClick={() => moveToAssignmentDetail(row.partId, row.id)}
            disabled={row.actionVariant !== "submit"}
            className={`min-w-[42px] rounded-[6px] px-4 py-2 text-[12px] font-semibold transition-colors lg:min-w-[102px] lg:text-[16px] ${getAssignmentActionClassName(
              row.actionVariant,
            )} ${row.actionVariant === "submit" ? "cursor-pointer" : "cursor-default"}`}
          >
            {row.actionLabel}
          </button>
        </div>
      </li>
    );
  }

  return (
    <div className="mt-6 space-y-10">
      {isLoading ? (
        <div className="rounded-[10px] border border-white/10 bg-[#363944] px-4 py-8 text-center text-[13px] text-white/70">
          과제 목록을 불러오는 중입니다.
        </div>
      ) : null}

      {!isLoading && errorMessage ? (
        <div className="rounded-[10px] border border-white/10 bg-[#363944] px-4 py-8 text-center text-[13px] text-[#ff9ea8]">
          {errorMessage}
        </div>
      ) : null}

      {!isLoading && !errorMessage ? (
        <>
          {highlightedAssignment ? (
            <div className="flex items-center justify-between gap-4 rounded-[10px] bg-gray-5 px-5 py-4 text-gray-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-3 border-gray-3 text-[18px] font-extrabold">
                  !
                </span>
                <p className="truncate text-[16px] font-medium lg:text-[24px]">
                  아직 제출하지 않은 과제가 있어요!
                </p>
              </div>
              <div className="flex items-center gap-4.5 font-medium">
                <span className="truncate text-[14px] text-white-1 lg:text-[18px]">
                  {highlightedAssignment.title}
                </span>
                <span className="text-[14px] lg:text-[24px]">
                  {formatAssignmentDday(highlightedAssignment.deadlineAt)}
                </span>
              </div>
            </div>
          ) : null}

          <section>
            <h3 className="text-[24px] font-bold text-white">과제</h3>
            <div className="mt-5">
              <AssignmentTableHeader />
              {ongoingRows.length > 0 ? (
                <ul>
                  {ongoingRows.map((row) => (
                    <AssignmentTableRow key={`ongoing-${row.id}`} row={row} />
                  ))}
                </ul>
              ) : (
                <p className="px-4 py-8 text-center text-[13px] text-white/70">
                  진행 중인 과제가 없습니다.
                </p>
              )}
            </div>
          </section>

          <section>
            <h3 className="text-[24px] font-bold text-white">지난 과제</h3>
            <div className="mt-5">
              <AssignmentTableHeader />
              {pagedPastRows.length > 0 ? (
                <ul>
                  {pagedPastRows.map((row) => (
                    <AssignmentTableRow key={`past-${row.id}`} row={row} />
                  ))}
                </ul>
              ) : (
                <p className="px-4 py-8 text-center text-[16px] text-white/70">
                  지난 과제가 없습니다.
                </p>
              )}
            </div>
          </section>

          {pastRows.length > 0 ? (
            <div className="flex items-center justify-center gap-2 text-[12px] text-white/65">
              <button
                type="button"
                onClick={() =>
                  setPastAssignmentPage((prev) => Math.max(prev - 1, 1))
                }
                disabled={pastAssignmentPage === 1}
                className="rounded px-2 py-1 disabled:opacity-35"
              >
                이전
              </button>

              {pastAssignmentPageTokens.map((token, index) => {
                if (token === "...") {
                  return (
                    <span key={`${token}-${index}`} className="px-1">
                      ...
                    </span>
                  );
                }

                const pageNumber = Number(token);
                const isActivePage = pageNumber === pastAssignmentPage;

                return (
                  <button
                    key={token}
                    type="button"
                    onClick={() => setPastAssignmentPage(pageNumber)}
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
                  setPastAssignmentPage((prev) =>
                    Math.min(prev + 1, totalPastAssignmentPages),
                  )
                }
                disabled={pastAssignmentPage >= totalPastAssignmentPages}
                className="rounded px-2 py-1 disabled:opacity-35"
              >
                다음
              </button>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
