type ApplicantPaginationProps = {
  page: number;
  totalPages: number;
  isLoading: boolean;
  disabled: boolean;
  pageButtonLimit: number;
  onChangePage: (nextPage: number) => void;
};

export default function ApplicantPagination({
  page,
  totalPages,
  isLoading,
  disabled,
  pageButtonLimit,
  onChangePage,
}: ApplicantPaginationProps) {
  const pageGroupStart = Math.floor(page / pageButtonLimit) * pageButtonLimit;
  const pageGroupEnd = Math.min(pageGroupStart + pageButtonLimit, totalPages);
  const visiblePages = Array.from(
    { length: Math.max(pageGroupEnd - pageGroupStart, 0) },
    (_, index) => pageGroupStart + index,
  );
  const canPrevGroup = pageGroupStart > 0;
  const canNextGroup = pageGroupEnd < totalPages;

  return (
    <div className="mt-4 flex items-center justify-end gap-2">
      <button
        type="button"
        disabled={!canPrevGroup || isLoading || disabled}
        onClick={() => onChangePage(Math.max(pageGroupStart - pageButtonLimit, 0))}
        className="h-9 rounded-md border border-[#565d6d] px-3 text-sm disabled:opacity-50"
      >
        이전
      </button>

      {visiblePages.map((pageIndex) => (
        <button
          key={pageIndex}
          type="button"
          onClick={() => onChangePage(pageIndex)}
          disabled={isLoading || disabled}
          className={`h-9 min-w-9 rounded-md border px-2 text-sm disabled:opacity-50 ${
            pageIndex === page
              ? "border-main-1 bg-main-1 text-white"
              : "border-[#565d6d] text-gray-3"
          }`}
        >
          {pageIndex + 1}
        </button>
      ))}

      <button
        type="button"
        disabled={!canNextGroup || isLoading || disabled}
        onClick={() => onChangePage(pageGroupEnd)}
        className="h-9 rounded-md border border-[#565d6d] px-3 text-sm disabled:opacity-50"
      >
        다음
      </button>
    </div>
  );
}

