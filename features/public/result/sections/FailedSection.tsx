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
        <br />본 동아리에 관심을 가지고 지원해 주셔서 진심으로 감사드립니다.
      </>
    ),
  },
  FINAL: {
    titleLine1: "멋쟁이사자처럼",
    titleLine2: "14기 아기사자 모집 최종 결과 발표",
    getMessage: (name: string) => (
      <>
        {name} 님께서는 멋쟁이사자처럼 삼육대학교 14기 아기사자 모집에 최종{" "}
        <span className="text-red-1">불합격</span>하셨음을 안내드립니다.
        <br />
        끝까지 함께해 주셔서 진심으로 감사드립니다.
      </>
    ),
  },
} as const;

export default function FailedSection({ stage, userName }: FailedSectionProps) {
  const copy = FAILED_COPY[stage];
  const displayName = userName?.trim() ? userName.trim() : "지원자";

  return (
    <section className="min-h-screen bg-background px-4 pb-24 pt-16 text-white lg:px-6 lg:pt-24">
      <div className="mx-auto flex w-full max-w-[1100px] flex-col items-center">
        <h1 className="text-center leading-[1.2]">
          <span className="block text-[32px] font-bold text-main-3 lg:text-[58px]">
            {copy.titleLine1}
          </span>
          <span className="mt-2 block text-[30px] font-bold text-white-1 lg:text-[56px]">
            {copy.titleLine2}
          </span>
        </h1>

        <div className="relative mt-10 flex w-full justify-center lg:mt-14">
          <Image
            src="/images/lions/peek.webp"
            alt="결과 안내 라이언"
            width={220}
            height={220}
            className="z-10 h-[130px] w-[130px] lg:h-[180px] lg:w-[180px]"
          />
          <div className="absolute bottom-0 h-16 w-full bg-gradient-to-t from-background to-transparent" />
        </div>

        <div className="mt-[-12px] w-full rounded-[20px] bg-[#343740]/90 px-6 py-8 text-center text-[20px] leading-[1.7] text-[#E6EAF2] lg:px-14 lg:py-10 lg:text-[36px]">
          {copy.getMessage(displayName)}
        </div>

        <Link
          href="/"
          className="mt-20 inline-flex h-[76px] min-w-[430px] items-center justify-center rounded-full bg-[#565D70] px-10 text-[38px] font-bold text-white transition-colors hover:bg-[#626A7F] lg:mt-28"
        >
          메인페이지로 돌아가기
        </Link>
      </div>
    </section>
  );
}
