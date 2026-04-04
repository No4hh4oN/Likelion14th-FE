"use client";
/* eslint-disable @next/next/no-img-element */

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { getMyProfile } from "@/features/public/mypage/api";
import type { MyPageUserApiResponse } from "@/features/public/mypage/types";
import type {
  CommonSpaceNoticeCommentCreateRequest,
  CommonSpaceNoticeCommentImage,
  CommonSpaceNoticeCommentItem,
} from "../notices/types";

type NoticeCommentsSectionProps = {
  /** 댓글이 속한 게시글 식별자 */
  noticeId: number;
  /** 현재 사용자가 댓글을 작성할 수 있는지 여부 */
  canWriteComment?: boolean;
  /** 외부에서 주입할 댓글 목록 */
  initialComments?: CommonSpaceNoticeCommentItem[];
  /** 댓글 등록 처리 핸들러 */
  onSubmitComment?: (
    payload: CommonSpaceNoticeCommentCreateRequest,
  ) => Promise<void>;
  /** 댓글 입력이 막혀 있을 때 보여줄 안내 문구 */
  blockedMessage?: string;
};

type NoticeCommentDraftImageItem = CommonSpaceNoticeCommentImage & {
  /** 실제 업로드할 파일 객체 */
  file: File;
};

type NoticeCommentViewerInfo = {
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
 * 프로필 조회 실패 시 사용할 기본 사용자 정보다.
 */
const DEFAULT_NOTICE_COMMENT_VIEWER_INFO: NoticeCommentViewerInfo = {
  name: "아기사자",
  description: "멋쟁이사자처럼 삼육대학교",
  profileImageSrc: "/images/defaultProf.webp",
  profileImageAlt: "댓글 작성자 프로필 사진",
};

/**
 * 댓글 입력창이 자동으로 늘어날 최대 높이다.
 */
const NOTICE_COMMENT_TEXTAREA_MAX_HEIGHT = 220;

/**
 * 마이페이지 프로필 응답을 댓글 작성자 표시용 데이터로 변환한다.
 */
function toNoticeCommentViewerInfo(
  profile: MyPageUserApiResponse | null,
): NoticeCommentViewerInfo {
  if (!profile) {
    return DEFAULT_NOTICE_COMMENT_VIEWER_INFO;
  }

  const name = profile.homepage.name || DEFAULT_NOTICE_COMMENT_VIEWER_INFO.name;
  const description = profile.homepage.studentNo
    ? `${profile.homepage.department} ${profile.homepage.studentNo}`
    : profile.homepage.department || DEFAULT_NOTICE_COMMENT_VIEWER_INFO.description;
  const profileImageSrc =
    profile.homepage.profileImage?.url ||
    DEFAULT_NOTICE_COMMENT_VIEWER_INFO.profileImageSrc;

  return {
    name,
    description,
    profileImageSrc,
    profileImageAlt: `${name} 프로필 사진`,
  };
}

/**
 * 댓글 이미지 미리보기 확대 모달을 렌더링한다.
 */
function NoticeCommentImageDialog({
  image,
  onClose,
}: {
  image: CommonSpaceNoticeCommentImage;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-6 py-10"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="댓글 첨부 이미지 확대 보기"
    >
      <div
        className="max-h-[calc(100vh-80px)] max-w-[min(96vw,1100px)] overflow-auto rounded-[18px] bg-white p-4"
        onClick={(event) => event.stopPropagation()}
      >
        <img
          src={image.src}
          alt={image.alt}
          className="h-auto max-h-none w-auto max-w-full object-contain"
        />
      </div>
    </div>
  );
}

/**
 * 공지 상세 하단의 댓글 작성/목록/이미지 미리보기 레이아웃을 렌더링한다.
 */
export default function NoticeCommentsSection(
  props: NoticeCommentsSectionProps,
) {
  const {
    canWriteComment = true,
    initialComments,
    onSubmitComment,
    blockedMessage = "댓글을 작성할 수 없습니다.",
  } = props;

  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const draftTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const draftImagesRef = useRef<NoticeCommentDraftImageItem[]>([]);

  /**
   * 현재 화면에 렌더링할 댓글 목록이다.
   */
  const comments = initialComments ?? [];

  /**
   * 작성 중인 댓글 본문이다.
   */
  const [draftContent, setDraftContent] = useState("");

  /**
   * 작성 중인 댓글에 첨부한 이미지 목록이다.
   */
  const [draftImages, setDraftImages] = useState<NoticeCommentDraftImageItem[]>(
    [],
  );

  /**
   * 댓글 제출 진행 여부다.
   */
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * 모달에 띄운 댓글 이미지다.
   */
  const [activePreviewImage, setActivePreviewImage] =
    useState<CommonSpaceNoticeCommentImage | null>(null);

  /**
   * 현재 사용자 표시 정보다.
   */
  const [viewerInfo, setViewerInfo] = useState<NoticeCommentViewerInfo>(
    DEFAULT_NOTICE_COMMENT_VIEWER_INFO,
  );

  /**
   * 댓글 입력창 높이를 현재 입력 길이에 맞춰 조정한다.
   */
  function resizeDraftTextarea() {
    if (!draftTextareaRef.current) {
      return;
    }

    draftTextareaRef.current.style.height = "auto";

    const nextHeight = Math.min(
      draftTextareaRef.current.scrollHeight,
      NOTICE_COMMENT_TEXTAREA_MAX_HEIGHT,
    );

    draftTextareaRef.current.style.height = `${nextHeight}px`;
    draftTextareaRef.current.style.overflowY =
      draftTextareaRef.current.scrollHeight > NOTICE_COMMENT_TEXTAREA_MAX_HEIGHT
        ? "auto"
        : "hidden";
  }

  /**
   * 작성 중인 첨부 이미지 URL을 정리한다.
   */
  function clearDraftImages(images: NoticeCommentDraftImageItem[]) {
    images.forEach((image) => {
      URL.revokeObjectURL(image.src);
    });
  }

  /**
   * 댓글 본문 입력값 변경을 처리한다.
   */
  function handleDraftContentChange(
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) {
    setDraftContent(event.target.value);
  }

  useEffect(() => {
    resizeDraftTextarea();
  }, [draftContent]);

  useEffect(() => {
    draftImagesRef.current = draftImages;
  }, [draftImages]);

  useEffect(() => {
    return () => {
      clearDraftImages(draftImagesRef.current);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadViewerInfo() {
      const profile = await getMyProfile().catch(() => null);

      if (!isMounted) {
        return;
      }

      setViewerInfo(toNoticeCommentViewerInfo(profile));
    }

    loadViewerInfo();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * 댓글 이미지 파일 선택을 처리한다.
   */
  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);

    if (selectedFiles.length === 0) {
      return;
    }

    const nextImages = selectedFiles.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      src: URL.createObjectURL(file),
      alt: file.name,
      file,
    }));

    setDraftImages((prev) => [...prev, ...nextImages]);
    event.target.value = "";
  }

  /**
   * 작성 중인 첨부 이미지를 제거한다.
   */
  function handleRemoveDraftImage(imageId: string) {
    setDraftImages((prev) => {
      const targetImage = prev.find((image) => image.id === imageId);

      if (targetImage) {
        URL.revokeObjectURL(targetImage.src);
      }

      return prev.filter((image) => image.id !== imageId);
    });
  }

  /**
   * 댓글 등록을 처리한다.
   */
  async function handleSubmitComment() {
    if (
      isSubmitting ||
      !onSubmitComment ||
      (draftContent.trim() === "" && draftImages.length === 0)
    ) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmitComment({
        content: draftContent.trim(),
        files: draftImages.map((image) => image.file),
      });

      clearDraftImages(draftImages);
      setDraftContent("");
      setDraftImages([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mt-10 space-y-8">
      <div className="space-y-10">
        {comments.map((comment) => (
          <article key={comment.id} className="flex gap-4">
            <Image
              src={
                comment.profileImageSrc ??
                DEFAULT_NOTICE_COMMENT_VIEWER_INFO.profileImageSrc
              }
              alt={comment.profileImageAlt ?? `${comment.authorName} 프로필 사진`}
              width={48}
              height={48}
              className="mt-1 h-12 w-12 shrink-0 rounded-full object-cover"
            />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <p className="text-[16px] font-semibold text-white-1">
                  {comment.authorName}
                </p>
                {comment.authorDescription ? (
                  <p className="text-[14px] text-gray-4">
                    {comment.authorDescription}
                  </p>
                ) : null}
              </div>

              <p className="mt-3 whitespace-pre-line text-[15px] leading-[1.7] text-white-1">
                {comment.content}
              </p>

              {comment.images.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-3">
                  {comment.images.map((image) => (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => setActivePreviewImage(image)}
                      className="relative h-[84px] w-[84px] cursor-pointer overflow-hidden rounded-[10px] bg-[#5A6070]"
                    >
                      <img
                        src={image.src}
                        alt={image.alt}
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/65 text-[16px] leading-none text-white-1">
                        +
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </article>
        ))}
      </div>
      {canWriteComment ? (
        <div className="rounded-[14px] bg-gray-6 px-9 py-8">
          <p className="text-[20px] font-bold text-white-1">{viewerInfo.name}</p>

          <textarea
            ref={draftTextareaRef}
            value={draftContent}
            onChange={handleDraftContentChange}
            placeholder="댓글 내용을 입력하세요."
            rows={1}
            className="mt-4 h-auto w-full resize-none bg-transparent text-[15px] leading-[1.27] text-white-1 placeholder:text-gray-5 focus:outline-none"
          />

          {draftImages.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-3">
              {draftImages.map((image) => (
                <div
                  key={image.id}
                  className="relative h-[88px] w-[88px] overflow-hidden rounded-[10px] bg-[#434958]"
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveDraftImage(image.id)}
                    className="absolute right-1 top-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-black/60 text-[12px] font-semibold text-white-1"
                    aria-label="첨부 이미지 삭제"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          <div className="flex items-end justify-between gap-4">
            <label
              htmlFor={fileInputId}
              className="inline-flex cursor-pointer items-center gap-2 text-[15px] text-gray-5"
            >
              <Image
                src="/icons/camera.svg"
                alt="사진 첨부 아이콘"
                width={16}
                height={16}
              />
              사진 첨부
            </label>
            <input
              id={fileInputId}
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={handleSubmitComment}
              disabled={
                isSubmitting ||
                !onSubmitComment ||
                (draftContent.trim() === "" && draftImages.length === 0)
              }
              className="rounded-[8px] bg-main-1 px-7 py-5 text-[18px] font-semibold text-white-1 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "등록 중..." : "등록하기"}
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-[12px] bg-[#5A6070] px-6 py-8 text-center text-[14px] text-gray-4">
          {blockedMessage}
        </div>
      )}

      {activePreviewImage ? (
        <NoticeCommentImageDialog
          image={activePreviewImage}
          onClose={() => setActivePreviewImage(null)}
        />
      ) : null}
    </section>
  );
}
