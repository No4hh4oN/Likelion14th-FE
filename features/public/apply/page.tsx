"use client";

import { ChangeEvent, useMemo, useState } from "react";

type PartKey = "front-end" | "back-end" | "ai-ml" | "pm-design";

/** 공통 질문 리스트 */
const commonQuestions = [
  "멋쟁이사자처럼에 지원하게 된 동기를 작성해 주세요.",
  "멋쟁이사자처럼 활동을 통해 이루고 싶은 목표를 작성해 주세요.",
  "팀플 또는 협업에서 가장 중요하다고 생각하는 역량에 대해 작성해 주세요.",
];

const partLabels: Record<PartKey, string> = {
  "front-end": "FRONT-END",
  "back-end": "BACK-END",
  "ai-ml": "AI / ML",
  "pm-design": "PM / DESIGN",
};

/** 파트별 질문 리스트 */
const partQuestions: Record<PartKey, string[]> = {
  "front-end": [
    "프론트엔드 트랙에 지원하게 된 동기를 작성해주세요.",
    "본인의 개발 경험에 대해 소개해 주세요. (사용 가능한 언어 / 관심있는 기술스택 / 프로젝트 경험 등)",
    "평소 사용하는 웹에서 ‘주문하기’ 버튼을 눌렀는데, 버튼이 잠깐 로딩되다가 “실패했습니다”라고 떴습니다. 그런데 새로고침해보니 실제로는 처리가 완료되어 주문이 들어가 있었습니다. 이런 현상이 프론트엔드 관점에서 왜 발생할 수 있는지 원인을 자유롭게 추측해 보고, 본인이 프론트엔드라면 UI/UX를 어떻게 설계할지 논리를 설명해 주세요.",
  ],
  "back-end": [
    "백엔드 트랙에 지원하게 된 동기를 작성해주세요.",
    "본인의 개발 경험에 대해 소개해 주세요. (사용 가능한 언어 / 관심있는 기술스택 / 프로젝트 경험 등) ",
    "평소 사용하는 앱에서 버튼을 눌렀는데, 내 화면에는 ‘오류가 발생했다’고 떴지만 실제로는 ‘정상 처리’가 되어버리는 상황이 생겼습니다. (예: 결제 실패라고 떴는데 돈이 빠져나감) 이런 문제가 구체적으로 왜 발생했는지 그 원인을 자유롭게 추측해 보고, 이처럼 두 정보가 서로 다를 때 시스템은 결국 ‘화면’과 ‘기록’ 중 무엇을 기준으로 판단해야 할지 본인의 논리를 설명해 주세요.",
  ],
  "ai-ml": [
    "AI/ML 트랙에 지원하게 된 동기를 작성해주세요.",
    "본인의 개발 경험에 대해 소개해 주세요. (사용 가능한 언어 / 관심있는 기술스택 / 프로젝트 경험 등) ",
    "아래 코드의 개선 방안을 자유롭게 이야기 해주세요. ",
  ],
  "pm-design": [
    "디자인 트랙에 지원하게 된 동기를 작성해주세요.",
    "기획/디자인 파트에서의 활동이 본인에게 어떤 도움이 되기를 기대하는지, 앞으로 얻고 싶은 가치와 함께 구체적으로 작성해 주세요.",
    "본인이 잘 디자인되었다고 생각하는 서비스를 소개하고, 그렇게 생각하는 이유를 작성해 주세요.",
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
  "rounded-[10px] bg-gray-7 px-3 py-6 shadow-[0_8px_24px_rgba(0,0,0,0.16)] lg:px-7 lg:py-12";

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
    <section className="bg-background px-4 py-9 text-white lg:px-6 lg:py-16">
      <div className="mx-auto w-full max-w-290">
        <div className={sectionCardClass}>
          <h2 className="text-center text-[18px] font-bold lg:text-[32px]">
            공통 질문
          </h2>
          <div className="mt-[37px] space-y-[16px] lg:mt-[65px] lg:space-y-[12px]">
            {commonQuestions.map((question, index) => (
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
                    className={`rounded-full cursor-pointer px-[17px] py-[8px] lg:px-[57px] lg:py-[14px] text-[14px] font-bold lg:min-w-[130px] lg:text-[28px] ${
                      selected
                        ? "bg-main-1 text-white-1"
                        : "bg-white-1 text-gray-4 hover:bg-gray-2"
                    }`}
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
              {/* <p className="text-[11px] font-medium text-[#F7F9FF] lg:text-[14px]">
                포트폴리오 설명
              </p>
              <textarea
                value={portfolioNote}
                onChange={(event) => setPortfolioNote(event.target.value)}
                maxLength={500}
                rows={4}
                placeholder="포트폴리오의 주요 포인트를 작성해 주세요. (최대 500자)"
                className="w-full resize-none rounded-[8px] border border-[#62697A] bg-[#4C5262] px-3.5 py-3 text-[12px] text-white placeholder:text-[#B8BECA] focus:border-[#0B7DE2] focus:outline-none lg:rounded-[10px] lg:px-4 lg:py-3.5 lg:text-[14px]"
              />
              <p className="text-right text-[10px] text-[#AEB5C2] lg:text-[12px]">
                {portfolioNote.length}/500
              </p> */}
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
      </div>
    </section>
  );
}
