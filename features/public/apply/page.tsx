"use client";

import { ChangeEvent, useMemo, useState } from "react";

type PartKey = "front-end" | "back-end" | "ai-ml" | "pm-design";

const commonQuestions = [
  "멋쟁이사자처럼에 지원하게 된 동기를 작성해 주세요.",
  "멋쟁이사자처럼 활동 중에서 이루고 싶은 목표를 작성해 주세요.",
  "협업 또는 참여 경험이 가장 중요하다고 생각하는 역량에 대해 작성해 주세요.",
];

const partLabels: Record<PartKey, string> = {
  "front-end": "FRONT-END",
  "back-end": "BACK-END",
  "ai-ml": "AI / ML",
  "pm-design": "PM / DESIGN",
};

const partQuestions: Record<PartKey, string[]> = {
  "front-end": [
    "본인이 프론트엔드에 매력을 느낀 이유와, 관련해 공부하거나 시도해 본 경험을 작성해 주세요.",
    "기획/디자인 결과물을 실제 화면으로 구현할 때 중요하다고 생각하는 기준 2가지를 작성해 주세요.",
    "본인이 생각하는 UX/UI 디테일 중 사용자 만족에 가장 크게 기여하는 부분을 작성해 주세요.",
  ],
  "back-end": [
    "백엔드 파트에 지원하게 된 계기와, 서버/데이터 처리에 흥미를 느낀 이유를 작성해 주세요.",
    "API 설계 또는 데이터 모델링에서 중요하다고 생각하는 원칙 2가지를 작성해 주세요.",
    "안정적인 서비스 운영을 위해 필요한 백엔드 역량이 무엇인지 작성해 주세요.",
  ],
  "ai-ml": [
    "AI/ML 파트에 지원한 이유와, 관심 있는 문제 영역(예: 추천, NLP, 비전)을 작성해 주세요.",
    "데이터를 다룰 때 중요하다고 생각하는 태도와 검증 방법을 작성해 주세요.",
    "AI 기능을 실제 서비스에 적용할 때 고려해야 할 점을 작성해 주세요.",
  ],
  "pm-design": [
    "문제 정의 및 사용자 관점에서 중요하게 보는 기준을 작성해 주세요.",
    "좋은 서비스 경험을 만든다고 생각하는 핵심 요소 2가지를 작성해 주세요.",
    "협업에서 PM/DESIGN 역할로 기여할 수 있는 강점을 작성해 주세요.",
  ],
};

const createEmptyAnswers = (count: number) =>
  Array.from({ length: count }, () => "");

const buildInitialPartAnswers = () =>
  (Object.keys(partQuestions) as PartKey[]).reduce(
    (acc, key) => {
      acc[key] = createEmptyAnswers(partQuestions[key].length);
      return acc;
    },
    {} as Record<PartKey, string[]>,
  );

const sectionCardClass =
  "rounded-[10px] bg-[#2F323B] px-3.5 py-5 shadow-[0_8px_24px_rgba(0,0,0,0.16)] md:rounded-[12px] md:px-7 md:py-8";

