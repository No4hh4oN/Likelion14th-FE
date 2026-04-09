"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { AssignmentSubmittedFile } from "../types";
import type { CommonSpaceAssignmentSubmissionRequest } from "../assignments/types";
import { normalizeCommonSpaceAssetUrl } from "../url";

/**
 * 업로드 가능 용량 안내 문구다.
 */
const ASSIGNMENT_SUBMIT_MAX_SIZE_MESSAGE = "최대 100MB까지 업로드 가능합니다.";

/**
 * AssignmentSubmitDialog 컴포넌트가 받을 props다.
 */
type AssignmentSubmitDialogProps = {
  /** 팝업 노출 여부 */
  isOpen: boolean;
  /** 팝업을 닫을 때 실행할 핸들러 */
  onClose: () => void;
  /** 제출 버튼 클릭 시 실행할 핸들러 */
  onSubmit?: (
    payload: CommonSpaceAssignmentSubmissionRequest,
  ) => Promise<void> | void;
  /** 기존 제출 본문 */
  initialContent?: string | null;
  /** 기존 제출 파일 목록 */
  initialFiles?: AssignmentSubmittedFile[];
  /** 제출 버튼 라벨 */
  submitButtonLabel?: string;
};

/**
 * 과제 제출 팝업의 닫기 아이콘이다.
 */
function AssignmentSubmitDialogCloseIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="h-6 w-6"
    >
      <path
        d="M6 6L18 18"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * 기존 서버 파일을 다시 업로드 가능한 File 객체로 변환한다.
 * 수정 제출 API가 전체 파일 집합을 다시 받는 경우를 대비해 유지할 파일을 재구성한다.
 */
async function resolveAssignmentSubmittedFileAsUploadFile(
  file: AssignmentSubmittedFile,
) {
  if (!file.url) {
    throw new Error("기존 첨부파일 URL이 없습니다.");
  }

  const resolvedFileUrl = normalizeCommonSpaceAssetUrl(file.url) ?? file.url;
  const response = await fetch(resolvedFileUrl);

  if (!response.ok) {
    throw new Error("기존 첨부파일을 다시 불러오지 못했습니다.");
  }

  const blob = await response.blob();

  return new File([blob], file.name, {
    type: file.contentType || blob.type || undefined,
    lastModified: Date.now(),
  });
}

/**
 * 사용자가 새로 선택한 파일의 동일 여부를 비교한다.
 */
function isSameSelectedFile(leftFile: File, rightFile: File) {
  return (
    leftFile.name === rightFile.name &&
    leftFile.size === rightFile.size &&
    leftFile.lastModified === rightFile.lastModified
  );
}

/**
 * 제출 파일 목록에 사용할 안정적인 key를 만든다.
 */
function getAssignmentSubmittedFileKey(
  file: AssignmentSubmittedFile,
  index: number,
) {
  return `${file.id ?? file.url ?? file.name}-${index}`;
}

/**
 * 과제 제출용 파일 선택 팝업을 렌더링한다.
 */
