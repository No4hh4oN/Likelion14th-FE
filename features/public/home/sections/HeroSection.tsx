import Image from "next/image";
import Link from "next/link";

/**
 * 배경에 배치할 스파클 좌표/크기/펄스 지연값.
 */
const SPARKLES = [
  {
    id: "sparkle-1",
    className: "left-[8%] top-[22%] w-7 lg:left-[12%] lg:top-[22%] lg:w-5",
    delay: "0s",
  },
  {
    id: "sparkle-2",
    className: "left-[2%] top-[42%] w-14 lg:left-[27%] lg:top-[45%] lg:w-14",
    delay: "0.9s",
  },
  {
    id: "sparkle-3",
    className: "right-[12%] top-[28%] w-13 lg:right-[18%] lg:top-[27%] lg:w-10",
    delay: "1.2s",
  },
  {
    id: "sparkle-4",
    className: "right-[18%] top-[40%] w-9 lg:right-[35%] lg:top-[55%] lg:w-18",
    delay: "0.5s",
  },
  {
    id: "sparkle-5",
    className: "left-[10%] top-[62%] w-18 lg:left-[22%] lg:top-[73%] lg:w-10",
    delay: "1.6s",
  },
  {
    id: "sparkle-6",
    className: "left-[70%] top-[65%] w-8 lg:left-[6%] lg:top-[38%] lg:w-16",
    delay: "6.8s",
  },
];

/**
 * Hero에 배치할 기술 뱃지 SVG 메타데이터
 */
const BADGES = [
  {
    id: "badge-pytorch",
    src: "/images/home/HeroSection/badge-pytorch.svg",
    alt: "PyTorch badge",
    width: 365,
    height: 135,
    className:
      "left-[5px] top-[230px] w-[134px] lg:left-[18px] lg:top-[238px] lg:w-[246px]",
    behind: true,
    muted: true,
    floatDelay: "0.2s",
    floatDuration: "7.8s",
  },
  {
    id: "badge-react",
    src: "/images/home/HeroSection/badge-react.svg",
    alt: "React badge",
    width: 459,
    height: 159,
    className:
      "right-[-10px] top-[38px] w-[196px] lg:right-[-50px] lg:top-[330px] lg:w-[330px]",
    behind: false,
    muted: false,
    floatDelay: "0.8s",
    floatDuration: "6.9s",
  },
  {
    id: "badge-figma",
    src: "/images/home/HeroSection/badge-figma.svg",
    alt: "Figma badge",
    width: 358,
    height: 124,
    className:
      "right-[2px] top-[290px] w-[160px] lg:left-[170px] lg:top-[570px] lg:w-[248px]",
    behind: false,
    muted: false,
    floatDelay: "1.1s",
    floatDuration: "7.4s",
  },
];

/**
 * 배경의 반짝이는 스파클 레이어를 렌더링함.
 */
function SparkleLayer() {
  return (
    <>
      {SPARKLES.map((sparkle) => (
        <Image
          key={sparkle.id}
          src="/images/home/HeroSection/sparkle.png"
          alt=""
          width={24}
          height={24}
          className={`absolute opacity-90 motion-safe:animate-pulse ${sparkle.className}`}
          style={{ animationDelay: sparkle.delay }}
          aria-hidden
        />
      ))}
    </>
  );
}

/**
 * 중앙 캐릭터 주변의 SVG 기술 뱃지를 렌더링함.
 */
function BadgeLayer() {
  return (
    <>
      {BADGES.map((badge) => (
        <div
          key={badge.id}
          className={`absolute ${badge.className} ${
            badge.behind ? "z-10" : "z-30"
          } ${badge.muted ? "opacity-55 blur-[1.2px] saturate-75" : ""}`}
        >
          <div
            className="glass-effect float-gentle"
            style={{
              animationDelay: badge.floatDelay,
              animationDuration: badge.floatDuration,
            }}
          >
            <Image
              src={badge.src}
              alt={badge.alt}
              width={badge.width}
              height={badge.height}
              className="h-auto w-full"
              priority
            />
          </div>
        </div>
      ))}
    </>
  );
}

