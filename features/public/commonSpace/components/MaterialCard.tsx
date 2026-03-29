/**
 * 세션 자료 카드 한 장을 렌더링하기 위한 표시용 props다.
 */
export type MaterialCardProps = {
  /** 카드에 노출할 자료 제목 */
  title: string;
  /** 카드에 노출할 자료 요약문 */
  summary?: string;
  /** 카드에 노출할 생성일 */
  createdAt: string;
  /** 카드 우측 대표 이미지 경로 */
  thumbnailSrc?: string;
  /** 대표 이미지 대체 텍스트 */
  thumbnailAlt?: string;
  /** 카드 클릭 시 실행할 핸들러 */
  onClick?: () => void;
};

/**
 * 자료 카드에 노출할 날짜 문자열을 화면용 형식으로 변환한다.
 */
function formatMaterialCardDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}. ${month}. ${day}.`;
}

/**
 * 세션 자료 섹션에서 사용할 목록 카드를 렌더링한다.
 */
export default function MaterialCard({
  title,
  summary,
  createdAt,
  thumbnailSrc,
  thumbnailAlt = "",
  onClick,
}: MaterialCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-stretch gap-6 rounded-[14px] bg-linear-to-r from-[#484D5A] to-[#303136] px-6 py-6 text-left text-white-1 transition-shadow hover:shadow-[0_0_12px_white] md:px-8 md:py-7"
      aria-label={`${title} 세션 자료 열기`}
    >
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-[22px] font-bold leading-[1.25] text-white-1">
          {title}
        </p>

        {summary ? (
          <p className="mt-4 line-clamp-3 text-[13px] leading-[1.55] text-gray-3 md:text-[15px]">
            {summary}
          </p>
        ) : null}

        <p className="mt-4 text-[18px] font-medium text-gray-4 md:mt-6">
          {formatMaterialCardDate(createdAt)}
        </p>
      </div>

      {thumbnailSrc ? (
        <div className="hidden h-[110px] w-[110px] shrink-0 overflow-hidden rounded-[12px] bg-[#3A404D] md:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnailSrc}
            alt={thumbnailAlt}
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}
    </button>
  );
}
