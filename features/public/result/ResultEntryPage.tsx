"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getActiveRecruitment } from "@/features/public/home/api";
import {
  getApplicationForResult,
  getDashboardForResult,
  getRecruitmentInfo,
} from "./api";
import { normalizeStatus, resolveResultStatus } from "./status";
import type { RecruitmentDetailResponse, ResultStatus } from "./type";

/**
 * 타임존 정보가 없는 날짜 문자열을 KST로 해석하기 위한 패턴입니다.
 */
const DATE_WITH_TZ_PATTERN = /(Z|[+-]\d{2}:\d{2})$/;

/**
 * 엔트리 페이지의 발표 안내 문구에 사용할 날짜 포맷터입니다.
 */
const ANNOUNCEMENT_FORMATTER = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: false,
});

/**
 * 결과 엔트리 페이지에 표시할 공지 메타 정보입니다.
 */
type AnnouncementMeta = {
  label: string;
  accentTitle: string;
  plainTitle: string;
  announcedAtText: string;
};

/**
 * KST 기준 발표 시각 문자열을 화면 문구에 맞게 포맷합니다.
 *
 * @param value 서버에서 내려준 발표 시각
 * @returns `3월 13일 10시` 형식의 문자열
 */
const formatAnnouncementAt = (value: string | null | undefined) => {
  if (!value) {
    return "추후 공지";
  }

  const normalized = DATE_WITH_TZ_PATTERN.test(value)
    ? value
    : `${value}+09:00`;
  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    return "추후 공지";
  }

  const parts = ANNOUNCEMENT_FORMATTER.formatToParts(date);
  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  const month = getPart("month");
  const day = getPart("day");
  const hour = getPart("hour");
  const minute = getPart("minute");

  if (minute === "00") {
    return `${month} ${day}일 ${hour}시`;
  }

  return `${month} ${day}일 ${hour}:${minute}`;
};

/**
 * 모집 정보와 현재 상태를 바탕으로 엔트리 페이지 제목과 발표 시각 문구를 결정합니다.
 *
 * @param recruitmentInfo 모집 상세 정보
 * @param status 현재 유저의 결과 상태
 * @returns 엔트리 화면에 표시할 제목과 발표 시각 문자열
 */
const getAnnouncementMeta = (
  recruitmentInfo: RecruitmentDetailResponse | null,
  status: ResultStatus | null,
): AnnouncementMeta => {
  const generation = recruitmentInfo?.generation ?? 14;
  const isFinalResult = status === "FINAL_FAILED" || status === "FINAL_PASSED";

  if (isFinalResult) {
    return {
      label: "최종 발표",
      accentTitle: `${generation}기 아기사자 모집`,
      plainTitle: "최종 결과 발표",
      announcedAtText: formatAnnouncementAt(recruitmentInfo?.finalResultAt),
    };
  }

  return {
    label: "1차 발표",
    accentTitle: `${generation}기 아기사자 모집`,
    plainTitle: "1차 결과 발표",
    announcedAtText: formatAnnouncementAt(recruitmentInfo?.docResultAt),
  };
};

/**
 * 결과 확인 상세 페이지 진입 전 보여주는 엔트리 화면입니다.
 *
 * @returns 결과 발표 안내와 상세 페이지 진입 버튼
 */
