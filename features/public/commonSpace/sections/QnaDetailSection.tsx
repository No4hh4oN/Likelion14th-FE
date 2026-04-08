"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getMyProfile } from "@/features/public/mypage/api";
import type { MyPageUserApiResponse, UserRole } from "@/features/public/mypage/types";
import {
  buildCommonSpaceViewerDisplayName,
  mapCommonSpaceAuthorLevelToLabel,
} from "../author";
import DetailAttachmentList from "../components/DetailAttachmentList";
import QnaAnswersSection from "../components/QnaAnswersSection";
import { QnaAnswerStateBadge, QnaPartBadge } from "../components/QnaBadges";
import {
  buildCommonSpaceHref,
  buildCommonSpaceQnaDetailHref,
} from "../config";
import { getRenderableCommonSpaceQnaHtml } from "../qna/html";
import { commonSpaceQnaApiDataSource } from "../qna/source";
import type {
  CommonSpaceQnaAnswerMutationRequest,
  CommonSpaceQnaDetailItem,
  CommonSpaceQnaListItem,
  CommonSpaceQnaLoadState,
} from "../qna/types";
import type { CommonSpacePartId } from "../types";

type QnaDetailSectionProps = {
  partId: CommonSpacePartId;
  qnaId: number;
};

type QnaViewerInfo = {
  /** 현재 사용자 역할 */
  role: UserRole;
  /** 작성창에 표시할 현재 사용자명 */
  displayName: string;
  /** 현재 사용자 이름 */
  name: string;
  /** 현재 사용자 부가 정보 */
  description: string;
  /** 현재 사용자 프로필 이미지 경로 */
  profileImageSrc: string;
  /** 현재 사용자 프로필 이미지 대체 텍스트 */
  profileImageAlt: string;
};

/**
 * 질의응답 상세 섹션이 현재 사용할 데이터 소스다.
 */
const commonSpaceQnaDataSource = commonSpaceQnaApiDataSource;

/**
 * 프로필 조회 실패 시 사용할 기본 사용자 정보다.
 */
const DEFAULT_QNA_VIEWER_INFO: QnaViewerInfo = {
  role: "아기사자",
  displayName: "아기사자",
  name: "아기사자",
  description: "멋쟁이사자처럼 삼육대학교",
  profileImageSrc: "/images/defaultProf.webp",
  profileImageAlt: "현재 사용자 프로필 사진",
};

/**
 * 역할 레벨 문자열을 화면용 사용자 역할로 정규화한다.
 */
function mapRoleLevelToUserRole(
  level?: string,
  fallbackRole: UserRole = DEFAULT_QNA_VIEWER_INFO.role,
): UserRole {
  const levelLabel = mapCommonSpaceAuthorLevelToLabel(level);

  if (
    levelLabel === "운영진" ||
    levelLabel === "아기사자" ||
    levelLabel === "게스트"
  ) {
    return levelLabel;
  }

  return fallbackRole;
}

/**
 * 프로필 API 응답을 질의응답 상세에서 사용할 현재 사용자 정보로 변환한다.
 */
function toQnaViewerInfo(profile: MyPageUserApiResponse | null): QnaViewerInfo {
  if (!profile) {
    return DEFAULT_QNA_VIEWER_INFO;
  }

  const activeRole = profile.roles.find((role) => role.active) ?? profile.roles[0];
  const role = mapRoleLevelToUserRole(activeRole?.level);
  const name = profile.homepage.name || DEFAULT_QNA_VIEWER_INFO.name;
  const description = profile.homepage.studentNo
    ? `${profile.homepage.department} ${profile.homepage.studentNo}`
    : profile.homepage.department || DEFAULT_QNA_VIEWER_INFO.description;
  const profileImageSrc =
    profile.homepage.profileImage?.url || DEFAULT_QNA_VIEWER_INFO.profileImageSrc;

  return {
    role,
    displayName: buildCommonSpaceViewerDisplayName(
      profile,
      DEFAULT_QNA_VIEWER_INFO.displayName,
    ),
    name,
    description,
    profileImageSrc,
    profileImageAlt: `${name} 프로필 사진`,
  };
}

/**
 * 질의응답 상세 날짜 문자열을 화면용 형식으로 변환한다.
 */
