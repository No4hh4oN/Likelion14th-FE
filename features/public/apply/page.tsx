"use client";

import { ChangeEvent, ReactNode, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { getActiveRecruitment, getDocumentQuestions } from "./api";
import type {
  ActiveRecruitmentResponse,
  ApplyPageStatus,
  DocumentQuestionCategory,
} from "./types";

/** 지원 파트 식별자 타입 */
type PartKey = "front-end" | "back-end" | "ai-ml" | "pm-design";

/** 파트 선택 버튼 라벨 매핑 */
const partLabels: Record<PartKey, string> = {
  "front-end": "FRONT-END",
  "back-end": "BACK-END",
  "ai-ml": "AI / ML",
  "pm-design": "PM / DESIGN",
};

const categoryToPartKey: Record<
  Exclude<DocumentQuestionCategory, "COMMON">,
  PartKey
> = {
  FRONTEND: "front-end",
  BACKEND: "back-end",
  AI_ML: "ai-ml",
  PM_DESIGN: "pm-design",
};

const emptyPartQuestions: Record<PartKey, string[]> = {
  "front-end": [],
  "back-end": [],
  "ai-ml": [],
  "pm-design": [],
};

/**
 * AI/ML 3번 문항에 표시할 파이썬 코드 원문
 */
const aiMlQuestionCode = `class TokenWindowDataset:
    def __init__(self, token_ids, max_len, stride, start = 0):
        self.token_ids = token_ids
        self.max_len = max_len
        self.stride = stride
        self.start = start

    def __getitem__(self, idx):
        base = self.start + idx * self.stride
        x = self.token_ids[base: base + self.max_len]
        y = self.token_ids[base + 1: 1 + base + self.max_len]
        return (x, y)

    def __len__(self):
        i = 0
        while(True):
            if(self.start + i * self.stride + self.max_len + 1 > len(self.token_ids)):
                break
            else:
                i += 1
        return i


t = TokenWindowDataset(token_ids = [0,1,2,3,4,5,6], max_len=3, stride=2)

for i in range(len(t)):
    print(t[i], end=" ")`;

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
    useState<Record<PartKey, string[]>>(emptyPartQuestions);
  /**
   * 포트폴리오 URL 입력 상태
   */
  const [portfolioUrl, setPortfolioUrl] = useState("");
  /**
   * 선택된 포트폴리오 파일명 상태
   */
  const [portfolioFileName, setPortfolioFileName] = useState("");
  const [activeRecruitment, setActiveRecruitment] =
    useState<ActiveRecruitmentResponse | null>(null);
  const [pageStatus, setPageStatus] = useState<ApplyPageStatus>("loading");
  const [loadErrorMessage, setLoadErrorMessage] = useState("");
  const [apiCommonQuestions, setApiCommonQuestions] = useState<string[]>([]);
  const [apiPartQuestionMap, setApiPartQuestionMap] =
    useState<Record<PartKey, string[]>>(emptyPartQuestions);
  const resolvedCommonQuestions = apiCommonQuestions;
  const selectedPartQuestions = useMemo(
    () => apiPartQuestionMap[selectedPart] ?? [],
    [apiPartQuestionMap, selectedPart],
  );

  useEffect(() => {
    let isMounted = true;

    const loadActiveRecruitment = async () => {
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

        const start = Date.parse(recruitment.startAt);
        const end = Date.parse(recruitment.endAt);
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

        const commonQuestionContents = sortedQuestions
          .filter((question) => question.category === "COMMON")
          .map((question) => question.content);

        const groupedPartQuestions: Record<PartKey, string[]> = {
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

            groupedPartQuestions[uiPart].push(question.content);
          });

        const firstPartWithQuestions =
          (Object.keys(groupedPartQuestions) as PartKey[]).find(
            (part) => groupedPartQuestions[part].length > 0,
          ) ?? "front-end";

        const normalizedCommonQuestions = commonQuestionContents;

        setSelectedPart(firstPartWithQuestions);
        setApiCommonQuestions(normalizedCommonQuestions);
        setApiPartQuestionMap(groupedPartQuestions);
        setCommonAnswers(createEmptyAnswers(normalizedCommonQuestions.length));
        setPartAnswers({
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
        });

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
  }, []);

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
   * 업로드 파일 선택 시 파일명을 상태에 반영함.
   * @param event 파일 입력 change 이벤트
   */
  const onSelectPortfolioFile = (event: ChangeEvent<HTMLInputElement>) => {
    setPortfolioFileName(event.target.files?.[0]?.name ?? "");
  };

  const formatDateTime = (value: string) => {
    const parsed = Date.parse(value);
    if (!Number.isFinite(parsed)) {
      return value;
    }
    return new Date(parsed).toLocaleString("ko-KR", { hour12: false });
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
    <section className="bg-background px-4 py-9 text-white lg:px-6 lg:py-16">
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
                src="/images/lion-stand-half-gradient-black.png"
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
            {resolvedCommonQuestions.map((question, index) => (
              <div key={question} className="space-y-[10px] lg:space-y-[22px]">
                <p className="text-[16px] font-medium lg:text-[22px]">
                  Q. {question}
                </p>
                <div>
                  <textarea
                    value={commonAnswers[index]}
                    onChange={(event) =>
                      onChangeCommonAnswer(index, event.target.value)
                    }
                    maxLength={500}
                    rows={5}
                    placeholder="답변을 자유롭게 작성해 주세요. (최대 500자)"
                    className="w-full resize-none rounded-[10px] bg-gray-6 border border-gray-6 font-medium px-2.75 py-2.5 lg:px-6 lg:py-5 text-[14px] lg:text-[18px] placeholder:text-gray-5 focus:border-main-1 focus:outline-none"
                  />
                  <p className="text-right text-[10px] text-gray-4 lg:text-[12px]">
                    {commonAnswers[index].length}/500
                  </p>
                </div>
              </div>
            ))}
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
                    className={`rounded-full px-[17px] py-[8px] lg:px-[57px] lg:py-[14px] text-[14px] font-bold lg:min-w-[130px] lg:text-[28px] ${
                      selected
                        ? "bg-main-1 text-white-1"
                        : "bg-white-1 text-gray-4 hover:bg-gray-2"
                    } cursor-pointer`}
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
              {selectedPartQuestions.map((question, index) => (
                <div
                  key={`${selectedPart}-${index}`}
                  className="space-y-[10px] lg:space-y-[22px]"
                >
                  <p className="text-[16px] font-medium lg:text-[22px]">
                    Q. {question}
                  </p>
                  {selectedPart === "ai-ml" && index === 2 && (
                    <div className="overflow-hidden rounded-[12px] border border-[#2E3E66] bg-[#0E1424] shadow-[0_10px_30px_rgba(8,12,24,0.4)]">
                      <div className="flex items-center justify-between border-b border-[#2E3E66] bg-[#151E32] px-3 py-2 lg:px-4">
                        <div className="flex items-center gap-2">
                          <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#FF5F56]" />
                          <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#FFBD2E]" />
                          <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#27C93F]" />
                          <span className="ml-1 text-[11px] font-medium text-[#AEB9D6] lg:text-[12px]">
                            TokenWindowDataset.py
                          </span>
                        </div>
                        <span className="rounded-full border border-[#325CA8] bg-[#11274A] px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.08em] text-[#8BC1FF] lg:text-[11px]">
                          PYTHON
                        </span>
                      </div>
                      <div className="overflow-x-auto p-3 lg:p-4">
                        <pre className="min-w-[640px] text-[11px] leading-[1.65] text-[#DCE6FF] lg:text-[13px] lg:leading-[1.75]">
                          {aiMlQuestionCode
                            .split("\n")
                            .map((line, lineIndex) => (
                              <div
                                key={`ai-ml-code-${lineIndex}`}
                                className="grid grid-cols-[26px_1fr] gap-3"
                              >
                                <span className="select-none text-right text-[#62709A]">
                                  {lineIndex + 1}
                                </span>
                                <code>
                                  {line.length > 0
                                    ? renderPythonLine(line)
                                    : " "}
                                </code>
                              </div>
                            ))}
                        </pre>
                      </div>
                    </div>
                  )}
                  <div>
                    <textarea
                      value={partAnswers[selectedPart][index]}
                      onChange={(event) =>
                        onChangePartAnswer(index, event.target.value)
                      }
                      maxLength={500}
                      rows={5}
                      placeholder="답변을 자유롭게 작성해 주세요. (최대 500자)"
                      className="w-full resize-none rounded-[10px] border border-gray-6 bg-gray-6 px-3 py-2.5 lg:px-[25px] lg:py-[21px] text-[14px] lg:text-[18px] text-white placeholder:text-gray-5 focus:border-main-1 focus:outline-none"
                    />
                    <p className="text-right text-[10px] text-gray-4 lg:text-[12px]">
                      {partAnswers[selectedPart][index].length}/500
                    </p>
                  </div>
                </div>
              ))}
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
          <button className="px-[36px] py-[14px] lg:px-[73px] lg:py-[19px] text-[16px] lg:text-[24px] font-semibold cursor-pointer rounded-full bg-gray-5">
            지원서 작성하기
          </button>
          <button className="px-[78px] py-[15px] lg:px-[112px] lg:py-[15px] text-[20px] lg:text-[36px] font-bold cursor-pointer rounded-full bg-main-1">
            제출하기
          </button>
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
