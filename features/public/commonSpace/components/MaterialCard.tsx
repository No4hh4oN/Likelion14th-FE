export type MaterialCardProps = {
  title: string;
  summary?: string;
  createdAt: string;
  thumbnailSrc?: string;
  thumbnailAlt?: string;
  onClick?: () => void;
};

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
      className="group flex w-full flex-col gap-5 rounded-[14px] bg-gray-7 px-5 py-5 text-left text-white-1 transition-shadow hover:shadow-[0_0_8px_#484D5A] sm:flex-row sm:items-stretch sm:gap-6 sm:px-6 sm:py-6 lg:px-8 lg:py-7 cursor-pointer"
      aria-label={`${title} 세션 자료 열기`}
    >
      <div className="min-w-0 flex flex-1 flex-col justify-between">
        <p className="truncate text-[20px] font-bold leading-[1.27] text-white-1 sm:text-[22px] lg:text-[24px]">
          {title}
        </p>

        {summary ? (
          <p className="mt-3 line-clamp-3 text-[15px] leading-[1.45] text-gray-4 sm:text-[16px] lg:mt-3.75 lg:text-[18px] lg:leading-[1.27]">
            {summary}
          </p>
        ) : null}

        <p className="mt-4 text-[14px] font-normal text-white-1 sm:text-[15px] lg:text-[18px]">
          {formatMaterialCardDate(createdAt)}
        </p>
      </div>

      {thumbnailSrc ? (
        <div className="h-[180px] w-full shrink-0 overflow-hidden rounded-[8px] bg-gray-6 sm:h-[132px] sm:w-[132px] lg:h-[170px] lg:w-[170px]">
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
