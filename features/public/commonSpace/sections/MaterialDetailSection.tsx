"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import DetailAttachmentList from "../components/DetailAttachmentList";
import {
  buildCommonSpaceHref,
  buildCommonSpaceMaterialDetailHref,
} from "../config";
import NoticeCommentsSection from "../components/NoticeCommentsSection";
import { getMockCommonSpaceMaterialComments } from "../materials/mock";
import { commonSpaceMaterialMockDataSource } from "../materials/source";
import type {
  CommonSpaceMaterialDetailItem,
  CommonSpaceMaterialListItem,
  CommonSpaceMaterialLoadState,
} from "../materials/types";
import type { CommonSpacePartId } from "../types";

type MaterialDetailSectionProps = {
  partId: CommonSpacePartId;
  materialId: number;
};

/**
 * 세션 자료 상세 날짜 문자열을 화면용 형식으로 변환한다.
 */
function formatMaterialDateTime(value: string) {
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
 * 세션 자료 상세 레이아웃을 렌더링한다.
 */
export default function MaterialDetailSection({
  partId,
  materialId,
}: MaterialDetailSectionProps) {
  /**
   * 현재 사용자가 댓글을 작성할 수 있는지 여부를 흉내내는 임시 값이다.
   * 추후 게시글 댓글 권한과 사용자 역할 정보를 연결해 교체한다.
   */
  const CAN_WRITE_MATERIAL_COMMENT = true;

  /**
   * 현재 세션 자료 상세 데이터다.
   */
  const [materialDetail, setMaterialDetail] =
    useState<CommonSpaceMaterialDetailItem | null>(null);

  /**
   * 이전/다음 글 계산에 사용할 목록 데이터다.
   */
  const [materialItems, setMaterialItems] = useState<
    CommonSpaceMaterialListItem[]
  >([]);

  /**
   * 세션 자료 상세 로드 상태다.
   */
  const [loadState, setLoadState] =
    useState<CommonSpaceMaterialLoadState>("idle");

  useEffect(() => {
    let isMounted = true;

    async function loadMaterialDetail() {
      setLoadState("loading");

      try {
        const [detailResponse, listResponse] = await Promise.all([
          commonSpaceMaterialMockDataSource.getDetail(materialId),
          commonSpaceMaterialMockDataSource.getList({
            partId,
            page: 0,
            size: 100,
          }),
        ]);

        if (!isMounted) {
          return;
        }

        setMaterialDetail(detailResponse);
        setMaterialItems(listResponse.items);
        setLoadState(detailResponse ? "success" : "empty");
      } catch {
        if (!isMounted) {
          return;
        }

        setMaterialDetail(null);
        setMaterialItems([]);
        setLoadState("error");
      }
    }

    loadMaterialDetail();

    return () => {
      isMounted = false;
    };
  }, [materialId, partId]);

  /**
   * 현재 자료의 목록 내 위치다.
   */
  const currentMaterialIndex = materialItems.findIndex(
    (item) => item.id === materialId,
  );

  /**
   * 이전 글 데이터다.
   */
  const previousMaterial =
    currentMaterialIndex > 0 ? materialItems[currentMaterialIndex - 1] : null;

  /**
   * 다음 글 데이터다.
   */
  const nextMaterial =
    currentMaterialIndex >= 0 && currentMaterialIndex < materialItems.length - 1
      ? materialItems[currentMaterialIndex + 1]
      : null;

  if (loadState === "loading" || loadState === "idle") {
    return (
      <section className="pb-16">
        <div className="rounded-[18px] border border-gray-6 bg-[#202329] px-6 py-14 text-center">
          <p className="text-[18px] font-medium text-gray-3">
            세션 자료 상세를 불러오는 중입니다.
          </p>
        </div>
      </section>
    );
  }

  if (loadState === "error" || !materialDetail) {
    return (
      <section className="pb-16">
        <div className="flex justify-end">
          <Link
            href={buildCommonSpaceHref(partId, "materials")}
            className="rounded-[8px] bg-main-1 px-5 py-3 text-[14px] font-semibold text-white-1"
          >
            목록 보기
          </Link>
        </div>
        <div className="mt-6 rounded-[18px] border border-gray-6 bg-[#202329] px-6 py-14 text-center">
          <p className="text-[18px] font-medium text-gray-3">
            세션 자료 상세를 불러오지 못했습니다.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="pb-16">
      <div className="flex justify-end">
        <Link
          href={buildCommonSpaceHref(partId, "materials")}
          className="rounded-[14px] bg-main-1 px-12.5 py-6.5 text-[20px] font-bold text-white-1"
        >
          목록 보기
        </Link>
      </div>

      <article className="mt-14 rounded-[28px] bg-gray-7 px-19.5 py-28 leading-[1.27] text-white-1">
        <h2 className="text-[34px] font-semibold text-white-1">
          {materialDetail.title}
        </h2>

        <div className="mt-7 flex items-center gap-4">
          <div className="h-12 w-12 shrink-0 rounded-full bg-[#D9D9D9]" />
          <div className="flex flex-col gap-1">
            <p className="text-[16px] font-semibold text-white-1">
              {materialDetail.authorName ?? "운영진"}
            </p>
            <p className="text-[14px] text-gray-3">
              {materialDetail.authorDescription ?? "멋쟁이사자처럼 삼육대학교"}
            </p>
            <p className="text-[13px] text-gray-4">
              {formatMaterialDateTime(materialDetail.createdAt)}
            </p>
          </div>
        </div>

        <div className="my-15 h-px w-full bg-[#5D6475]" />

        <div className="mt-8 space-y-7">
          {materialDetail.bodyImageSrc ? (
            <div className="overflow-hidden">
              <Image
                src={materialDetail.bodyImageSrc}
                alt={materialDetail.bodyImageAlt ?? "세션 자료 본문 이미지"}
                width={920}
                height={520}
                quality={90}
                className="h-auto max-h-[520px] w-auto max-w-full object-contain"
              />
            </div>
          ) : null}

          <div className="whitespace-pre-line text-[16px] leading-[1.6] text-white-1">
            {materialDetail.content}
          </div>
        </div>

        {materialDetail.attachments.length > 0 ? (
          <>
            <DetailAttachmentList
              attachments={materialDetail.attachments}
              className="mt-8"
            />
            <div className="my-20 h-px w-full bg-[#5D6475]" />
          </>
        ) : null}

        <NoticeCommentsSection
          key={`material-comments-${materialId}`}
          noticeId={materialId}
          canWriteComment={CAN_WRITE_MATERIAL_COMMENT}
          initialComments={getMockCommonSpaceMaterialComments(materialId)}
        />

        <div className="mt-29 grid gap-4 md:grid-cols-2">
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
            {previousMaterial ? (
              <Link
                href={buildCommonSpaceMaterialDetailHref(
                  partId,
                  previousMaterial.id,
                )}
                className="block truncate rounded-[14px] bg-gray-6 px-5 py-8 text-[18px] font-medium text-white-1 transition-shadow hover:shadow-[0_0_6px_#828797]"
              >
                {previousMaterial.title}
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
            {nextMaterial ? (
              <Link
                href={buildCommonSpaceMaterialDetailHref(
                  partId,
                  nextMaterial.id,
                )}
                className="block truncate rounded-[14px] bg-gray-6 px-5 py-8 text-right text-[18px] font-medium text-white-1 transition-shadow hover:shadow-[0_0_6px_#828797]"
              >
                {nextMaterial.title}
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
