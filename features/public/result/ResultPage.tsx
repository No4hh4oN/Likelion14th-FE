"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getActiveRecruitment } from "@/features/public/home/api";
import { getMyProfile } from "@/features/public/mypage/api";
import {
  getApplicationForResult,
  getDashboardForResult,
  getInterviewSlots,
  getRecruitmentInfo,
  reserveInterviewSlot,
} from "./api";
import type {
  DashboardForResultResponse,
  InterviewReservation,
  InterviewSlot,
  RecruitmentDetailResponse,
  ResultStatus,
} from "./type";
import FailedSection from "./sections/FailedSection";
import PassedSection from "./sections/PassedSection";
import FinalPassedSection from "./sections/FinalPassedSection";

const VALID_STATUSES: ResultStatus[] = [
  "DRAFT",
  "SUBMITTED",
  "DOC_FAILED",
  "DOC_PASSED",
  "FINAL_FAILED",
  "FINAL_PASSED",
];

const normalizeStatus = (value: string | null | undefined): ResultStatus | null => {
  if (!value) {
    return null;
  }

  const normalized = value.toUpperCase();
  return VALID_STATUSES.includes(normalized as ResultStatus)
    ? (normalized as ResultStatus)
    : null;
};

const parseStatusFromDocumentResult = (
  value: string | null | undefined,
): ResultStatus | null => {
  if (!value) {
    return null;
  }

  const normalized = value
    .toUpperCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/-/g, "_");

  const normalizedAsStatus = normalizeStatus(normalized);
  if (normalizedAsStatus) {
    return normalizedAsStatus;
  }

  if (normalized.includes("FINAL") && normalized.includes("PASS")) {
    return "FINAL_PASSED";
  }

  if (normalized.includes("FINAL") && normalized.includes("FAIL")) {
    return "FINAL_FAILED";
  }

  if (normalized.includes("DOC") && normalized.includes("PASS")) {
    return "DOC_PASSED";
  }

  if (normalized.includes("DOC") && normalized.includes("FAIL")) {
    return "DOC_FAILED";
  }

  if (normalized === "PASS" || normalized === "PASSED") {
    return "DOC_PASSED";
  }

  if (normalized === "FAIL" || normalized === "FAILED") {
    return "DOC_FAILED";
  }

  return null;
};

const resolveResultStatus = (params: {
  dashboardStatus: string | null | undefined;
  applicationStatus: ResultStatus | null;
  isDocumentResultVisible: boolean;
  documentResult: string | null | undefined;
}): ResultStatus | null => {
  const statusFromDashboard = normalizeStatus(params.dashboardStatus);
  if (statusFromDashboard) {
    return statusFromDashboard;
  }

  if (params.applicationStatus) {
    return params.applicationStatus;
  }

  if (!params.isDocumentResultVisible) {
    return null;
  }

  return parseStatusFromDocumentResult(params.documentResult);
};