/**
 * 메인 페이지 Hero 섹션
 */
export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background pb-20 pt-10 lg:pb-24 lg:pt-8">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute left-1/2 top-[83%] h-[clamp(920px,92.8vmax,1781px)] w-[clamp(920px,92.8vmax,1781px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#070041]/95 blur-[clamp(180px,20vmax,380px)]" />
        <div className="absolute left-1/2 top-[83%] h-[clamp(520px,53.1vmax,1019px)] w-[clamp(520px,53.1vmax,1019px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-main-1/95 blur-[clamp(120px,14vmax,300px)]" />
      </div>

      <div className="pointer-events-none absolute inset-0 z-10">
        <SparkleLayer />
      </div>

      {/* FIXME: 공식 폰트 받아서 수정 */}
      <div className="relative z-20 mx-auto flex w-full max-w-[1220px] flex-col items-center px-4 text-white-1">
        {/* 모바일버전 제목 탭 */}
        <div className="text-center leading-none lg:hidden">
          <p className="text-[38px] font-extrabold tracking-[0.03em]">
            LIKELION
          </p>
          <p className="text-[28px] font-bold tracking-[-0.02em]">
            at SYU 14th
          </p>
        </div>

        <div className="relative h-[550px] w-[340px] lg:h-[760px] lg:w-[980px]">
          {/* 데스크탑버전 제목 탭 */}
          <div className="pointer-events-none absolute inset-0 hidden lg:block">
            <p className="absolute left-[-24px] top-[-24px] z-10 text-[112px] font-extrabold tracking-[0.03em] text-white">
              LIKELION
            </p>
            <p
              className="absolute left-[56%] top-[80px] z-40 whitespace-nowrap text-[68px] font-extrabold tracking-[-0.02em] text-white"
              style={{ textShadow: "0 2px 8px rgba(8, 16, 42, 0.82)" }}
            >
              at SYU 14th
            </p>
          </div>

          <BadgeLayer />

          <Image
            src="/images/lions/standing-full.png"
            alt="노트북을 든 멋사 라이언 캐릭터"
            width={768}
            height={768}
            className="absolute bottom-[138px] left-1/2 z-20 w-[274px] -translate-x-1/2 lg:bottom-0 lg:w-[520px]"
            priority
          />

          <div className="absolute inset-x-0 bottom-[50px] z-30 mx-auto flex w-fit flex-col items-center gap-[22px] text-center lg:inset-x-auto lg:bottom-[56px] lg:right-[-74px] lg:mx-0 lg:w-auto">
            <div className="hidden text-center leading-none text-white lg:flex flex-col items-center justify-center">
              <p className="text-[48px] font-extrabold tracking-[0.03em]">
                LIKELION
              </p>
              <p className="mt-[-2px] text-[28px] font-bold tracking-[-0.02em]">
                at SYU 14th
              </p>
            </div>

            <Link href="/14/apply" className="rounded-full bg-main-3 z-30 px-7 py-3.5 text-[24px] font-bold text-white transition-transform duration-300 cursor-pointer hover:translate-y-[-3px] lg:px-[72px] lg:py-4 lg:text-[36px]">
              14기 지원하기
            </Link>
            <p className="mt-[-9px] text-[16px] text-gray-3 font-normal lg:hidden">
              지원 마감까지{" "}
              <span className="text-main-3 font-bold">FIXME:날짜</span>
            </p>
          </div>

          <div className="absolute bottom-[12px] left-[10px] z-30 h-18 w-18 items-center justify-center lg:flex">
            <Image
              src="/images/logo.png"
              alt="LIKELION logo"
              width={72}
              height={72}
              className="h-auto w-11"
              style={{ filter: "brightness(0) invert(1)" }}
              priority={false}
            />
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-[-164px] left-1/2 h-[270px] w-full -translate-x-1/2 rounded-[50px] lg:rounded-[150px] bg-background z-30" />
    </section>
  );
}



