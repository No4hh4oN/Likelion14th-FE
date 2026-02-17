"use client";

import { ChangeEvent, ReactNode, useMemo, useState } from "react";

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

const pythonBuiltins = new Set(["len", "print"]);

const pythonHighlightPattern =
  /(\bclass\b|\bdef\b|\breturn\b|\bfor\b|\bin\b|\bwhile\b|\bif\b|\belse\b|\bbreak\b|\bTrue\b|\blen\b|\bprint\b|'[^']*'|"[^"]*"|\d+)/g;

const getPythonTokenClass = (token: string) => {
  if (pythonKeywords.has(token)) return "text-[#C792EA]";
  if (pythonBuiltins.has(token)) return "text-[#82AAFF]";
  if (token === "True") return "text-[#FFCB6B]";
  if (/^['"]/.test(token)) return "text-[#C3E88D]";
  if (/^\d+$/.test(token)) return "text-[#F78C6C]";
  return "text-[#DCE6FF]";
};

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
              <img
                src="/images/lion-stand-half-gradient-black.png"
                alt="lion-standing"
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