export default function ResultPage() {
  const searchParams = useSearchParams();
  const requestedApplicationId = useMemo(() => {
    const raw = searchParams.get("applicationId");
    if (!raw) {
      return null;
    }

    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  }, [searchParams]);

  const [isLoading, setIsLoading] = useState(true);
  const [loadErrorMessage, setLoadErrorMessage] = useState("");
  const [status, setStatus] = useState<ResultStatus | null>(null);
  const [targetRecruitmentId, setTargetRecruitmentId] = useState<number | null>(
    null,
  );
  const [recruitmentInfo, setRecruitmentInfo] =
    useState<RecruitmentDetailResponse | null>(null);
  const [dashboard, setDashboard] = useState<DashboardForResultResponse | null>(
    null,
  );
  const [slots, setSlots] = useState<InterviewSlot[]>([]);
  const [userName, setUserName] = useState("");
  const [isReserving, setIsReserving] = useState(false);
  const [reserveErrorMessage, setReserveErrorMessage] = useState("");
  const [reserveSuccessMessage, setReserveSuccessMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadResultData = async () => {
      setIsLoading(true);
      setLoadErrorMessage("");
      setReserveErrorMessage("");
      setReserveSuccessMessage("");

      try {
        let recruitmentId: number | null = null;
        let statusFromApplication: ResultStatus | null = null;

        if (requestedApplicationId) {
          const application = await getApplicationForResult(requestedApplicationId);
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

        const [nextRecruitmentInfo, nextDashboard, nextProfile] = await Promise.all([
          getRecruitmentInfo(recruitmentId),
          getDashboardForResult(recruitmentId),
          getMyProfile().catch(() => null),
        ]);

        const resolvedStatus = resolveResultStatus({
          dashboardStatus: nextDashboard.myApplication?.status,
          applicationStatus: statusFromApplication,
          isDocumentResultVisible: nextDashboard.documentResult.visible === true,
          documentResult: nextDashboard.documentResult.result,
        });

        let nextSlots: InterviewSlot[] = [];
        if (resolvedStatus === "DOC_PASSED") {
          try {
            nextSlots = await getInterviewSlots(recruitmentId);
          } catch {
            nextSlots = [];
          }
        }

        if (!isMounted) {
          return;
        }

        setTargetRecruitmentId(recruitmentId);
        setRecruitmentInfo(nextRecruitmentInfo);
        setDashboard(nextDashboard);
        setUserName(nextProfile?.homepage?.name?.trim() ?? "");
        setStatus(resolvedStatus);
        setSlots(nextSlots);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const maybeMessage =
          error instanceof Error && error.message === "NO_RECRUITMENT"
            ? "조회 가능한 모집 결과가 없습니다."
            : "결과 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.";

        setLoadErrorMessage(maybeMessage);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadResultData();

    return () => {
      isMounted = false;
    };
  }, [requestedApplicationId]);

  const reservation: InterviewReservation | null =
    dashboard?.interview?.myReservation ?? null;
  const hasDashboardApplication = dashboard?.myApplication != null;
  const canReserveInterview = dashboard?.interview?.canReserve === true;
  const isFinalResultStatus =
    status === "FINAL_FAILED" || status === "FINAL_PASSED";
  const isResultVisible =
    dashboard?.documentResult.visible === true || isFinalResultStatus;

  const handleReserveInterview = async (slotId: number) => {
    if (!targetRecruitmentId || isReserving) {
      return;
    }

    if (!canReserveInterview) {
      setReserveErrorMessage("현재 면접 일정 선택 기간이 아닙니다.");
      setReserveSuccessMessage("");
      return;
    }

    if (reservation) {
      return;
    }

    setIsReserving(true);
    setReserveErrorMessage("");
    setReserveSuccessMessage("");

    try {
      await reserveInterviewSlot(targetRecruitmentId, slotId);

      const [nextDashboard, nextSlots] = await Promise.all([
        getDashboardForResult(targetRecruitmentId),
        getInterviewSlots(targetRecruitmentId).catch(() => []),
      ]);

      setDashboard(nextDashboard);
      setSlots(nextSlots);
      setStatus(
        resolveResultStatus({
          dashboardStatus: nextDashboard.myApplication?.status,
          applicationStatus: null,
          isDocumentResultVisible: nextDashboard.documentResult.visible === true,
          documentResult: nextDashboard.documentResult.result,
        }),
      );
      setReserveSuccessMessage("면접 일정이 확정되었습니다.");
    } catch {
      setReserveErrorMessage(
        "면접 시간 확정에 실패했습니다. 이미 마감된 시간이거나 잠시 오류가 발생했습니다.",
      );
    } finally {
      setIsReserving(false);
    }
  };

  if (isLoading) {
    return (
      <section className="min-h-screen bg-background px-4 pt-28 text-white lg:px-6">
        <div className="mx-auto w-full max-w-[820px] rounded-[14px] bg-[#343740] px-8 py-10 text-center text-[20px]">
          결과 정보를 불러오는 중입니다.
        </div>
      </section>
    );
  }

  if (loadErrorMessage) {
    return (
      <section className="min-h-screen bg-background px-4 pt-28 text-white lg:px-6">
        <div className="mx-auto w-full max-w-[820px] rounded-[14px] bg-[#343740] px-8 py-10 text-center">
          <p className="text-[20px] text-[#FFD5D9]">{loadErrorMessage}</p>
          <Link
            href="/"
            className="mt-8 inline-flex h-[56px] items-center justify-center rounded-full bg-main-1 px-8 text-[18px] font-semibold text-white"
          >
            메인으로 이동
          </Link>
        </div>
      </section>
    );
  }

  if (!hasDashboardApplication && status === null) {
    return (
      <section className="min-h-screen bg-background px-4 pt-28 text-white lg:px-6">
        <div className="mx-auto w-full max-w-[980px] rounded-[16px] bg-[#343740] px-8 py-12 text-center">
          <h2 className="text-[30px] font-bold text-main-3 lg:text-[44px]">
            지원 내역이 없습니다
          </h2>
          <p className="mt-4 text-[18px] text-white/80 lg:text-[24px]">
            해당 모집에 제출된 지원서를 먼저 작성해 주세요.
          </p>
          <Link
            href="/14/apply"
            className="mt-8 inline-flex h-[56px] items-center justify-center rounded-full bg-main-1 px-8 text-[18px] font-semibold text-white"
          >
            지원하러 가기
          </Link>
        </div>
      </section>
    );
  }

  if (!isResultVisible) {
    return (
      <section className="min-h-screen bg-background px-4 pt-28 text-white lg:px-6">
        <div className="mx-auto w-full max-w-[980px] rounded-[16px] bg-[#343740] px-8 py-12 text-center">
          <h2 className="text-[30px] font-bold text-main-3 lg:text-[44px]">
            결과 확인 준비중
          </h2>
          <p className="mt-4 text-[18px] text-white/80 lg:text-[24px]">
            아직 결과 발표 전입니다.
          </p>
          {recruitmentInfo?.phaseType && (
            <p className="mt-3 text-[14px] text-white/55 lg:text-[16px]">
              현재 모집 단계: {recruitmentInfo.phaseType}
            </p>
          )}
        </div>
      </section>
    );
  }

  if (status === "DOC_FAILED") {
    return <FailedSection stage="DOCUMENT" userName={userName} />;
  }

  if (status === "FINAL_FAILED") {
    return <FailedSection stage="FINAL" userName={userName} />;
  }

  if (status === "DOC_PASSED") {
    return (
      <PassedSection
        slots={slots}
        reservation={reservation}
        canReserve={canReserveInterview}
        isReserving={isReserving}
        reserveErrorMessage={reserveErrorMessage}
        reserveSuccessMessage={reserveSuccessMessage}
        onReserve={handleReserveInterview}
      />
    );
  }

  if (status === "FINAL_PASSED") {
    return <FinalPassedSection />;
  }

  return (
    <section className="min-h-screen bg-background px-4 pt-28 text-white lg:px-6">
      <div className="mx-auto w-full max-w-[980px] rounded-[16px] bg-[#343740] px-8 py-12 text-center">
        <h2 className="text-[30px] font-bold text-main-3 lg:text-[44px]">
          결과 정보를 확인할 수 없습니다
        </h2>
        <p className="mt-4 text-[18px] text-white/80 lg:text-[24px]">
          잠시 후 다시 시도해 주세요.
        </p>
      </div>
    </section>
  );
}
