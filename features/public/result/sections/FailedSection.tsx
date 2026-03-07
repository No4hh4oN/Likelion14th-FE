"use client";

import Link from "next/link";
import Image from "next/image";

export type FailedStage = "DOCUMENT" | "FINAL";

type FailedSectionProps = {
  stage: FailedStage;
  userName?: string | null;
};

const FAILED_COPY = {
  DOCUMENT: {
    titleLine1: "LIKELION at SYU 14th",
    titleLine2: "아기사자 1차 모집 결과 발표",
    getMessage: (name: string) => (
      <>
        {name} 님께서는 멋쟁이사자처럼 삼육대학교 14기 아기사자 모집에 1차{" "}
        <span className="text-red-1">불합격</span>하셨음을 안내드립니다.
        <br />
        <br className="lg:hidden block" />본 동아리에 관심을 가지고 지원해
        주셔서 진심으로 감사드립니다.
      </>
    ),
  },
  FINAL: {
    titleLine1: "LIKELION at SYU 14th",
    titleLine2: "아기사자 모집 최종 결과 발표",
    getMessage: (name: string) => (
      <>
        {name} 님께서는 멋쟁이사자처럼 삼육대학교 14기 아기사자 모집에 최종{" "}
        <span className="text-red-1">불합격</span>하셨음을 안내드립니다.
        <br />
        <br className="lg:hidden block" />본 동아리에 관심을 가지고 지원해
        주셔서 진심으로 감사드립니다.
      </>
    ),
  },
} as const;

export default function FailedSection({ stage, userName }: FailedSectionProps) {
  const copy = FAILED_COPY[stage];
  const displayName = userName?.trim() ? userName.trim() : "지원자";

  return (
    <section className="min-h-screen bg-background px-4 pb-24 pt-10 text-white lg:px-6 lg:pt-24">
      <div className="mx-auto relative flex w-full max-w-[1160px] flex-col items-center pt-36">
        <h1 className="text-center leading-[1.27] text-[24px] lg:text-[48px] font-bold">
          <span className="block text-main-3">{copy.titleLine1}</span>
          <span className="block text-white-1">{copy.titleLine2}</span>
        </h1>

        <div className="z-0 mt-12 lg:mt-20 mx-auto w-[110px] lg:w-[167px]">
          <Image
            src="/images/lions/peek.webp"
            alt="라이언 빼꼼"
            width={476}
            height={408}
            className="h-auto w-full object-contain"
          />
        </div>

        <div className="w-full z-10 rounded-[20px] bg-gray-7 px-10 py-4.5 text-center font-semibold text-[14px] leading-[1.27] text-gray-3 lg:px-26.75 lg:py-11.5 lg:text-[24px]">
          {copy.getMessage(displayName)}
        </div>

        <Link
          href="/"
          className="mt-23 inline-flex items-center justify-center rounded-full bg-gray-6 px-5.5 py-4.5 lg:px-17 lg:py-5 text-[14px] font-bold text-white-1 transition-colors lg:text-[28px] hover:bg-[#626A7F] lg:mt-28"
        >
          메인페이지로 돌아가기
        </Link>
      </div>
    </section>
  );
}
