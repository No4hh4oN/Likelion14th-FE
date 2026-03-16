"use client";
import Image from "next/image";
import { useEffect, useRef } from "react";

const tracks = [
  {
    part: 1,
    title: "기획 & UX/UI 디자인",
    titleColor: "text-[#FF0066CC]",
    description:
      "아이디어를 감각적으로 시각화하는 기획 & UX/UI 디자인 트랙은 사용자 경험(UX)과 인터페이스(UI)를 설계하고, 서비스의 흐름과 기능을 기획하여 사용자가 편리하게 이용할 수 있도록 합니다.",
  },
  {
    part: 2,
    title: "프론트엔드",
    titleColor: "text-[var(--main-1)]",
    description:
      "웹페이지의 시각적인 부분을 담당하는 프론트엔드 트랙은 사용자와 직접 상호작용하는 화면과 기능을 개발하는 역할로, HTML, CSS, JavaScript 등을 활용하여 웹이나 앱의 UI를 구현합니다.",
  },
  {
    part: 3,
    title: "백엔드",
    titleColor: "text-[var(--green-1)]",
    description:
      "사용자 눈에 보이지 않는 서버를 담당하는 백엔드 트랙은 데이터베이스, 서버, API 등을 관리하며, 프론트엔드와 연결되어 웹이나 앱이 원활하게 동작하도록 로직을 개발합니다.",
  },
  {
    part: 4,
    title: "AI / ML",
    titleColor: "text-[#7C2CD8]",
    description:
      "인공지능과 머신러닝을 활용해 데이터를 분석하고 모델을 적용하는 AI/ML 트랙은 LLM 기반 자연어 처리나 간단한 컴퓨터 비전 기술을 웹서비스에 적용하여, 실제 서비스에서 활용 가능한 AI 기능을 구현하는 것을 목표로 합니다.",
  },
];

const TRACK_IMAGE_SIZE_CLASS = "w-[214px] lg:w-[427px]";
const TRACK_IMAGE_SRC: Record<number, string> = {
  1: "/images/lions/head-design.webp",
  2: "/images/lions/head-front.webp",
  3: "/images/lions/head-back.webp",
  4: "/images/lions/head-ai.webp",
};

type TrackBadge = {
  id: string;
  src: string;
  width: number;
  height: number;
  behind: boolean;
  useGlass?: boolean;
  className: string;
  duration?: string;
  delay?: string;
};

const TRACK_BADGES: Record<number, TrackBadge[]> = {
  1: [
    {
      id: "adobe",
      src: "/images/home/badges/badge-adobe.svg",
      width: 224,
      height: 95,
      behind: true,
      useGlass: false,
      className: "top-1 -right-12 w-[108px] lg:-right-6 lg:-top-6 lg:w-[224px]",
      duration: "5.2s",
      delay: "-1.3s",
    },
    {
      id: "figma",
      src: "/images/home/badges/badge-figma.svg",
      width: 358,
      height: 124,
      behind: false,
      className:
        "-left-11 -bottom-1 w-[124px] rotate-[-2.77deg] lg:-left-16 lg:-bottom-8 lg:w-[300px]",
      duration: "4.4s",
      delay: "-0.6s",
    },
  ],
  2: [
    {
      id: "js",
      src: "/images/home/badges/badge-js.svg",
      width: 98,
      height: 96,
      behind: true,
      useGlass: false,
      className:
        "left-[-17%] top-[13%] w-[81px] lg:left-[-5%] lg:top-[5%] lg:w-[98px]",
      duration: "4.8s",
      delay: "-0.8s",
    },
    {
      id: "ts",
      src: "/images/home/badges/badge-ts.svg",
      width: 136,
      height: 132,
      behind: false,
      useGlass: false,
      className:
        "right-[-6px] top-[3%] w-[62.7px] lg:right-[0%] lg:top-[0%] lg:w-[136px]",
      duration: "4.5s",
      delay: "-0.2s",
    },
    {
      id: "react",
      src: "/images/home/badges/badge-react.svg",
      width: 459,
      height: 159,
      behind: false,
      className:
        "right-[-55px] bottom-[14px] w-[128px] rotate-[7.45deg] lg:right-[10] lg:bottom-[-50] lg:w-[246px]",
      duration: "5s",
      delay: "-1.1s",
    },
  ],
  3: [
    {
      id: "java",
      src: "/images/home/badges/badge-java.svg",
      width: 159,
      height: 233,
      behind: true,
      useGlass: false,
      className:
        "left-45 top-[6%] w-[90px] rotate-[28deg] lg:rotate-[11.5deg] lg:left-0 lg:top-[-12%] lg:w-[152px]",
      duration: "5.4s",
      delay: "-0.7s",
    },
    {
      id: "spring",
      src: "/images/home/badges/badge-spring.svg",
      width: 296,
      height: 115,
      behind: false,
      className:
        "-left-14 bottom-[12px] w-[146px] rotate-[17.13deg] lg:-left-10 lg:bottom-[-6%] lg:w-[287px]",
      duration: "4.6s",
      delay: "-1.4s",
    },
  ],
  4: [
    {
      id: "openCV",
      src: "/images/home/badges/badge-openCV.svg",
      width: 98,
      height: 97,
      behind: true,
      useGlass: false,
      className:
        "left-[-35px] top-[20%] w-[83.6px] lg:left-[-2%] lg:top-[13%] lg:w-[93px]",
      duration: "4.8s",
      delay: "-0.9s",
    },
    {
      id: "tensorflow",
      src: "/images/home/badges/badge-tensorflow.svg",
      width: 177,
      height: 145,
      behind: false,
      className:
        "right-[-12px] top-[2%] w-[86px] rotate-[20.4deg] lg:right-[-2px] lg:top-[3%] lg:w-[152px]",
      duration: "5s",
      delay: "-0.4s",
    },
    {
      id: "python",
      src: "/images/home/badges/badge-python.svg",
      width: 239,
      height: 83,
      behind: false,
      className:
        "right-[-40px] bottom-[-4px] w-[138px] rotate-[-2deg] lg:right-[-12px] lg:bottom-[-7%] lg:w-[235px]",
      duration: "4.3s",
      delay: "-1.2s",
    },
  ],
};