function formatQnaDateTime(value: string) {
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
 * 비밀글 여부를 표시할 자물쇠 아이콘이다.
 */
function QnaDetailSecretIcon() {
  return (
    <svg
      width="18"
      height="22"
      viewBox="0 0 12 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mt-1 h-[22px] w-[18px] shrink-0 text-[#9EA3B2]"
      aria-hidden="true"
    >
      <path
        d="M9.75 5.25H9.375V3.75C9.375 1.67906 7.69594 0 5.625 0C3.55406 0 1.875 1.67906 1.875 3.75V5.25H1.5C0.671578 5.25 0 5.92158 0 6.75V13.5C0 14.3284 0.671578 15 1.5 15H9.75C10.5784 15 11.25 14.3284 11.25 13.5V6.75C11.25 5.92158 10.5784 5.25 9.75 5.25ZM3.375 3.75C3.375 2.50734 4.38234 1.5 5.625 1.5C6.86766 1.5 7.875 2.50734 7.875 3.75V5.25H3.375V3.75ZM6.375 10.5281V12H4.875V10.5281C4.42734 10.2684 4.125 9.78469 4.125 9.23438C4.125 8.40594 4.79658 7.73438 5.625 7.73438C6.45342 7.73438 7.125 8.40594 7.125 9.23438C7.125 9.78469 6.82266 10.2684 6.375 10.5281Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * 질의응답 상세 섹션에 필요한 상세/목록/현재 사용자 데이터를 함께 불러온다.
 */
async function getQnaDetailSectionData(qnaId: number) {
  const [detailResponse, listResponse, profileResponse] = await Promise.all([
    commonSpaceQnaDataSource.getDetail(qnaId),
    commonSpaceQnaDataSource.getList({
      partId: "all",
      page: 0,
      size: 100,
    }),
    getMyProfile().catch(() => null),
  ]);

  return {
    qnaDetail: detailResponse,
    qnaItems: listResponse.items,
    viewerInfo: toQnaViewerInfo(profileResponse),
  };
}

/**
 * 질의응답 상세 레이아웃을 렌더링한다.
 */
export default function QnaDetailSection({
  partId,
  qnaId,
}: QnaDetailSectionProps) {
  /**
   * 현재 질문 상세 데이터다.
   */
  const [qnaDetail, setQnaDetail] = useState<CommonSpaceQnaDetailItem | null>(null);

  /**
   * 이전/다음 글 계산에 사용할 목록 데이터다.
   */
  const [qnaItems, setQnaItems] = useState<CommonSpaceQnaListItem[]>([]);

  /**
   * 현재 사용자 정보다.
   */
  const [viewerInfo, setViewerInfo] = useState<QnaViewerInfo>(
    DEFAULT_QNA_VIEWER_INFO,
  );

  /**
   * 질의응답 상세 로드 상태다.
   */
  const [loadState, setLoadState] = useState<CommonSpaceQnaLoadState>("idle");

  useEffect(() => {
    let isMounted = true;

    async function loadQnaDetail() {
      setLoadState("loading");

      try {
        const nextSectionData = await getQnaDetailSectionData(qnaId);

        if (!isMounted) {
          return;
        }

        setQnaDetail(nextSectionData.qnaDetail);
        setQnaItems(nextSectionData.qnaItems);
        setViewerInfo(nextSectionData.viewerInfo);
        setLoadState(nextSectionData.qnaDetail ? "success" : "empty");
      } catch {
        if (!isMounted) {
          return;
        }

        setQnaDetail(null);
        setQnaItems([]);
        setViewerInfo(DEFAULT_QNA_VIEWER_INFO);
        setLoadState("error");
      }
    }

    loadQnaDetail();

    return () => {
      isMounted = false;
    };
  }, [qnaId]);

  /**
   * 현재 질문의 목록 내 위치다.
   */
  const currentQnaIndex = qnaItems.findIndex((item) => item.id === qnaId);

  /**
   * 이전 글 데이터다.
   */
  const previousQna = currentQnaIndex > 0 ? qnaItems[currentQnaIndex - 1] : null;

  /**
   * 다음 글 데이터다.
   */
  const nextQna =
    currentQnaIndex >= 0 && currentQnaIndex < qnaItems.length - 1
      ? qnaItems[currentQnaIndex + 1]
      : null;

  if (loadState === "loading" || loadState === "idle") {
    return (
      <section className="pb-16">
        <div className="rounded-[18px] border border-gray-6 bg-[#202329] px-6 py-14 text-center">
          <p className="text-[18px] font-medium text-gray-3">
            질의응답 상세를 불러오는 중입니다.
          </p>
        </div>
      </section>
    );
  }

  if (loadState === "error" || !qnaDetail) {
    return (
      <section className="pb-16">
        <div className="flex justify-end">
          <Link
            href={buildCommonSpaceHref(partId, "qna")}
            className="rounded-[8px] bg-main-1 px-5 py-3 text-[14px] font-semibold text-white-1"
          >
            목록 보기
          </Link>
        </div>
        <div className="mt-6 rounded-[18px] border border-gray-6 bg-[#202329] px-6 py-14 text-center">
          <p className="text-[18px] font-medium text-gray-3">
            질의응답 상세를 불러오지 못했습니다.
          </p>
        </div>
      </section>
    );
  }

  /**
   * 현재 사용자가 답변을 작성할 수 있는지 여부다.
   */
  const canWriteAnswer = viewerInfo.role === "운영진";

  /**
   * 답변 등록 이후 상세/목록 상태를 새로 불러온다.
   */
  async function handleSubmitAnswer(payload: CommonSpaceQnaAnswerMutationRequest) {
    await commonSpaceQnaDataSource.createAnswer(qnaId, payload);

    const nextSectionData = await getQnaDetailSectionData(qnaId);
    setQnaDetail(nextSectionData.qnaDetail);
    setQnaItems(nextSectionData.qnaItems);
    setViewerInfo(nextSectionData.viewerInfo);
    setLoadState(nextSectionData.qnaDetail ? "success" : "empty");
  }

  return (
    <section className="pb-16">
      <div className="flex justify-end">
        <Link
          href={buildCommonSpaceHref(partId, "qna")}
          className="rounded-[10px] bg-main-1 px-5 py-3 text-[14px] font-semibold text-white-1 sm:rounded-[12px] sm:px-8 sm:py-4 sm:text-[16px] lg:rounded-[14px] lg:px-12.5 lg:py-6.5 lg:text-[20px] lg:font-bold"
        >
          목록 보기
        </Link>
      </div>

      <article className="mt-6 w-full rounded-[22px] bg-gray-7 px-4 py-8 leading-[1.27] text-white-1 sm:mt-8 sm:rounded-[24px] sm:px-6 sm:py-10 lg:mt-14 lg:rounded-[28px] lg:px-12 lg:py-20 xl:px-19.5 xl:py-28">
        <div className="flex flex-wrap items-center gap-3">
          <QnaPartBadge questionPartId={qnaDetail.questionPartId} />
          <QnaAnswerStateBadge answerState={qnaDetail.answerState} />
        </div>

        <div className="mt-6 flex flex-wrap items-start gap-2.5 sm:mt-7 sm:gap-3">
          <h2 className="text-[28px] font-semibold leading-[1.3] text-white-1 sm:text-[30px] lg:text-[34px]">
            {qnaDetail.title}
          </h2>
          {qnaDetail.isSecret ? <QnaDetailSecretIcon /> : null}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4 sm:mt-7">
          <Image
            src={qnaDetail.profileImageSrc ?? "/images/defaultProf.webp"}
            alt={qnaDetail.profileImageAlt ?? "질문 작성자 프로필 사진"}
            width={48}
            height={48}
            className="h-12 w-12 shrink-0 rounded-full object-cover"
          />
          <div className="flex flex-col gap-1">
            <p className="text-[16px] font-semibold text-white-1">
              {qnaDetail.authorName ?? "질문 작성자"}
            </p>
            <p className="text-[14px] text-gray-3">
              {qnaDetail.authorDescription ?? "멋쟁이사자처럼 삼육대학교"}
            </p>
            <p className="text-[13px] text-gray-4">
              {formatQnaDateTime(qnaDetail.createdAt)}
            </p>
          </div>
        </div>

        <div className="my-10 h-px w-full bg-[#5D6475] sm:my-12 lg:my-15" />

        <div
          className="text-[15px] leading-[1.8] text-white-1 sm:text-[16px] [&_ol]:list-decimal [&_ol]:pl-6 [&_p+p]:mt-4 [&_ul]:list-disc [&_ul]:pl-6"
          dangerouslySetInnerHTML={{
            __html: getRenderableCommonSpaceQnaHtml(qnaDetail.content),
          }}
        />

        {qnaDetail.attachments.length > 0 ? (
          <DetailAttachmentList attachments={qnaDetail.attachments} className="mt-8" />
        ) : null}

        <div className="my-12 h-px w-full bg-[#5D6475] sm:my-14 lg:my-20" />

        <QnaAnswersSection
          key={`qna-answers-${qnaId}`}
          qnaId={qnaId}
          answers={qnaDetail.answers}
          canWriteAnswer={canWriteAnswer}
          onSubmitAnswer={handleSubmitAnswer}
          writerName={viewerInfo.displayName}
          writerDescription={viewerInfo.description}
          writerProfileImageSrc={viewerInfo.profileImageSrc}
          writerProfileImageAlt={viewerInfo.profileImageAlt}
        />

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
            {previousQna ? (
              <Link
                href={buildCommonSpaceQnaDetailHref(partId, previousQna.id)}
                className="block truncate rounded-[14px] bg-gray-6 px-4 py-6 text-[16px] font-medium text-white-1 transition-shadow hover:shadow-[0_0_6px_#828797] sm:px-5 sm:py-8 sm:text-[18px]"
              >
                {previousQna.title}
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
            {nextQna ? (
              <Link
                href={buildCommonSpaceQnaDetailHref(partId, nextQna.id)}
                className="block truncate rounded-[14px] bg-gray-6 px-4 py-6 text-right text-[16px] font-medium text-white-1 transition-shadow hover:shadow-[0_0_6px_#828797] sm:px-5 sm:py-8 sm:text-[18px]"
              >
                {nextQna.title}
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
