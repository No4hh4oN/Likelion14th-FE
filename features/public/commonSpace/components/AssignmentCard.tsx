"use client";

import { useState } from "react";
import clsx from "clsx";
import type { AssignmentItem } from "../types";
import AssignmentReviewBadge from "./AssignmentReviewBadge";

/**
 * AssignmentCard 컴포넌트가 받을 props다.
 */
type AssignmentCardProps = {
  /** 화면에 그릴 단일 과제 카드 데이터 */
  assignment: AssignmentItem;
};

type FileIconProps = {
  className?: string;
};

/**
 * 공통 공간에서 제출 파일 아이콘을 재사용하기 위한 SVG 컴포넌트다.
 * `currentColor` 기반이라 부모의 `text-*` 클래스로 색상을 바꿀 수 있다.
 */
function FileIcon({ className }: FileIconProps) {
  return (
    <svg
      width="17"
      height="18"
      viewBox="0 0 17 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M11.5215 9.62788H4.81808C4.65141 9.62788 4.49156 9.56173 4.3737 9.44397C4.25585 9.32622 4.18964 9.16651 4.18964 8.99998C4.18964 8.83345 4.25585 8.67374 4.3737 8.55598C4.49156 8.43822 4.65141 8.37207 4.81808 8.37207H11.5215C11.6882 8.37207 11.8481 8.43822 11.9659 8.55598C12.0838 8.67374 12.15 8.83345 12.15 8.99998C12.15 9.16651 12.0838 9.32622 11.9659 9.44397C11.8481 9.56173 11.6882 9.62788 11.5215 9.62788ZM8.16981 12.9767H4.81808C4.65141 12.9767 4.49156 12.9106 4.3737 12.7928C4.25585 12.6751 4.18964 12.5153 4.18964 12.3488C4.18964 12.1823 4.25585 12.0226 4.3737 11.9048C4.49156 11.7871 4.65141 11.7209 4.81808 11.7209H8.16981C8.33649 11.7209 8.49633 11.7871 8.61419 11.9048C8.73205 12.0226 8.79826 12.1823 8.79826 12.3488C8.79826 12.5153 8.73205 12.6751 8.61419 12.7928C8.49633 12.9106 8.33649 12.9767 8.16981 12.9767Z"
        fill="currentColor"
      />
      <path
        d="M13.1974 18H3.14224C2.30921 17.9989 1.51061 17.6678 0.921566 17.0792C0.332521 16.4907 0.0011085 15.6928 0 14.8605V3.13953C0.0011085 2.30722 0.332521 1.50931 0.921566 0.920772C1.51061 0.332235 2.30921 0.00110754 3.14224 0H10.3485C10.8085 0.00014577 11.263 0.101481 11.6795 0.296813C12.0959 0.492145 12.4643 0.776684 12.7583 1.13023L15.6115 4.55191C16.0814 5.11628 16.339 5.82707 16.3397 6.56121V14.8605C16.3386 15.6928 16.0071 16.4907 15.4181 17.0792C14.8291 17.6678 14.0305 17.9989 13.1974 18ZM3.14224 1.25581C2.64242 1.25648 2.16326 1.45515 1.80984 1.80828C1.45641 2.1614 1.25756 2.64015 1.2569 3.13953V14.8605C1.25756 15.3599 1.45641 15.8386 1.80984 16.1917C2.16326 16.5448 2.64242 16.7435 3.14224 16.7442H13.1974C13.6972 16.7435 14.1764 16.5448 14.5298 16.1917C14.8833 15.8386 15.0821 15.3599 15.0828 14.8605V6.56037C15.082 6.12001 14.9276 5.69368 14.6462 5.35479L11.7922 1.93395C11.6162 1.7219 11.3956 1.55121 11.146 1.434C10.8965 1.31679 10.6242 1.25596 10.3485 1.25581H3.14224Z"
        fill="currentColor"
      />
      <path
        d="M13.1974 6.27902C12.5864 6.27857 12.0006 6.03586 11.5685 5.60419C11.1365 5.17252 10.8936 4.58717 10.8931 3.97669V0.920876C10.8931 0.754344 10.9593 0.594634 11.0772 0.476878C11.1951 0.359123 11.3549 0.292969 11.5216 0.292969C11.6883 0.292969 11.8481 0.359123 11.966 0.476878C12.0838 0.594634 12.15 0.754344 12.15 0.920876V3.97669C12.1505 4.25411 12.261 4.52003 12.4573 4.7162C12.6536 4.91236 12.9198 5.02276 13.1974 5.0232C13.3641 5.0232 13.524 5.08936 13.6418 5.20711C13.7597 5.32487 13.8259 5.48458 13.8259 5.65111C13.8259 5.81764 13.7597 5.97735 13.6418 6.09511C13.524 6.21286 13.3641 6.27902 13.1974 6.27902Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * 제출 상태에 대응하는 헤더 라벨을 반환한다.
 */
function getAssignmentStatusLabel(submissionState: AssignmentItem["submissionState"]) {
  return submissionState === "submitted" || submissionState === "rejected"
    ? "제출함"
    : "미제출";
}

/**
 * 제출 파일 URL에서 표시용 파일명을 추출한다.
 */
function getAssignmentFileNameFromUrl(fileUrl: string) {
  const normalizedUrl = fileUrl.split("?")[0] ?? fileUrl;
  const fileName = normalizedUrl.split("/").pop();

  return fileName ? decodeURIComponent(fileName) : "제출 파일";
}

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
   * 제출 기한이 지났지만 제출하지 못한 상태인지 판별한다.
   */
  const isClosedAssignment = assignment.submissionState === "closed";

  /**
   * 미제출 카드 스타일을 그대로 사용해야 하는 상태인지 판별한다.
   */
  const isUnsubmittedCard =
    assignment.submissionState === "notSubmitted" || isClosedAssignment;

  /**
   * 카드 외곽에 적용할 상태별 그림자 스타일이다.
   */
  const cardShadowClassName = isUnsubmittedCard
    ? "shadow-[0_0_18px_rgba(251,29,29,0.55)]"
    : "shadow-[0_0_18px_rgba(99,125,255,0.55)]";

  /**
   * 제출 파일 표시 영역을 반려 스타일로 바꿔야 하는 상태인지 판별한다.
   */
  const isRejectedSubmission = assignment.submissionState === "rejected";

  /**
   * 평가 본문이 실제로 등록되어 있는지 판별한다.
   */
  const hasReviewContent =
    assignment.reviewState === "published" && Boolean(assignment.reviewContent);

  /**
   * 헤더 우측에 노출할 제출 상태 라벨이다.
   */
  const submissionStatusLabel = getAssignmentStatusLabel(
    assignment.submissionState,
  );

  /**
   * 화면에 노출할 제출 파일명이다.
   */
  const submissionFileName =
    assignment.submissionFileName ??
    (assignment.submissionFileUrl
      ? getAssignmentFileNameFromUrl(assignment.submissionFileUrl)
      : null);

  /**
   * 미제출 상태 카드 본문에 노출할 기본 안내 문구다.
   */
  const unsubmittedBodyMessage =
    assignment.bodyMessage ?? "아직 과제를 제출하지 않았습니다.";

  return (
    <li
      className={clsx(
        "relative overflow-hidden rounded-[14px] bg-foreground",
        cardShadowClassName,
      )}
    >
      <div
        className={`flex gap-4 flex-row items-center justify-between px-10 py-6.5 ${
          isUnsubmittedCard
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
              isUnsubmittedCard ? "text-red-1" : "text-main-2"
            }`}
          >
            {assignment.deadline}
          </span>
          <span
            className={`rounded-full px-3.5 py-2 text-[20px] border-2 font-normal text-white-1 ${isUnsubmittedCard ? "bg-red-1 border-[#BA191C]" : "bg-main-1 border-main-2"}`}
          >
            {isClosedAssignment ? "미제출" : submissionStatusLabel}
          </span>
        </div>
      </div>

      {!hasSubmission ? (
        <div className="bg-white-1 py-12 text-center font-medium text-[24px] text-gray-5">
          {isClosedAssignment
            ? "아직 과제를 제출하지 않았습니다."
            : unsubmittedBodyMessage}
        </div>
      ) : (
        <div className="bg-gray-2 px-8 py-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 flex-wrap items-center gap-3">
              <AssignmentReviewBadge
                reviewState={assignment.reviewState}
                submissionState={assignment.submissionState}
              />

              {submissionFileName &&
                (assignment.submissionFileUrl ? (
                  <a
                    href={assignment.submissionFileUrl}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className={clsx(
                      "flex min-w-0 items-center gap-2 rounded-[10px] leading-[1.27] px-4 py-3.25 text-[20px]",
                      isRejectedSubmission
                        ? "bg-gray-3 text-white-1"
                        : "bg-white-1 text-gray-6",
                    )}
                  >
                    <FileIcon
                      className={clsx(
                        "h-[18px] w-[17px] shrink-0",
                        isRejectedSubmission ? "text-white-1" : "text-[#606060]",
                      )}
                    />
                    <span
                      className={clsx(
                        "truncate",
                        isRejectedSubmission && "line-through",
                      )}
                    >
                      {submissionFileName}
                    </span>
                  </a>
                ) : (
                  <div
                    className={clsx(
                      "flex min-w-0 items-center gap-2 rounded-[10px] leading-[1.27] px-4 py-3.25 text-[20px]",
                      isRejectedSubmission
                        ? "bg-gray-3 text-white-1"
                        : "bg-white-1 text-gray-6",
                    )}
                  >
                    <FileIcon
                      className={clsx(
                        "h-[18px] w-[17px] shrink-0",
                        isRejectedSubmission ? "text-white-1" : "text-[#606060]",
                      )}
                    />
                    <span
                      className={clsx(
                        "truncate",
                        isRejectedSubmission && "line-through",
                      )}
                    >
                      {submissionFileName}
                    </span>
                  </div>
                ))}
            </div>

            <button
              type="button"
              onClick={() => setIsReviewOpen((prev) => !prev)}
              className="flex items-center gap-2 self-start text-[18px] cursor-pointer font-medium text-[#355BCB] md:self-auto"
            >
              과제 평가 {isReviewOpen ? "접기" : "열기"}
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
          </div>

          <div
            className={clsx(
              "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
              isReviewOpen
                ? "grid-rows-[1fr] opacity-100"
                : "pointer-events-none grid-rows-[0fr] opacity-0",
            )}
          >
            <div className="min-h-0 overflow-hidden">
              {hasReviewContent ? (
                <div className="pt-10.5">
                  <div className="rounded-[14px] bg-white-1 p-8 text-[20px] leading-[1.27] font-medium text-background">
                    <p className="whitespace-pre-line">
                      {assignment.reviewContent}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center px-4 pb-14.5 pt-18.5 text-center text-[20px] font-medium text-background">
                  아직 평가가 등록되지 않았습니다.
                </div>
              )}

              {assignment.canResubmit && hasReviewContent && (
                <div className="mt-10.5 flex justify-end">
                  <button
                    type="button"
                    className="rounded-[14px] bg-main-1 cursor-pointer px-10.75 py-6.75 text-[20px] font-bold text-white-1"
                  >
                    과제 수정하기
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isClosedAssignment && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#303136]/80 text-center text-[24px] font-bold text-white-1 backdrop-blur-[4px]">
          기한 내에 과제를 제출하지 않았습니다.
        </div>
      )}
    </li>
  );
}
