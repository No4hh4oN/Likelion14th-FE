"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getMyProfile } from "@/features/public/mypage/api";
import type { MyPageUserApiResponse } from "@/features/public/mypage/types";
import { buildCommonSpaceHref, buildCommonSpaceQnaDetailHref } from "../config";
import {
  extractCommonSpaceQnaTextContent,
  normalizeCommonSpaceQnaHtml,
} from "../qna/html";
import { commonSpaceQnaApiDataSource } from "../qna/source";
import type {
  CommonSpaceQnaQuestionMutationRequest,
  CommonSpaceQnaQuestionPartId,
} from "../qna/types";
import type { CommonSpacePartId } from "../types";

type QnaWriteSectionProps = {
  partId: CommonSpacePartId;
};

type QnaWriteViewerInfo = {
  /** 현재 사용자 이름 */
  name: string;
  /** 현재 사용자 부가 정보 */
  description: string;
  /** 현재 사용자 프로필 이미지 경로 */
  profileImageSrc: string;
  /** 현재 사용자 프로필 이미지 대체 텍스트 */
  profileImageAlt: string;
};

type QnaDraftFileItem = {
  /** 임시 파일 식별자 */
  id: string;
  /** 원본 파일 */
  file: File;
};

type QnaWriteToolbarButtonProps = {
  /** 버튼에 표시할 텍스트 또는 요소 */
  label: string;
  /** 버튼 title 속성에 사용할 텍스트 */
  title?: string;
  /** 버튼 내부에 렌더링할 요소 */
  children?: ReactNode;
  /** 추가 클래스 */
  className?: string;
  /** 버튼 클릭 시 실행할 핸들러 */
  onPress?: () => void;
};

