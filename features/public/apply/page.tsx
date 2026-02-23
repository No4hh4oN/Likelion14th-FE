"use client";

import { ChangeEvent, ReactNode, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { getAccessToken } from "@/lib/axios";
import {
  createApplicationDraft,
  getActiveRecruitment,
  getApplicationDetail,
  getApplications,
  getDocumentQuestions,
  submitApplication,
  updateApplicationDraft,
  updateSubmittedApplication,
  uploadApplicationFile,
} from "./api";
import type {
  ActiveRecruitmentResponse,
  ApplicationStatus,
  ApplyAnswerPayload,
  ApplyPartKey,
  ApplyPageStatus,
  DocumentQuestion,
  DocumentQuestionCategory,
} from "./types";

/** 지원 파트 식별자 타입 */
type PartKey = "front-end" | "back-end" | "ai-ml" | "pm-design";
type QuestionItem = Pick<DocumentQuestion, "questionId" | "content">;
type PartQuestionMap = Record<PartKey, QuestionItem[]>;
type PartAnswerMap = Record<PartKey, string[]>;

/** 파트 선택 버튼 라벨 매핑 */
const partLabels: Record<PartKey, string> = {
  "front-end": "FRONT-END",
  "back-end": "BACK-END",
  "ai-ml": "AI / ML",
  "pm-design": "PM / DESIGN",
};

/**
 * 백엔드 질문 카테고리를 프론트 파트 키로 변환합니다.
 */
const categoryToPartKey: Record<
  Exclude<DocumentQuestionCategory, "COMMON">,
  PartKey
> = {
  FRONTEND: "front-end",
  BACKEND: "back-end",
  AI_ML: "ai-ml",
  PM_DESIGN: "pm-design",
};

/**
 * 프론트 파트 키를 API 파트 값으로 변환합니다.
 */
const partKeyToApplyPart: Record<PartKey, ApplyPartKey> = {
  "front-end": "FRONTEND",
  "back-end": "BACKEND",
  "ai-ml": "AI_ML",
  "pm-design": "PM_DESIGN",
};

/**
 * API 파트 값을 프론트 파트 키로 변환합니다.
 */
const applyPartToPartKey: Record<ApplyPartKey, PartKey> = {
  FRONTEND: "front-end",
  BACKEND: "back-end",
  AI_ML: "ai-ml",
  PM_DESIGN: "pm-design",
};

/**
 * 파트별 질문 배열의 초기값입니다.
 */
const emptyPartQuestionMap: PartQuestionMap = {
  "front-end": [],
  "back-end": [],
  "ai-ml": [],
  "pm-design": [],
};

/**
 * 파트별 답변 배열의 초기값입니다.
 */
const emptyPartAnswerMap: PartAnswerMap = {
  "front-end": [],
  "back-end": [],
  "ai-ml": [],
  "pm-design": [],
};

/**
 * 타임존 오프셋/UTC 접미사가 있는 날짜 문자열 패턴입니다.
 */
const kstDateTimePattern = /(Z|[+-]\d{2}:\d{2})$/;

/**
 * KST 기준으로 날짜 문자열을 파싱합니다.
 * @param value 서버에서 받은 날짜 문자열
 * @returns 파싱된 타임스탬프(ms)
 */
const parseKstDateTime = (value: string) => {
  const normalized = kstDateTimePattern.test(value) ? value : `${value}+09:00`;
  return Date.parse(normalized);
};

/**
 * 서버 상태 문자열을 지원서 화면에서 사용하는 상태로 정규화합니다.
 * @param status 서버가 내려준 상태 문자열
 * @returns 화면에서 사용하는 상태(DRAFT/SUBMITTED) 또는 null
 */
const normalizeStatus = (
  status: ApplicationStatus | string,
): ApplicationStatus | null => {
  if (status === "DRAFT" || status === "SUBMITTED") {
    return status;
  }
  return null;
};

/**
 * 서버의 파트 문자열을 화면 파트 키로 변환합니다.
 * @param part 서버 파트 문자열
 * @returns 화면 파트 키 또는 null
 */
const toPartKey = (part: ApplyPartKey | string): PartKey | null => {
  if (part in applyPartToPartKey) {
    return applyPartToPartKey[part as ApplyPartKey];
  }
  return null;
};

/**
 * 질문 본문(content)에서 텍스트/코드 영역을 분리함.
 * 백엔드에서 "질문 텍스트\n\n코드" 형태로 내려주는 포맷을 처리함.
 */
const stripCodeFence = (snippet: string) => {
  const trimmed = snippet.trim();
  const fenced = trimmed.match(/^```(?:[\w+-]+)?\n([\s\S]*?)\n?```$/);

  if (fenced) {
    return fenced[1].trimEnd();
  }

  // 백엔드가 "질문\n\n`코드`" 형태로 보내는 단일 백틱 래핑 처리
  if (trimmed.startsWith("`") && trimmed.endsWith("`") && trimmed.length >= 2) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
};

/**
 * 질문 본문에서 질문 텍스트와 코드 블록을 분리합니다.
 * @param content 질문 원문
 * @returns 질문 텍스트와 코드 스니펫
 */
const splitQuestionContent = (content: string) => {
  const normalized = content
    .replace(/\\n/g, "\n")
    .replace(/\r\n/g, "\n")
    .trim();
  const separatorIndex = normalized.indexOf("\n\n");

  if (separatorIndex === -1) {
    return {
      questionText: normalized,
      codeSnippet: null as string | null,
    };
  }

  const questionText = normalized.slice(0, separatorIndex).trim();
  const rawCodeSnippet = normalized.slice(separatorIndex + 2).trim();
  const codeSnippet = stripCodeFence(rawCodeSnippet);

  return {
    questionText: questionText || normalized,
    codeSnippet: codeSnippet || null,
  };
};

/**
 * 코드 스니펫이 파이썬 코드인지 단순 판별합니다.
 * @param codeSnippet 코드 문자열
 * @returns 파이썬 코드 여부
 */
const isLikelyPythonCode = (codeSnippet: string) =>
  /\b(class|def|return|for|while|if|else|break|print|len|True)\b/.test(
    codeSnippet,
  );

/**
 * 파이썬 키워드 토큰 집합
 */
const pythonKeywords = new Set([
  "class",
  "def",
  "return",
  "for",
  "in",
  "while",
  "if",
  "else",
  "break",
]);

/**
 * 파이썬 내장 함수 토큰 집합
 */
const pythonBuiltins = new Set(["len", "print"]);

/**
 * 파이썬 코드 하이라이트 대상 토큰 정규식
 */
const pythonHighlightPattern =
  /(\bclass\b|\bdef\b|\breturn\b|\bfor\b|\bin\b|\bwhile\b|\bif\b|\belse\b|\bbreak\b|\bTrue\b|\blen\b|\bprint\b|'[^']*'|"[^"]*"|\d+)/g;

/**
 * 토큰 종류에 따라 코드 색상 클래스를 반환함.
 * @param token 하이라이트할 코드 토큰
 * @returns 토큰에 대응하는 Tailwind 색상 클래스
 */
const getPythonTokenClass = (token: string) => {
  if (pythonKeywords.has(token)) return "text-[#C792EA]";
  if (pythonBuiltins.has(token)) return "text-[#82AAFF]";
  if (token === "True") return "text-[#FFCB6B]";
  if (/^['"]/.test(token)) return "text-[#C3E88D]";
  if (/^\d+$/.test(token)) return "text-[#F78C6C]";
  return "text-[#DCE6FF]";
};

/**
 * 파이썬 코드 한 줄을 토큰 단위로 분해해 하이라이트 노드로 변환함.
 * @param line 렌더링할 코드 한 줄
 * @returns 하이라이트가 적용된 React 노드 배열
 */
const renderPythonLine = (line: string): ReactNode =>
  line.split(pythonHighlightPattern).map((part, index) => {
    if (!part) return null;

    const isHighlightedToken =
      pythonKeywords.has(part) ||
      pythonBuiltins.has(part) ||
      part === "True" ||
      /^['"]/.test(part) ||
      /^\d+$/.test(part);

    if (!isHighlightedToken) {
      return <span key={`${part}-${index}`}>{part}</span>;
    }

    return (
      <span key={`${part}-${index}`} className={getPythonTokenClass(part)}>
        {part}
      </span>
    );
  });

/**
 * 질문의 코드 영역 UI를 렌더링합니다.
 * @param codeSnippet 코드 문자열
 * @param keyPrefix React key prefix
 * @returns 코드 블록 노드
 */
const renderQuestionCodeBlock = (codeSnippet: string, keyPrefix: string) => {
  const isPython = isLikelyPythonCode(codeSnippet);

  return (
    <div className="overflow-hidden rounded-[12px] border border-[#2E3E66] bg-[#0E1424] shadow-[0_10px_30px_rgba(8,12,24,0.4)]">
      <div className="flex items-center justify-between border-b border-[#2E3E66] bg-[#151E32] px-3 py-2 lg:px-4">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#FF5F56]" />
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#FFBD2E]" />
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#27C93F]" />
          <span className="ml-1 text-[11px] font-medium text-[#AEB9D6] lg:text-[12px]">
            QuestionCode
          </span>
        </div>
        <span className="rounded-full border border-[#325CA8] bg-[#11274A] px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.08em] text-[#8BC1FF] lg:text-[11px]">
          {isPython ? "PYTHON" : "CODE"}
        </span>
      </div>
      <div className="overflow-x-auto p-3 lg:p-4">
        <pre className="min-w-[640px] text-[11px] leading-[1.65] text-[#DCE6FF] lg:text-[13px] lg:leading-[1.75]">
          {codeSnippet.split("\n").map((line, lineIndex) => (
            <div
              key={`${keyPrefix}-code-${lineIndex}`}
              className="grid grid-cols-[26px_1fr] gap-3"
            >
              <span className="select-none text-right text-[#62709A]">
                {lineIndex + 1}
              </span>
              <code>
                {line.length > 0
                  ? isPython
                    ? renderPythonLine(line)
                    : line
                  : " "}
              </code>
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
};

/**
 * 질문 개수에 맞는 빈 답변 배열을 생성함.
 * @param count 생성할 답변 칸 개수
 * @returns 빈 문자열 배열
 */
const createEmptyAnswers = (count: number) =>
  Array.from({ length: count }, () => "");

/**
 * 질문 카드 섹션 공통 스타일 클래스
 */
const sectionCardClass =
  "rounded-[10px] bg-gray-7 px-3 py-6 shadow-[0_8px_24px_rgba(0,0,0,0.16)] lg:px-7 lg:py-12";

/**
 * 지원서 작성 페이지 컴포넌트
 * @returns 지원서 작성 UI
 */
export default function ApplyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  /**
   * 공통 질문 답변 상태
   */
  const [commonAnswers, setCommonAnswers] = useState<string[]>([]);
  /**
   * 현재 선택된 지원 파트 상태
   */
  const [selectedPart, setSelectedPart] = useState<PartKey>("front-end");
  /**
   * 파트별 질문 답변 상태
   */
  const [partAnswers, setPartAnswers] =
    useState<PartAnswerMap>(emptyPartAnswerMap);
  /**
   * 포트폴리오 URL 입력 상태
   */
  const [portfolioUrl, setPortfolioUrl] = useState("");
  /**
   * 선택된 포트폴리오 파일명 상태
   */
  const [portfolioFileName, setPortfolioFileName] = useState("");
  /**
   * 업로드된 포트폴리오 파일 ID 목록입니다.
   */
  const [uploadedFileIds, setUploadedFileIds] = useState<number[]>([]);
  /**
   * 현재 편집 중인 지원서 ID입니다.
   */
  const [applicationId, setApplicationId] = useState<number | null>(null);
  /**
   * 현재 지원서 상태입니다.
   */
  const [applicationStatus, setApplicationStatus] =
    useState<ApplicationStatus | null>(null);
  /**
   * 현재 사용자의 지원서 수정 가능 여부입니다.
   */
  const [canEditApplication, setCanEditApplication] = useState(true);
  /**
   * 현재 사용자의 지원서 제출 가능 여부입니다.
   */
  const [canSubmitApplication, setCanSubmitApplication] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [actionErrorMessage, setActionErrorMessage] = useState("");
  const [activeRecruitment, setActiveRecruitment] =
    useState<ActiveRecruitmentResponse | null>(null);
  const [pageStatus, setPageStatus] = useState<ApplyPageStatus>("loading");
  const [loadErrorMessage, setLoadErrorMessage] = useState("");
  const [apiCommonQuestions, setApiCommonQuestions] = useState<QuestionItem[]>(
    [],
  );
  const [apiPartQuestionMap, setApiPartQuestionMap] =
    useState<PartQuestionMap>(emptyPartQuestionMap);
  const resolvedCommonQuestions = apiCommonQuestions;
  const selectedPartQuestions = useMemo(
    () => apiPartQuestionMap[selectedPart] ?? [],
    [apiPartQuestionMap, selectedPart],
  );
  /**
   * 저장/제출/파일 업로드 중 하나라도 진행 중인지 여부입니다.
   */
  const isBusy = isSaving || isSubmitting || isUploadingFile;
  /**
   * 현재 지원서가 제출 완료 상태인지 여부입니다.
   */
  const isSubmitted = applicationStatus === "SUBMITTED";

  useEffect(() => {
    let isMounted = true;

    /**
     * 모집 정보, 질문, 기존 지원서 데이터를 한 번에 로드합니다.
     */
    const loadActiveRecruitment = async () => {
      const accessToken = getAccessToken();
      if (!accessToken) {
        router.replace("/auth");
        return;
      }

      setPageStatus("loading");
      setLoadErrorMessage("");

      try {
        const recruitment = await getActiveRecruitment();
        if (!isMounted) {
          return;
        }

        if (!recruitment) {
          setActiveRecruitment(null);
          setPageStatus("empty");
          return;
        }

        setActiveRecruitment(recruitment);

        if (recruitment.phaseType !== "DOC_OPEN") {
          setPageStatus("closed");
          return;
        }

        const start = parseKstDateTime(recruitment.startAt);
        const end = parseKstDateTime(recruitment.endAt);
        const now = Date.now();

        if (Number.isFinite(start) && Number.isFinite(end)) {
          if (now < start || now > end) {
            setPageStatus("closed");
            return;
          }
        }

        const questionResponse = await getDocumentQuestions(
          recruitment.recruitmentId,
        );
        if (!isMounted) {
          return;
        }

        const sortedQuestions = [...questionResponse.questions].sort(
          (a, b) => a.order - b.order,
        );

        const commonQuestionItems: QuestionItem[] = sortedQuestions
          .filter((question) => question.category === "COMMON")
          .map((question) => ({
            questionId: question.questionId,
            content: question.content,
          }));

        const groupedPartQuestions: PartQuestionMap = {
          "front-end": [],
          "back-end": [],
          "ai-ml": [],
          "pm-design": [],
        };

        sortedQuestions
          .filter((question) => question.category !== "COMMON")
          .forEach((question) => {
            const uiPart =
              categoryToPartKey[
                question.category as Exclude<DocumentQuestionCategory, "COMMON">
              ];

            if (!uiPart) {
              return;
            }

            groupedPartQuestions[uiPart].push({
              questionId: question.questionId,
              content: question.content,
            });
          });

        const firstPartWithQuestions =
          (Object.keys(groupedPartQuestions) as PartKey[]).find(
            (part) => groupedPartQuestions[part].length > 0,
          ) ?? "front-end";

        let nextSelectedPart = firstPartWithQuestions;
        let nextApplicationId: number | null = null;
        let nextApplicationStatus: ApplicationStatus | null = null;
        let nextCanEditApplication = true;
        let nextCanSubmitApplication = true;
        let nextPortfolioUrl = "";
        let nextPortfolioFileName = "";
        let nextUploadedFileIds: number[] = [];
        let nextCommonAnswers = createEmptyAnswers(commonQuestionItems.length);
        let nextPartAnswers: PartAnswerMap = {
          "front-end": createEmptyAnswers(
            groupedPartQuestions["front-end"].length,
          ),
          "back-end": createEmptyAnswers(
            groupedPartQuestions["back-end"].length,
          ),
          "ai-ml": createEmptyAnswers(groupedPartQuestions["ai-ml"].length),
          "pm-design": createEmptyAnswers(
            groupedPartQuestions["pm-design"].length,
          ),
        };

        try {
          const applicationList = await getApplications();
          const existingApplication = applicationList.items.find(
            (item) => item.recruitmentId === recruitment.recruitmentId,
          );

          if (existingApplication) {
            nextApplicationId = existingApplication.applicationId;
            nextApplicationStatus = normalizeStatus(existingApplication.status);
            nextCanEditApplication =
              typeof existingApplication.canEdit === "boolean"
                ? existingApplication.canEdit
                : true;
            nextCanSubmitApplication =
              typeof existingApplication.canSubmit === "boolean"
                ? existingApplication.canSubmit
                : true;

            const detail = await getApplicationDetail(
              existingApplication.applicationId,
            );
            const detailPart = toPartKey(detail.applyPart);
            if (detailPart) {
              nextSelectedPart = detailPart;
            }

            nextPortfolioUrl = detail.portfolioUrl ?? "";
            nextUploadedFileIds = detail.files.map((file) => file.fileId);
            nextPortfolioFileName =
              detail.files[detail.files.length - 1]?.originalName ?? "";

            const answerByQuestionId = new Map(
              detail.answers.map((item) => [item.questionId, item.answer]),
            );

            nextCommonAnswers = commonQuestionItems.map(
              (item) => answerByQuestionId.get(item.questionId) ?? "",
            );

            nextPartAnswers = {
              "front-end": groupedPartQuestions["front-end"].map(
                (item) => answerByQuestionId.get(item.questionId) ?? "",
              ),
              "back-end": groupedPartQuestions["back-end"].map(
                (item) => answerByQuestionId.get(item.questionId) ?? "",
              ),
              "ai-ml": groupedPartQuestions["ai-ml"].map(
                (item) => answerByQuestionId.get(item.questionId) ?? "",
              ),
              "pm-design": groupedPartQuestions["pm-design"].map(
                (item) => answerByQuestionId.get(item.questionId) ?? "",
              ),
            };

            const detailStatus = normalizeStatus(detail.status);
            if (detailStatus) {
              nextApplicationStatus = detailStatus;
            }
          }
        } catch {
          // If existing application lookup fails, keep empty form state.
        }

        setSelectedPart(nextSelectedPart);
        setApiCommonQuestions(commonQuestionItems);
        setApiPartQuestionMap(groupedPartQuestions);
        setCommonAnswers(nextCommonAnswers);
        setPartAnswers(nextPartAnswers);
        setPortfolioUrl(nextPortfolioUrl);
        setPortfolioFileName(nextPortfolioFileName);
        setUploadedFileIds(nextUploadedFileIds);
        setApplicationId(nextApplicationId);
        setApplicationStatus(nextApplicationStatus);
        setCanEditApplication(nextCanEditApplication);
        setCanSubmitApplication(nextCanSubmitApplication);
        setActionMessage("");
        setActionErrorMessage("");

        const requestedApplicationIdRaw = searchParams.get("applicationId");
        const requestedApplicationId = Number(requestedApplicationIdRaw);
        const isEditRequestForSubmitted =
          !!requestedApplicationIdRaw &&
          Number.isFinite(requestedApplicationId) &&
          requestedApplicationId === nextApplicationId;

        if (
          nextApplicationStatus === "SUBMITTED" &&
          nextApplicationId &&
          !isEditRequestForSubmitted
        ) {
          router.replace(
            `/14/apply/complete?applicationId=${nextApplicationId}`,
          );
          return;
        }

        setPageStatus("ready");
      } catch {
        if (!isMounted) {
          return;
        }
        setPageStatus("error");
        setLoadErrorMessage(
          "모집 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
        );
      }
    };

    void loadActiveRecruitment();

    return () => {
      isMounted = false;
    };
  }, [router, searchParams]);

  /**
   * 공통 질문 답변 값을 갱신함.
   * @param index 질문 인덱스
   * @param value 변경된 입력값
   */
  const onChangeCommonAnswer = (index: number, value: string) => {
    setCommonAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  /**
   * 현재 선택된 파트 질문 답변 값을 갱신함.
   * @param index 질문 인덱스
   * @param value 변경된 입력값
   */
  const onChangePartAnswer = (index: number, value: string) => {
    setPartAnswers((prev) => ({
      ...prev,
      [selectedPart]: prev[selectedPart].map((answer, idx) =>
        idx === index ? value : answer,
      ),
    }));
  };

  /**
   * 현재 화면의 공통/파트 답변을 API 전송용 배열로 생성합니다.
   * @returns questionId 기반 답변 배열
   */
  const buildDraftAnswers = (): ApplyAnswerPayload[] => {
    const commonAnswerPayload = resolvedCommonQuestions.map(
      (question, index) => ({
        questionId: question.questionId,
        answer: commonAnswers[index] ?? "",
      }),
    );

    const partAnswerPayload = selectedPartQuestions.map((question, index) => ({
      questionId: question.questionId,
      answer: partAnswers[selectedPart]?.[index] ?? "",
    }));

    return [...commonAnswerPayload, ...partAnswerPayload];
  };

  /**
   * 임시저장/수정 API 요청 바디를 생성합니다.
   * @returns 저장 요청 바디
   */
  const buildDraftPayload = () => ({
    applyPart: partKeyToApplyPart[selectedPart],
    portfolioUrl: portfolioUrl.trim(),
    answers: buildDraftAnswers(),
    fileIds: uploadedFileIds,
  });

  /**
   * DRAFT 상태 지원서를 저장합니다.
   */
  const handleSaveDraft = async () => {
    if (isBusy || !canEditApplication || !activeRecruitment) {
      return;
    }

    setIsSaving(true);
    setActionMessage("");
    setActionErrorMessage("");

    try {
      const payload = buildDraftPayload();

      if (applicationId) {
        const updated = await updateApplicationDraft(applicationId, payload);
        const nextStatus = normalizeStatus(updated.status);
        setApplicationStatus(nextStatus ?? "DRAFT");
      } else {
        const created = await createApplicationDraft(
          activeRecruitment.recruitmentId,
          payload,
        );
        setApplicationId(created.applicationId);
        setApplicationStatus("DRAFT");
      }

      setActionMessage("임시 저장이 완료되었습니다.");
    } catch {
      setActionErrorMessage(
        "임시 저장에 실패했습니다. 잠시 후 다시 시도해주세요.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * SUBMITTED 상태 지원서를 수정합니다.
   */
  const handleUpdateSubmitted = async () => {
    if (
      isBusy ||
      !canEditApplication ||
      !applicationId ||
      !activeRecruitment ||
      !isSubmitted
    ) {
      return;
    }

    setIsSaving(true);
    setActionMessage("");
    setActionErrorMessage("");

    try {
      const payload = buildDraftPayload();
      const updated = await updateSubmittedApplication(applicationId, payload);
      const nextStatus = normalizeStatus(updated.status);
      setApplicationStatus(nextStatus ?? "SUBMITTED");
      setActionMessage("지원서 수정이 완료되었습니다.");
    } catch {
      setActionErrorMessage(
        "지원서 수정에 실패했습니다. 잠시 후 다시 시도해주세요.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * 지원서를 최종 제출합니다.
   */
  const handleSubmit = async () => {
    if (isBusy || !canSubmitApplication || !activeRecruitment) {
      return;
    }

    const hasEmptyCommonAnswer = commonAnswers.some(
      (answer) => answer.trim().length === 0,
    );
    const hasEmptyPartAnswer = (partAnswers[selectedPart] ?? []).some(
      (answer) => answer.trim().length === 0,
    );

    if (hasEmptyCommonAnswer || hasEmptyPartAnswer) {
      setActionMessage("");
      setActionErrorMessage("필수 질문 답변을 모두 작성한 뒤 제출해주세요.");
      return;
    }

    setIsSubmitting(true);
    setActionMessage("");
    setActionErrorMessage("");

    try {
      const payload = buildDraftPayload();
      let targetApplicationId = applicationId;

      if (targetApplicationId) {
        await updateApplicationDraft(targetApplicationId, payload);
      } else {
        const created = await createApplicationDraft(
          activeRecruitment.recruitmentId,
          payload,
        );
        targetApplicationId = created.applicationId;
        setApplicationId(created.applicationId);
      }

      if (!targetApplicationId) {
        throw new Error("MISSING_APPLICATION_ID");
      }

      const submitted = await submitApplication(targetApplicationId);
      const nextStatus = normalizeStatus(submitted.status);
      setApplicationStatus(nextStatus ?? "SUBMITTED");
      router.replace(`/14/apply/complete?applicationId=${targetApplicationId}`);
      return;
    } catch {
      setActionErrorMessage(
        "지원서 제출에 실패했습니다. 잠시 후 다시 시도해주세요.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 업로드 파일 선택 시 파일명을 상태에 반영함.
   * @param event 파일 입력 change 이벤트
   */
  const onSelectPortfolioFile = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = event.target.files?.[0];
    event.target.value = "";

    if (!selectedFile || !canEditApplication || isBusy || !activeRecruitment) {
      return;
    }

    setIsUploadingFile(true);
    setActionMessage("");
    setActionErrorMessage("");

    try {
      let targetApplicationId = applicationId;

      if (!targetApplicationId) {
        const created = await createApplicationDraft(
          activeRecruitment.recruitmentId,
          buildDraftPayload(),
        );
        targetApplicationId = created.applicationId;
        setApplicationId(created.applicationId);
        setApplicationStatus("DRAFT");
      }

      const uploaded = await uploadApplicationFile(
        targetApplicationId,
        selectedFile,
      );
      setUploadedFileIds((prev) =>
        prev.includes(uploaded.fileId) ? prev : [...prev, uploaded.fileId],
      );
      setPortfolioFileName(uploaded.originalName ?? selectedFile.name);
      setActionMessage("파일 업로드가 완료되었습니다.");
    } catch {
      setActionErrorMessage(
        "파일 업로드에 실패했습니다. 잠시 후 다시 시도해주세요.",
      );
    } finally {
      setIsUploadingFile(false);
    }
  };

  /**
   * 화면 표시용 날짜 문자열을 KST 기준으로 포맷합니다.
   * @param value 서버 날짜 문자열
   * @returns 사용자 표시용 날짜 문자열
   */
  const formatDateTime = (value: string) => {
    const parsed = parseKstDateTime(value);
    if (!Number.isFinite(parsed)) {
      return value;
    }
    return new Date(parsed).toLocaleString("ko-KR", {
      timeZone: "Asia/Seoul",
      hour12: false,
    });
  };

  if (pageStatus === "loading") {
    return (
      <section className="bg-background px-4 py-20 text-white lg:px-6">
        <div className="mx-auto max-w-290 rounded-[10px] bg-gray-7 px-6 py-12 text-center">
          모집 정보를 불러오는 중입니다.
        </div>
      </section>
    );
  }

  if (pageStatus === "empty") {
    return (
      <section className="bg-background px-4 py-20 text-white lg:px-6">
        <div className="mx-auto max-w-290 rounded-[10px] bg-gray-7 px-6 py-12 text-center">
          현재 진행중인 모집이 없습니다.
        </div>
      </section>
    );
  }

  if (pageStatus === "error") {
    return (
      <section className="bg-background px-4 py-20 text-white lg:px-6">
        <div className="mx-auto max-w-290 rounded-[10px] bg-gray-7 px-6 py-12 text-center">
          {loadErrorMessage}
        </div>
      </section>
    );
  }

  if (pageStatus === "closed") {
    return (
      <section className="bg-background px-4 py-20 text-white lg:px-6">
        <div className="mx-auto max-w-290 rounded-[10px] bg-gray-7 px-6 py-12 text-center">
          <p>현재는 지원 기간이 아닙니다.</p>
          {activeRecruitment && (
            <p className="mt-3 text-sm text-gray-4">
              모집 기간: {formatDateTime(activeRecruitment.startAt)} ~{" "}
              {formatDateTime(activeRecruitment.endAt)}
            </p>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-background px-4 py-29 text-white lg:px-6 lg:py-36">
      <div className="mx-auto w-full max-w-290">
        <div className="relative overflow-hidden rounded-[10px] px-5 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-10">
            <div className="order-1 text-center lg:order-2">
              <h2 className="text-[22px] font-bold leading-[1.22] text-white-1 lg:text-[52px]">
                멋쟁이사자처럼 삼육대학교
                <br />
                14기 아기사자 <span className="text-main-3">모집 지원서</span>
              </h2>
              <p className="mt-3 text-[12px] font-medium text-gray-4 lg:mt-7 lg:text-[24px]">
                모든 문항에 빠짐없이 답변해 주시기 바랍니다.
              </p>
            </div>

            <div className="order-2 mx-auto w-[170px] sm:w-[210px] lg:order-1 lg:mx-0 lg:w-[260px] lg:shrink-0">
              <Image
                src="/images/lions/lion-stand-half-gradient-black.webp"
                alt="lion-standing"
                width={260}
                height={260}
                priority
                className="h-auto w-full object-contain"
              />
            </div>
          </div>
        </div>

        <div className={`lg:mt-[65px] ${sectionCardClass}`}>
          <h2 className="text-center text-[18px] font-bold lg:text-[32px]">
            공통 질문
          </h2>
          <div className="mt-[37px] space-y-[16px] lg:mt-[65px] lg:space-y-[12px]">
            {resolvedCommonQuestions.map((question, index) => {
              const parsedQuestion = splitQuestionContent(question.content);

              return (
                <div
                  key={`common-${question.questionId}`}
                  className="space-y-[10px] lg:space-y-[22px]"
                >
                  <p className="whitespace-pre-line text-[16px] font-medium lg:text-[22px]">
                    Q. {parsedQuestion.questionText}
                  </p>
                  {parsedQuestion.codeSnippet &&
                    renderQuestionCodeBlock(
                      parsedQuestion.codeSnippet,
                      `common-${question.questionId}`,
                    )}
                  <div>
                    <textarea
                      value={commonAnswers[index] ?? ""}
                      onChange={(event) =>
                        onChangeCommonAnswer(index, event.target.value)
                      }
                      disabled={!canEditApplication}
                      maxLength={500}
                      rows={5}
                      placeholder="답변을 자유롭게 작성해 주세요. (최대 500자)"
                      className="w-full resize-none rounded-[10px] bg-gray-6 border border-gray-6 font-medium px-2.75 py-2.5 lg:px-6 lg:py-5 text-[14px] lg:text-[18px] placeholder:text-gray-5 focus:border-main-1 focus:outline-none"
                    />
                    <p className="text-right text-[10px] text-gray-4 lg:text-[12px]">
                      {(commonAnswers[index] ?? "").length}/500
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-[74px] lg:mt-[120px] space-y-[43px] lg:space-y-[83px]">
          <div className="space-y-[23px] text-center lg:space-y-[61px]">
            <h2 className="text-[22px] lg:text-[36px] font-bold">지원 파트</h2>
            <div className="mx-auto flex max-w-[260px] lg:max-w-290 flex-wrap items-center justify-center gap-[20px] lg:gap-[40px]">
              {(Object.keys(partLabels) as PartKey[]).map((part) => {
                const selected = part === selectedPart;
                return (
                  <button
                    key={part}
                    type="button"
                    onClick={() => setSelectedPart(part)}
                    disabled={!canEditApplication}
                    className={`rounded-full px-[17px] py-[8px] lg:px-[57px] lg:py-[14px] text-[14px] font-bold lg:min-w-[130px] lg:text-[28px] ${
                      selected
                        ? "bg-main-1 text-white-1"
                        : "bg-white-1 text-gray-4 hover:bg-gray-2"
                    } cursor-pointer disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    {partLabels[part]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={sectionCardClass}>
            <h3 className="text-center text-[18px] font-bold lg:text-[32px]">
              파트별 질문
            </h3>
            <div className="mt-[37px] space-y-3 lg:mt-[65px] lg:space-y-5">
              {selectedPartQuestions.map((question, index) => {
                const parsedQuestion = splitQuestionContent(question.content);

                return (
                  <div
                    key={`${selectedPart}-${question.questionId}`}
                    className="space-y-[10px] lg:space-y-[22px]"
                  >
                    <p className="whitespace-pre-line text-[16px] font-medium lg:text-[22px]">
                      Q. {parsedQuestion.questionText}
                    </p>
                    {parsedQuestion.codeSnippet &&
                      renderQuestionCodeBlock(
                        parsedQuestion.codeSnippet,
                        `${selectedPart}-${question.questionId}`,
                      )}
                    <div>
                      <textarea
                        value={partAnswers[selectedPart]?.[index] ?? ""}
                        onChange={(event) =>
                          onChangePartAnswer(index, event.target.value)
                        }
                        disabled={!canEditApplication}
                        maxLength={500}
                        rows={5}
                        placeholder="답변을 자유롭게 작성해 주세요. (최대 500자)"
                        className="w-full resize-none rounded-[10px] border border-gray-6 bg-gray-6 px-3 py-2.5 lg:px-[25px] lg:py-[21px] text-[14px] lg:text-[18px] text-white placeholder:text-gray-5 focus:border-main-1 focus:outline-none"
                      />
                      <p className="text-right text-[10px] text-gray-4 lg:text-[12px]">
                        {(partAnswers[selectedPart]?.[index] ?? "").length}/500
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className={`mt-[92px] lg:mt-[139px] ${sectionCardClass}`}>
          <h2 className="text-center text-[18px] font-bold lg:text-[32px]">
            포트폴리오 제출
          </h2>
          <div className="mt-5 space-y-5 lg:mt-7 lg:space-y-6">
            <div className="space-y-2.5">
              <p className="text-[16px] font-medium text-white-1 lg:text-[22px]">
                포트폴리오 링크
              </p>
              <input
                type="url"
                value={portfolioUrl}
                onChange={(event) => setPortfolioUrl(event.target.value)}
                disabled={!canEditApplication}
                placeholder="https:// 형태의 URL을 입력해 주세요."
                className="w-full rounded-[10px] border border-[#62697A] bg-[#4C5262] px-3.5 py-3 text-[12px] text-white placeholder:text-[#B8BECA] focus:border-[#0B7DE2] focus:outline-none lg:px-4 lg:py-3.5 lg:text-[14px]"
              />
            </div>

            <div className="space-y-2.5">
              <p className="text-[16px] font-medium text-white-1 lg:text-[22px]">
                파일 업로드
              </p>
              <label className="flex w-full cursor-pointer items-center justify-between rounded-[10px] border border-[#7E8698] bg-[#7E8698] px-3.5 py-3 text-[12px] text-[#D9DEEA] lg:px-4 lg:py-2 lg:text-[14px]">
                <span className="truncate">
                  {portfolioFileName || "포트폴리오 파일을 선택해 주세요."}
                </span>
                <span className="ml-3 rounded-[5px] bg-white-1 border border-main-1 px-6 py-2 text-[11px] font-medium text-main-1 lg:text-[16px]">
                  파일 찾기
                </span>
                <input
                  type="file"
                  className="hidden"
                  onChange={onSelectPortfolioFile}
                  disabled={!canEditApplication || isBusy}
                />
              </label>
            </div>

            <div className="space-y-2.5">
              <p className="text-left pl-[14px] text-[12px] lg:text-[14px] leading-[1.46] font-regular font-sans">
                *포트폴리오 제출은 필수가 아니며, 자유롭게 제출해 주셔도 됩니다.
                (최대 3개) <br />
                *제출 형식은 PDF 파일 또는 링크 형식만 받습니다. (1개 당 최대
                50MB) <br />
                *제출해 주신 포트폴리오는 모집 종료 후 안전하게 폐기됩니다.{" "}
                <br />
                *팀 프로젝트의 경우, 본인의 기여도를 포트폴리오 내에 반드시
                명시해 주시기 바랍니다.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-[72px] lg:mt-[156px] flex flex-col items-center justify-center gap-[26px] lg:gap-[32px]">
          {isSubmitted ? (
            <button
              type="button"
              onClick={handleUpdateSubmitted}
              disabled={isBusy || !canEditApplication || !applicationId}
              className="px-[78px] py-[15px] lg:px-[112px] lg:py-[15px] text-[20px] lg:text-[36px] font-bold cursor-pointer rounded-full bg-main-3 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "수정 중..." : "수정하기"}
            </button>
          ) : (
            <div className="flex flex-col items-center justify-center gap-[26px] lg:gap-[32px]">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isBusy || !canEditApplication}
                className="px-[36px] py-[14px] lg:px-[73px] lg:py-[19px] text-[16px] lg:text-[24px] font-semibold cursor-pointer rounded-full bg-gray-5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "저장 중..." : "지원서 저장하기"}
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isBusy || !canSubmitApplication}
                className="px-[78px] py-[15px] lg:px-[112px] lg:py-[15px] text-[20px] lg:text-[36px] font-bold cursor-pointer rounded-full bg-main-1 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "제출 중..." : "제출하기"}
              </button>
            </div>
          )}
          {actionMessage && (
            <p className="text-[12px] text-main-3 lg:text-[16px]">
              {actionMessage}
            </p>
          )}
          {actionErrorMessage && (
            <p className="text-[12px] text-[#ff9ea8] lg:text-[16px]">
              {actionErrorMessage}
            </p>
          )}
          <p className="mt-[10px] leading-[1.27] text-center text-[12px] lg:text-[20px] font-regular text-gray-5">
            *제출 전, 수정 사항이 없는지 다시 한 번 확인해 주시기 바랍니다.
            <br />
            *지원 기간 내에는 지원 페이지를 통해 내용 수정이 가능합니다.
            <br />
            *지원서 제출 완료 후, 확인 메일이 전송될 예정입니다
          </p>
        </div>
      </div>
    </section>
  );
}
