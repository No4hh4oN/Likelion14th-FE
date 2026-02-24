"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getActiveRecruitment } from "@/features/public/home/api";
import { getRecruitmentInfo } from "./api";
import type { RecruitmentDetailResponse } from "./type";

export type ResultPhase = "FIRST" | "FINAL";

type ResultPageProps = {
  phase?: ResultPhase;
};

type ResultCopy = {
  titleSuffix: string;
  schedulePrefix: string;
  fallbackScheduleText: string;
};

const RESULT_COPY: Record<ResultPhase, ResultCopy> = {
  FIRST: {
    titleSuffix: "1차 결과 발표",
    schedulePrefix: "1차 발표",
    fallbackScheduleText: "1차 발표 : 3월 13일 10시",
  },
  FINAL: {
    titleSuffix: "최종 결과 발표",
    schedulePrefix: "최종 발표",
    fallbackScheduleText: "최종 발표 : 3월 18일 10시",
  },
};

const kstDateTimePattern = /(Z|[+-]\d{2}:\d{2})$/;

const parseKstDateTime = (value: string) => {
  const normalized = kstDateTimePattern.test(value) ? value : `${value}+09:00`;
  return Date.parse(normalized);
};

function formatAnnouncementTime(value: string) {
  const parsed = parseKstDateTime(value);
  if (!Number.isFinite(parsed)) {
    return "";
  }

  const parts = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    hour12: false,
  }).formatToParts(new Date(parsed));

  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  const month = getPart("month");
  const day = getPart("day");
  const hour = getPart("hour");

  if (!month || !day || !hour) {
    return "";
  }

  return `${month}월 ${day}일 ${hour}시`;
}

export default function ResultPage({ phase = "FIRST" }: ResultPageProps) {
  const copy = RESULT_COPY[phase];
  const [recruitmentInfo, setRecruitmentInfo] =
    useState<RecruitmentDetailResponse | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchSchedule = async () => {
      try {
        const activeRecruitment = await getActiveRecruitment();
        if (!isMounted || !activeRecruitment) {
          return;
        }

        const recruitmentDetail = await getRecruitmentInfo(
          activeRecruitment.recruitmentId,
        );
        if (!isMounted) {
          return;
        }
        setRecruitmentInfo(recruitmentDetail);
      } catch {
        // Keep fallback text when API request fails.
      }
    };

    void fetchSchedule();

    return () => {
      isMounted = false;
    };
  }, []);

  const announcementAt =
    phase === "FIRST"
      ? recruitmentInfo?.docResultAt
      : recruitmentInfo?.finalResultAt;
  const formattedAnnouncementAt = announcementAt
    ? formatAnnouncementTime(announcementAt)
    : "";
  const scheduleText = formattedAnnouncementAt
    ? `${copy.schedulePrefix} : ${formattedAnnouncementAt}`
    : copy.fallbackScheduleText;

  return (
    <section className="pt-20 lg:pt-20.5 pb-15 lg:pb-21 bg-background">
      <div className="px-4.5 lg:px-[clamp(18px,12vw,392px)]">
        <div className="flex flex-col items-center">
          <h2 className="text-[22px] lg:text-[48px] font-bold leading-[1.27] text-center text-white-1">
            멋쟁이사자처럼
            <br />
            <span className="text-main-3">14기 아기사자 모집</span>{" "}
            {copy.titleSuffix}
          </h2>
          <div className="flex my-8 lg:my-16.5 ml-7">
            <Image
              src="/images/lions/lion-stand-half-gradient-black.webp"
              alt="노트북을 든 멋사 라이언 캐릭터"
              width={528}
              height={516}
              className="w-54.5 lg:w-102.25 object-contain"
            />
          </div>
          <p className="text-white-1 text-center w-auto lg:w-auto font-normal text-[14px] lg:text-[20px]">
            {scheduleText}
          </p>
          <Link
            href="#"
            className="mt-10 lg:mt-4 cursor-pointer rounded-[100px] px-11.75 lg:px-[132px] py-4.5 font-bold bg-main-1 text-white-1 text-[14px] lg:text-[36px]"
          >
            결과 확인하기
          </Link>
        </div>
      </div>
    </section>
  );
}
