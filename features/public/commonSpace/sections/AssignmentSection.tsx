"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AssignmentCard from "../components/AssignmentCard";
import NoticeCard from "../components/NoticeCard";
import {
  buildCommonSpaceAssignmentDetailHref,
  buildCommonSpaceNoticeDetailHref,
} from "../config";
import {
  COMMON_SPACE_ASSIGNMENT_EMPTY_TITLE_BY_PART,
  COMMON_SPACE_ASSIGNMENT_STATUS_MESSAGE,
  DEFAULT_COMMON_SPACE_ASSIGNMENT_PAGE_SIZE,
} from "../assignments/constants";
import { commonSpaceAssignmentApiDataSource } from "../assignments/source";
import type {
  CommonSpaceAssignmentListItem,
  CommonSpaceAssignmentLoadState,
  CommonSpaceAssignmentSubmissionRequest,
} from "../assignments/types";
import { getCommonSpacePinnedNoticeItems } from "../notices/source";
import type { CommonSpaceNoticeListItem } from "../notices/types";
import type { CommonSpacePartId } from "../types";

type AssignmentSectionProps = {
  partId: CommonSpacePartId;
};

/**
 * 검색 입력창 placeholder 문구다.
 */
const ASSIGNMENT_SEARCH_PLACEHOLDER = "검색어를 입력하세요. (최대 10자)";

/**
 * 검색어 최대 글자 수다.
 */
const ASSIGNMENT_SEARCH_MAX_LENGTH = 10;

/**
 * 과제 섹션이 현재 사용할 데이터 소스다.
 * 실 API 연결 시 mock 대신 api data source로 교체하면 된다.
 */
const commonSpaceAssignmentDataSource = commonSpaceAssignmentApiDataSource;

/**
 * 과제 섹션 목록과 상단 pinned 공지를 함께 불러온다.
 */
async function getAssignmentSectionData(partId: CommonSpacePartId) {
  const [assignmentResponse, pinnedNoticeItems] = await Promise.all([
    commonSpaceAssignmentDataSource.getList({
      partId,
    }),
    getCommonSpacePinnedNoticeItems(partId),
  ]);

  return {
    assignmentItems: assignmentResponse.items,
    pinnedNoticeItems,
  };
}

/**
 * 과제 안내 및 제출 섹션을 렌더링한다.
 */
