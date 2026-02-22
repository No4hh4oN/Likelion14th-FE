"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function ApplyCompletePage() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("applicationId");
  const editHref = applicationId
    ? `/14/apply?applicationId=${applicationId}`
    : "/14/apply";

  return (
    <section className="bg-background px-4 py-16 text-white lg:px-6 lg:py-24">
      <div className="mx-auto flex w-full max-w-290 flex-col items-center text-center">
        <Image
          src="/images/lions/standing-thankyou.png"
          alt="지원 감사 라이언"
          width={180}
          height={180}
          className="h-auto w-[130px] lg:w-[180px]"
          priority
        />

        <p className="mt-4 text-[28px] font-bold leading-[1.27] text-main-3 lg:mt-6 lg:text-[48px]">
          LIKELION at SYU 14th
        </p>
        <h1 className="mt-3 text-[18px] font-bold leading-[1.27] lg:mt-0 lg:text-[48px]">
          아기사자 지원서 제출이 정상적으로 <br className="lg:hidden" />
          완료되었습니다.
        </h1>

        <div className="mt-7.75 w-full max-w-[940px] bg-surface rounded-[20px] leading-[1.9] bg-surface p-5 lg:mt-14.25 lg:px-26.25 lg:py-6.25">
          <p className="text-[12px] font-light text-gray-3 lg:text-[16px]">
            <span className="font-bold">1차 합격 결과 </span> 3월 13일 10시
            홈페이지 발표
          </p>
          <p className="text-[12px] font-light text-gray-3 lg:text-[16px]">
            <span className="font-bold">2차 면접 기간 </span> 3월 15일 ~ 3월
            17일
          </p>
          <p className="mt-8 text-[14px] text-gray-3 font-bold break-keep lg:text-[18px]">
            합격 후 면접 날짜 및 시간은 홈페이지를 통해 신청 받습니다. 미지정 시
            면접 진행 불가하니 유의 바랍니다.
          </p>
        </div>

        <div className="mt-11 flex flex-wrap items-center justify-center gap-3 lg:mt-21.5 lg:gap-5.5">
          <Link
            href={editHref}
            className="rounded-[14px] bg-main-1 px-8.5 py-4 text-[18px] font-bold text-white transition-opacity hover:opacity-90 lg:px-13.5 lg:py-6 lg:text-[24px]"
          >
            지원서 수정
          </Link>
          {/* TODO: 취소 API 연결 후 동작 추가 */}
          <button
            type="button"
            disabled
            className="rounded-[14px] bg-gray-5 px-8.5 py-4 text-[18px] font-bold text-surface lg:px-13.5 lg:py-6 lg:text-[24px]"
          >
            지원 취소
          </button>
        </div>

        <div className="mt-11 leading-[1.9] text-[12px] text-gray-5 font-light lg:mt-9 lg:text-[16px]">
          <p>* 1차 합격 결과 발표 후에는 지원서 수정이 불가능합니다.</p>
          <p>* 반드시 제출 기한이 지나기 전 수정을 완료해 주세요.</p>
        </div>
      </div>
    </section>
  );
}
