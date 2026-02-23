"use client";

import React, { useState } from "react";

const FAQData = [
  {
    Q: "Q. 멋쟁이 사자처럼 동비는 얼마인가요?",
    A: "회비는 30,000원이며, 연 1회 납부하시면 됩니다.",
  },
  {
    Q: "Q. 해커톤은 필수 참여인가요?",
    A: "네, 멋쟁이사자처럼 중앙 해커톤과 대학 연합 해커톤 총 2가지 행사에 모두 참여해 주셔야 합니다.",
  },
  {
    Q: "Q. 2학기에도 아기사자 모집을 하나요?",
    A: "아니요. 멋쟁이사자처럼은 1년 단위로 운영되는 동아리입니다. <br />따라서 신입 회원 모집은 1학기에만 진행되며, 선발 이후 1년간 활동하게 됩니다.",
  },
  {
    Q: "Q. 개발 경험이 전혀 없어도 지원 가능한가요?",
    A: "멋쟁이사자처럼은 “기술적 장벽 때문에 생각을 표현하지 못한 비전공자들과 감동의 순간을 만들어 가고 싶다”는 모토로 시작된 동아리입니다. <br/>따라서 개발 경험이 없거나 비전공자이더라도, 열정과 성장 의지가 있다면 충분히 지원하실 수 있습니다.",
  },
  {
    Q: "Q. 휴학생, 졸업유예생도 지원 가능한가요?",
    A: "네, 가능합니다.",
  },
  {
    Q: "Q. 정기세션은 언제, 어디서 이루어지나요?",
    A: "정기 세션은 3주간 매주 화요일 18시에 진행되며, 교내 강의실을 대관하여 운영됩니다. <br />이후 파트별 세션은 각 파트별로 일정 및 장소를 조율하여 진행됩니다.",
  },
  {
    Q: "Q. 지원 시 포트폴리오 제출은 필수인가요?",
    A: "백엔드, 프론트엔드, AI/ML 파트 지원자의 경우 포트폴리오 제출은 필수가 아니며 선택 사항입니다. 기획/디자인 파트 지원자의 경우에는 필수 제출 항목입니다. 다만, 해당 포트폴리오는 아기사자 커리큘럼의 수업 난이도 및 디자인 툴 이해도를 확인하기 위한 자료로, 개발과 직접적인 관련이 없는 포트폴리오를 제출하셔도 무관합니다. 또한 신입생의 경우, 포트폴리오를 제출하지 않으셔도 지원이 가능합니다. 제출된 모든 포트폴리오는 아기사자 모집 종료 후 안전하게 폐기됩니다.",
  },
];

type FAQItem = {
  Q: string;
  A: string;
};

/** FAQ 목록 컴포넌트
 * @param {Object} item QNA 내용이 담긴 FAQData
 */
const FAQCard = ({ item }: { item: FAQItem }) => {
  const [isOpen, setIsOpen] = useState(false);
  const answer = item.A.replace(/<br\s*\/?>/gi, "\n");

  return (
    <div className="max-w-[1160px] w-full overflow-hidden border-2 border-gray-2 rounded-[10px] text-background">
      {/* Question */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className={`w-full cursor-pointer bg-gray-2 px-[13px] py-[12px] lg:px-[29px] lg:py-[22px] flex items-center justify-between text-left transition-colors duration-300 ${
          isOpen ? "rounded-b-[10px]" : "rounded-none"
        }`}
      >
        <span className="text-[14px] lg:text-[20px] font-bold">{item.Q}</span>
        {/* 위/아래 화살표 아이콘 */}
        <svg
          className={`h-7 w-7 shrink-0 text-gray-5 transition-transform duration-300 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {/* Answer : Question 영역 토글로 보임/안보임 */}
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="whitespace-pre-line px-[14px] py-[20px] lg:px-[54px] lg:py-[26px] text-[14px] lg:text-[20px] font-medium text-gray-7 leading-[1.27]">
            {answer}
          </div>
        </div>
      </div>
    </div>
  );
};

const FaqSection = () => {
  return (
    <section className="w-full bg-foreground py-[117px] lg:py-92.5 px-[18px] lg:px-18">
      <div className="flex flex-col gap-[85px] items-center justify-center">
        <h3 className="text-[22px] lg:text-[40px] text-main-1 font-bold text-center">
          FAQ
        </h3>
        <div className="flex flex-col gap-[20px] ">
          {FAQData.map((item) => (
            <FAQCard key={item.Q} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
