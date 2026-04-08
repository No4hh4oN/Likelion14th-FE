"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import AssignmentCard from "../components/AssignmentCard";
import DetailAttachmentList from "../components/DetailAttachmentList";
import {
  buildCommonSpaceAssignmentDetailHref,
  buildCommonSpaceHref,
} from "../config";
import { commonSpaceAssignmentApiDataSource } from "../assignments/source";
import type {
  CommonSpaceAssignmentDetailItem,
  CommonSpaceAssignmentListItem,
  CommonSpaceAssignmentLoadState,
  CommonSpaceAssignmentSubmissionRequest,
} from "../assignments/types";
import type { CommonSpacePartId } from "../types";

type AssignmentDetailSectionProps = {
  partId: CommonSpacePartId;
  assignmentId: number;
};

/**
 * 과제 상세 섹션이 현재 사용할 데이터 소스다.
 * 실 API 연결 시 mock 대신 api data source로 교체하면 된다.
 */
const commonSpaceAssignmentDataSource = commonSpaceAssignmentApiDataSource;

/**
 * 과제 상세 날짜 문자열을 화면용 형식으로 변환한다.
 */
function formatAssignmentDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}. ${month}. ${day}. ${hours}:${minutes}`;
}

/**
 * D-Day 박스에 노출할 남은 날짜 문자열을 계산한다.
 */
function formatAssignmentDday(deadlineAt: string, referenceNowAt?: string) {
  const deadlineDate = new Date(deadlineAt);

  if (Number.isNaN(deadlineDate.getTime())) {
    return "D-Day";
  }

  const today = referenceNowAt ? new Date(referenceNowAt) : new Date();
  const diffTime = deadlineDate.getTime() - today.getTime();
  const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  return `D-${diffDays}`;
}

/**
 * D-Day 박스에 노출할 날짜 범위를 화면용 형식으로 변환한다.
 */
function formatAssignmentDateRange(startAt: string, endAt: string) {
  const startDate = new Date(startAt);
  const endDate = new Date(endAt);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return `${startAt} - ${endAt}`;
  }

  const formatDate = (date: Date) =>
    `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, "0")}. ${String(
      date.getDate(),
    ).padStart(2, "0")}.`;

  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

/**
 * 과제 상세 섹션에 필요한 상세/목록 데이터를 함께 불러온다.
 */
async function getAssignmentDetailSectionData(
  partId: CommonSpacePartId,
  assignmentId: number,
) {
  const [detailResponse, listResponse] = await Promise.all([
    commonSpaceAssignmentDataSource.getDetail(assignmentId),
    commonSpaceAssignmentDataSource.getList({
      partId,
    }),
  ]);

  return {
    assignmentDetail: detailResponse,
    assignmentItems: listResponse.items,
  };
}

/**
 * 과제 상세 레이아웃을 렌더링한다.
 */
export default function AssignmentDetailSection({
  partId,
  assignmentId,
}: AssignmentDetailSectionProps) {
  /**
   * 현재 과제 상세 데이터다.
   */
  const [assignmentDetail, setAssignmentDetail] =
    useState<CommonSpaceAssignmentDetailItem | null>(null);

  /**
   * 이전/다음 글 계산에 사용할 목록 데이터다.
   */
  const [assignmentItems, setAssignmentItems] = useState<
    CommonSpaceAssignmentListItem[]
  >([]);

  /**
   * 과제 상세 로드 상태다.
   */
  const [loadState, setLoadState] =
    useState<CommonSpaceAssignmentLoadState>("idle");

  useEffect(() => {
    let isMounted = true;

    async function loadAssignmentDetail() {
      setLoadState("loading");

      try {
        const nextSectionData = await getAssignmentDetailSectionData(
          partId,
          assignmentId,
        );

        if (!isMounted) {
          return;
        }

        setAssignmentDetail(nextSectionData.assignmentDetail);
        setAssignmentItems(nextSectionData.assignmentItems);
        setLoadState(nextSectionData.assignmentDetail ? "success" : "empty");
      } catch {
        if (!isMounted) {
          return;
        }

        setAssignmentDetail(null);
        setAssignmentItems([]);
        setLoadState("error");
      }
    }

    loadAssignmentDetail();

    return () => {
      isMounted = false;
    };
  }, [assignmentId, partId]);

  /**
   * 현재 과제의 목록 내 위치다.
   */
  const currentAssignmentIndex = assignmentItems.findIndex(
    (item) => item.id === assignmentId,
  );

  /**
   * 이전 글 데이터다.
   */
  const previousAssignment =
    currentAssignmentIndex > 0
      ? assignmentItems[currentAssignmentIndex - 1]
      : null;

  /**
   * 다음 글 데이터다.
   */
  const nextAssignment =
    currentAssignmentIndex >= 0 &&
    currentAssignmentIndex < assignmentItems.length - 1
      ? assignmentItems[currentAssignmentIndex + 1]
      : null;

  if (loadState === "loading" || loadState === "idle") {
    return (
      <section className="pb-16">
        <div className="rounded-[18px] border border-gray-6 bg-[#202329] px-6 py-14 text-center">
          <p className="text-[18px] font-medium text-gray-3">
            과제 상세를 불러오는 중입니다.
          </p>
        </div>
      </section>
    );
  }

  if (loadState === "error" || !assignmentDetail) {
    return (
      <section className="pb-16">
        <div className="flex justify-end">
          <Link
            href={buildCommonSpaceHref(partId, "assignments")}
            className="rounded-[8px] bg-main-1 px-5 py-3 text-[14px] font-semibold text-white-1"
          >
            목록 보기
          </Link>
        </div>
        <div className="mt-6 rounded-[18px] border border-gray-6 bg-[#202329] px-6 py-14 text-center">
          <p className="text-[18px] font-medium text-gray-3">
            과제 상세를 불러오지 못했습니다.
          </p>
        </div>
      </section>
    );
  }

  const currentAssignmentDetail = assignmentDetail;

  /**
   * D-Day 박스를 노출해야 하는지 여부다.
   */
  const shouldShowDdayBox =
    currentAssignmentDetail.assignment.submissionState === "notSubmitted" ||
    currentAssignmentDetail.assignment.submissionState === "rejected";

  /**
   * 과제 제출 또는 수정 제출 이후 상세 상태를 새로 불러온다.
   */
  async function handleAssignmentSubmit(file: File) {
    const submissionPayload = {
      request: {},
      files: [file],
    } satisfies CommonSpaceAssignmentSubmissionRequest;

    if (
      currentAssignmentDetail.assignment.submissionState === "rejected" ||
      currentAssignmentDetail.assignment.submissionState === "submitted"
    ) {
      await commonSpaceAssignmentDataSource.updateSubmission(
        assignmentId,
        submissionPayload,
      );
    } else {
      await commonSpaceAssignmentDataSource.submit(
        assignmentId,
        submissionPayload,
      );
    }

    const nextSectionData = await getAssignmentDetailSectionData(
      partId,
      assignmentId,
    );

    setAssignmentDetail(nextSectionData.assignmentDetail);
    setAssignmentItems(nextSectionData.assignmentItems);
    setLoadState(nextSectionData.assignmentDetail ? "success" : "empty");
  }

  return (
    <section className="pb-16">
      <div className="flex justify-end">
        <Link
          href={buildCommonSpaceHref(partId, "assignments")}
          className="rounded-[10px] bg-main-1 px-5 py-3 text-[14px] font-semibold text-white-1 sm:rounded-[12px] sm:px-8 sm:py-4 sm:text-[16px] lg:rounded-[14px] lg:px-12.5 lg:py-6.5 lg:text-[20px] lg:font-bold"
        >
          목록 보기
        </Link>
      </div>

      <article className="mt-6 w-full rounded-[22px] bg-gray-7 px-4 py-8 leading-[1.27] text-white-1 sm:mt-8 sm:rounded-[24px] sm:px-6 sm:py-10 lg:mt-14 lg:rounded-[28px] lg:px-12 lg:py-20 xl:px-19.5 xl:py-28">
        <h2 className="text-[28px] font-semibold leading-[1.3] text-white-1 sm:text-[30px] lg:text-[34px]">
          {currentAssignmentDetail.title}
        </h2>

        <div className="mt-6 flex flex-wrap items-center gap-4 sm:mt-7">
          <Image
            src={
              currentAssignmentDetail.profileImageSrc ?? "/images/defaultProf.webp"
            }
            alt={
              currentAssignmentDetail.profileImageAlt ??
              "과제 작성자 프로필 사진"
            }
            width={48}
            height={48}
            className="h-12 w-12 shrink-0 rounded-full object-cover"
          />
          <div className="flex flex-col gap-1">
            <p className="text-[16px] font-semibold text-white-1">
              {currentAssignmentDetail.authorName ?? "운영진"}
            </p>
            <p className="text-[14px] text-gray-3">
              {currentAssignmentDetail.authorDescription ??
                "멋쟁이사자처럼 삼육대학교"}
            </p>
            <p className="text-[13px] text-gray-4">
              {formatAssignmentDateTime(currentAssignmentDetail.createdAt)}
            </p>
          </div>
        </div>

        <div className="my-10 h-px w-full bg-gray-4 sm:my-12 lg:my-15" />

        <div className="mt-8 space-y-6 sm:space-y-7">
          {currentAssignmentDetail.bodyImageSrc ? (
            <div className="overflow-hidden">
              <Image
                src={currentAssignmentDetail.bodyImageSrc}
                alt={
                  currentAssignmentDetail.bodyImageAlt ?? "과제 본문 이미지"
                }
                width={920}
                height={520}
                quality={90}
                className="h-auto max-h-[520px] w-auto max-w-full object-contain"
              />
            </div>
          ) : null}

          <div className="whitespace-pre-line text-[15px] leading-[1.6] text-white-1 sm:text-[16px]">
            {currentAssignmentDetail.content}
          </div>
        </div>

        <DetailAttachmentList
          attachments={currentAssignmentDetail.attachments}
          className="mt-8"
        />

        <div className="my-10 h-px w-full bg-gray-4 sm:my-12 lg:my-15" />

        <div className="space-y-5">
          {shouldShowDdayBox ? (
            <div className="flex flex-col items-start gap-3 rounded-[12px] border border-[#FFB5B5] bg-[#FFF3F3] px-4 py-4 text-background sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <span className="rounded-full bg-red-1 px-3.5 py-1 text-[13px] font-bold text-white-1 sm:px-4 sm:text-[14px]">
                {formatAssignmentDday(
                  currentAssignmentDetail.deadlineAt,
                  currentAssignmentDetail.displayNowAt,
                )}
              </span>
              <span className="text-[14px] font-semibold text-red-1 sm:text-[16px]">
                {formatAssignmentDateRange(
                  currentAssignmentDetail.createdAt,
                  currentAssignmentDetail.deadlineAt,
                )}
              </span>
            </div>
          ) : null}

          <AssignmentCard
            assignment={currentAssignmentDetail.assignment}
            onSubmitFile={handleAssignmentSubmit}
          />
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:mt-29">
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-3">
              <Image
                src="/icons/right.svg"
                alt=">"
                width={7}
                height={14}
                className="w-[7px] rotate-180"
              />
              <p className="text-[16px] font-bold text-white-1">이전 글</p>
            </div>
            {previousAssignment ? (
              <Link
                href={buildCommonSpaceAssignmentDetailHref(
                  partId,
                  previousAssignment.id,
                )}
                className="block rounded-[14px] bg-gray-6 px-4 py-6 text-[16px] font-medium text-white-1 transition-shadow hover:shadow-[0_0_6px_#828797] sm:px-5 sm:py-8 sm:text-[18px]"
              >
                {previousAssignment.title}
              </Link>
            ) : (
              <div className="rounded-[14px] bg-gray-6 px-4 py-6 text-center text-[16px] text-gray-4 sm:px-5 sm:py-8 sm:text-[18px]">
                이전 글이 없습니다.
              </div>
            )}
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-end gap-3">
              <p className="text-[16px] font-bold text-white-1">다음 글</p>
              <Image
                src="/icons/right.svg"
                alt=">"
                width={7}
                height={14}
                className="w-[7px]"
              />
            </div>
            {nextAssignment ? (
              <Link
                href={buildCommonSpaceAssignmentDetailHref(
                  partId,
                  nextAssignment.id,
                )}
                className="block rounded-[14px] bg-gray-6 px-4 py-6 text-right text-[16px] font-medium text-white-1 transition-shadow hover:shadow-[0_0_6px_#828797] sm:px-5 sm:py-8 sm:text-[18px]"
              >
                {nextAssignment.title}
              </Link>
            ) : (
              <div className="rounded-[14px] bg-gray-6 px-4 py-6 text-center text-[16px] text-gray-4 sm:px-5 sm:py-8 sm:text-[18px]">
                다음 글이 없습니다.
              </div>
            )}
          </div>
        </div>
      </article>
    </section>
  );
}
