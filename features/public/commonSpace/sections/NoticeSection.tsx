"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NoticeCard from "../components/NoticeCard";
import type { CommonSpacePartId } from "../types";
import { buildCommonSpaceNoticeDetailHref } from "../config";
import {
  COMMON_SPACE_NOTICE_EMPTY_TITLE_BY_PART,
  COMMON_SPACE_NOTICE_STATUS_MESSAGE,
  DEFAULT_COMMON_SPACE_NOTICE_PAGE_SIZE,
} from "../notices/constants";
import {
  commonSpaceNoticeApiDataSource,
  excludeCommonSpacePinnedNoticeItems,
  getCommonSpacePinnedNoticeItems,
} from "../notices/source";
import type {
  CommonSpaceNoticeListItem,
  CommonSpaceNoticeLoadState,
} from "../notices/types";

type NoticeSectionProps = {
  partId: CommonSpacePartId;
};

/**
 * 검색 입력창 placeholder 문구다.
 */
const NOTICE_SEARCH_PLACEHOLDER = "검색어를 입력하세요. (최대 10자)";

/**
 * 검색어 최대 글자 수다.
 */
const NOTICE_SEARCH_MAX_LENGTH = 10;

/**
 * 전체 공지 섹션을 렌더링한다.
 */
export default function NoticeSection({ partId }: NoticeSectionProps) {
  const router = useRouter();

  /**
   * 화면에 표시할 공지 목록 상태다.
   */
  const [noticeItems, setNoticeItems] = useState<CommonSpaceNoticeListItem[]>(
    [],
  );

  /**
   * 섹션 상단에 고정 노출할 pinned 공지 목록이다.
   */
  const [pinnedNoticeItems, setPinnedNoticeItems] = useState<
    CommonSpaceNoticeListItem[]
  >([]);

  /**
   * 공지 목록 비동기 로드 상태다.
   */
  const [loadState, setLoadState] =
    useState<CommonSpaceNoticeLoadState>("idle");

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

    async function loadNoticeItems() {
      setLoadState("loading");
      setSearchInput("");
      setSearchKeyword("");
      setCurrentPage(1);

      try {
        const [response, nextPinnedNoticeItems] = await Promise.all([
          commonSpaceNoticeApiDataSource.getList({
            partId,
            page: 0,
            size: 100,
          }),
          getCommonSpacePinnedNoticeItems(partId),
        ]);

        if (!isMounted) {
          return;
        }

        setNoticeItems(response.items);
        setPinnedNoticeItems(nextPinnedNoticeItems);
        setLoadState(
          response.items.length > 0 || nextPinnedNoticeItems.length > 0
            ? "success"
            : "empty",
        );
      } catch {
        if (!isMounted) {
          return;
        }

        setNoticeItems([]);
        setPinnedNoticeItems([]);
        setLoadState("error");
      }
    }

    loadNoticeItems();

    return () => {
      isMounted = false;
    };
  }, [partId]);

  /**
   * 검색어를 정규화한 값이다.
   */
  const normalizedSearchKeyword = searchKeyword.trim().toLowerCase();

  /**
   * 현재 검색 조건을 반영한 공지 목록이다.
   */
  const filteredNoticeItems = excludeCommonSpacePinnedNoticeItems(
    noticeItems,
    pinnedNoticeItems,
  ).filter((item) =>
    normalizedSearchKeyword
      ? item.title.toLowerCase().includes(normalizedSearchKeyword)
      : true,
  );

  /**
   * 현재 검색 조건을 반영한 pinned 공지 목록이다.
   */
  const filteredPinnedNoticeItems = pinnedNoticeItems.filter((item) =>
    normalizedSearchKeyword
      ? item.title.toLowerCase().includes(normalizedSearchKeyword)
      : true,
  );

  /**
   * 검색 결과 기준 전체 페이지 수다.
   */
  const totalPages =
    Math.ceil(
      filteredNoticeItems.length / DEFAULT_COMMON_SPACE_NOTICE_PAGE_SIZE,
    ) || 1;

  /**
   * 필터링 결과를 기준으로 보정한 현재 페이지 번호다.
   */
  const resolvedCurrentPage = Math.min(currentPage, totalPages);

  /**
   * 현재 페이지에 노출할 일반 공지 목록이다.
   */
  const paginatedNoticeItems = filteredNoticeItems.slice(
    (resolvedCurrentPage - 1) * DEFAULT_COMMON_SPACE_NOTICE_PAGE_SIZE,
    resolvedCurrentPage * DEFAULT_COMMON_SPACE_NOTICE_PAGE_SIZE,
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
   * 상세 공지 화면으로 이동한다.
   */
  function handleNoticeClick(noticeId: number) {
    router.push(buildCommonSpaceNoticeDetailHref(partId, noticeId));
  }

  /**
   * 상단 pinned 공지 카드는 해당 공지의 원래 파트 기준으로 상세 화면을 연다.
   */
  function handlePinnedNoticeClick(
    noticePartId: CommonSpacePartId,
    noticeId: number,
  ) {
    router.push(buildCommonSpaceNoticeDetailHref(noticePartId, noticeId));
  }

  /**
   * 로딩/에러/빈 상태에서 보여줄 안내 문구다.
   */
  const statusMessage =
    loadState === "empty"
      ? COMMON_SPACE_NOTICE_EMPTY_TITLE_BY_PART[partId]
      : loadState !== "success" && loadState !== "idle"
        ? COMMON_SPACE_NOTICE_STATUS_MESSAGE[loadState]
        : null;

  /**
   * 검색 결과가 비어 있는지 여부다.
   */
  const isSearchResultEmpty =
    loadState === "success" &&
    filteredNoticeItems.length === 0 &&
    filteredPinnedNoticeItems.length === 0;

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
        {filteredPinnedNoticeItems.map((item) => (
          <NoticeCard
            key={item.id}
            title={item.title}
            pinned
            isNew={item.isNew}
            onClick={() => handlePinnedNoticeClick(item.partId, item.id)}
          />
        ))}

        {statusMessage ? (
          <div className="rounded-[18px] border border-gray-6 bg-[#202329] px-6 py-14 text-center">
            <p className="text-[18px] font-medium text-gray-3">{statusMessage}</p>
          </div>
        ) : (
          <>
            <ul className="mt-10 space-y-4">
              {paginatedNoticeItems.map((item) => (
                <li key={item.id}>
                  <NoticeCard
                    title={item.title}
                    isNew={item.isNew}
                    onClick={() => handleNoticeClick(item.id)}
                  />
                </li>
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
        className="mt-10 flex w-full flex-wrap items-center gap-3 sm:mt-12 sm:gap-4 lg:mt-29"
      >
        <input
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          maxLength={NOTICE_SEARCH_MAX_LENGTH}
          placeholder={NOTICE_SEARCH_PLACEHOLDER}
          className="h-[52px] w-full rounded-[8px] bg-[#F4F4F4] px-4 text-[14px] text-[#1F1F1F] placeholder:text-[#A0A3AE] focus:outline-none sm:w-[280px]"
        />
        <button
          type="submit"
          className="h-[52px] w-full rounded-[8px] bg-black px-6 text-[16px] font-semibold text-white-1 sm:min-w-[90px] sm:w-auto"
        >
          검색
        </button>
      </form>

      <nav
        aria-label="전체 공지 페이지네이션"
        className="mt-10 flex flex-wrap items-center justify-center gap-4 text-[16px] text-gray-4 sm:mt-12 sm:gap-5 sm:text-[18px] lg:mt-29 lg:justify-between lg:text-[24px]"
      >
        <div className="flex gap-3 sm:gap-4 lg:-mr-3.25 lg:gap-5">
          <button
            type="button"
            onClick={() => setCurrentPage(1)}
            disabled={resolvedCurrentPage === 1}
            className="disabled:opacity-40 disabled:cursor-auto cursor-pointer"
          >
            &laquo;
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={resolvedCurrentPage === 1}
            className="disabled:opacity-40 disabled:cursor-auto cursor-pointer"
          >
            &lsaquo;
          </button>
        </div>

        <div className="order-3 flex w-full justify-center gap-3 sm:gap-4 lg:order-none lg:w-auto lg:gap-17.25">
          {pageNumbers.map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => setCurrentPage(pageNumber)}
              className={
                pageNumber === resolvedCurrentPage
                  ? "font-semibold text-white-1"
                  : "text-gray-4 cursor-pointer"
              }
              aria-current={pageNumber === resolvedCurrentPage ? "page" : undefined}
            >
              {pageNumber}
            </button>
          ))}
        </div>

        <div className="flex gap-3 sm:gap-4 lg:-ml-3.25 lg:gap-5">
          <button
            type="button"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={resolvedCurrentPage === totalPages}
            className="disabled:opacity-40 disabled:cursor-auto cursor-pointer"
          >
            &rsaquo;
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage(totalPages)}
            disabled={resolvedCurrentPage === totalPages}
            className="disabled:opacity-40 disabled:cursor-auto cursor-pointer"
          >
            &raquo;
          </button>
        </div>
      </nav>
    </section>
  );
}
