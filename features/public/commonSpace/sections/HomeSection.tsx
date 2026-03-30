"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import AssignmentCard from "../components/AssignmentCard";
import NoticeCard from "../components/NoticeCard";
import { buildCommonSpaceAssignmentDetailHref } from "../config";
import type { AssignmentItem } from "../types";

/**
 * 홈 섹션에서 사용하는 과제 프리뷰 카드 데이터다.
 */
type HomeAssignmentItem = AssignmentItem & {
  /** 상세 이동에 사용할 과제 식별자 */
  id: number;
};

/**
 * 공통 공간 메인 홈 섹션을 렌더링한다.
 */
export default function HomeSection() {
  const router = useRouter();

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

  /**
   * 과제 카드 컴포넌트의 상태별 UI를 검증하기 위한 임시 과제 데이터다.
   */
  const assignmentItems: HomeAssignmentItem[] = [
    {
      id: 1001,
      title: "공통 세션 3주차 : 협업을 위한 기초 세팅법",
      deadline: "마감 2026-03-04",
      statusLabel: "미제출",
      submissionState: "notSubmitted",
      reviewState: "hidden",
      bodyMessage: "아직 과제를 제출하지 않았습니다.",
    },
    {
      id: 1002,
      title: "공통 세션 2주차 : 떠먹여주는 기초 코딩",
      deadline: "마감 2026-03-01",
      statusLabel: "제출함",
      submissionState: "rejected",
      reviewState: "published",
      submissionFileName:
        "경동나비앤보일러공학과 24학번 윤혜원 2주차(공통) 과제 제출.jpg",
      reviewContent:
        "열라면 순두부 물의 양은 좀 주의하셔야하는데요. 순두부에서 물이 나오기 때문에 열라면 1개당 기본 물양 500ml 보다 적게 넣어주셔야 합니다.\n저는 라면 2개 기준으로 500ml 넣었습니다. (원래는 1,000ml넣어야 함) 저는 자극적인거 좋아하는 편이라 딱 좋았어요.\n\n원 레시피도 국물의 양은 많지 않은 레시피인데 물이 제가 끓인 정도의 자작함을 보시고 국물이 더 많기를 원하시면 600-700ml 정도 조절해서 넣어주세요.\n\n제가 해먹은 레시피는 라면 두개 기준 레시피이기 때문에 ★라면 1개 끓일때는 물을 반으로 하면 너무 쫄아버리니 350ml-400ml 정도 넣어주세요★",
      canResubmit: true,
    },
    {
      id: 1003,
      title: "공통 세션 1주차 : 숨쉬는법진짜쉽다",
      deadline: "마감 2026-03-01",
      statusLabel: "제출함",
      submissionState: "submitted",
      reviewState: "pending",
      submissionFileName: "숨쉬는중.mp4",
    },
    {
      id: 1004,
      title: "공통 세션 OT : 자기소개 카드 만들기",
      deadline: "마감 2026-02-24",
      statusLabel: "제출함",
      submissionState: "submitted",
      reviewState: "published",
      submissionFileName: "자기소개카드_윤혜원.png",
      reviewContent:
        "전달하고 싶은 정보가 명확하게 정리되어 있어서 읽기 쉬웠습니다.\n타이포 위계도 잘 잡혀 있고, 컬러 사용도 안정적입니다.\n\n다음 제출부터는 텍스트와 아이콘 사이 간격만 조금 더 정리해보면 완성도가 더 올라갈 것 같습니다.",
    },
    {
      id: 1005,
      title: "공통 세션 0주차 : OT 출석 인증",
      deadline: "마감 2026-02-20",
      statusLabel: "마감",
      submissionState: "closed",
      reviewState: "hidden",
      bodyMessage: "제출 기간이 종료되었습니다.",
    },
  ];

  /**
   * 홈 과제 프리뷰 카드 클릭 시 과제 상세 화면으로 이동한다.
   */
  function handleAssignmentClick(assignmentId: number) {
    router.push(buildCommonSpaceAssignmentDetailHref("all", assignmentId));
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
