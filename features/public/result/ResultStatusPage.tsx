"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getActiveRecruitment } from "@/features/public/home/api";
import { getMyProfile } from "@/features/public/mypage/api";
import { getRecruitmentPhaseLabel } from "@/features/public/recruitmentPhase";
import {
  getApplicationForResult,
  getDashboardForResult,
  getInterviewSlots,
  getInterviewReservationErrorInfo,
  getRecruitmentInfo,
  reserveInterviewSlot,
} from "./api";
import { normalizeStatus, resolveResultStatus } from "./status";
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
import ReservedSection from "./sections/ReservedSection";

export default function ResultStatusPage() {
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

        const [nextRecruitmentInfo, nextDashboard, nextProfile] =
          await Promise.all([
            getRecruitmentInfo(recruitmentId),
            getDashboardForResult(recruitmentId),
            getMyProfile().catch(() => null),
          ]);

        const resolvedStatus = resolveResultStatus({
          dashboardStatus: nextDashboard.myApplication?.status,
          applicationStatus: statusFromApplication,
          isDocumentResultVisible:
            nextDashboard.documentResult.visible === true,
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
            : "결과 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 보시거나 운영진에게 문의 바랍니다.";

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
  }, [requestedApplicationId, requestedRecruitmentId]);

  const reservation: InterviewReservation | null =
    dashboard?.interview?.myReservation ?? null;
  const reservationLocation = useMemo(() => {
    if (!reservation) {
      return null;
    }

    const matchedSlot = slots.find(
      (slot) => slot.slotId === reservation.slotId,
    );
    return matchedSlot?.location ?? reservation.location ?? null;
  }, [reservation, slots]);
  const hasDashboardApplication = dashboard?.myApplication != null;
  const canReserveInterview = dashboard?.interview?.canReserve === true;
  const isFinalResultStatus =
    status === "FINAL_FAILED" || status === "FINAL_PASSED";
  const isResultVisible =
    dashboard?.documentResult.visible === true || isFinalResultStatus;

  /**
   * 예약 시도 직후 대시보드와 슬롯 목록을 다시 조회해 최신 예약 상태를 반영합니다.
   */
  const refreshInterviewState = async (recruitmentId: number) => {
    const [dashboardResult, slotsResult] = await Promise.allSettled([
      getDashboardForResult(recruitmentId),
      getInterviewSlots(recruitmentId),
    ]);

    const nextDashboard =
      dashboardResult.status === "fulfilled" ? dashboardResult.value : null;
    const nextSlots =
      slotsResult.status === "fulfilled" ? slotsResult.value : null;

    if (nextDashboard) {
      setDashboard(nextDashboard);
      setStatus(
        resolveResultStatus({
          dashboardStatus: nextDashboard.myApplication?.status,
          applicationStatus: null,
          isDocumentResultVisible:
            nextDashboard.documentResult.visible === true,
          documentResult: nextDashboard.documentResult.result,
        }),
      );
    }

    if (nextSlots) {
      setSlots(nextSlots);
    }

    return {
      nextDashboard,
      nextSlots,
    };
  };

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
      const nextReservation = await reserveInterviewSlot(
        targetRecruitmentId,
        slotId,
      );

      const { nextDashboard, nextSlots } =
        await refreshInterviewState(targetRecruitmentId);

      if (nextReservation) {
        setDashboard((currentDashboard) =>
          currentDashboard
            ? {
                ...currentDashboard,
                interview: {
                  ...currentDashboard.interview,
                  myReservation:
                    currentDashboard.interview.myReservation ?? nextReservation,
                },
              }
            : currentDashboard,
        );
      }

      if (!nextSlots && nextReservation) {
        setSlots((currentSlots) =>
          currentSlots.map((slot) =>
            slot.slotId === nextReservation.slotId
              ? {
                  ...slot,
                  available: false,
                  closed: true,
                  remainingCount:
                    slot.remainingCount === null
                      ? null
                      : Math.max(slot.remainingCount - 1, 0),
                }
              : slot,
          ),
        );
      }

      const hasReservationAfterSuccess =
        nextDashboard?.interview?.myReservation != null ||
        nextReservation != null;

      if (!hasReservationAfterSuccess) {
        setReserveSuccessMessage(
          "면접 일정 요청은 접수되었습니다. 예약 상태를 다시 확인해 주세요.",
        );
        return;
      }

      setReserveSuccessMessage("면접 일정이 확정되었습니다.");
    } catch (error) {
      const errorInfo = getInterviewReservationErrorInfo(error);
      const { nextDashboard, nextSlots } =
        await refreshInterviewState(targetRecruitmentId);
      const latestReservation = nextDashboard?.interview?.myReservation ?? null;

      if (latestReservation) {
        setReserveErrorMessage("");
        setReserveSuccessMessage(
          "면접 일정이 이미 확정되어 예약 완료 상태로 반영했습니다.",
        );
        return;
      }

      const latestCanReserve =
        nextDashboard?.interview?.canReserve ?? canReserveInterview;
      const attemptedSlot =
        nextSlots?.find((slot) => slot.slotId === slotId) ??
        slots.find((slot) => slot.slotId === slotId) ??
        null;
      const isAttemptedSlotUnavailable =
        attemptedSlot !== null &&
        (!attemptedSlot.available ||
          attemptedSlot.closed ||
          (attemptedSlot.remainingCount !== null &&
            attemptedSlot.remainingCount <= 0));

      let nextErrorMessage =
        "면접 시간 확정에 실패했습니다. 잠시 후 다시 시도해 보시거나 운영진에게 문의 바랍니다.";

      if (!latestCanReserve) {
        nextErrorMessage = "현재 면접 일정 선택 기간이 아닙니다.";
      } else if (isAttemptedSlotUnavailable) {
        nextErrorMessage =
          "방금 다른 사용자가 먼저 예약해 해당 면접 시간이 마감되었습니다. 다른 시간을 선택해 주세요.";
      } else if (errorInfo.code === "ALREADY_RESERVED") {
        nextErrorMessage = "이미 면접 일정이 확정된 상태입니다.";
      } else if (errorInfo.code === "RESERVATION_CLOSED") {
        nextErrorMessage = "현재 면접 일정 선택 기간이 아닙니다.";
      } else if (errorInfo.code === "UNAUTHORIZED") {
        nextErrorMessage =
          "로그인 정보가 만료되었습니다. 다시 로그인한 뒤 시도해 주세요.";
      } else if (errorInfo.code === "SLOT_UNAVAILABLE") {
        nextErrorMessage =
          "이미 마감된 면접 시간입니다. 다른 시간을 선택해 주세요.";
      }

      setReserveErrorMessage(nextErrorMessage);
    } finally {
      setIsReserving(false);
    }
  };

  // 개발 편의를 위한 최종 합격 섹션 미리보기 기능
  const preview = searchParams.get("preview");
  const isPreviewFinalPassed =
    process.env.NODE_ENV === "development" && preview === "final-passed";

  if (isPreviewFinalPassed) {
    return <FinalPassedSection userName="홍길동" />;
  }

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
              현재 모집 단계:{" "}
              {getRecruitmentPhaseLabel(recruitmentInfo.phaseType)}
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
    if (reservation) {
      return (
        <ReservedSection
          reservation={reservation}
          location={reservationLocation}
        />
      );
    }

    return (
      <PassedSection
        userName={userName}
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
    return <FinalPassedSection userName={userName} />;
  }

  return (
    <section className="min-h-screen bg-background px-4 pt-28 text-white lg:px-6">
      <div className="mx-auto w-full max-w-[980px] rounded-[16px] bg-[#343740] px-8 py-12 text-center">
        <h2 className="text-[30px] font-bold text-main-3 lg:text-[44px]">
          결과 정보를 확인할 수 없습니다
        </h2>
        <p className="mt-4 text-[18px] text-white/80 lg:text-[24px]">
          잠시 후 다시 시도해 보시거나 운영진에게 문의 바랍니다.
        </p>
      </div>
    </section>
  );
}