export default function AssignmentSubmitDialog({
  isOpen,
  onClose,
  onSubmit,
  initialContent = "",
  initialFiles = [],
  submitButtonLabel = "제출",
}: AssignmentSubmitDialogProps) {
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const normalizedInitialContent = initialContent ?? "";

  /**
   * 현재 편집 중인 제출 본문이다.
   */
  const [draftContent, setDraftContent] = useState(normalizedInitialContent);

  /**
   * 수정 제출 시 유지할 기존 첨부파일 목록이다.
   */
  const [existingFiles, setExistingFiles] = useState<AssignmentSubmittedFile[]>(
    initialFiles,
  );

  /**
   * 사용자가 이번에 새로 추가한 첨부파일 목록이다.
   */
  const [newFiles, setNewFiles] = useState<File[]>([]);

  /**
   * 제출 요청 진행 중인지 여부다.
   */
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * 제출 실패 시 사용자에게 보여줄 오류 메시지다.
   */
  const [submitErrorMessage, setSubmitErrorMessage] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setDraftContent(normalizedInitialContent);
    setExistingFiles(initialFiles);
    setNewFiles([]);
    setSubmitErrorMessage("");
  }, [initialFiles, isOpen, normalizedInitialContent]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  /**
   * 팝업을 닫고 내부 상태를 초기화한다.
   */
  function handleClose(forceClose = false) {
    if (isSubmitting && !forceClose) {
      return;
    }

    setDraftContent(normalizedInitialContent);
    setExistingFiles(initialFiles);
    setNewFiles([]);
    setSubmitErrorMessage("");
    onClose();
  }

  /**
   * 파일 찾기 버튼 클릭 시 숨겨진 input을 연다.
   */
  function handleFileSearchClick() {
    fileInputRef.current?.click();
  }

  /**
   * 사용자가 선택한 새 파일 목록을 상태에 누적한다.
   */
  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextSelectedFiles = Array.from(event.target.files ?? []);

    setNewFiles((previousFiles) => {
      const deduplicatedNewFiles = nextSelectedFiles.filter(
        (nextFile) =>
          !previousFiles.some((previousFile) =>
            isSameSelectedFile(previousFile, nextFile),
          ),
      );

      return [...previousFiles, ...deduplicatedNewFiles];
    });

    setSubmitErrorMessage("");
    event.target.value = "";
  }

  /**
   * 기존 서버 파일을 수정 제출 대상에서 제거한다.
   */
  function handleRemoveExistingFile(targetFile: AssignmentSubmittedFile) {
    setExistingFiles((previousFiles) =>
      previousFiles.filter((file) => file !== targetFile),
    );
  }

  /**
   * 새로 선택한 파일을 제출 대상에서 제거한다.
   */
  function handleRemoveNewFile(targetFile: File) {
    setNewFiles((previousFiles) =>
      previousFiles.filter((file) => !isSameSelectedFile(file, targetFile)),
    );
  }

  /**
   * 제출 버튼 활성화 여부를 계산한다.
   */
  const hasSubmissionInput =
    draftContent.trim().length > 0 ||
    existingFiles.length > 0 ||
    newFiles.length > 0;

  /**
   * 제출 버튼 클릭 시 현재 작성 중인 본문과 파일을 상위로 전달한다.
   */
  async function handleSubmit() {
    if (!hasSubmissionInput) {
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitErrorMessage("");

      const resolvedExistingFiles =
        existingFiles.length > 0
          ? await Promise.all(
              existingFiles.map(resolveAssignmentSubmittedFileAsUploadFile),
            )
          : [];

      await onSubmit?.({
        request: {
          content: draftContent,
        },
        files: [...resolvedExistingFiles, ...newFiles],
      });

      handleClose(true);
    } catch {
      setSubmitErrorMessage("과제 제출에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-[6px]"
      onClick={(event) => {
        event.stopPropagation();
        handleClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="과제 제출 팝업"
    >
      <div
        className="w-full max-w-[540px] overflow-hidden rounded-[14px] bg-white-1 shadow-[0_18px_60px_rgba(0,0,0,0.28)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#E7E8EC] px-7 py-5">
          <h3 className="text-[18px] font-bold text-background">과제 제출</h3>
          <button
            type="button"
            onClick={() => handleClose()}
            disabled={isSubmitting}
            className="cursor-pointer text-background disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="과제 제출 팝업 닫기"
          >
            <AssignmentSubmitDialogCloseIcon />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-7 py-8">
          <div>
            <label
              htmlFor={`${fileInputId}-content`}
              className="text-[14px] font-semibold text-background"
            >
              제출 내용
            </label>
            <textarea
              id={`${fileInputId}-content`}
              value={draftContent}
              onChange={(event) => setDraftContent(event.target.value)}
              rows={5}
              placeholder="과제 제출 내용을 입력해 주세요."
              className="mt-3 w-full resize-none rounded-[10px] border border-[#E1E5EE] bg-[#F3F5F9] px-4 py-3 text-[14px] text-background outline-none placeholder:text-[#98A0B2] focus:border-main-1"
            />
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[14px] font-semibold text-background">
                제출 파일
              </p>
              <button
                type="button"
                onClick={handleFileSearchClick}
                disabled={isSubmitting}
                className="shrink-0 rounded-[5px] bg-background px-5 py-3 text-[14px] font-medium text-white-1 cursor-pointer hover:bg-gray-5"
              >
                파일 찾기
              </button>
            </div>

            <input
              id={fileInputId}
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />

            {existingFiles.length > 0 || newFiles.length > 0 ? (
              <ul className="mt-4 space-y-2">
                {existingFiles.map((file, index) => (
                  <li
                    key={getAssignmentSubmittedFileKey(file, index)}
                    className="flex items-center justify-between gap-3 rounded-[10px] bg-[#F3F5F9] px-4 py-3 text-[14px] text-[#4E5668]"
                  >
                    <span className="truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingFile(file)}
                      disabled={isSubmitting}
                      className="shrink-0 text-[13px] font-semibold text-red-1 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      삭제
                    </button>
                  </li>
                ))}
                {newFiles.map((file) => (
                  <li
                    key={`${file.name}-${file.lastModified}-${file.size}`}
                    className="flex items-center justify-between gap-3 rounded-[10px] bg-[#F3F5F9] px-4 py-3 text-[14px] text-[#4E5668]"
                  >
                    <span className="truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveNewFile(file)}
                      disabled={isSubmitting}
                      className="shrink-0 text-[13px] font-semibold text-red-1 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      삭제
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-4 rounded-[10px] bg-[#F3F5F9] px-5 py-3 text-[14px] text-[#98A0B2]">
                첨부된 파일이 없습니다.
              </div>
            )}

            <p className="mt-4 text-[14px] font-semibold text-red-1">
              {ASSIGNMENT_SUBMIT_MAX_SIZE_MESSAGE}
            </p>
            {submitErrorMessage ? (
              <p className="mt-3 text-[13px] font-medium text-red-1">
                {submitErrorMessage}
              </p>
            ) : null}
          </div>
        </div>

        <div className="border-t border-[#E7E8EC] px-7 py-6">
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => handleClose()}
              disabled={isSubmitting}
              className="min-w-[110px] rounded-full bg-gray-2 px-8 py-4 text-[16px] font-bold text-gray-5 hover:bg-gray-5 hover:text-white-1 cursor-pointer"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!hasSubmissionInput || isSubmitting}
              className="min-w-[110px] rounded-full bg-main-1 px-8 py-4 text-[16px] font-bold text-white-1 disabled:cursor-not-allowed disabled:bg-[#AFC8F7]"
            >
              {isSubmitting ? "제출 중" : submitButtonLabel}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