export default function TracksSection() {
  const animatedRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const targets = entry.target.querySelectorAll(".reveal-item");
            targets.forEach((target) => {
              target.classList.remove(
                "opacity-0",
                "translate-y-5",
                "translate-x-10",
                "-translate-x-10",
              );
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 },
    );

    const currentRefs = animatedRefs.current;
    currentRefs.forEach((ref) => {
      if (ref) {
        observer.observe(ref);
      }
    });

    return () => {
      currentRefs.forEach((ref) => {
        if (ref) {
          observer.unobserve(ref);
        }
      });
    };
  }, []);

  return (
    <section className="pt-[119px] pb-[68px] lg:pt-65.75 lg:pb-101 overflow-hidden bg-background text-[#141621]">
      <div className="w-[min(1120px,92%)] mx-auto">
        <h2 className="mb-14 lg:mb-38.25 text-white-1 text-[22px] lg:text-[48px] font-bold leading-[1.27] text-center">
          멋쟁이사자처럼 삼육대학교만의 <br />
          세분화된 트랙별 커리큘럼
        </h2>
        {/* 지그재그 배치 */}
        <div className="flex flex-col gap-20 lg:gap-25">
          {tracks.map((track, i) => (
            <div
              key={track.title}
              ref={(el) => {
                if (el) animatedRefs.current[i] = el;
              }}
              className={`flex flex-col items-center lg:flex-row lg:justify-between ${
                i % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
            >
              <div
                className={`reveal-item opacity-0 transition-all duration-1000 ease-out ${
                  i % 2 === 1 ? "translate-x-10" : "-translate-x-10"
                } relative flex shrink-0 items-center justify-center mb-3 lg:mb-0 ${TRACK_IMAGE_SIZE_CLASS} ${
                  i === 2 ? "-rotate-[11.5deg]" : ""
                }`}
              >
                <Image
                  src={TRACK_IMAGE_SRC[track.part]}
                  alt=""
                  width={427}
                  height={362}
                  sizes="(min-width: 1024px) 427px, 214px"
                  unoptimized
                  className="h-auto w-full object-contain z-20"
                />
                <div className="pointer-events-none absolute inset-0 overflow-visible">
                  {(TRACK_BADGES[track.part] ?? []).map((badge) => (
                    <div
                      key={badge.id}
                      aria-hidden
                      className={`badge-float-bubble absolute isolate ${badge.className} ${
                        badge.behind ? "z-10" : "z-30"
                      } float-gentle`}
                      style={{
                        animationDuration: badge.duration ?? "4.8s",
                        animationDelay: badge.delay ?? "0s",
                      }}
                    >
                      {badge.useGlass !== false ? (
                        <span className="badge-refracted-glass" />
                      ) : null}
                      <Image
                        src={badge.src}
                        alt=""
                        width={badge.width}
                        height={badge.height}
                        unoptimized
                        className="relative z-10 h-auto w-full"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 카드 + PART */}
              <div
                className={`reveal-item flex w-full max-w-155 flex-col gap-1 items-end lg:gap-3 transform opacity-0 translate-y-5 transition-all duration-700 ease-out ${
                  i % 2 === 0 ? "lg:items-end" : "lg:items-start"
                }`}
              >
                <span className="text-[12px] lg:text-2xl mx-3.25 lg:mx-5.25 font-semibold text-white">
                  PART {track.part}
                </span>
                <div
                  className={`flex h-auto w-[min(324px, 100%)] lg:w-146.75 text-center flex-col justify-center gap-2.25 lg:gap-8.5 rounded-[10px] lg:rounded-[20px] bg-white-1 px-3.5 py-3 lg:py-11 lg:px-14 ${
                    i % 2 === 0 ? "lg:text-left" : "lg:text-right"
                  }`}
                >
                  <h3
                    className={`text-[18px] lg:text-4xl font-bold  ${track.titleColor}`}
                  >
                    {track.title}
                  </h3>
                  <p className="break-keep text-sm lg:text-base font-normal leading-[143%] text-gray-5">
                    {track.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
