"use client";

import Link from "next/link";
import Image from "next/image";

export default function FinalPassedSection() {
  return (
    <section className="min-h-screen bg-background px-4 pb-24 pt-16 text-white lg:px-6 lg:pt-24">
      <div className="mx-auto flex w-full max-w-[1050px] flex-col items-center">
        <h1 className="text-center leading-[1.2]">
          <span className="block text-[32px] font-bold text-main-3 lg:text-[58px]">
            멋쟁이사자처럼
          </span>
          <span className="mt-2 block text-[30px] font-bold text-white-1 lg:text-[56px]">
            14기 아기사자 모집 최종 결과 발표
          </span>
        </h1>

        <div className="relative mt-10 flex w-full justify-center lg:mt-14">
          <Image
            src="/images/lions/standing-thankyou.webp"
            alt="최종 합격 안내 라이언"
            width={220}
            height={220}
            className="z-10 h-[130px] w-[130px] lg:h-[180px] lg:w-[180px]"
          />
          <div className="absolute bottom-0 h-16 w-full bg-gradient-to-t from-background to-transparent" />
        </div>

        <div className="mt-[-8px] w-full rounded-[20px] bg-[#343740]/90 px-6 py-8 text-center text-[20px] leading-[1.65] text-[#E6EAF2] lg:px-14 lg:py-10 lg:text-[34px]">
          최종 합격 안내 페이지는 현재 제작 중입니다.
          <br />
          자세한 공지는 운영진 안내를 확인해 주세요.
        </div>

        <Link
          href="/"
          className="mt-20 inline-flex h-[76px] min-w-[430px] items-center justify-center rounded-full bg-main-1 px-10 text-[36px] font-bold text-white transition-colors hover:bg-[#3A79D7] lg:mt-28"
        >
          메인페이지로 돌아가기
        </Link>
      </div>
    </section>
  );
}
