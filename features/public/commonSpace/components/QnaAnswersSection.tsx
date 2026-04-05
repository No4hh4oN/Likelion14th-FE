"use client";
/* eslint-disable @next/next/no-img-element */

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { getRenderableCommonSpaceQnaHtml } from "../qna/html";
import DetailAttachmentList from "./DetailAttachmentList";
import type {
  CommonSpaceQnaAnswerImage,
  CommonSpaceQnaAnswerItem,
  CommonSpaceQnaAnswerMutationRequest,
} from "../qna/types";

type QnaAnswersSectionProps = {
  /** 현재 상세 화면의 질문 식별자 */
  qnaId: number;
  /** 화면에 렌더링할 답변 목록 */
  answers: CommonSpaceQnaAnswerItem[];
  /** 현재 사용자가 답변을 작성할 수 있는지 여부 */
  canWriteAnswer?: boolean;
  /** 답변 등록 시 실행할 비동기 핸들러 */
  onSubmitAnswer?: (
    payload: CommonSpaceQnaAnswerMutationRequest,
  ) => Promise<void> | void;
  /** 작성 폼 상단에 표시할 작성자명 */
  writerName?: string;
  /** 작성 폼 상단에 표시할 작성자 부가 정보 */
  writerDescription?: string;
  /** 작성 폼 상단에 표시할 프로필 이미지 경로 */
  writerProfileImageSrc?: string;
  /** 작성 폼 상단에 표시할 프로필 이미지 대체 텍스트 */
  writerProfileImageAlt?: string;
  /** 답변 작성 권한이 없을 때 표시할 문구 */
  blockedMessage?: string;
};

type QnaDraftImageItem = {
  /** 임시 이미지 식별자 */
  id: string;
  /** 업로드할 원본 파일 */
  file: File;
  /** 미리보기 URL */
  src: string;
  /** 이미지 대체 텍스트 */
  alt: string;
};

/**
 * 답변 입력창이 자동으로 늘어날 최대 높이다.
 */
const QNA_ANSWER_TEXTAREA_MAX_HEIGHT = 220;

/**
 * 답변 이미지 확대 모달을 렌더링한다.
 */
