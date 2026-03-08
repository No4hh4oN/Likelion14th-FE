"use client";

import Image from "next/image";

export default function HomeSection() {
  const noticeItems = [
    "세션의 규칙을 안내드립니다. (첨부파일 참조)",
    "공통 세션 장소 및 시간대 안내",
    "과제 미제출 시 불이익",
    "과제 미제출 시 불이익2",
    "과제 미제출 시 불이익3",
    "과제 미제출 시 불이익4",
  ];

  const materialItems = [
    { title: "발로 해도 따라할 수 있는 기초 강의" },
    { title: "2차 공통 세션 자료 PDF" },
    { title: "발로 해도 따라할 수 있는 기초 강의2" },
    { title: "2차 공통 세션 자료 PDF2" },
  ];

  const assignmentItems = [
    {
      title: "공통 세션 3주차 : 협업을 위한 기초 세팅법",
      deadline: "마감 2026-03-04",
      status: "미제출",
      body: "아직 과제를 제출하지 않았습니다.",
    },
    {
      title: "공통 세션 2주차 : 떠먹여주는 기초 코딩",
      deadline: "마감 2026-03-01",
      status: "제출함",
      body: "경동나비앤보일러공학과 24학번 윤혜원 2주차(공통) 과제 제출.jpg",
    },
    {
      title: "공통 세션 1주차 : 숨쉬는법진짜쉽다",
      deadline: "마감 2026-03-01",
      status: "제출함",
      body: "숨쉬는중.mp4",
    },
  ];

  return (
    <section className="flex flex-col gap-28.5">
      <div className="relative bg-linear-to-r from-[#334EBE] to-[#0B7DE2] w-full overflow-hidden rounded-[14px] px-10.5 py-8 text-center flex items-center gap-5 shadow-[0_0_17.3px_#003BA8]">
        <Image
          src="/icons/pin.svg"
          alt="pin icon"
          width={29}
          height={29}
          className="z-10 h-[29px] w-[29px]"
        />
        <span className="text-[20px] font-normal py-2 px-3.5 rounded-[40px] bg-[#2a3c75]">
          NEW
        </span>
        <p className="text-[24px] font-bold">예시로 보여지는 텍스트입니다.</p>
        <svg
          className="ml-auto shrink-0 z-10"
          width="12"
          height="24"
          viewBox="0 0 12 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2 2L10 12L2 22"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="miter"
          />
        </svg>
        <Image
          src="/images/lions/head-back.webp"
          alt="back head lion"
          width={384.3}
          height={332.1}
          className="z-10 absolute right-12 -top-36 rotate-[-30deg] h-[332.1px] w-[384.3px]"
        />
      </div>
      <div className="grid gap-10 lg:grid-cols-2">
        <section>
          <div className="flex items-center justify-between">
            <h3 className="text-[30px] font-semibold text-white-1">
              전체 공지
            </h3>
            <button
              type="button"
              className="flex items-center gap-2 text-gray-3"
            >
              더보기
              <span>{">"}</span>
            </button>
          </div>
          <div className="mt-3 h-[2px] w-full bg-main-2" />
          <ul className="mt-7 flex flex-col gap-3">
            {noticeItems.map((item) => (
              <li
                key={item}
                className="rounded-[12px] bg-[#4f5465] px-6 py-5 text-[20px] font-medium text-white-1"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <div className="flex items-center justify-between">
            <h3 className="text-[30px] font-semibold text-white-1">
              세션 자료 공유
            </h3>
            <button
              type="button"
              className="flex items-center gap-2 text-gray-3"
            >
              더보기
              <span>{">"}</span>
            </button>
          </div>
          <div className="mt-3 h-[2px] w-full bg-main-2" />
          <ul className="mt-7 grid grid-cols-2 gap-4">
            {materialItems.map((item, index) => (
              <li key={`${item.title}-${index}`}>
                <div className="overflow-hidden rounded-[16px] bg-[#434958]">
                  <Image
                    src="/images/lions/head-back.webp"
                    alt="자료 썸네일"
                    width={240}
                    height={160}
                    className="h-[170px] w-full object-cover"
                  />
                </div>
                <p className="mt-3 text-[21px] font-semibold text-white-1 line-clamp-1">
                  {item.title}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section>
        <div className="flex items-center justify-between">
          <h3 className="text-[30px] font-semibold text-white-1">
            과제 안내 & 제출
          </h3>
          <button type="button" className="flex items-center gap-2 text-gray-3">
            더보기
            <span>{">"}</span>
          </button>
        </div>
        <div className="mt-3 h-[2px] w-full bg-main-2" />

        <ul className="mt-10 flex flex-col gap-6">
          {assignmentItems.map((item, index) => (
            <li
              key={`${item.title}-${index}`}
              className="overflow-hidden rounded-[14px] border border-main-3 bg-[#d7dce8]"
            >
              <div className="flex items-center justify-between bg-[#9ea7bb] px-8 py-5">
                <p className="text-[24px] font-bold text-[#1f1f1f]">
                  {item.title}
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-[32px] font-bold text-[#1c61ff]">
                    {item.deadline}
                  </span>
                  <span className="rounded-full bg-main-2 px-4 py-1 text-[18px] font-semibold text-white-1">
                    {item.status}
                  </span>
                </div>
              </div>
              <div className="bg-[#eef1f8] px-8 py-8 text-center text-[30px] text-[#9aa0af]">
                {item.body}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}
