"use client";

import Image from "next/image";
import Link from "next/link";
import { isAxiosError } from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { deleteApplication, getApplications } from "./api";

export default function ApplyCompletePage() {
  const APPLICATION_LIST_PAGE_SIZE = 100;

  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCancelling, setIsCancelling] = useState(false);
  const [isCancelAvailabilityLoading, setIsCancelAvailabilityLoading] =
    useState(false);
  const [canCancelApplication, setCanCancelApplication] = useState<
    boolean | null
  >(null);
  const [cancelAvailabilityError, setCancelAvailabilityError] = useState("");
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelErrorMessage, setCancelErrorMessage] = useState("");

  const applicationId = useMemo(() => {
    const raw = searchParams.get("applicationId");
    if (!raw) {
      return null;
    }

    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return null;
    }

    return parsed;
  }, [searchParams]);

  const editHref = applicationId
    ? `/14/apply?applicationId=${applicationId}`
    : "/14/apply";

  useEffect(() => {
    let mounted = true;

    const loadCancelAvailability = async () => {
      if (!applicationId) {
        setCanCancelApplication(null);
        setCancelAvailabilityError("");
        return;
      }

      setIsCancelAvailabilityLoading(true);
      setCanCancelApplication(null);
      setCancelErrorMessage("");
      setCancelAvailabilityError("");

      try {
        let nextPage = 0;
        let totalPages = 1;
        let targetCanEdit: boolean | null = null;

        while (nextPage < totalPages && nextPage < 10) {
          const response = await getApplications({
            page: nextPage,
            size: APPLICATION_LIST_PAGE_SIZE,
          });
          if (!mounted) {
            return;
          }

          const target = response.items.find(
            (item) => Number(item.applicationId) === applicationId,
          );

          if (target) {
            if (typeof target.canEdit === "boolean") {
              targetCanEdit = target.canEdit;
            } else {
              // Some backend responses omit canEdit; avoid false-negative lock.
              targetCanEdit = true;
            }
            break;
          }

          totalPages = Math.max(1, response.page.totalPages);
          nextPage += 1;
        }

        if (targetCanEdit !== null) {
          setCanCancelApplication(targetCanEdit);
          return;
        }

        setCanCancelApplication(true);
        setCancelAvailabilityError(
          "취소 가능 여부 자동 확인이 지연되고 있습니다. 버튼 클릭 후 최종 확인됩니다.",
        );
      } catch {
        if (!mounted) {
          return;
        }
        setCanCancelApplication(false);
        setCancelAvailabilityError(
          "지원 취소 가능 여부를 확인하지 못했습니다. 잠시 후 새로고침해 주세요.",
        );
      } finally {
        if (!mounted) {
          return;
        }
        setIsCancelAvailabilityLoading(false);
      }
    };

    void loadCancelAvailability();

    return () => {
      mounted = false;
    };
  }, [applicationId]);

  const cancelDisabledReason = useMemo(() => {
    if (isCancelAvailabilityLoading || canCancelApplication === null) {
      return "지원 취소 가능 여부를 확인하고 있습니다.";
    }

    if (!applicationId) {
      return "지원서 정보를 찾을 수 없습니다.";
    }

    if (isCancelling) {
      return "지원 취소 처리 중입니다.";
    }

    if (cancelAvailabilityError) {
      return cancelAvailabilityError;
    }

    if (canCancelApplication === false) {
      return "지원서를 수정할 수 없는 기간입니다. 지원 취소도 불가능합니다.";
    }

    return "";
  }, [
    applicationId,
    canCancelApplication,
    cancelAvailabilityError,
    isCancelAvailabilityLoading,
    isCancelling,
  ]);

  useEffect(() => {
    if (!isCancelModalOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isCancelling) {
        setIsCancelModalOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isCancelModalOpen, isCancelling]);

  const openCancelModal = () => {
    if (
      !applicationId ||
      isCancelling ||
      isCancelAvailabilityLoading ||
      canCancelApplication !== true
    ) {
      return;
    }
    setCancelErrorMessage("");
    setIsCancelModalOpen(true);
  };

  const closeCancelModal = () => {
    if (isCancelling) {
      return;
    }
    setIsCancelModalOpen(false);
  };

  const handleCancelApplication = async () => {
    if (!applicationId || isCancelling || canCancelApplication !== true) {
      return;
    }

    setIsCancelling(true);
    setCancelErrorMessage("");

    try {
      await deleteApplication(applicationId);
      setIsCancelModalOpen(false);
      router.replace("/14/apply");
    } catch (error) {
      if (isAxiosError(error)) {
        if (error.response?.status === 404) {
          setCancelErrorMessage("삭제할 지원서를 찾을 수 없습니다.");
          return;
        }

        if (error.response?.status === 409 || error.response?.status === 400) {
          setCancelErrorMessage(
            "지원 취소 가능한 기간이 아니거나 현재 상태에서는 취소할 수 없습니다.",
          );
          setCanCancelApplication(false);
          return;
        }

        if (error.response?.status === 500) {
          setCancelErrorMessage(
            "지원 취소 처리 중 서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
          );
          return;
        }
      }

      setCancelErrorMessage("지원 취소에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <section className="bg-background px-4 py-16 text-white lg:px-6 lg:py-24">
      <div className="mx-auto flex w-full max-w-290 flex-col items-center text-center">
        <Image
          src="/images/lions/standing-thankyou.webp"
          alt="지원 완료 라이언"
          width={180}
          height={180}
          className="h-auto w-[130px] lg:w-[180px]"
          priority
        />

        <p className="mt-4 text-[28px] font-bold leading-[1.27] text-main-3 lg:mt-6 lg:text-[48px]">
          LIKELION at SYU 14th
        </p>
        <h1 className="mt-3 text-[18px] font-bold leading-[1.27] lg:mt-0 lg:text-[48px]">
          아기사자 지원서 제출이 정상적으로
          <br className="lg:hidden" /> 완료되었습니다.
        </h1>

        <div className="mt-7.75 w-full max-w-[940px] rounded-[20px] bg-surface p-5 leading-[1.9] lg:mt-14.25 lg:px-26.25 lg:py-6.25">
          <p className="text-[12px] font-light text-gray-3 lg:text-[16px]">
            <span className="font-bold">1차 합격 결과 </span> 3월 13일 10시
            홈페이지 발표
          </p>
          <p className="text-[12px] font-light text-gray-3 lg:text-[16px]">
            <span className="font-bold">2차 면접 기간 </span> 3월 15일 ~ 3월
            17일
          </p>
          <p className="mt-8 break-keep text-[14px] font-bold text-gray-3 lg:text-[18px]">
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
          <button
            type="button"
            onClick={openCancelModal}
            disabled={
              !applicationId ||
              isCancelling ||
              isCancelAvailabilityLoading ||
              canCancelApplication !== true
            }
            title={cancelDisabledReason || undefined}
            className="rounded-[14px] bg-gray-5 px-10.5 py-4 cursor-pointer text-[18px] font-bold text-surface disabled:cursor-not-allowed disabled:opacity-60 hover:bg-red-400 hover:text-white-1 lg:px-16 lg:py-6 lg:text-[24px]"
          >
            {isCancelling ? "취소 중..." : "지원 취소"}
          </button>
        </div>

        {cancelDisabledReason && (
          <p className="mt-3 text-[12px] text-gray-4 lg:text-[14px]">
            {cancelDisabledReason}
          </p>
        )}

        {cancelErrorMessage && (
          <p className="mt-4 text-[12px] text-[#ff9ea8] lg:text-[16px]">
            {cancelErrorMessage}
          </p>
        )}

        <div className="mt-11 text-[12px] font-light leading-[1.9] text-gray-5 lg:mt-9 lg:text-[16px]">
          <p>* 서류 마감 기간 이후에는 지원서 수정이 불가능합니다.</p>
          <p>* 지원 취소 버튼은 취소 가능한 기간에만 활성화됩니다.</p>
          <p>* 반드시 제출 기한이 지나기 전 수정을 완료해 주세요.</p>
        </div>
      </div>

      {isCancelModalOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/65 p-4"
          onClick={closeCancelModal}
          role="presentation"
        >
          <div
            className="w-full max-w-[520px] rounded-[20px] bg-surface px-6 py-7 text-center shadow-[0_18px_48px_rgba(0,0,0,0.35)] lg:px-9 lg:py-10"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="지원 취소 확인"
          >
            <p className="text-[22px] font-bold text-white lg:text-[30px]">
              정말로 지원을 취소하시겠습니까?
            </p>
            <p className="mt-3 text-[13px] text-gray-3 lg:text-[16px]">
              삭제된 지원내역은 복구할 수 없습니다.
            </p>

            <div className="mt-8 flex items-center justify-center gap-3 lg:gap-4">
              <button
                type="button"
                onClick={closeCancelModal}
                disabled={isCancelling}
                className="rounded-[12px] bg-gray-5 px-6 py-3 text-[14px] cursor-pointer hover:bg-white-1 font-semibold text-surface disabled:cursor-not-allowed disabled:opacity-60 lg:px-8 lg:py-3.5 lg:text-[16px]"
              >
                아니오
              </button>
              <button
                type="button"
                onClick={handleCancelApplication}
                disabled={
                  !applicationId ||
                  isCancelling ||
                  isCancelAvailabilityLoading ||
                  canCancelApplication !== true
                }
                className="rounded-[12px] bg-[#d64657] px-6 py-3 text-[14px] cursor-pointer hover:bg-red-400 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 lg:px-8 lg:py-3.5 lg:text-[16px]"
              >
                {isCancelling ? "삭제 중..." : "예, 삭제할게요"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
