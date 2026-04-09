"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  commonSpaceAssignmentApiDataSource,
} from "../assignments/source";
import {
  cacheAssignmentSubmissionFiles,
  clearCachedAssignmentSubmissionFiles,
} from "../assignments/submissionFileName";
import type {
  CommonSpaceAssignmentListItem,
  CommonSpaceAssignmentSubmissionRequest,
} from "../assignments/types";
import AssignmentCard from "../components/AssignmentCard";
import NoticeCard from "../components/NoticeCard";
import {
  buildCommonSpaceAssignmentDetailHref,
  buildCommonSpaceHref,
  buildCommonSpaceMaterialDetailHref,
  buildCommonSpaceNoticeDetailHref,
} from "../config";
import {
  commonSpaceMaterialApiDataSource,
  hydrateCommonSpaceMaterialSummaries,
} from "../materials/source";
import type { CommonSpaceMaterialListItem } from "../materials/types";
import {
  commonSpaceNoticeApiDataSource,
  excludeCommonSpacePinnedNoticeItems,
  getCommonSpacePinnedNoticeItems,
} from "../notices/source";
import type { CommonSpaceNoticeListItem } from "../notices/types";
import type { CommonSpacePartId } from "../types";

type HomeSectionProps = {
  /** 현재 홈에서 보여줄 파트 식별자 */
  partId: CommonSpacePartId;
};

type HomeSectionData = {
  /** 상단 고정 공지 카드에 노출할 pinned 공지 목록 */
  pinnedNoticeItems: CommonSpaceNoticeListItem[];
  /** 공지 프리뷰 목록 */
  noticeItems: CommonSpaceNoticeListItem[];
  /** 세션 자료 프리뷰 목록 */
  materialItems: CommonSpaceMaterialListItem[];
  /** 과제 프리뷰 목록 */
  assignmentItems: CommonSpaceAssignmentListItem[];
};

/**
 * 홈 공지 목록 카드에 사용할 장식 이미지 경로다.
 */
const HOME_NOTICE_BACKGROUND_IMAGE_SRC = "/images/lions/lion-stand-half.webp";

/**
 * 홈 세션 자료 프리뷰에서 대표 이미지가 없을 때 사용할 기본 썸네일 경로다.
 */
const HOME_MATERIAL_DEFAULT_THUMBNAIL_SRC = "/images/commonSpace/default.webp";

/**
 * 홈 프리뷰에서 노출할 일반 공지 최대 개수다.
 */
const HOME_NOTICE_PREVIEW_LIMIT = 6;

/**
 * 홈 프리뷰에서 노출할 세션 자료 최대 개수다.
 */
const HOME_MATERIAL_PREVIEW_LIMIT = 4;

/**
 * 홈 프리뷰에서 노출할 과제 최대 개수다.
 */
const HOME_ASSIGNMENT_PREVIEW_LIMIT = 3;

/**
 * 홈 섹션이 현재 사용할 공지 데이터 소스다.
 */
const commonSpaceNoticeDataSource = commonSpaceNoticeApiDataSource;

/**
 * 홈 섹션이 현재 사용할 세션 자료 데이터 소스다.
 */
const commonSpaceMaterialDataSource = commonSpaceMaterialApiDataSource;

/**
 * 홈 섹션이 현재 사용할 과제 데이터 소스다.
 */
const commonSpaceAssignmentDataSource = commonSpaceAssignmentApiDataSource;

/**
 * 홈에서 과제 프리뷰용 최신 과제 3개를 추린다.
 */
function getHomePreviewAssignmentItems(items: CommonSpaceAssignmentListItem[]) {
  return [...items]
    .sort(
      (leftItem, rightItem) =>
        new Date(rightItem.deadlineAt).getTime() -
        new Date(leftItem.deadlineAt).getTime(),
    )
    .slice(0, HOME_ASSIGNMENT_PREVIEW_LIMIT);
}

/**
 * 홈 섹션에 필요한 공지/자료/과제 프리뷰 데이터를 함께 불러온다.
 */
async function getHomeSectionData(partId: CommonSpacePartId): Promise<HomeSectionData> {
  const [noticeResult, materialResult, assignmentResult, pinnedResult] =
    await Promise.allSettled([
      commonSpaceNoticeDataSource.getList({
        partId,
        page: 0,
        size: 100,
      }),
      commonSpaceMaterialDataSource.getList({
        partId,
        page: 0,
        size: 100,
      }),
      commonSpaceAssignmentDataSource.getList({
        partId,
      }),
      getCommonSpacePinnedNoticeItems(partId),
    ]);

  const pinnedNoticeItems =
    pinnedResult.status === "fulfilled" ? pinnedResult.value : [];
  const noticeItems =
    noticeResult.status === "fulfilled"
      ? excludeCommonSpacePinnedNoticeItems(
          noticeResult.value.items,
          pinnedNoticeItems,
        ).slice(0, HOME_NOTICE_PREVIEW_LIMIT)
      : [];
  const materialItems =
    materialResult.status === "fulfilled"
      ? (
          await hydrateCommonSpaceMaterialSummaries(
            commonSpaceMaterialDataSource,
            materialResult.value.items,
          )
        ).slice(0, HOME_MATERIAL_PREVIEW_LIMIT)
      : [];
  const assignmentItems =
    assignmentResult.status === "fulfilled"
      ? getHomePreviewAssignmentItems(assignmentResult.value.items)
      : [];

  return {
    pinnedNoticeItems,
    noticeItems,
    materialItems,
    assignmentItems,
  };
}

