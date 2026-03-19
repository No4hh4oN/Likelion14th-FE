"use client";

import { useState } from "react";
import clsx from "clsx";
import type { AssignmentItem } from "../types";
import AssignmentReviewBadge from "./AssignmentReviewBadge";

/**
 * 공통 공간 과제 카드 컴포넌트.
 *
 * #내부 컴포넌트
 * - 제출/미제출 뱃지
 * - 평가 상태 배지 (평가 대기/과제 반려/평가 완료)
 * - 제출 파일 상태 (제출된 파일명)
 *
 */

/**
 * AssignmentCard 컴포넌트가 받을 props다.
 */
type AssignmentCardProps = {
  /** 화면에 그릴 단일 과제 카드 데이터 */
  assignment: AssignmentItem;
};

/**
 * 상태 기반 과제 카드 UI를 렌더링한다.
 */
export default function AssignmentCard({ assignment }: AssignmentCardProps) {
  /**
   * 평가가 공개된 카드에서 피드백 패널의 열림/닫힘 상태를 관리한다.
   */
  const [isReviewOpen, setIsReviewOpen] = useState(
    assignment.defaultReviewOpen ?? false,
  );

  /**
   * 본문을 미제출형 레이아웃으로 그릴지, 제출형 레이아웃으로 그릴지 판별한다.
   */
  const hasSubmission =
    assignment.submissionState === "submitted" ||
    assignment.submissionState === "rejected";

  /**
   * 평가 토글과 평가 본문을 노출할 수 있는 상태인지 판별한다.
   */
  const hasPublishedReview =
    assignment.reviewState === "published" && Boolean(assignment.reviewContent);

  return (
    <li className="overflow-hidden rounded-[14px] bg-foreground">
      <div
        className={`flex gap-4 flex-row items-center justify-between px-10 py-6.5 ${
          assignment.submissionState === "notSubmitted"
            ? "bg-linear-to-r from-main-3 to-[#FFD16E]"
            : "bg-gray-4"
        }`}
      >
        <p className="font-bold text-background text-[24px]">
          {assignment.title}
        </p>

        <div className="flex items-center gap-6">
          <span
            className={`text-[24px] font-bold ${
              assignment.submissionState === "notSubmitted"
                ? "text-red-1"
                : "text-main-2"
            }`}
          >
            {assignment.deadline}
          </span>
          <span
            className={`rounded-full px-3.5 py-2 text-[20px] border-2 font-normal text-white-1 ${assignment.submissionState === "notSubmitted" ? "bg-red-1 border-[#BA191C]" : "bg-main-1 border-main-2"}`}
          >
            {assignment.statusLabel}
          </span>
        </div>
      </div>

      {!hasSubmission ? (
        <div className="bg-white-1 py-12 text-center font-medium text-[24px] text-gray-5">
          {assignment.bodyMessage}
        </div>
      ) : (
        <div className="bg-[#DDE2F2] px-6 py-6 md:px-8 md:py-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 flex-wrap items-center gap-3">
              <AssignmentReviewBadge
                reviewState={assignment.reviewState}
                submissionState={assignment.submissionState}
              />

              {assignment.submissionFileName && (
                <div className="flex min-w-0 items-center gap-2 rounded-[10px] bg-[#C5CDDF] px-4 py-3 text-[16px] text-white-1/95 md:text-[18px]">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-[18px] w-[18px] shrink-0"
                    aria-hidden="true"
                  >
                    <path
                      d="M5.25 2.25H9.75L13.5 6V15C13.5 15.4142 13.1642 15.75 12.75 15.75H5.25C4.83579 15.75 4.5 15.4142 4.5 15V3C4.5 2.58579 4.83579 2.25 5.25 2.25Z"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />
                    <path
                      d="M9.75 2.25V6H13.5"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />
                  </svg>
                  <span className="truncate">
                    {assignment.submissionFileName}
                  </span>
                </div>
              )}
            </div>

            {hasPublishedReview ? (
              <button
                type="button"
                onClick={() => setIsReviewOpen((prev) => !prev)}
                className="flex items-center gap-2 self-start text-[18px] font-medium text-[#355BCB] md:self-auto"
              >
                과제 평가 {isReviewOpen ? "닫기" : "열기"}
                <svg
                  className={clsx(
                    "h-4 w-4 transition-transform",
                    isReviewOpen && "rotate-180",
                  )}
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M3.5 6L8 10.5L12.5 6"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            ) : null}
          </div>

          {assignment.bodyMessage && (
            <p className="mt-5 text-[18px] text-[#5D667C]">
              {assignment.bodyMessage}
            </p>
          )}

          {hasPublishedReview && isReviewOpen && (
            <>
              <div className="mt-5 rounded-[14px] bg-[#F6F7FB] px-6 py-5 text-[17px] leading-[1.7] text-[#2D2D2D] md:px-7 md:py-6 md:text-[18px]">
                <p className="whitespace-pre-line">
                  {assignment.reviewContent}
                </p>
              </div>

              {assignment.canResubmit && (
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    className="rounded-[12px] bg-main-2 px-8 py-4 text-[18px] font-semibold text-white-1"
                  >
                    과제 수정하기
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </li>
  );
}
