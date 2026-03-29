"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  buildCommonSpaceHref,
  buildCommonSpaceNoticeDetailHref,
} from "../config";
import NoticeCommentsSection from "../components/NoticeCommentsSection";
import { commonSpaceNoticeMockDataSource } from "../notices/source";
import type {
  CommonSpaceNoticeDetailItem,
  CommonSpaceNoticeListItem,
  CommonSpaceNoticeLoadState,
} from "../notices/types";
import type { CommonSpacePartId } from "../types";

type NoticeDetailSectionProps = {
  partId: CommonSpacePartId;
  noticeId: number;
};

/**
 * 공지 상세 날짜 문자열을 화면용 형식으로 변환한다.
 */
function formatNoticeDateTime(value: string) {
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
 * 공지 상세 레이아웃을 렌더링한다.
 */
export default function NoticeDetailSection({
  partId,
  noticeId,
}: NoticeDetailSectionProps) {
  /**
   * 현재 사용자가 댓글을 작성할 수 있는지 여부를 흉내내는 임시 값이다.
   * 추후 게시글 댓글 권한과 사용자 역할 정보를 연결해 교체한다.
   */
  const CAN_WRITE_NOTICE_COMMENT = true;

  /**
   * 현재 공지 상세 데이터다.
   */
  const [noticeDetail, setNoticeDetail] =
    useState<CommonSpaceNoticeDetailItem | null>(null);

  /**
   * 이전/다음 글 계산에 사용할 목록 데이터다.
   */
  const [noticeItems, setNoticeItems] = useState<CommonSpaceNoticeListItem[]>(
    [],
  );

  /**
   * 공지 상세 로드 상태다.
   */
  const [loadState, setLoadState] =
    useState<CommonSpaceNoticeLoadState>("idle");

  useEffect(() => {
    let isMounted = true;

    async function loadNoticeDetail() {
      setLoadState("loading");

      try {
        const [detailResponse, listResponse] = await Promise.all([
          commonSpaceNoticeMockDataSource.getDetail(noticeId),
          commonSpaceNoticeMockDataSource.getList({
            partId,
            page: 0,
            size: 100,
          }),
        ]);

        if (!isMounted) {
          return;
        }

        setNoticeDetail(detailResponse);
        setNoticeItems(listResponse.items);
        setLoadState(detailResponse ? "success" : "empty");
      } catch {
        if (!isMounted) {
          return;
        }

        setNoticeDetail(null);
        setNoticeItems([]);
        setLoadState("error");
      }
    }

    loadNoticeDetail();

    return () => {
      isMounted = false;
    };
  }, [noticeId, partId]);

  /**
   * 현재 공지의 목록 내 위치다.
   */
  const currentNoticeIndex = noticeItems.findIndex(
    (item) => item.id === noticeId,
  );

  /**
   * 이전 글 데이터다.
   */
  const previousNotice =
    currentNoticeIndex > 0 ? noticeItems[currentNoticeIndex - 1] : null;

  /**
   * 다음 글 데이터다.
   */
  const nextNotice =
    currentNoticeIndex >= 0 && currentNoticeIndex < noticeItems.length - 1
      ? noticeItems[currentNoticeIndex + 1]
      : null;

  if (loadState === "loading" || loadState === "idle") {
    return (
      <section className="pb-16">
        <div className="rounded-[18px] border border-gray-6 bg-[#202329] px-6 py-14 text-center">
          <p className="text-[18px] font-medium text-gray-3">
            공지 상세를 불러오는 중입니다.
          </p>
        </div>
      </section>
    );
  }

  if (loadState === "error" || !noticeDetail) {
    return (
      <section className="pb-16">
        <div className="flex justify-end">
          <Link
            href={buildCommonSpaceHref(partId, "notices")}
            className="rounded-[8px] bg-main-1 px-5 py-3 text-[14px] font-semibold text-white-1"
          >
            목록 보기
          </Link>
        </div>
        <div className="mt-6 rounded-[18px] border border-gray-6 bg-[#202329] px-6 py-14 text-center">
          <p className="text-[18px] font-medium text-gray-3">
            공지 상세를 불러오지 못했습니다.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="pb-16">
      <div className="flex justify-end">
        <Link
          href={buildCommonSpaceHref(partId, "notices")}
          className="rounded-[14px] bg-main-1 px-12.5 py-6.5 text-[20px] font-bold text-white-1"
        >
          목록 보기
        </Link>
      </div>

      <article className="mt-14 rounded-[28px] bg-gray-7 px-19.5 py-28 text-white-1 leading-[1.27]">
        <h2 className="text-[34px] font-semibold text-white-1">
          {noticeDetail.title}
        </h2>

        <div className="mt-7 flex items-center gap-4">
          <div className="h-12 w-12 shrink-0 rounded-full bg-[#D9D9D9]" />
          <div className="flex flex-col gap-1">
            <p className="text-[16px] font-semibold text-white-1">
              {noticeDetail.authorName ?? "운영진"}
            </p>
            <p className="text-[14px] text-gray-3">
              {noticeDetail.authorDescription ?? "멋쟁이사자처럼 삼육대학교"}
            </p>
            <p className="text-[13px] text-gray-4">
              {formatNoticeDateTime(noticeDetail.createdAt)}
            </p>
          </div>
        </div>

        <div className="my-15 h-px w-full bg-[#5D6475]" />

        <div className="mt-8 space-y-7">
          {noticeDetail.bodyImageSrc ? (
            <div className="overflow-hidden">
              <Image
                src={noticeDetail.bodyImageSrc}
                alt={noticeDetail.bodyImageAlt ?? "공지 본문 이미지"}
                width={920}
                height={520}
                quality={90}
                className="w-full object-cover"
              />
            </div>
          ) : null}

          <div className="whitespace-pre-line text-[16px] leading-[1.6] text-white-1">
            {noticeDetail.content}
          </div>
        </div>

        {noticeDetail.attachments.length > 0 ? (
          <>
            <div className="mt-8 rounded-[12px] bg-[#484D5A] px-6 py-5">
              <p className="text-[16px] font-semibold text-white-1">
                첨부파일 ({noticeDetail.attachments.length}개)
              </p>

              <div className="mt-4 space-y-3">
                {noticeDetail.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between gap-4 rounded-[10px] bg-[#5A6070] px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-medium text-white-1">
                        {attachment.name}
                      </p>
                      <p className="mt-1 text-[12px] text-gray-3">
                        파일을 다운로드할 수 있습니다.
                      </p>
                    </div>
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 rounded-[8px] bg-main-1 px-4 py-2 text-[13px] font-semibold text-white-1"
                    >
                      내려받기
                    </a>
                  </div>
                ))}
              </div>
            </div>
            <div className="my-20 h-px w-full bg-[#5D6475]" />
          </>
        ) : null}
        <NoticeCommentsSection
          key={noticeId}
          noticeId={noticeId}
          canWriteComment={CAN_WRITE_NOTICE_COMMENT}
        />

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="space-y-6">
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
            {previousNotice ? (
              <Link
                href={buildCommonSpaceNoticeDetailHref(
                  partId,
                  previousNotice.id,
                )}
                className="block rounded-[14px] bg-gray-6 px-5 py-8 text-[18px] font-medium text-white-1 hover:shadow-[0_0_6px_#828797] transition-shadow"
              >
                {previousNotice.title}
              </Link>
            ) : (
              <div className="rounded-[14px] bg-gray-6 px-5 py-8 text-center text-[18px] text-gray-4">
                이전 글이 없습니다.
              </div>
            )}
          </div>

          <div className="space-y-6">
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
            {nextNotice ? (
              <Link
                href={buildCommonSpaceNoticeDetailHref(partId, nextNotice.id)}
                className="block rounded-[14px] bg-gray-6 px-5 py-8 text-right text-[18px] font-medium text-white-1 hover:shadow-[0_0_6px_#828797] transition-shadow"
              >
                {nextNotice.title}
              </Link>
            ) : (
              <div className="rounded-[14px] bg-gray-6 px-5 py-8 text-center text-[18px] text-gray-4">
                다음 글이 없습니다.
              </div>
            )}
          </div>
        </div>
      </article>
    </section>
  );
}