/**
 * 공통 공간 메인 홈 섹션을 렌더링한다.
 */
export default function HomeSection({ partId }: HomeSectionProps) {
  const router = useRouter();

  /**
   * 홈 상단에 노출할 pinned 공지 카드 데이터다.
   */
  const [pinnedNoticeItems, setPinnedNoticeItems] = useState<
    CommonSpaceNoticeListItem[]
  >([]);

  /**
   * 홈 전체 공지 프리뷰 목록이다.
   */
  const [noticeItems, setNoticeItems] = useState<CommonSpaceNoticeListItem[]>([]);

  /**
   * 홈 세션 자료 프리뷰 목록이다.
   */
  const [materialItems, setMaterialItems] = useState<CommonSpaceMaterialListItem[]>(
    [],
  );

  /**
   * 홈 과제 프리뷰 목록이다.
   */
  const [assignmentItems, setAssignmentItems] = useState<
    CommonSpaceAssignmentListItem[]
  >([]);

  useEffect(() => {
    let isMounted = true;

    async function loadHomeSectionData() {
      try {
        const nextHomeSectionData = await getHomeSectionData(partId);

        if (!isMounted) {
          return;
        }

        setPinnedNoticeItems(nextHomeSectionData.pinnedNoticeItems);
        setNoticeItems(nextHomeSectionData.noticeItems);
        setMaterialItems(nextHomeSectionData.materialItems);
        setAssignmentItems(nextHomeSectionData.assignmentItems);
      } catch {
        if (!isMounted) {
          return;
        }

        setPinnedNoticeItems([]);
        setNoticeItems([]);
        setMaterialItems([]);
        setAssignmentItems([]);
      }
    }

    loadHomeSectionData();

    return () => {
      isMounted = false;
    };
  }, [partId]);

  /**
   * 공지 상세 화면으로 이동한다.
   */
  function handleNoticeClick(noticeId: number) {
    router.push(buildCommonSpaceNoticeDetailHref(partId, noticeId));
  }

  /**
   * 상단 pinned 공지 카드는 해당 공지의 원래 파트 기준으로 상세 화면을 연다.
   */
  function handlePinnedNoticeClick(
    noticePartId: CommonSpacePartId,
    noticeId: number,
  ) {
    router.push(buildCommonSpaceNoticeDetailHref(noticePartId, noticeId));
  }

  /**
   * 세션 자료 상세 화면으로 이동한다.
   */
  function handleMaterialClick(materialId: number) {
    router.push(buildCommonSpaceMaterialDetailHref(partId, materialId));
  }

  /**
   * 과제 프리뷰 카드 클릭 시 과제 상세 화면으로 이동한다.
   */
  function handleAssignmentClick(assignmentId: number) {
    router.push(buildCommonSpaceAssignmentDetailHref(partId, assignmentId));
  }

  /**
   * 홈 과제 프리뷰 카드에서 제출/재제출 후 최신 상태를 다시 불러온다.
   */
  async function handleAssignmentSubmit(
    assignmentId: number,
    submissionState: CommonSpaceAssignmentListItem["submissionState"],
    payload: CommonSpaceAssignmentSubmissionRequest,
  ) {
    if (submissionState === "submitted") {
      await commonSpaceAssignmentDataSource.updateSubmission(
        assignmentId,
        payload,
      );
    } else {
      await commonSpaceAssignmentDataSource.submit(
        assignmentId,
        payload,
      );
    }

    cacheAssignmentSubmissionFiles(
      assignmentId,
      payload.files.map((file) => ({ name: file.name })),
    );

    const nextHomeSectionData = await getHomeSectionData(partId);
    setPinnedNoticeItems(nextHomeSectionData.pinnedNoticeItems);
    setNoticeItems(nextHomeSectionData.noticeItems);
    setMaterialItems(nextHomeSectionData.materialItems);
    setAssignmentItems(nextHomeSectionData.assignmentItems);
  }

  /**
   * 홈 과제 프리뷰 카드에서 제출 취소 후 최신 상태를 다시 불러온다.
   */
  async function handleAssignmentCancel(assignmentId: number) {
    await commonSpaceAssignmentDataSource.deleteSubmission(assignmentId);
    clearCachedAssignmentSubmissionFiles(assignmentId);

    const nextHomeSectionData = await getHomeSectionData(partId);
    setPinnedNoticeItems(nextHomeSectionData.pinnedNoticeItems);
    setNoticeItems(nextHomeSectionData.noticeItems);
    setMaterialItems(nextHomeSectionData.materialItems);
    setAssignmentItems(nextHomeSectionData.assignmentItems);
  }

  /**
   * 전체 공지 화면으로 이동한다.
   */
  function handleMoveToNoticeSection() {
    router.push(buildCommonSpaceHref(partId, "notices"));
  }

  /**
   * 세션 자료 공유 화면으로 이동한다.
   */
  function handleMoveToMaterialSection() {
    router.push(buildCommonSpaceHref(partId, "materials"));
  }

  /**
   * 과제 안내 및 제출 화면으로 이동한다.
   */
  function handleMoveToAssignmentSection() {
    router.push(buildCommonSpaceHref(partId, "assignments"));
  }

  return (
    <section className="flex flex-col gap-28.5">
      {pinnedNoticeItems.length > 0 ? (
        <div className="space-y-4">
          {pinnedNoticeItems.map((item) => (
            <NoticeCard
              key={item.id}
              title={item.title}
              pinned
              isNew={item.isNew}
              onClick={() => handlePinnedNoticeClick(item.partId, item.id)}
            />
          ))}
        </div>
      ) : null}

      <div className="grid gap-10 lg:grid-cols-2">
        <section>
          <div className="flex items-center justify-between">
            <h3 className="text-[24px] font-bold text-white-1">전체 공지</h3>
            <button
              type="button"
              onClick={handleMoveToNoticeSection}
              className="flex gap-3.75 cursor-pointer text-[20px] leading-[1.27] font-medium text-gray-4"
            >
              더보기
              <Image
                src="/icons/right.svg"
                alt=">"
                width={7}
                height={14}
                className="w-[7px]"
              />
            </button>
          </div>
          <div className="mt-8 h-[5px] w-full bg-main-1" />
          <ul className="mt-16.75 flex flex-col gap-3.5">
            {noticeItems.map((item) => (
              <li key={item.id}>
                <NoticeCard
                  title={item.title}
                  isNew={item.isNew}
                  onClick={() => handleNoticeClick(item.id)}
                  displayVariant="home"
                  backgroundImageSrc={HOME_NOTICE_BACKGROUND_IMAGE_SRC}
                />
              </li>
            ))}
          </ul>
        </section>

        <section>
          <div className="flex items-center justify-between">
            <h3 className="text-[24px] font-bold text-white-1">
              세션 자료 공유
            </h3>
            <button
              type="button"
              onClick={handleMoveToMaterialSection}
              className="flex items-center gap-3.75 cursor-pointer text-[20px] font-medium text-gray-4"
            >
              더보기
              <Image
                src="/icons/right.svg"
                alt=">"
                width={7}
                height={14}
                className="w-[7px]"
              />
            </button>
          </div>
          <div className="mt-8 h-[5px] w-full bg-main-1" />
          <ul className="mt-16.75 grid grid-cols-2 gap-x-5.25 gap-y-7.75">
            {materialItems.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => handleMaterialClick(item.id)}
                  className="w-full cursor-pointer text-left"
                >
                  <div className="overflow-hidden rounded-[16px] bg-[#434958]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.thumbnailSrc ?? HOME_MATERIAL_DEFAULT_THUMBNAIL_SRC}
                      alt={item.thumbnailAlt ?? `${item.title} 썸네일`}
                      className="h-[210px] w-full object-cover"
                    />
                  </div>
                  <p className="mt-4.25 line-clamp-1 text-[20px] font-bold text-white-1">
                    {item.title}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section>
        <div className="flex items-center justify-between">
          <h3 className="text-[24px] font-bold text-white-1">
            과제 안내 & 제출
          </h3>
          <button
            type="button"
            onClick={handleMoveToAssignmentSection}
            className="flex items-center gap-3.75 cursor-pointer text-[20px] font-medium text-gray-4"
          >
            더보기
            <Image
              src="/icons/right.svg"
              alt=">"
              width={7}
              height={14}
              className="w-[7px]"
            />
          </button>
        </div>
        <div className="mt-8 h-[5px] w-full bg-main-1" />

        <ul className="mt-16.75 flex flex-col gap-6">
          {assignmentItems.map((item) => (
            <AssignmentCard
              key={item.id}
              assignment={item}
              onClick={() => handleAssignmentClick(item.id)}
              onSubmit={(payload) =>
                handleAssignmentSubmit(item.id, item.submissionState, payload)
              }
              onCancelSubmission={() => handleAssignmentCancel(item.id)}
            />
          ))}
        </ul>
      </section>

      <p className="mt-60.5 text-center text-[14px] font-semibold leading-normal text-gray-5">
        LIKE LION UNIV.
        <br />
        X<br />
        SAHMYOOK UNIV.
      </p>
      <Image
        src="/images/lions/peek.webp"
        alt="라이언 빼꼼"
        width={476}
        height={408}
        quality={90}
        className="mx-auto w-61.5 object-contain"
      />
    </section>
  );
}