function QnaAnswerImageDialog({
  image,
  onClose,
}: {
  image: CommonSpaceQnaAnswerImage;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-6 py-10"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="답변 첨부 이미지 확대 보기"
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
 * 질의응답 상세 하단의 답변 목록과 답변 작성 영역을 렌더링한다.
 */
export default function QnaAnswersSection({
  qnaId,
  answers,
  canWriteAnswer = false,
  onSubmitAnswer,
  writerName = "운영진",
  writerDescription = "멋쟁이사자처럼 삼육대학교",
  writerProfileImageSrc = "/images/defaultProf.webp",
  writerProfileImageAlt = "운영진 프로필 사진",
  blockedMessage = "아기사자는 답변을 작성할 수 없습니다.",
}: QnaAnswersSectionProps) {
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const draftTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  /**
   * 작성 중인 답변 본문이다.
   */
  const [draftContent, setDraftContent] = useState("");

  /**
   * 작성 중인 답변에 첨부한 이미지 목록이다.
   */
  const [draftImages, setDraftImages] = useState<QnaDraftImageItem[]>([]);

  /**
   * 답변 제출 처리 중 여부다.
   */
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * 모달에 띄운 답변 이미지다.
   */
  const [activePreviewImage, setActivePreviewImage] =
    useState<CommonSpaceQnaAnswerImage | null>(null);

  /**
   * 답변 입력창 높이를 현재 입력 길이에 맞춰 조정한다.
   */
  function resizeDraftTextarea() {
    if (!draftTextareaRef.current) {
      return;
    }

    draftTextareaRef.current.style.height = "auto";

    const nextHeight = Math.min(
      draftTextareaRef.current.scrollHeight,
      QNA_ANSWER_TEXTAREA_MAX_HEIGHT,
    );

    draftTextareaRef.current.style.height = `${nextHeight}px`;
    draftTextareaRef.current.style.overflowY =
      draftTextareaRef.current.scrollHeight > QNA_ANSWER_TEXTAREA_MAX_HEIGHT
        ? "auto"
        : "hidden";
  }

  /**
   * 답변 본문 입력값 변경을 처리한다.
   */
  function handleDraftContentChange(
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) {
    setDraftContent(event.target.value);
  }

  useEffect(() => {
    resizeDraftTextarea();
  }, [draftContent]);

  /**
   * 답변 이미지 파일 선택을 처리한다.
   */
  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);

    if (selectedFiles.length === 0) {
      return;
    }

    const nextImages = selectedFiles.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file,
      src: URL.createObjectURL(file),
      alt: file.name,
    }));

    setDraftImages((prev) => [...prev, ...nextImages]);
    event.target.value = "";
  }

  /**
   * 작성 중인 첨부 이미지를 제거한다.
   */
  function handleRemoveDraftImage(imageId: string) {
    setDraftImages((prev) => prev.filter((image) => image.id !== imageId));
  }

  /**
   * 답변 등록을 처리한다.
   */
  async function handleSubmitAnswer() {
    if ((draftContent.trim() === "" && draftImages.length === 0) || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmitAnswer?.({
        content: draftContent.trim(),
        files: draftImages.map((image) => image.file),
        authorName: writerName,
        authorDescription: writerDescription,
        profileImageSrc: writerProfileImageSrc,
        profileImageAlt: writerProfileImageAlt,
      });

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
    <section key={qnaId} className="space-y-10">
      <div className="space-y-10">
        {answers.map((answer) => (
          <article key={answer.id} className="flex gap-4">
            <Image
              src={answer.profileImageSrc ?? "/images/defaultProf.webp"}
              alt={answer.profileImageAlt ?? `${answer.authorName} 프로필 사진`}
              width={48}
              height={48}
              className="mt-1 h-12 w-12 shrink-0 rounded-full object-cover"
            />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <p className="text-[16px] font-semibold text-white-1">
                  {answer.authorName}
                </p>
                {answer.authorDescription ? (
                  <p className="text-[14px] text-gray-4">
                    {answer.authorDescription}
                  </p>
                ) : null}
              </div>

              <div
                className="mt-3 text-[15px] leading-[1.7] text-white-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_p+p]:mt-3 [&_ul]:list-disc [&_ul]:pl-6"
                dangerouslySetInnerHTML={{
                  __html: getRenderableCommonSpaceQnaHtml(answer.content),
                }}
              />

              {answer.images.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-3">
                  {answer.images.map((image) => (
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

              {answer.attachments.length > 0 ? (
                <DetailAttachmentList
                  attachments={answer.attachments}
                  className="mt-4"
                />
              ) : null}
            </div>
          </article>
        ))}
      </div>

      {canWriteAnswer ? (
        <div className="rounded-[14px] bg-gray-6 px-9 py-8">
          <div className="flex items-center gap-4">
            <Image
              src={writerProfileImageSrc}
              alt={writerProfileImageAlt}
              width={48}
              height={48}
              className="h-12 w-12 shrink-0 rounded-full object-cover"
            />
            <div className="min-w-0">
              <p className="text-[20px] font-bold text-white-1">{writerName}</p>
              <p className="text-[14px] text-gray-4">{writerDescription}</p>
            </div>
          </div>

          <textarea
            ref={draftTextareaRef}
            value={draftContent}
            onChange={handleDraftContentChange}
            placeholder="답변 내용을 입력하세요."
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
              onClick={handleSubmitAnswer}
              disabled={isSubmitting}
              className="rounded-[8px] bg-main-1 px-7 py-5 text-[18px] font-semibold text-white-1 disabled:cursor-auto disabled:opacity-60"
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
        <QnaAnswerImageDialog
          image={activePreviewImage}
          onClose={() => setActivePreviewImage(null)}
        />
      ) : null}
    </section>
  );
}