export default function ApplyPage() {
  const [commonAnswers, setCommonAnswers] = useState<string[]>(() =>
    createEmptyAnswers(commonQuestions.length),
  );
  const [selectedPart, setSelectedPart] = useState<PartKey>("front-end");
  const [partAnswers, setPartAnswers] = useState<Record<PartKey, string[]>>(
    () => buildInitialPartAnswers(),
  );
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [portfolioNote, setPortfolioNote] = useState("");
  const [portfolioFileName, setPortfolioFileName] = useState("");

  const selectedPartQuestions = useMemo(
    () => partQuestions[selectedPart],
    [selectedPart],
  );

  const onChangeCommonAnswer = (index: number, value: string) => {
    setCommonAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const onChangePartAnswer = (index: number, value: string) => {
    setPartAnswers((prev) => ({
      ...prev,
      [selectedPart]: prev[selectedPart].map((answer, idx) =>
        idx === index ? value : answer,
      ),
    }));
  };

  const onSelectPortfolioFile = (event: ChangeEvent<HTMLInputElement>) => {
    setPortfolioFileName(event.target.files?.[0]?.name ?? "");
  };

  return (
    <section className="bg-[linear-gradient(180deg,#2B2D33_0%,#212329_100%)] px-4 py-9 text-white md:px-6 md:py-16">
      <div className="mx-auto w-full max-w-[760px] space-y-10 md:space-y-14">
        <div className={sectionCardClass}>
          <h2 className="text-center text-[15px] font-bold md:text-[20px]">
            공통 질문
          </h2>
          <div className="mt-5 space-y-5 md:mt-7 md:space-y-7">
            {commonQuestions.map((question, index) => (
              <div key={question} className="space-y-2.5">
                <p className="text-[11px] font-medium text-[#F7F9FF] md:text-[14px]">
                  Q. {question}
                </p>
                <textarea
                  value={commonAnswers[index]}
                  onChange={(event) =>
                    onChangeCommonAnswer(index, event.target.value)
                  }
                  maxLength={500}
                  rows={5}
                  placeholder="답변을 자유롭게 작성해 주세요. (최대 500자)"
                  className="w-full resize-none rounded-[8px] border border-[#62697A] bg-[#4C5262] px-3.5 py-3 text-[12px] text-white placeholder:text-[#B8BECA] focus:border-[#0B7DE2] focus:outline-none md:rounded-[10px] md:px-4 md:py-3.5 md:text-[14px]"
                />
                <p className="text-right text-[10px] text-[#AEB5C2] md:text-[12px]">
                  {commonAnswers[index].length}/500
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6 md:space-y-8">
          <div className="space-y-4 text-center md:space-y-5">
            <h2 className="text-[20px] font-bold text-white">지원 파트</h2>
            <div className="mx-auto flex max-w-[520px] flex-wrap items-center justify-center gap-2.5 md:gap-3">
              {(Object.keys(partLabels) as PartKey[]).map((part) => {
                const selected = part === selectedPart;
                return (
                  <button
                    key={part}
                    type="button"
                    onClick={() => setSelectedPart(part)}
                    className={`min-w-[112px] rounded-full px-4 py-2 text-[12px] font-semibold transition-colors md:min-w-[130px] md:text-[13px] ${
                      selected
                        ? "bg-[#0B7DE2] text-white"
                        : "bg-[#F3F3F3] text-[#8C94A6] hover:bg-[#E8E8E8]"
                    }`}
                  >
                    {partLabels[part]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={sectionCardClass}>
            <h3 className="text-center text-[15px] font-bold md:text-[20px]">
              파트별 질문
            </h3>
            <div className="mt-5 space-y-5 md:mt-7 md:space-y-7">
              {selectedPartQuestions.map((question, index) => (
                <div key={`${selectedPart}-${index}`} className="space-y-2.5">
                  <p className="text-[11px] font-medium text-[#F7F9FF] md:text-[14px]">
                    Q. {question}
                  </p>
                  <textarea
                    value={partAnswers[selectedPart][index]}
                    onChange={(event) =>
                      onChangePartAnswer(index, event.target.value)
                    }
                    maxLength={500}
                    rows={5}
                    placeholder="답변을 자유롭게 작성해 주세요. (최대 500자)"
                    className="w-full resize-none rounded-[8px] border border-[#62697A] bg-[#4C5262] px-3.5 py-3 text-[12px] text-white placeholder:text-[#B8BECA] focus:border-[#0B7DE2] focus:outline-none md:rounded-[10px] md:px-4 md:py-3.5 md:text-[14px]"
                  />
                  <p className="text-right text-[10px] text-[#AEB5C2] md:text-[12px]">
                    {partAnswers[selectedPart][index].length}/500
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={sectionCardClass}>
          <h2 className="text-center text-[15px] font-bold md:text-[20px]">
            포트폴리오 제출
          </h2>
          <div className="mt-5 space-y-5 md:mt-7 md:space-y-6">
            <div className="space-y-2.5">
              <p className="text-[11px] font-medium text-[#F7F9FF] md:text-[14px]">
                포트폴리오 링크
              </p>
              <input
                type="url"
                value={portfolioUrl}
                onChange={(event) => setPortfolioUrl(event.target.value)}
                placeholder="https:// 형태의 URL을 입력해 주세요."
                className="w-full rounded-[8px] border border-[#62697A] bg-[#4C5262] px-3.5 py-3 text-[12px] text-white placeholder:text-[#B8BECA] focus:border-[#0B7DE2] focus:outline-none md:rounded-[10px] md:px-4 md:py-3.5 md:text-[14px]"
              />
            </div>

            <div className="space-y-2.5">
              <p className="text-[11px] font-medium text-[#F7F9FF] md:text-[14px]">
                파일 업로드
              </p>
              <label className="flex w-full cursor-pointer items-center justify-between rounded-[8px] border border-[#7E8698] bg-[#7E8698] px-3.5 py-3 text-[12px] text-[#D9DEEA] md:rounded-[10px] md:px-4 md:py-2 md:text-[14px]">
                <span className="truncate">
                  {portfolioFileName || "포트폴리오 파일을 선택해 주세요."}
                </span>
                <span className="ml-3 rounded-[5px] bg-white-1 border border-main-1 px-6 py-2 text-[11px] font-medium text-main-1 md:text-[16px]">
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
              {/* <p className="text-[11px] font-medium text-[#F7F9FF] md:text-[14px]">
                포트폴리오 설명
              </p>
              <textarea
                value={portfolioNote}
                onChange={(event) => setPortfolioNote(event.target.value)}
                maxLength={500}
                rows={4}
                placeholder="포트폴리오의 주요 포인트를 작성해 주세요. (최대 500자)"
                className="w-full resize-none rounded-[8px] border border-[#62697A] bg-[#4C5262] px-3.5 py-3 text-[12px] text-white placeholder:text-[#B8BECA] focus:border-[#0B7DE2] focus:outline-none md:rounded-[10px] md:px-4 md:py-3.5 md:text-[14px]"
              />
              <p className="text-right text-[10px] text-[#AEB5C2] md:text-[12px]">
                {portfolioNote.length}/500
              </p> */}
              <p className="text-left pl-[14px] text-[14px] leading-[1.46] font-regular font-sans">
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
      </div>
    </section>
  );
}
