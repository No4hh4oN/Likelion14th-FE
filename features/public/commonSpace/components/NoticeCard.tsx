import Image from "next/image";

/**
 * 공지 카드가 렌더링할 시각적 상태다.
 */
type NoticeCardVariant = "pinned" | "default";

/**
 * 공지 카드가 렌더링될 위치에 따른 표시 형태다.
 */
type NoticeCardDisplayVariant = "section" | "home";

/**
 * 공지 카드 한 장을 렌더링하기 위한 표시용 props다.
 */
export type NoticeCardProps = {
  /** 카드에 노출할 공지 제목 */
  title: string;
  /** 고정 공지 여부 */
  pinned?: boolean;
  /** 신규 공지 여부 */
  isNew?: boolean;
  /** 카드 클릭 시 실행할 핸들러 */
  onClick?: () => void;
  /** 공지 카드가 배치될 섹션 타입 */
  displayVariant?: NoticeCardDisplayVariant;
  /** 홈 카드에 장식용으로 깔아둘 배경 이미지 경로 */
  backgroundImageSrc?: string;
  /** 홈 카드 배경 이미지의 대체 텍스트 */
  backgroundImageAlt?: string;
  /** 홈 카드 배경 이미지에 적용할 클래스 */
  backgroundImageClassName?: string;
  /** 홈 카드 배경 이미지 원본 너비 */
  backgroundImageWidth?: number;
  /** 홈 카드 배경 이미지 원본 높이 */
  backgroundImageHeight?: number;
};

/**
 * 섹션별 카드 공통 레이아웃 클래스다.
 */
const NOTICE_CARD_BASE_CLASS_NAME_BY_DISPLAY_VARIANT: Record<
  NoticeCardDisplayVariant,
  string
> = {
  section:
    "group relative flex w-full items-center overflow-hidden rounded-[14px] px-6 py-6 text-white-1 md:px-10.5 md:py-8",
  home: "group relative w-full overflow-hidden rounded-[14px] px-6 py-6.5 text-white-1",
};

/**
 * 비고정 공지 카드의 섹션별 배경 클래스다.
 */
const NOTICE_CARD_DEFAULT_CONTAINER_CLASS_NAME_BY_DISPLAY_VARIANT: Record<
  NoticeCardDisplayVariant,
  string
> = {
  section: "bg-linear-to-r from-[#484D5A] to-[#303136]",
  home: "bg-linear-to-r from-gray-6 to-gray-7",
};

/**
 * 고정 공지 카드 배경 클래스다.
 */
const NOTICE_CARD_PINNED_CONTAINER_CLASS_NAME =
  "bg-linear-to-r from-[#334EBE] to-[#0B7DE2] shadow-[0_0_17.3px_#003BA8]";

/**
 * 섹션별 카드 콘텐츠 래퍼 클래스다.
 */
const NOTICE_CARD_CONTENT_CLASS_NAME_BY_DISPLAY_VARIANT: Record<
  NoticeCardDisplayVariant,
  string
> = {
  section:
    "relative z-10 flex min-w-0 flex-1 items-center gap-4 text-left md:gap-5",
  home: "relative z-10 flex min-w-0 items-center gap-4 text-left",
};

/**
 * 섹션별 카드 제목 클래스다.
 */
const NOTICE_CARD_TITLE_CLASS_NAME_BY_DISPLAY_VARIANT: Record<
  NoticeCardDisplayVariant,
  string
> = {
  section:
    "min-w-0 truncate text-[20px] leading-[1.25] font-bold text-white-1 md:text-[24px]",
  home: "min-w-0 flex-1 text-[20px] leading-[1.27] font-bold text-white-1",
};

/**
 * 홈 공지 카드 장식 이미지의 기본 스타일이다.
 */
const NOTICE_CARD_HOME_BACKGROUND_IMAGE_CLASS_NAME =
  "absolute right-1 -top-43 z-0 w-[270px] opacity-15";

/**
 * 공지 카드가 사용할 시각적 변형을 계산한다.
 */
function getNoticeCardVariant(pinned?: boolean): NoticeCardVariant {
  return pinned ? "pinned" : "default";
}

/**
 * 공지 카드 우측 이동 화살표 아이콘이다.
 */
function NoticeCardArrowIcon() {
  return (
    <svg
      width="12"
      height="24"
      viewBox="0 0 12 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="relative z-10 h-5 w-3 shrink-0 text-white-1 md:h-6 md:w-3"
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

/**
 * 공지 카드의 NEW 뱃지다.
 */
function NoticeCardNewBadge() {
  return (
    <span className="shrink-0 rounded-full px-3.5 py-2 text-[20px] leading-none font-normal text-white-1 bg-background/50">
      NEW
    </span>
  );
}

/**
 * 공지 섹션과 홈 섹션에서 공통으로 재사용할 단일 공지 카드를 렌더링한다.
 */
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
  /**
   * 카드의 시각적 변형 값이다.
   */
  const variant = getNoticeCardVariant(pinned);

  /**
   * 카드 바디에 적용할 최종 클래스다.
   */
  const containerClassName = `${NOTICE_CARD_BASE_CLASS_NAME_BY_DISPLAY_VARIANT[displayVariant]} ${
    variant === "pinned"
      ? NOTICE_CARD_PINNED_CONTAINER_CLASS_NAME
      : NOTICE_CARD_DEFAULT_CONTAINER_CLASS_NAME_BY_DISPLAY_VARIANT[
          displayVariant
        ]
  }`;

  /**
   * 콘텐츠 래퍼에 적용할 최종 클래스다.
   */
  const contentClassName = `${NOTICE_CARD_CONTENT_CLASS_NAME_BY_DISPLAY_VARIANT[displayVariant]} ${
    pinned && displayVariant === "section" ? "md:pr-[260px]" : ""
  }`;

  /**
   * 우측 화살표를 노출할지 여부다.
   */
  const shouldShowArrow = displayVariant === "section";

  /**
   * 고정 공지 전용 우측 비주얼을 노출할지 여부다.
   */
  const shouldShowPinnedArtwork = pinned && displayVariant === "section";

  /**
   * 홈 카드 배경 장식 이미지를 노출할지 여부다.
   */
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
            className="h-[24px] w-[24px] shrink-0 md:h-[29px] md:w-[29px]"
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
          className="z-10 absolute right-12 -top-36 rotate-[-30deg] h-[332.1px] w-[384.3px]"
        />
      )}

      {shouldShowBackgroundImage && (
        <Image
          src="/images/lions/lion-stand-half.webp"
          alt={backgroundImageAlt}
          width={backgroundImageWidth}
          height={backgroundImageHeight}
          quality={90}
          className={`pointer-events-none ${backgroundImageClassName}`}
          aria-hidden={backgroundImageAlt === ""}
        />
      )}
    </button>
  );
}
