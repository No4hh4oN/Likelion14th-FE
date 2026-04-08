"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * 업로드 가능 용량 안내 문구다.
 */
const ASSIGNMENT_SUBMIT_MAX_SIZE_MESSAGE = "최대 100MB까지 업로드 가능합니다.";

/**
 * 제출 팝업 파일 선택 전 placeholder 문구다.
 */
const ASSIGNMENT_SUBMIT_FILE_PLACEHOLDER = "파일을 선택해 주세요.";

/**
 * AssignmentSubmitDialog 컴포넌트가 받을 props다.
 */
type AssignmentSubmitDialogProps = {
  /** 팝업 노출 여부 */
  isOpen: boolean;
  /** 팝업을 닫을 때 실행할 핸들러 */
  onClose: () => void;
  /** 제출 버튼 클릭 시 실행할 핸들러 */
  onSubmit?: (file: File) => Promise<void> | void;
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
 * 과제 제출용 파일 선택 팝업을 렌더링한다.
 */
export default function AssignmentSubmitDialog({
  isOpen,
  onClose,
  onSubmit,
  submitButtonLabel = "제출",
}: AssignmentSubmitDialogProps) {
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /**
   * 현재 사용자가 선택한 제출 파일이다.
   */
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  /**
   * 팝업을 닫고 내부 선택 상태를 초기화한다.
   */
  function handleClose(forceClose = false) {
    if (isSubmitting && !forceClose) {
      return;
    }

    setSelectedFile(null);
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
   * 사용자가 선택한 제출 파일을 상태에 반영한다.
   */
  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSelectedFile(event.target.files?.[0] ?? null);
    setSubmitErrorMessage("");
  }

  /**
   * 제출 버튼 클릭 시 현재 선택한 파일을 상위로 전달한다.
   */
  async function handleSubmit() {
    if (!selectedFile) {
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitErrorMessage("");
      await onSubmit?.(selectedFile);
      handleClose(true);
    } catch {
      setSubmitErrorMessage("파일 제출에 실패했습니다. 다시 시도해 주세요.");
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
      aria-label="과제 제출 파일 업로드"
    >
      <div
        className="w-full max-w-[380px] overflow-hidden rounded-[14px] bg-white-1 shadow-[0_18px_60px_rgba(0,0,0,0.28)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#E7E8EC] px-7 py-5">
          <h3 className="text-[18px] font-bold text-background">파일</h3>
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

        <div className="px-7 py-8">
          <input
            id={fileInputId}
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1 rounded-[10px] bg-[#F3F5F9] px-5 py-3 text-[14px] text-[#6C7384]">
              <p className="truncate">
                {selectedFile?.name ?? ASSIGNMENT_SUBMIT_FILE_PLACEHOLDER}
              </p>
            </div>

            <button
              type="button"
              onClick={handleFileSearchClick}
              disabled={isSubmitting}
              className="shrink-0 rounded-[5px] bg-background px-5 py-3 text-[14px] font-medium text-white-1 cursor-pointer hover:bg-gray-5"
            >
              파일 찾기
            </button>
          </div>

          <p className="mt-4 text-[14px] font-semibold text-red-1">
            {ASSIGNMENT_SUBMIT_MAX_SIZE_MESSAGE}
          </p>
          {submitErrorMessage ? (
            <p className="mt-3 text-[13px] font-medium text-red-1">
              {submitErrorMessage}
            </p>
          ) : null}
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
              disabled={!selectedFile || isSubmitting}
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
