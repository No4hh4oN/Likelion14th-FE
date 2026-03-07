"use client";

import Link from "next/link";
import Image from "next/image";
import type { InterviewReservation } from "../type";

type ReservedSectionProps = {
  reservation: InterviewReservation;
  location?: string | null;
};

const DATE_WITH_TZ_PATTERN = /(Z|[+-]\d{2}:\d{2})$/;

const parseDateWithKstFallback = (value: string) => {
  const normalized = DATE_WITH_TZ_PATTERN.test(value)
    ? value
    : `${value}+09:00`;
  return new Date(normalized);
};

const formatKstDate = (value: string) =>
  new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(parseDateWithKstFallback(value));

const formatKstTime = (value: string) =>
  new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(parseDateWithKstFallback(value));

export default function ReservedSection({
  reservation,
  location,
}: ReservedSectionProps) {
  const interviewDate = formatKstDate(reservation.startAt);
  const interviewTimeRange = `${formatKstTime(reservation.startAt)}-${formatKstTime(
    reservation.endAt,
  )}`;
  const interviewLocation =
    location ??
    reservation.location ??
    "면접 장소는 운영진 안내를 확인해 주세요.";

  return (
    <section className="min-h-screen bg-background px-4 pb-24 pt-16 text-white lg:px-6 lg:pt-24">
      <div className="mx-auto flex w-full max-w-[980px] flex-col items-center pt-12">
        <h1 className="flex flex-col items-center text-center leading-[1.2] font-bold">
          <Image
            src="/images/lions/standing-thankyou.webp"
            alt="예약 완료 라이언"
            width={180}
            height={180}
            className="h-auto w-[130px] lg:w-[180px]"
            priority
          />
          <span className="mt-5 lg:mt-6 block text-[28px] font-bold text-main-3 lg:text-[48px]">
            LIKELION at SYU 14th
          </span>
          <span className="mt-3 lg:mt-0 block text-[18px] font-bold text-white-1 lg:text-[48px]">
            면접 예약이 완료되었습니다.
          </span>
        </h1>

        <div className="mt-12 w-full rounded-[20px] bg-[#343740]/90 px-6 py-8 text-center text-[20px] leading-[1.65] text-[#E6EAF2] lg:px-14 lg:py-10 lg:text-[34px]">
          면접 일정이 확정되었습니다.
          <br />
          아래 예약 정보를 확인해 주세요.
        </div>

        <div className="mt-8 w-full rounded-[16px] border border-[#5A6378] bg-[#2F333D] px-6 py-7 lg:px-10 lg:py-9">
          <div className="space-y-6">
            <div>
              <p className="text-[14px] font-semibold text-main-3 lg:text-[18px]">
                면접 일시
              </p>
              <p className="mt-1 text-[20px] font-semibold text-white lg:text-[30px]">
                {interviewDate} / {interviewTimeRange}
              </p>
            </div>

            <div>
              <p className="text-[14px] font-semibold text-main-3 lg:text-[18px]">
                면접 장소
              </p>
              <p className="mt-1 text-[20px] font-semibold text-white lg:text-[30px]">
                {interviewLocation}
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/"
          className="mt-14 inline-flex h-[72px] min-w-[360px] items-center justify-center rounded-full bg-main-1 px-10 text-[32px] font-bold text-white transition-colors hover:bg-[#3A79D7] lg:min-w-[430px] lg:text-[36px]"
        >
          확인
        </Link>
      </div>
    </section>
  );
}
