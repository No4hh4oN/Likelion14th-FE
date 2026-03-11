"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, MouseEvent, TouchEvent } from "react";
import { useMemo, useRef, useState } from "react";

type EntryItem = {
  title: string;
  description: string;
  href: string;
};

const ENTRY_ITEMS: EntryItem[] = [
  {
    title: "멋사 SYU 14TH\n지원자 관리",
    description:
      "서류 지원부터 최종 합격까지\n지원자 상태를 단계별로 관리해요.",
    href: "/admin/applications",
  },
  {
    title: "멋사 SYU 14TH\n아기사자 관리",
    description:
      "아기사자의 출석과 과제를 운영진 관점에서\n통합 관리하고 평가를 진행해요.",
    href: "/admin/baby-lions",
  },
  {
    title: "멋사 SYU 14TH\n운영진 주요업무",
    description:
      "운영진의 주요 업무를 수행해요.\n지원자와 스태프 운영 페이지를 관리해요.",
    href: "/admin/staff-tasks",
  },
];

export default function AdminEntryPage() {
  const [activeIndex, setActiveIndex] = useState(1);
  const touchStartXRef = useRef<number | null>(null);
  const itemCount = ENTRY_ITEMS.length;

  const goPrev = () =>
    setActiveIndex((prev) => (prev - 1 + itemCount) % itemCount);
  const goNext = () => setActiveIndex((prev) => (prev + 1) % itemCount);

  const getLoopOffset = (index: number) => {
    const raw = index - activeIndex;
    if (raw > itemCount / 2) {
      return raw - itemCount;
    }
    if (raw < -itemCount / 2) {
      return raw + itemCount;
    }
    return raw;
  };

  const handleCardClick = (
    event: MouseEvent<HTMLAnchorElement>,
    index: number,
  ) => {
    if (index !== activeIndex) {
      event.preventDefault();
      const offset = getLoopOffset(index);
      if (offset > 0) {
        goNext();
      } else if (offset < 0) {
        goPrev();
      }
    }
  };

  const handleTouchStart = (event: TouchEvent<HTMLElement>) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLElement>) => {
    if (touchStartXRef.current === null) {
      return;
    }

    const endX = event.changedTouches[0]?.clientX ?? touchStartXRef.current;
    const deltaX = endX - touchStartXRef.current;
    const swipeThreshold = 40;

    if (deltaX <= -swipeThreshold) {
      goNext();
    } else if (deltaX >= swipeThreshold) {
      goPrev();
    }

    touchStartXRef.current = null;
  };

  const mobileTrackStyle = useMemo<CSSProperties>(
    () => ({
      transform: `translateX(-${activeIndex * 100}%)`,
    }),
    [activeIndex],
  );

  return (
    <div className="w-full bg-background pt-16">
      <div className="min-h-[calc(100dvh-4rem)] p-0 md:p-3">
        <section
          className="relative h-[calc(100dvh-4rem)] min-h-[620px] w-full overflow-x-hidden overflow-y-visible md:min-h-[700px]"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="absolute inset-x-0 top-[14%] z-10 md:hidden">
            <div className="overflow-hidden px-4">
              <div
                className="flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={mobileTrackStyle}
              >
                {ENTRY_ITEMS.map((item, index) => (
                  <div
                    key={item.title}
                    className="w-full shrink-0 px-2 text-white"
                  >
                    <article
                      className={`h-[360px] w-full rounded-3xl border px-7 py-8 transition-all duration-500 ${
                        index === activeIndex
                          ? "border-[#8fa1d2] bg-[linear-gradient(145deg,#333b4f_0%,#242a38_100%)] shadow-[0_22px_44px_rgba(0,0,0,0.4)]"
                          : "border-white/10 bg-[linear-gradient(145deg,#2a2f3b_0%,#20242f_100%)] shadow-[0_18px_40px_rgba(0,0,0,0.35)]"
                      }`}
                    >
                      <p className="text-xs font-semibold tracking-[0.14em] text-[#8a95b2]">
                        ADMIN ENTRY
                      </p>
                      <Link
                        href={item.href}
                        onClick={(event) => handleCardClick(event, index)}
                        className="mt-5 block"
                      >
                        <h2 className="whitespace-normal break-words text-[33px] font-extrabold leading-[1.12] tracking-[-0.02em]">
                          {item.title}
                        </h2>
                        <p className="mt-5 whitespace-pre-line break-words text-[15px] leading-[1.5] text-[#9aa2b4]">
                          {item.description}
                        </p>
                      </Link>
                      <Link
                        href={item.href}
                        onClick={(event) => handleCardClick(event, index)}
                        className="mt-8 inline-flex h-10 items-center justify-center rounded-full bg-[#4a5162] px-4 text-sm font-semibold text-white"
                      >
                        바로가기
                      </Link>
                    </article>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute inset-x-0 top-[19%] z-10 hidden h-[58%] overflow-visible md:block">
            {ENTRY_ITEMS.map((item, index) => {
              const offset = getLoopOffset(index);
              const isActive = offset === 0;
              const isNear = Math.abs(offset) === 1;

              const offsetVw = offset === -1 ? -20 : offset === 1 ? 20 : 0;
              const centerBiasVw = -9;
              const scale = isActive ? 1.1 : isNear ? 0.9 : 0.75;
              const desktopCardStyle: CSSProperties = {
                transform: `translateX(calc(-50% + ${centerBiasVw}vw + ${offsetVw}vw)) scale(${scale})`,
              };

              return (
                <div
                  key={item.title}
                  style={desktopCardStyle}
                  className={`pointer-events-none absolute left-1/2 top-0 block text-white transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isActive
                      ? "z-30 min-h-[520px] w-[44vw] min-w-[520px] max-w-[760px] opacity-100 overflow-visible"
                      : isNear
                        ? "z-20 min-h-[520px] w-[44vw] min-w-[520px] max-w-[760px] opacity-45 overflow-visible"
                        : "z-10 min-h-[520px] w-[44vw] min-w-[520px] max-w-[760px] opacity-0 overflow-visible"
                  }`}
                >
                  <div className="-rotate-[7deg] origin-center px-8 py-6">
                    <Link
                      href={item.href}
                      onClick={(event) => handleCardClick(event, index)}
                      className="pointer-events-auto ml-auto block w-fit text-right"
                    >
                      <h2
                        className={`whitespace-pre font-extrabold leading-[1.08] tracking-[-0.02em] ${
                          isActive ? "text-[46px]" : "text-[30px]"
                        }`}
                      >
                        {item.title}
                      </h2>
                      <p
                        className={`mt-3 whitespace-pre text-[#9aa2b4] ${
                          isActive ? "text-sm" : "text-xs"
                        }`}
                      >
                        {item.description}
                      </p>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={goPrev}
            aria-label="이전"
            className="absolute bottom-[110px] left-[14%] z-20 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#4a5162] text-white md:bottom-[112px] md:left-[20%] md:h-16 md:w-16"
          >
            <Image
              src="/icons/left.png"
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 md:h-8 md:w-8"
            />
          </button>

          <button
            type="button"
            onClick={goNext}
            aria-label="다음"
            className="absolute bottom-[110px] right-[14%] z-20 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#4a5162] text-white md:bottom-[112px] md:right-[20%] md:h-16 md:w-16"
          >
            <Image
              src="/icons/right.png"
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 md:h-8 md:w-8"
            />
          </button>

          <div className="absolute bottom-16 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2.5">
            {ENTRY_ITEMS.map((item, index) => (
              <button
                key={item.title}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`${index + 1}번 슬라이드`}
                aria-current={index === activeIndex}
                className={`rounded-full transition-all duration-400 ease-out ${
                  index === activeIndex
                    ? "h-3.5 w-3.5 bg-[#8a95b2]"
                    : "h-2 w-2 bg-[#4f5566]"
                }`}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