export default function ResultEntryPage() {
  const searchParams = useSearchParams();
  const requestedApplicationId = useMemo(() => {
    const raw = searchParams.get("applicationId");
    if (!raw) {
      return null;
    }

    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  }, [searchParams]);
  const requestedRecruitmentId = useMemo(() => {
    const raw = searchParams.get("recruitmentId");
    if (!raw) {
      return null;
    }

    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  }, [searchParams]);

  const [recruitmentInfo, setRecruitmentInfo] =
    useState<RecruitmentDetailResponse | null>(null);
  const [status, setStatus] = useState<ResultStatus | null>(null);
  const [isLoadingEntryData, setIsLoadingEntryData] = useState(true);
  const [loadErrorMessage, setLoadErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadEntryData = async () => {
      setIsLoadingEntryData(true);
      setLoadErrorMessage("");

      try {
        let recruitmentId: number | null = requestedRecruitmentId;
        let statusFromApplication: ResultStatus | null = null;

        if (!recruitmentId && requestedApplicationId) {
          const application = await getApplicationForResult(
            requestedApplicationId,
          );
          recruitmentId = application.recruitmentId;
          statusFromApplication = normalizeStatus(application.status);
        }

        if (!recruitmentId) {
          const activeRecruitment = await getActiveRecruitment();
          recruitmentId = activeRecruitment?.recruitmentId ?? null;
        }

        if (!recruitmentId) {
          throw new Error("NO_RECRUITMENT");
        }

        const [nextRecruitmentInfo, nextDashboard] = await Promise.all([
          getRecruitmentInfo(recruitmentId),
          getDashboardForResult(recruitmentId).catch(() => null),
        ]);

        if (!isMounted) {
          return;
        }

        setRecruitmentInfo(nextRecruitmentInfo);
        setStatus(
          nextDashboard
            ? resolveResultStatus({
                dashboardStatus: nextDashboard.myApplication?.status,
                applicationStatus: statusFromApplication,
                isDocumentResultVisible:
                  nextDashboard.documentResult.visible === true,
                documentResult: nextDashboard.documentResult.result,
              })
            : statusFromApplication,
        );
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const message =
          error instanceof Error && error.message === "NO_RECRUITMENT"
            ? "조회 가능한 모집 정보가 없습니다."
            : "모집 정보를 불러오지 못해 기본 안내를 표시합니다.";
        setLoadErrorMessage(message);
      } finally {
        if (isMounted) {
          setIsLoadingEntryData(false);
        }
      }
    };

    void loadEntryData();

    return () => {
      isMounted = false;
    };
  }, [requestedApplicationId, requestedRecruitmentId]);

  const announcementMeta = getAnnouncementMeta(recruitmentInfo, status);
  const checkHref = useMemo(() => {
    const nextSearchParams = new URLSearchParams();

    if (requestedApplicationId) {
      nextSearchParams.set("applicationId", String(requestedApplicationId));
    }

    if (requestedRecruitmentId) {
      nextSearchParams.set("recruitmentId", String(requestedRecruitmentId));
    }

    const queryString = nextSearchParams.toString();
    return queryString ? `/14/result/check?${queryString}` : "/14/result/check";
  }, [requestedApplicationId, requestedRecruitmentId]);

  return (
    <section className="relative min-h-screen overflow-hidden bg-background px-4 pt-10 lg:py-28 text-white lg:px-6">
      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-[980px] flex-col items-center justify-center text-center">
        <h1 className="text-[22px] font-bold leading-[1.27] lg:text-[48px]">
          <span className="block text-white-1">멋쟁이사자처럼</span>
          <span className="block">
            <span className="text-main-3">{announcementMeta.accentTitle} </span>
            <span className="text-white-1">{announcementMeta.plainTitle}</span>
          </span>
        </h1>

        <div className="relative mt-10 lg:mt-14">
          <Image
            src="/images/lions/lion-stand-half.webp"
            alt="결과 확인 안내 사자"
            width={520}
            height={520}
            priority
            className="relative mx-auto h-auto w-[220px] object-contain lg:w-[360px]"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[35%] bg-linear-to-t from-background to-transparent" />
        </div>

        <p className="mt-8 text-[20px] font-medium text-white lg:text-[24px]">
          {isLoadingEntryData ? (
            <span className="inline-flex items-center gap-3 text-white/75">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-main-3 lg:h-3 lg:w-3" />
              발표 일시 확인 중...
            </span>
          ) : (
            `${announcementMeta.label} : ${announcementMeta.announcedAtText}`
          )}
        </p>

        {loadErrorMessage ? (
          <p className="mt-4 text-[14px] text-[#FFD9A0] lg:text-[18px]">
            {loadErrorMessage}
          </p>
        ) : null}

        <Link
          href={checkHref}
          className="mt-8 inline-flex tems-center justify-center rounded-full bg-main-1 px-11.75 py-4.5 lg:px-33 lg:py-4.75 text-[14px] font-bold text-white-1 transition hover:bg-[#2289E6] lg:mt-10 lg:text-[36px]"
        >
          결과 확인하기
        </Link>
      </div>
    </section>
  );
}
