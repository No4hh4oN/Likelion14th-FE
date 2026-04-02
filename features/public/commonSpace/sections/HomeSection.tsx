"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  commonSpaceAssignmentMockDataSource,
} from "../assignments/source";
import type {
  CommonSpaceAssignmentListItem,
  CommonSpaceAssignmentSubmissionRequest,
} from "../assignments/types";
import AssignmentCard from "../components/AssignmentCard";
import NoticeCard from "../components/NoticeCard";
import { buildCommonSpaceAssignmentDetailHref } from "../config";

/**
 * 홈 섹션이 현재 사용할 과제 데이터 소스다.
 * 실 API 연결 시 mock 대신 api data source로 교체하면 된다.
 */
const commonSpaceAssignmentDataSource = commonSpaceAssignmentMockDataSource;

/**
 * 공통 공간 메인 홈 섹션을 렌더링한다.
 */
export default function HomeSection() {
  const router = useRouter();

  /**
   * 홈 하단에 노출할 과제 프리뷰 목록이다.
   */
  const [assignmentItems, setAssignmentItems] = useState<
    CommonSpaceAssignmentListItem[]
  >([]);

  /**
   * 세션 자료 썸네일이 없을 때 사용할 기본 이미지 경로다.
   */
  const SESSION_DEFAULT_THUMBNAIL = "/images/commonSpace/default.webp";

  /**
   * 실제 API 연결 전까지 썸네일 존재 여부를 흉내내기 위한 임시 값이다.
   */
  const TEMP = null;

  /**
   * 전체 공지 섹션에 노출할 임시 공지 목록이다.
   */
  const noticeItems = [
    "세션의 규칙을 안내드립니다. (첨부파일 참조)",
    "공통 세션 장소 및 시간대 안내",
    "과제 미제출 시 불이익",
    "과제 미제출 시 불이익2",
    "과제 미제출 시 불이익3",
    "과제 미제출 시 불이익4",
  ];

  /**
   * 홈 상단에 노출할 고정 공지 카드의 임시 데이터다.
   */
  const pinnedNoticeTitle = "예시로 보여지는 텍스트입니다.";

  /**
   * 홈 공지 목록 카드에 사용할 장식 이미지 경로다.
   */
  const HOME_NOTICE_BACKGROUND_IMAGE_SRC = "/images/lions/lion-stand-half.webp";

  /**
   * 세션 자료 공유 섹션에 노출할 임시 자료 목록이다.
   */
  const materialItems = [
    {
      title: "발로 해도 따라할 수 있는 기초 강의",
      thumbnailUrl: TEMP || SESSION_DEFAULT_THUMBNAIL,
    },
    {
      title: "2차 공통 세션 자료 PDF",
      thumbnailUrl: TEMP || SESSION_DEFAULT_THUMBNAIL,
    },
    {
      title: "발로 해도 따라할 수 있는 기초 강의2",
      thumbnailUrl: TEMP || SESSION_DEFAULT_THUMBNAIL,
    },
    {
      title: "2차 공통 세션 자료 PDF2",
      thumbnailUrl: TEMP || SESSION_DEFAULT_THUMBNAIL,
    },
  ];

  useEffect(() => {
    let isMounted = true;

    async function loadHomeAssignmentItems() {
      try {
        const response = await commonSpaceAssignmentDataSource.getList({
          partId: "all",
        });

        if (!isMounted) {
          return;
        }

        setAssignmentItems(response.items);
      } catch {
        if (!isMounted) {
          return;
        }

        setAssignmentItems([]);
      }
    }

    loadHomeAssignmentItems();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * 홈 과제 프리뷰 카드 클릭 시 과제 상세 화면으로 이동한다.
   */
  function handleAssignmentClick(assignmentId: number) {
    router.push(buildCommonSpaceAssignmentDetailHref("all", assignmentId));
  }

  /**
   * 홈 과제 프리뷰 카드에서 제출/재제출 후 최신 상태를 다시 불러온다.
   */
  async function handleAssignmentSubmit(
    assignmentId: number,
    submissionState: CommonSpaceAssignmentListItem["submissionState"],
    file: File,
  ) {
    const submissionPayload = {
      request: {},
      files: [file],
    } satisfies CommonSpaceAssignmentSubmissionRequest;

    if (submissionState === "rejected") {
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

    const nextAssignmentItems = await commonSpaceAssignmentDataSource.getList({
      partId: "all",
    });

    setAssignmentItems(nextAssignmentItems.items);
  }

  return (
    <section className="flex flex-col gap-28.5">
      <NoticeCard title={pinnedNoticeTitle} pinned isNew />
      <div className="grid gap-10 lg:grid-cols-2">
        <section>
          <div className="flex items-center justify-between">
            <h3 className="text-[24px] font-bold text-white-1">전체 공지</h3>
            <button
              type="button"
              className="flex text-[20px] leading-[1.27] gap-3.75 cursor-pointer text-gray-4 font-medium"
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
              <li key={item}>
                <NoticeCard
                  title={item}
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
              className="flex text-[20px] items-center gap-3.75 cursor-pointer text-gray-4 font-medium"
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
          <ul className="mt-16.75 grid grid-cols-2 gap-y-7.75 gap-x-5.25">
            {materialItems.map((item, index) => (
              <li key={`${item.title}-${index}`}>
                <div className="overflow-hidden rounded-[16px] bg-[#434958]">
                  <Image
                    src={item.thumbnailUrl || SESSION_DEFAULT_THUMBNAIL}
                    alt={`${item.title} 썸네일`}
                    width={258}
                    height={210}
                    quality={90}
                    className="h-[210px] w-full object-cover"
                  />
                </div>
                <p className="mt-4.25 text-[20px] font-bold text-white-1 line-clamp-1">
                  {item.title}
                </p>
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
            className="flex text-[20px] items-center gap-3.75 cursor-pointer text-gray-4 font-medium"
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
          {assignmentItems.map((item, index) => (
            <AssignmentCard
              key={`${item.title}-${index}`}
              assignment={item}
              onClick={() => handleAssignmentClick(item.id)}
              onSubmitFile={(file) =>
                handleAssignmentSubmit(item.id, item.submissionState, file)
              }
            />
          ))}
        </ul>
      </section>
      <p className="mt-60.5 text-[14px] font-semibold leading-normal text-gray-5 text-center">
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
        className="w-61.5 mx-auto object-contain"
      />
    </section>
  );
}
