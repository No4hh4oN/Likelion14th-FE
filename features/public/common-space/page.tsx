"use client";

import { useState } from "react";
import Image from "next/image";
import HomeSection from "./sections/HomeSection";
import type { MenuItem, SectionContent } from "./types";

const menuItems: MenuItem[] = [
  {
    label: "ALL",
    children: ["전체 공지", "세션 자료 공유", "과제 안내 & 제출", "질의응답"],
  },
  { label: "FRONT-END" },
  { label: "BACK-END" },
  { label: "AI / ML" },
  { label: "PM / DESIGN" },
];

/** 임시 섹션 콘텐츠 */
const sectionContent: Record<string, SectionContent> = {
  ALL: {
    title: "전체",
    description:
      "전체 공지/자료/과제/커뮤니티를 한 번에 확인할 수 있는 메인 화면입니다.",
    items: ["전체 공지", "세션 자료 공유", "과제 안내 & 제출", "질의응답"],
  },
  "전체 공지": {
    title: "전체 공지",
    description: "운영진이 등록한 전체 공지를 확인할 수 있습니다.",
    items: ["모집/일정 공지", "운영 공지", "긴급 공지"],
  },
  "세션 자료 공유": {
    title: "세션 자료 공유",
    description: "공통 세션 자료와 파트별 학습 자료를 확인할 수 있습니다.",
    items: ["공통 세션 자료", "파트별 세션 자료", "참고 링크"],
  },
  "과제 안내 & 제출": {
    title: "과제 안내 & 제출",
    description: "주차별 과제 안내와 제출 현황을 확인할 수 있습니다.",
    items: ["진행 중 과제", "제출 완료 과제", "피드백 대기 과제"],
  },
  질의응답: {
    title: "질의응답",
    description: "질문과 답변을 통해 학습 이슈를 빠르게 해결할 수 있습니다.",
    items: ["최근 질문", "답변 대기", "해결된 질문"],
  },
  "FRONT-END": {
    title: "FRONT-END",
    description:
      "프론트엔드 부서의 공지, 교육자료, 과제, 커뮤니티 정보를 확인하세요.",
    items: ["파트 공지", "파트 자료", "파트 과제"],
  },
  "BACK-END": {
    title: "BACK-END",
    description:
      "백엔드 부서의 공지, 교육자료, 과제, 커뮤니티 정보를 확인하세요.",
    items: ["파트 공지", "파트 자료", "파트 과제"],
  },
  "AI / ML": {
    title: "AI / ML",
    description:
      "AI/ML 부서의 공지, 교육자료, 과제, 커뮤니티 정보를 확인하세요.",
    items: ["파트 공지", "파트 자료", "파트 과제"],
  },
  "PM / DESIGN": {
    title: "PM / DESIGN",
    description:
      "PM/Design 부서의 공지, 교육자료, 과제, 커뮤니티 정보를 확인하세요.",
    items: ["파트 공지", "파트 자료", "파트 과제"],
  },
};

export default function CommonSpacePage() {
  const [isAllOpen, setIsAllOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("ALL");

  const baseItemClass =
    "pl-3.75 border-l-5 border-gray-6 text-[24px] transition-all cursor-pointer hover:text-white-1 hover:font-bold";
  const activeItemClass = "border-main-1 text-white-1 font-bold";
  const baseChildClass =
    "pl-4.75 text-[18px] text-gray-4 transition-all hover:border-[#da8338] hover:border-l-5";
  const activeChildClass = "text-white-1 font-bold border-l-5 border-main-3";

  const currentSection = sectionContent[activeCategory] ?? sectionContent.ALL;
  const allSubCategories = menuItems[0].children ?? [];

  return (
    <div className="mx-auto max-w-[1440px] leading-[1.27] pt-16">
      <div className="grid grid-cols-1 items-start lg:grid-cols-[165px_minmax(0,1fr)_165px] lg:gap-8">
        <aside className="lg:sticky lg:self-start mt-60">
          <nav>
            <ul className="flex flex-col gap-8">
              {menuItems.map((item) =>
                item.label === "ALL" ? (
                  <li key={item.label}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAllOpen((prev) => !prev);
                        setActiveCategory("ALL");
                      }}
                      className={`${baseItemClass} hover:border-main-2 ${
                        activeCategory === "ALL" ||
                        allSubCategories.includes(activeCategory)
                          ? activeItemClass
                          : "text-gray-4 font-normal"
                      }`}
                    >
                      {item.label}
                    </button>
                    {isAllOpen && item.children && (
                      <ul className="mt-8 flex flex-col gap-3">
                        {item.children.map((child) => (
                          <li key={child}>
                            <button
                              type="button"
                              onClick={() => setActiveCategory(child)}
                              className={`${baseChildClass} cursor-pointer ${
                                activeCategory === child
                                  ? activeChildClass
                                  : "text-gray-4 font-normal"
                              }`}
                            >
                              -{child}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ) : (
                  <li key={item.label}>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveCategory(item.label);
                      }}
                      className={`${baseItemClass} cursor-pointer hover:border-main-2 hover:text-white-1 hover:font-bold ${
                        activeCategory === item.label
                          ? activeItemClass
                          : "text-gray-4 font-normal"
                      }`}
                    >
                      {item.label}
                    </button>
                  </li>
                ),
              )}
            </ul>
          </nav>
        </aside>

        <main className="text-white-1">
          <section className="text-[48px] font-semibold text-white-1 flex gap-4 items-center pt-25.5 pb-21">
            멋쟁이사자처럼 SYU 공통 공간
            <Image
              src="/images/lions/lion-long-hair.webp"
              alt="롱헤어 라이언"
              width={53}
              height={53}
              className="z-10 h-[53px] w-[53px]"
            />
          </section>
          {activeCategory === "ALL" ? (
            <HomeSection />
          ) : (
            <section className="pb-16">
              <h2 className="text-[32px] font-bold">{currentSection.title}</h2>
              <p className="mt-3 text-[18px] text-gray-3">
                {currentSection.description}
              </p>
              <ul className="mt-8 grid gap-4 md:grid-cols-2">
                {currentSection.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-lg border border-gray-6 px-5 py-4 text-[18px] text-white-1"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </main>

        <div className="hidden lg:block" aria-hidden="true" />
      </div>
    </div>
  );
}
