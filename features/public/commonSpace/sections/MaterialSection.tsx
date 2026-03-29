"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MaterialCard from "../components/MaterialCard";
import NoticeCard from "../components/NoticeCard";
import {
  buildCommonSpaceMaterialDetailHref,
} from "../config";
import {
  COMMON_SPACE_MATERIAL_EMPTY_TITLE_BY_PART,
  COMMON_SPACE_MATERIAL_STATUS_MESSAGE,
  DEFAULT_COMMON_SPACE_MATERIAL_PAGE_SIZE,
} from "../materials/constants";
import { commonSpaceMaterialMockDataSource } from "../materials/source";
import type {
  CommonSpaceMaterialListItem,
  CommonSpaceMaterialLoadState,
} from "../materials/types";
import type { CommonSpacePartId } from "../types";

type MaterialSectionProps = {
  partId: CommonSpacePartId;
};

/**
 * 검색 입력창 placeholder 문구다.
 */
const MATERIAL_SEARCH_PLACEHOLDER = "검색어를 입력하세요. (최대 10자)";

/**
 * 검색어 최대 글자 수다.
 */
const MATERIAL_SEARCH_MAX_LENGTH = 10;

/**
 * 세션 자료 목록 섹션을 렌더링한다.
 */
export default function MaterialSection({ partId }: MaterialSectionProps) {
  const router = useRouter();

  /**
   * 화면에 표시할 세션 자료 목록 상태다.
   */
  const [materialItems, setMaterialItems] = useState<CommonSpaceMaterialListItem[]>(
    [],
  );

  /**
   * 세션 자료 목록 비동기 로드 상태다.
   */
  const [loadState, setLoadState] =
    useState<CommonSpaceMaterialLoadState>("idle");

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

    async function loadMaterialItems() {
      setLoadState("loading");
      setSearchInput("");
      setSearchKeyword("");
      setCurrentPage(1);

      try {
        const response = await commonSpaceMaterialMockDataSource.getList({
          partId,
          page: 0,
          size: 100,
        });

        if (!isMounted) {
          return;
        }

        setMaterialItems(response.items);
        setLoadState(response.items.length > 0 ? "success" : "empty");
      } catch {
        if (!isMounted) {
          return;
        }

        setMaterialItems([]);
        setLoadState("error");
      }
    }

    loadMaterialItems();

    return () => {
      isMounted = false;
    };
  }, [partId]);

  /**
   * 검색어를 정규화한 값이다.
   */
  const normalizedSearchKeyword = searchKeyword.trim().toLowerCase();

  /**
   * 현재 검색 조건을 반영한 세션 자료 목록이다.
   */
  const filteredMaterialItems = materialItems.filter((item) =>
    normalizedSearchKeyword
      ? item.title.toLowerCase().includes(normalizedSearchKeyword)
      : true,
  );

  /**
   * 상단에 고정 노출할 pinned 자료다.
   */
  const pinnedMaterialItem =
    filteredMaterialItems.find((item) => item.isPinned) ?? null;

  /**
   * pinned 자료를 제외한 일반 자료 목록이다.
   */
  const regularMaterialItems = filteredMaterialItems.filter(
    (item) => !item.isPinned,
  );

  /**
   * 검색 결과 기준 전체 페이지 수다.
   */
  const totalPages =
    Math.ceil(
      regularMaterialItems.length / DEFAULT_COMMON_SPACE_MATERIAL_PAGE_SIZE,
    ) || 1;

  /**
   * 필터링 결과를 기준으로 보정한 현재 페이지 번호다.
   */
  const resolvedCurrentPage = Math.min(currentPage, totalPages);

  /**
   * 현재 페이지에 노출할 일반 세션 자료 목록이다.
   */
  const paginatedMaterialItems = regularMaterialItems.slice(
    (resolvedCurrentPage - 1) * DEFAULT_COMMON_SPACE_MATERIAL_PAGE_SIZE,
    resolvedCurrentPage * DEFAULT_COMMON_SPACE_MATERIAL_PAGE_SIZE,
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
   * 상세 세션 자료 화면으로 이동한다.
   */
  function handleMaterialClick(materialId: number) {
    router.push(buildCommonSpaceMaterialDetailHref(partId, materialId));
  }

  /**
   * 로딩/에러/빈 상태에서 보여줄 안내 문구다.
   */
  const statusMessage =
    loadState === "empty"
      ? COMMON_SPACE_MATERIAL_EMPTY_TITLE_BY_PART[partId]
      : loadState !== "success" && loadState !== "idle"
        ? COMMON_SPACE_MATERIAL_STATUS_MESSAGE[loadState]
        : null;

  /**
   * 검색 결과가 비어 있는지 여부다.
   */
  const isSearchResultEmpty =
    loadState === "success" && filteredMaterialItems.length === 0;

  /**
   * 페이지 버튼 목록이다.
   */
  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  );

  return (
    <section className="pb-16">
      {statusMessage ? (
        <div className="rounded-[18px] border border-gray-6 bg-[#202329] px-6 py-14 text-center">
          <p className="text-[18px] font-medium text-gray-3">{statusMessage}</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {pinnedMaterialItem ? (
              <NoticeCard
                title={pinnedMaterialItem.title}
                pinned
                isNew={pinnedMaterialItem.isNew}
                onClick={() => handleMaterialClick(pinnedMaterialItem.id)}
              />
            ) : null}

            <ul className="mt-10 space-y-4">
              {paginatedMaterialItems.map((item) => (
                <li key={item.id}>
                  <MaterialCard
                    title={item.title}
                    summary={item.summary}
                    createdAt={item.createdAt}
                    thumbnailSrc={item.thumbnailSrc}
                    thumbnailAlt={item.thumbnailAlt}
                    onClick={() => handleMaterialClick(item.id)}
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
          </div>

          <form
            onSubmit={handleSearchSubmit}
            className="mt-12 flex flex-wrap items-center gap-4"
          >
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              maxLength={MATERIAL_SEARCH_MAX_LENGTH}
              placeholder={MATERIAL_SEARCH_PLACEHOLDER}
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
            aria-label="세션 자료 페이지네이션"
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
                aria-current={
                  pageNumber === resolvedCurrentPage ? "page" : undefined
                }
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
        </>
      )}
    </section>
  );
}
