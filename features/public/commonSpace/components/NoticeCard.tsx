import Image from "next/image";

type NoticeCardVariant = "pinned" | "default";
type NoticeCardDisplayVariant = "section" | "home";

export type NoticeCardProps = {
  title: string;
  pinned?: boolean;
  isNew?: boolean;
  onClick?: () => void;
  displayVariant?: NoticeCardDisplayVariant;
  backgroundImageSrc?: string;
  backgroundImageAlt?: string;
  backgroundImageClassName?: string;
  backgroundImageWidth?: number;
  backgroundImageHeight?: number;
};

const NOTICE_CARD_BASE_CLASS_NAME_BY_DISPLAY_VARIANT: Record<
  NoticeCardDisplayVariant,
  string
> = {
  section:
    "group relative flex w-full items-center overflow-hidden rounded-[14px] px-4 py-5 text-white-1 transition-shadow hover:shadow-[0_0_12px_white] sm:px-6 sm:py-6 md:px-8 md:py-7 cursor-pointer",
  home: "group relative w-full overflow-hidden rounded-[14px] px-4 py-5 text-white-1 transition-shadow hover:shadow-[0_0_12px_white] sm:px-6 sm:py-6 cursor-pointer",
};

const NOTICE_CARD_DEFAULT_CONTAINER_CLASS_NAME_BY_DISPLAY_VARIANT: Record<
  NoticeCardDisplayVariant,
  string
> = {
  section: "bg-linear-to-r from-[#484D5A] to-[#303136]",
  home: "bg-linear-to-r from-gray-6 to-gray-7",
};

const NOTICE_CARD_PINNED_CONTAINER_CLASS_NAME =
  "bg-linear-to-r from-[#334EBE] to-[#0B7DE2] shadow-[0_0_17.3px_#003BA8]";

const NOTICE_CARD_CONTENT_CLASS_NAME_BY_DISPLAY_VARIANT: Record<
  NoticeCardDisplayVariant,
  string
> = {
  section:
    "relative z-10 flex min-w-0 flex-1 items-center gap-3 text-left sm:gap-4 md:gap-5",
  home: "relative z-10 flex min-w-0 items-center gap-3 text-left sm:gap-4",
};

const NOTICE_CARD_TITLE_CLASS_NAME_BY_DISPLAY_VARIANT: Record<
  NoticeCardDisplayVariant,
  string
> = {
  section:
    "min-w-0 truncate text-[17px] leading-[1.25] font-bold text-white-1 sm:text-[19px] md:text-[22px] cursor-pointer",
  home: "min-w-0 flex-1 truncate text-[17px] leading-[1.27] font-bold text-white-1 sm:text-[19px] md:text-[20px] cursor-pointer",
};

const NOTICE_CARD_HOME_BACKGROUND_IMAGE_CLASS_NAME =
  "pointer-events-none absolute -right-4 -top-24 z-0 hidden w-[190px] opacity-10 sm:block md:-top-32 md:right-0 md:w-[240px]";

function getNoticeCardVariant(pinned?: boolean): NoticeCardVariant {
  return pinned ? "pinned" : "default";
}

function NoticeCardArrowIcon() {
  return (
    <svg
      width="12"
      height="24"
      viewBox="0 0 12 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="relative z-10 h-5 w-3 shrink-0 text-white-1 sm:h-6 sm:w-3"
      aria-hidden="true"
    >
      <path
        d="M2 2L10 12L2 22"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

function NoticeCardNewBadge() {
  return (
    <span className="shrink-0 rounded-full bg-background/50 px-2.5 py-1.5 text-[13px] leading-none font-normal text-white-1 sm:px-3 sm:py-2 sm:text-[15px] md:px-3.5 md:text-[20px]">
      NEW
    </span>
  );
}

export default function NoticeCard({
  title,
  pinned = false,
  isNew = false,
  onClick,
  displayVariant = "section",
  backgroundImageSrc,
  backgroundImageAlt = "",
  backgroundImageClassName = NOTICE_CARD_HOME_BACKGROUND_IMAGE_CLASS_NAME,
  backgroundImageWidth = 527,
  backgroundImageHeight = 515,
}: NoticeCardProps) {
  const variant = getNoticeCardVariant(pinned);

  const containerClassName = `${NOTICE_CARD_BASE_CLASS_NAME_BY_DISPLAY_VARIANT[displayVariant]} ${
    variant === "pinned"
      ? NOTICE_CARD_PINNED_CONTAINER_CLASS_NAME
      : NOTICE_CARD_DEFAULT_CONTAINER_CLASS_NAME_BY_DISPLAY_VARIANT[
          displayVariant
        ]
  }`;

  const contentClassName = `${NOTICE_CARD_CONTENT_CLASS_NAME_BY_DISPLAY_VARIANT[displayVariant]} ${
    pinned && displayVariant === "section" ? "lg:pr-[220px]" : ""
  }`;

  const shouldShowArrow = displayVariant === "section";
  const shouldShowPinnedArtwork = pinned && displayVariant === "section";
  const shouldShowBackgroundImage =
    displayVariant === "home" && Boolean(backgroundImageSrc);

  return (
    <button
      type="button"
      onClick={onClick}
      className={containerClassName}
      aria-label={`${title} 공지 열기`}
    >
      <div className={contentClassName}>
        {pinned && displayVariant === "section" && (
          <Image
            src="/icons/pin.svg"
            alt=""
            width={29}
            height={29}
            className="h-[22px] w-[22px] shrink-0 sm:h-[24px] sm:w-[24px] md:h-[29px] md:w-[29px]"
            aria-hidden="true"
          />
        )}
        {isNew && <NoticeCardNewBadge />}
        <p
          className={
            NOTICE_CARD_TITLE_CLASS_NAME_BY_DISPLAY_VARIANT[displayVariant]
          }
        >
          {title}
        </p>
      </div>

      {shouldShowArrow && <NoticeCardArrowIcon />}

      {shouldShowPinnedArtwork && (
        <Image
          src="/images/lions/head-back.webp"
          alt="back head lion"
          width={384.3}
          height={332.1}
          quality={90}
          className="absolute opacity-70 right-6 top-1/2 z-0 hidden h-[260px] w-[300px] -translate-y-1/2 rotate-[-20deg] lg:block xl:right-10 xl:h-[332.1px] xl:w-[384.3px]"
        />
      )}

      {shouldShowBackgroundImage ? (
        <Image
          src={backgroundImageSrc ?? "/images/lions/lion-stand-half.webp"}
          alt={backgroundImageAlt}
          width={backgroundImageWidth}
          height={backgroundImageHeight}
          quality={90}
          className={backgroundImageClassName}
          aria-hidden={backgroundImageAlt === ""}
        />
      ) : null}
    </button>
  );
}