type QnaWriteColorButtonProps = {
  /** 현재 선택된 글자 색상 */
  color: string;
  /** 색상 입력 필드 식별자 */
  inputId: string;
  /** 색상 입력 DOM 참조 */
  inputRef: React.RefObject<HTMLInputElement | null>;
  /** 버튼 클릭 시 실행할 핸들러 */
  onPress: () => void;
  /** 색상 변경 시 실행할 핸들러 */
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

/**
 * 질문 작성 섹션이 현재 사용할 데이터 소스다.
 */
const commonSpaceQnaDataSource = commonSpaceQnaApiDataSource;

/**
 * 질문 트랙 선택 옵션 목록이다.
 */
const QNA_TRACK_OPTIONS: Array<{
  value: CommonSpaceQnaQuestionPartId;
  label: string;
}> = [
  { value: "front-end", label: "FRONT-END" },
  { value: "back-end", label: "BACK-END" },
  { value: "ai-ml", label: "AI / ML" },
  { value: "pm-design", label: "PM / DESIGN" },
  { value: "etc", label: "기타" },
];

/**
 * 프로필 조회 실패 시 사용할 기본 사용자 정보다.
 */
const DEFAULT_QNA_WRITE_VIEWER_INFO: QnaWriteViewerInfo = {
  name: "질문 작성자",
  description: "멋쟁이사자처럼 삼육대학교",
  profileImageSrc: "/images/defaultProf.webp",
  profileImageAlt: "질문 작성자 프로필 사진",
};

/**
 * 제목 입력 placeholder다.
 */
const QNA_WRITE_TITLE_PLACEHOLDER = "제목을 입력하세요.";

/**
 * 본문 입력 placeholder다.
 */
const QNA_WRITE_CONTENT_PLACEHOLDER = "내용을 입력하세요.";

/**
 * 프로필 API 응답을 작성 화면용 사용자 정보로 변환한다.
 */
function toQnaWriteViewerInfo(
  profile: MyPageUserApiResponse | null,
): QnaWriteViewerInfo {
  if (!profile) {
    return DEFAULT_QNA_WRITE_VIEWER_INFO;
  }

  const name = profile.homepage.name || DEFAULT_QNA_WRITE_VIEWER_INFO.name;
  const description = profile.homepage.studentNo
    ? `${profile.homepage.department} ${profile.homepage.studentNo}`
    : profile.homepage.department || DEFAULT_QNA_WRITE_VIEWER_INFO.description;
  const profileImageSrc =
    profile.homepage.profileImage?.url ||
    DEFAULT_QNA_WRITE_VIEWER_INFO.profileImageSrc;

  return {
    name,
    description,
    profileImageSrc,
    profileImageAlt: `${name} 프로필 사진`,
  };
}

/**
 * 작성 툴바에서 재사용할 기본 아이콘 버튼을 렌더링한다.
 */
function QnaWriteToolbarButton({
  label,
  title,
  children,
  className,
  onPress,
}: QnaWriteToolbarButtonProps) {
  return (
    <button
      type="button"
      onMouseDown={(event) => {
        event.preventDefault();
        onPress?.();
      }}
      className={`text-[20px] font-medium text-gray-4 transition-colors hover:text-white-1 ${className ?? ""}`}
      aria-label={label}
      title={title ?? label}
    >
      {children ?? label}
    </button>
  );
}

/**
 * 글자 색상 선택 버튼을 렌더링한다.
 */
function QnaWriteColorButton({
  color,
  inputId,
  inputRef,
  onPress,
  onChange,
}: QnaWriteColorButtonProps) {
  return (
    <>
      <button
        type="button"
        onMouseDown={(event) => {
          event.preventDefault();
          onPress();
        }}
        className="relative h-8 w-4 text-[20px] -ml-0.5 font-medium text-gray-4 transition-colors hover:text-white-1"
        aria-label="글자 색상 변경"
        title="글자 색상 변경"
      >
        <span>T</span>
        <span
          className="absolute bottom-2 left-3 h-2 w-2 rounded-full"
          style={{ backgroundColor: color }}
          aria-hidden="true"
        />
      </button>

      <input
        ref={inputRef}
        id={inputId}
        type="color"
        value={color}
        onChange={onChange}
        className="sr-only mt-8"
        tabIndex={-1}
      />
    </>
  );
}

/**
 * 문단 정렬 아이콘을 렌더링한다.
 */
function QnaWriteAlignIcon({
  variant,
}: {
  variant: "left" | "center" | "right" | "justify";
}) {
  const pathByVariant = {
    left: ["M1 2H17", "M1 7H13", "M1 12H15", "M1 17H10"],
    center: ["M1 2H17", "M3 7H15", "M2 12H16", "M4 17H14"],
    right: ["M1 2H17", "M5 7H17", "M3 12H17", "M8 17H17"],
    justify: ["M1 2H17", "M1 7H17", "M1 12H17", "M1 17H17"],
  } as const;

  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-[18px] w-[18px]"
      aria-hidden="true"
    >
      {pathByVariant[variant].map((pathValue) => (
        <path
          key={pathValue}
          d={pathValue}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

/**
 * 질문 작성 레이아웃을 렌더링한다.
 */
export default function QnaWriteSection({ partId }: QnaWriteSectionProps) {
  const router = useRouter();
  const imageInputId = useId();
  const fileInputId = useId();
  const colorInputId = useId();
  const editorRef = useRef<HTMLDivElement | null>(null);
  const colorInputRef = useRef<HTMLInputElement | null>(null);
  const editorSelectionRef = useRef<Range | null>(null);
  const questionPartDropdownRef = useRef<HTMLDivElement | null>(null);
  /**
   * 현재 사용자 정보다.
   */
  const [viewerInfo, setViewerInfo] = useState<QnaWriteViewerInfo>(
    DEFAULT_QNA_WRITE_VIEWER_INFO,
  );

  /**
   * 선택한 질문 트랙이다.
   */
  const [questionPartId, setQuestionPartId] = useState<
    CommonSpaceQnaQuestionPartId | ""
  >("");

  /**
   * 질문 트랙 드롭다운 열림 여부다.
   */
  const [isQuestionPartDropdownOpen, setIsQuestionPartDropdownOpen] =
    useState(false);

  /**
   * 비밀글 여부다.
   */
  const [isSecret, setIsSecret] = useState(false);

  /**
   * 질문 제목이다.
   */
  const [title, setTitle] = useState("");

  /**
   * 질문 본문이다.
   */
  const [contentHtml, setContentHtml] = useState("");

  /**
   * 선택한 첨부파일 목록이다.
   */
  const [draftFiles, setDraftFiles] = useState<QnaDraftFileItem[]>([]);

  /**
   * 등록 처리 중 여부다.
   */
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * 현재 선택된 글자 색상이다.
   */
  const [selectedTextColor, setSelectedTextColor] = useState("#FF3E3E");

  useEffect(() => {
    let isMounted = true;

    async function loadViewerInfo() {
      const profile = await getMyProfile().catch(() => null);

      if (!isMounted) {
        return;
      }

      setViewerInfo(toQnaWriteViewerInfo(profile));
    }

    loadViewerInfo();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    function handleCloseQuestionPartDropdown(event: MouseEvent) {
      if (
        questionPartDropdownRef.current &&
        !questionPartDropdownRef.current.contains(event.target as Node)
      ) {
        setIsQuestionPartDropdownOpen(false);
      }
    }

    function handleEscapeQuestionPartDropdown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsQuestionPartDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleCloseQuestionPartDropdown);
    document.addEventListener("keydown", handleEscapeQuestionPartDropdown);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleCloseQuestionPartDropdown,
      );
      document.removeEventListener("keydown", handleEscapeQuestionPartDropdown);
    };
  }, []);

  useEffect(() => {
    if (!editorRef.current) {
      return;
    }

    if (editorRef.current.innerHTML === contentHtml) {
      return;
    }

    editorRef.current.innerHTML = contentHtml;
  }, [contentHtml]);

  /**
   * 현재 작성 중인 HTML 본문에서 추출한 텍스트 값이다.
   */
  const contentText = useMemo(
    () => extractCommonSpaceQnaTextContent(contentHtml),
    [contentHtml],
  );

  /**
   * 본문 입력 영역이 비어 있는지 여부다.
   */
  const isContentEmpty = contentText.trim() === "";

  /**
   * 현재 폼이 등록 가능한 상태인지 여부다.
   */
  const canSubmit = useMemo(
    () =>
      questionPartId !== "" &&
      title.trim() !== "" &&
      !isContentEmpty &&
      !isSubmitting,
    [isContentEmpty, isSubmitting, questionPartId, title],
  );

  /**
   * 선택한 파일 개수 문구다.
   */
  const fileSummaryLabel =
    draftFiles.length > 0 ? `첨부파일 ${draftFiles.length}개` : "첨부파일 없음";

  /**
   * 현재 선택된 질문 트랙 옵션이다.
   */
  const selectedQuestionPartOption =
    QNA_TRACK_OPTIONS.find((option) => option.value === questionPartId) ?? null;

  /**
   * 파일 선택을 처리한다.
   */
  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);

    if (selectedFiles.length === 0) {
      return;
    }

    const nextFiles = selectedFiles.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file,
    }));

    setDraftFiles((prev) => [...prev, ...nextFiles]);
    event.target.value = "";
  }

  /**
   * 선택한 첨부파일을 제거한다.
   */
  function handleRemoveDraftFile(fileId: string) {
    setDraftFiles((prev) => prev.filter((item) => item.id !== fileId));
  }

  /**
   * 질문 트랙 드롭다운을 열거나 닫는다.
   */
  function toggleQuestionPartDropdown() {
    setIsQuestionPartDropdownOpen((prev) => !prev);
  }

  /**
   * 질문 트랙 옵션을 선택한다.
   */
  function handleSelectQuestionPart(
    nextQuestionPartId: CommonSpaceQnaQuestionPartId,
  ) {
    setQuestionPartId(nextQuestionPartId);
    setIsQuestionPartDropdownOpen(false);
  }

  /**
   * contentEditable 영역의 현재 HTML 값을 상태에 동기화한다.
   */
  function syncEditorHtml() {
    if (!editorRef.current) {
      return;
    }

    setContentHtml(editorRef.current.innerHTML);
  }

  /**
   * 현재 에디터 선택 영역을 저장한다.
   */
  function rememberEditorSelection() {
    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0 || !editorRef.current) {
      return;
    }

    const activeRange = selection.getRangeAt(0);

    if (!editorRef.current.contains(activeRange.commonAncestorContainer)) {
      return;
    }

    editorSelectionRef.current = activeRange.cloneRange();
  }

  /**
   * 마지막으로 저장한 에디터 선택 영역을 복원한다.
   */
  function restoreEditorSelection() {
    const selection = window.getSelection();
    const savedRange = editorSelectionRef.current;

    if (!selection || !savedRange) {
      return;
    }

    selection.removeAllRanges();
    selection.addRange(savedRange);
  }

  /**
   * 툴바 버튼에서 사용할 편집 명령을 실행한다.
   */
  function runEditorCommand(command: string, value?: string) {
    if (!editorRef.current) {
      return;
    }

    editorRef.current.focus();
    restoreEditorSelection();

    if (command === "foreColor") {
      document.execCommand("styleWithCSS", false, "true");
    }

    document.execCommand(command, false, value);
    rememberEditorSelection();
    syncEditorHtml();
  }

  /**
   * 본문 편집 영역 입력을 상태에 반영한다.
   */
  function handleEditorInput(event: React.FormEvent<HTMLDivElement>) {
    setContentHtml(event.currentTarget.innerHTML);
  }

  /**
   * 글자 색상 선택 UI를 연다.
   */
  function openTextColorPicker() {
    rememberEditorSelection();
    colorInputRef.current?.click();
  }

  /**
   * 선택한 글자 색상을 에디터에 적용한다.
   */
  function handleTextColorChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextColor = event.target.value;

    setSelectedTextColor(nextColor);
    runEditorCommand("foreColor", nextColor);
  }

  /**
   * 질문 등록을 처리한다.
   */
  async function handleSubmitQuestion() {
    if (!canSubmit || questionPartId === "") {
      return;
    }

    const normalizedContentHtml = normalizeCommonSpaceQnaHtml(contentHtml);

    if (normalizedContentHtml === "") {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        content: normalizedContentHtml,
        isSecret,
        questionPartId,
        files: draftFiles.map((item) => item.file),
        authorName: viewerInfo.name,
        authorDescription: viewerInfo.description,
        profileImageSrc: viewerInfo.profileImageSrc,
        profileImageAlt: viewerInfo.profileImageAlt,
      } satisfies CommonSpaceQnaQuestionMutationRequest;
      const result = await commonSpaceQnaDataSource.createQuestion(payload);

      router.push(buildCommonSpaceQnaDetailHref(partId, result.qnaId));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="pb-16">
      <div className="flex items-center justify-between">
        <Link
          href={buildCommonSpaceHref(partId, "qna")}
          className="rounded-[14px] bg-[#3A3E49] px-8 py-4 text-[16px] font-semibold text-white-1"
        >
          목록으로
        </Link>

        <div className="flex items-center gap-8">
          <label className="inline-flex cursor-pointer items-center gap-2 text-[16px] text-gray-3">
            <input
              type="checkbox"
              checked={isSecret}
              onChange={(event) => setIsSecret(event.target.checked)}
              className="h-4 w-4 accent-main-1"
            />
            비밀글 등록
          </label>

          <button
            type="button"
            onClick={handleSubmitQuestion}
            disabled={!canSubmit}
            className="rounded-[12px] bg-[#0071C8] px-10 py-6 text-[16px] font-semibold text-white-1 transition-colors enabled:cursor-pointer enabled:hover:bg-main-1 disabled:cursor-auto disabled:opacity-60"
          >
            {isSubmitting ? "등록 중..." : "등록 하기"}
          </button>
        </div>
      </div>

      <div className="mt-11 rounded-[20px] bg-[#363841] px-12 py-12">
        <div className="flex flex-wrap items-center justify-between gap-6 pb-7">
          <div ref={questionPartDropdownRef} className="relative w-[270px]">
            <button
              type="button"
              onClick={toggleQuestionPartDropdown}
              className="flex h-[54px] w-full items-center justify-between border-b border-gray-4 text-left cursor-pointer"
              aria-haspopup="listbox"
              aria-expanded={isQuestionPartDropdownOpen}
              aria-label="질문 트랙 선택"
            >
              <span
                className={`text-[20px] ${
                  selectedQuestionPartOption ? "text-white-1" : "text-gray-4"
                }`}
              >
                {selectedQuestionPartOption?.label ?? "트랙을 선택하세요."}
              </span>
              <svg
                width="18"
                height="12"
                viewBox="0 0 18 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`shrink-0 text-white-1 transition-transform ${
                  isQuestionPartDropdownOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              >
                <path
                  d="M1 1.5L9 10.5L17 1.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {isQuestionPartDropdownOpen ? (
              <div className="absolute left-0 top-[calc(100%+12px)] z-30 w-full overflow-hidden rounded-[16px] border border-[#5B6170] bg-[#2F323A] shadow-[0_18px_36px_rgba(0,0,0,0.32)]">
                <ul role="listbox" aria-label="질문 트랙 목록" className="p-2">
                  {QNA_TRACK_OPTIONS.map((option) => {
                    const isSelected = option.value === questionPartId;

                    return (
                      <li key={option.value}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => handleSelectQuestionPart(option.value)}
                          className={`flex w-full items-center justify-between rounded-[12px] px-4 py-3 text-left text-[18px] transition-colors ${
                            isSelected
                              ? "bg-[#434958] text-white-1"
                              : "text-gray-3 hover:bg-[#3A3E49] hover:text-white-1"
                          }`}
                        >
                          <span>{option.label}</span>
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${
                              isSelected ? "bg-main-1" : "bg-transparent"
                            }`}
                            aria-hidden="true"
                          />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-gray-4">
            <label htmlFor={imageInputId} className="cursor-pointer">
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white-1"
                aria-hidden="true"
              >
                <path
                  d="M15 3H3C1.89543 3 1 3.89543 1 5V13C1 14.1046 1.89543 15 3 15H15C16.1046 15 17 14.1046 17 13V5C17 3.89543 16.1046 3 15 3Z"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
                <path
                  d="M6 8.5C6.82843 8.5 7.5 7.82843 7.5 7C7.5 6.17157 6.82843 5.5 6 5.5C5.17157 5.5 4.5 6.17157 4.5 7C4.5 7.82843 5.17157 8.5 6 8.5Z"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
                <path
                  d="M17 12L12.5 8L4 15"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
              </svg>
            </label>
            <input
              id={imageInputId}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />

            <label htmlFor={fileInputId} className="cursor-pointer">
              <svg
                width="16"
                height="18"
                viewBox="0 0 16 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white-1"
                aria-hidden="true"
              >
                <path
                  d="M10.3485 0H3.14224C2.30921 0.00110754 1.51061 0.332235 0.921566 0.920772C0.332521 1.50931 0.0011085 2.30722 0 3.13953V14.8605C0.0011085 15.6928 0.332521 16.4907 0.921566 17.0792C1.51061 17.6678 2.30921 17.9989 3.14224 18H13.1974C14.0305 17.9989 14.8291 17.6678 15.4181 17.0792C16.0071 16.4907 16.3386 15.6928 16.3397 14.8605V6.56121C16.339 5.82707 16.0814 5.11628 15.6115 4.55191L12.7583 1.13023C12.4643 0.776684 12.0959 0.492145 11.6795 0.296813C11.263 0.101481 10.8085 0.00014577 10.3485 0Z"
                  fill="currentColor"
                />
              </svg>
            </label>
            <input
              id={fileInputId}
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />

            <span className="text-[18px] text-gray-4">|</span>
            <QnaWriteToolbarButton
              label="B"
              title="굵게"
              onPress={() => runEditorCommand("bold")}
            />
            <QnaWriteToolbarButton
              label="U"
              title="밑줄"
              className="underline decoration-[1.5px] underline-offset-[3px]"
              onPress={() => runEditorCommand("underline")}
            />
            <QnaWriteToolbarButton
              label="T"
              title="취소선"
              className="line-through decoration-[1.5px]"
              onPress={() => runEditorCommand("strikeThrough")}
            />
            <QnaWriteColorButton
              color={selectedTextColor}
              inputId={colorInputId}
              inputRef={colorInputRef}
              onPress={openTextColorPicker}
              onChange={handleTextColorChange}
            />
            <span className="text-[18px] text-gray-4">|</span>
            <QnaWriteToolbarButton
              label="왼쪽 정렬"
              onPress={() => runEditorCommand("justifyLeft")}
            >
              <QnaWriteAlignIcon variant="left" />
            </QnaWriteToolbarButton>
            <QnaWriteToolbarButton
              label="가운데 정렬"
              onPress={() => runEditorCommand("justifyCenter")}
            >
              <QnaWriteAlignIcon variant="center" />
            </QnaWriteToolbarButton>
            <QnaWriteToolbarButton
              label="오른쪽 정렬"
              onPress={() => runEditorCommand("justifyRight")}
            >
              <QnaWriteAlignIcon variant="right" />
            </QnaWriteToolbarButton>
            <QnaWriteToolbarButton
              label="양쪽 정렬"
              onPress={() => runEditorCommand("justifyFull")}
            >
              <QnaWriteAlignIcon variant="justify" />
            </QnaWriteToolbarButton>
          </div>
        </div>

        {draftFiles.length > 0 ? (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-[14px] text-gray-4">{fileSummaryLabel}</span>
            {draftFiles.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleRemoveDraftFile(item.id)}
                className="inline-flex items-center gap-2 rounded-full bg-[#4D5363] px-4 py-2 text-[14px] text-white-1"
              >
                <span className="max-w-[240px] truncate">{item.file.name}</span>
                <span aria-hidden="true">×</span>
              </button>
            ))}
          </div>
        ) : null}

        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder={QNA_WRITE_TITLE_PLACEHOLDER}
          className="mt-8 h-20 w-full rounded-[10px] bg-gray-6 px-8 text-[28px] font-semibold text-white-1 placeholder:text-gray-5 focus:outline-none"
        />

        <div className="my-12 h-px w-full bg-gray-4" />

        <div
          className="relative mt-10 min-h-[520px] cursor-text"
          onClick={() => editorRef.current?.focus()}
        >
          {isContentEmpty ? (
            <span className="pointer-events-none absolute left-0 top-0 text-[20px] leading-[1.7] text-gray-5">
              {QNA_WRITE_CONTENT_PLACEHOLDER}
            </span>
          ) : null}

          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleEditorInput}
            onKeyUp={rememberEditorSelection}
            onMouseUp={rememberEditorSelection}
            onBlur={rememberEditorSelection}
            className="min-h-[520px] bg-transparent text-[20px] leading-[1.7] text-white-1 focus:outline-none [&_ol]:list-decimal [&_ol]:pl-8 [&_p]:min-h-[1.7em] [&_ul]:list-disc [&_ul]:pl-8"
          />
        </div>
      </div>
    </section>
  );
}