export default function AssignmentSection({ partId }: AssignmentSectionProps) {
  const router = useRouter();

  /**
   * 화면에 표시할 과제 목록 상태다.
   */
  const [assignmentItems, setAssignmentItems] = useState<
    CommonSpaceAssignmentListItem[]
  >([]);

  /**
   * 섹션 상단에 고정 노출할 pinned 공지 목록이다.
   */
  const [pinnedNoticeItems, setPinnedNoticeItems] = useState<
    CommonSpaceNoticeListItem[]
  >([]);

  /**
   * 과제 목록 비동기 로드 상태다.
   */
  const [loadState, setLoadState] =
    useState<CommonSpaceAssignmentLoadState>("idle");

  /**
   * 입력창에 보이는 검색어다.
   */
  const [searchInput, setSearchInput] = useState("");

  /**
   * 실제 검색에 적용된 검색어다.
   */
  const [searchKeyword, setSearchKeyword] = useState("");

  /**
   * 현재 선택된 페이지 번호다. UI에서는 1부터 시작한다.
   */
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let isMounted = true;

    async function loadAssignmentItems() {
      setLoadState("loading");
      setSearchInput("");
      setSearchKeyword("");
      setCurrentPage(1);

      try {
        const nextSectionData = await getAssignmentSectionData(partId);

        if (!isMounted) {
          return;
        }

        setAssignmentItems(nextSectionData.assignmentItems);
        setPinnedNoticeItems(nextSectionData.pinnedNoticeItems);
        setLoadState(
          nextSectionData.assignmentItems.length > 0 ||
            nextSectionData.pinnedNoticeItems.length > 0
            ? "success"
            : "empty",
        );
      } catch {
        if (!isMounted) {
          return;
        }

        setAssignmentItems([]);
        setPinnedNoticeItems([]);
        setLoadState("error");
      }
    }

    loadAssignmentItems();

    return () => {
      isMounted = false;
    };
  }, [partId]);

  /**
   * 검색어를 정규화한 값이다.
   */
  const normalizedSearchKeyword = searchKeyword.trim().toLowerCase();

  /**
   * 현재 검색 조건을 반영한 과제 목록이다.
   */
  const filteredAssignmentItems = assignmentItems.filter((item) =>
    normalizedSearchKeyword
      ? item.title.toLowerCase().includes(normalizedSearchKeyword)
      : true,
  );

  /**
   * 검색 결과 기준 전체 페이지 수다.
   */
  const totalPages =
    Math.ceil(
      filteredAssignmentItems.length / DEFAULT_COMMON_SPACE_ASSIGNMENT_PAGE_SIZE,
    ) || 1;

  /**
   * 필터링 결과를 기준으로 보정한 현재 페이지 번호다.
   */
  const resolvedCurrentPage = Math.min(currentPage, totalPages);

  /**
   * 현재 페이지에 노출할 과제 목록이다.
   */
  const paginatedAssignmentItems = filteredAssignmentItems.slice(
    (resolvedCurrentPage - 1) * DEFAULT_COMMON_SPACE_ASSIGNMENT_PAGE_SIZE,
    resolvedCurrentPage * DEFAULT_COMMON_SPACE_ASSIGNMENT_PAGE_SIZE,
  );

  /**
   * 검색 폼 제출을 처리한다.
   */
  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearchKeyword(searchInput.trim());
    setCurrentPage(1);
  }

  /**
   * 상단 pinned 공지 상세 화면으로 이동한다.
   */
  function handlePinnedNoticeClick(noticeId: number) {
    router.push(buildCommonSpaceNoticeDetailHref(partId, noticeId));
  }

  /**
   * 과제 상세 화면으로 이동한다.
   */
  function handleAssignmentClick(assignmentId: number) {
    router.push(buildCommonSpaceAssignmentDetailHref(partId, assignmentId));
  }

  /**
   * 과제 제출 또는 수정 제출 이후 목록 상태를 갱신한다.
   */
  async function handleAssignmentSubmit(
    assignmentId: number,
    submissionState: CommonSpaceAssignmentListItem["submissionState"],
    file: File,
  ) {
    const submissionPayload = {
      request: {},
      files: [file],
    } satisfies CommonSpaceAssignmentSubmissionRequest;

    if (submissionState === "rejected") {
      await commonSpaceAssignmentDataSource.updateSubmission(
        assignmentId,
        submissionPayload,
      );
    } else {
      await commonSpaceAssignmentDataSource.submit(
        assignmentId,
        submissionPayload,
      );
    }

    const nextSectionData = await getAssignmentSectionData(partId);

    setAssignmentItems(nextSectionData.assignmentItems);
    setPinnedNoticeItems(nextSectionData.pinnedNoticeItems);
    setLoadState(
      nextSectionData.assignmentItems.length > 0 ||
        nextSectionData.pinnedNoticeItems.length > 0
        ? "success"
        : "empty",
    );
  }

  /**
   * 로딩/에러/빈 상태에서 보여줄 안내 문구다.
   */
  const statusMessage =
    loadState === "empty"
      ? COMMON_SPACE_ASSIGNMENT_EMPTY_TITLE_BY_PART[partId]
      : loadState !== "success" && loadState !== "idle"
        ? COMMON_SPACE_ASSIGNMENT_STATUS_MESSAGE[loadState]
        : null;

  /**
   * 검색 결과가 비어 있는지 여부다.
   */
  const isSearchResultEmpty =
    loadState === "success" &&
    filteredAssignmentItems.length === 0 &&
    pinnedNoticeItems.length === 0;

  /**
   * 페이지 버튼 목록이다.
   */
  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  );

  return (
    <section className="pb-16">
      <div className="space-y-4">
        {pinnedNoticeItems.map((item) => (
          <NoticeCard
            key={item.id}
            title={item.title}
            pinned
            isNew={item.isNew}
            onClick={() => handlePinnedNoticeClick(item.id)}
          />
        ))}

        {statusMessage ? (
          <div className="rounded-[18px] border border-gray-6 bg-[#202329] px-6 py-14 text-center">
            <p className="text-[18px] font-medium text-gray-3">{statusMessage}</p>
          </div>
        ) : (
          <>
            <ul className="mt-10 flex flex-col gap-6">
              {paginatedAssignmentItems.map((item) => (
                <AssignmentCard
                  key={item.id}
                  assignment={item}
                  onClick={() => handleAssignmentClick(item.id)}
                  onSubmitFile={(file) =>
                    handleAssignmentSubmit(item.id, item.submissionState, file)
                  }
                />
              ))}
            </ul>

            {isSearchResultEmpty ? (
              <div className="rounded-[18px] border border-gray-6 bg-[#202329] px-6 py-14 text-center">
                <p className="text-[18px] font-medium text-gray-3">
                  검색 결과가 없습니다.
                </p>
              </div>
            ) : null}
          </>
        )}
      </div>

      <form
        onSubmit={handleSearchSubmit}
        className="mt-12 flex flex-wrap items-center gap-4"
      >
        <input
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          maxLength={ASSIGNMENT_SEARCH_MAX_LENGTH}
          placeholder={ASSIGNMENT_SEARCH_PLACEHOLDER}
          className="h-[52px] w-[280px] rounded-[8px] bg-[#F4F4F4] px-4 text-[14px] text-[#1F1F1F] placeholder:text-[#A0A3AE] focus:outline-none"
        />
        <button
          type="submit"
          className="h-[52px] min-w-[90px] rounded-[8px] bg-black px-6 text-[16px] font-semibold text-white-1"
        >
          검색
        </button>
      </form>

      <nav
        aria-label="과제 안내 페이지네이션"
        className="mt-11 flex items-center justify-center gap-5 text-[18px] text-gray-4"
      >
        <button
          type="button"
          onClick={() => setCurrentPage(1)}
          disabled={resolvedCurrentPage === 1}
          className="cursor-pointer disabled:cursor-auto disabled:opacity-40"
        >
          &laquo;
        </button>
        <button
          type="button"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={resolvedCurrentPage === 1}
          className="cursor-pointer disabled:cursor-auto disabled:opacity-40"
        >
          &lsaquo;
        </button>

        {pageNumbers.map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            onClick={() => setCurrentPage(pageNumber)}
            className={
              pageNumber === resolvedCurrentPage
                ? "font-semibold text-white-1"
                : "cursor-pointer text-gray-4"
            }
            aria-current={pageNumber === resolvedCurrentPage ? "page" : undefined}
          >
            {pageNumber}
          </button>
        ))}

        <button
          type="button"
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={resolvedCurrentPage === totalPages}
          className="cursor-pointer disabled:cursor-auto disabled:opacity-40"
        >
          &rsaquo;
        </button>
        <button
          type="button"
          onClick={() => setCurrentPage(totalPages)}
          disabled={resolvedCurrentPage === totalPages}
          className="cursor-pointer disabled:cursor-auto disabled:opacity-40"
        >
          &raquo;
        </button>
      </nav>
    </section>
  );
}
