"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { STAFF_MEMBERS } from "./staffMembers";
import type { StaffMember } from "./staffMembers";

const StaffParts = [
  "LEADER",
  "PM / DESIGN",
  "FRONT-END",
  "BACK-END",
  "AI / ML",
];

/**
 * 운영진 파트 라벨 뱃지를 렌더링함.
 * @param props 라벨 텍스트와 활성화 여부
 * @returns 파트 뱃지 UI
 */
function PartBadge({
  label,
  active = false,
}: {
  label: string;
  active?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap text-white-1 rounded-full border-1 lg:border-2 px-2 py-0.75 text-[12px] font-normal leading-none lg:px-4.5 lg:py-2.25 lg:text-[14px] ${
        active ? "border-main-1 bg-main-1" : "border-white-1 bg-transparent"
      }`}
    >
      {label}
    </span>
  );
}

/**
 * 운영진 목록의 미리보기 카드를 렌더링함.
 * @param props 운영진 정보와 카드 클릭 핸들러
 * @returns 운영진 미리보기 카드 버튼
 */
function StaffPreviewCard({
  member,
  onClick,
}: {
  member: StaffMember;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-[10px] bg-gray-7 p-2.5 text-left transition-colors hover:bg-gray-6 lg:p-3.75"
    >
      <div className="flex items-start gap-3 lg:gap-[26px]">
        <div className="relative h-26.75 w-22.5 overflow-hidden rounded-[5px] lg:h-60.75 lg:w-51">
          <Image
            src={member.imageSrc}
            alt={`${member.name} 사진`}
            fill
            sizes="(min-width: 1024px) 204px, 90px"
            quality={100}
            className="object-cover"
          />
        </div>

        <div className="flex flex-col lg:pt-3.25">
          <div className="flex flex-wrap items-center gap-1.75 lg:gap-3">
            {member.mainPart && <PartBadge label={member.mainPart} active />}
            {member.subParts.length > 0 && (
              <div className="flex flex-nowrap gap-1.75 lg:gap-3">
                {member.subParts.map((part) => (
                  <PartBadge key={part} label={part} />
                ))}
              </div>
            )}
          </div>

          <p className="mt-2 text-[16px] font-bold text-white-1 lg:mt-4.75 lg:text-[22px]">
            {member.name}
          </p>
          <p className="mt-2 text-[12px] font-light text-white-1 lg:mt-0.75 lg:text-[18px]">
            {member.studentInfo}
          </p>

          <ul className="mt-[12px] hidden text-[14px] font-light leading-normal text-gray-3 lg:block">
            {member.previewCareer.map((item) => (
              <li
                key={item}
                className="relative list-none pl-3 before:absolute before:left-0 before:top-2.5 before:h-1 before:w-1 before:-translate-y-1/2 before:rounded-full before:bg-gray-3"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </button>
  );
}

/**
 * 운영진 상세 정보를 보여주는 모달을 렌더링합니다.
 * @param props 선택된 운영진 정보와 닫기 핸들러
 * @returns 운영진 상세 모달 UI
 */
function StaffDetailModal({
  member,
  onClose,
}: {
  member: StaffMember;
  onClose: () => void;
}) {
  useEffect(() => {
    const original = document.body.style.overflow;
    /**
     * ESC 입력 시 모달을 닫습니다.
     * @param event 키보드 이벤트
     */
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] bg-black/30 p-3 lg:p-8"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative mx-auto h-full w-full max-w-[876px] overflow-y-auto rounded-[10px] bg-gray-7 p-4 text-white-1 lg:h-auto lg:max-h-[90vh] lg:p-10"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`${member.name} 사진`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2 lg:gap-3">
            <p className="text-[36px] mr-2 font-semibold leading-none">
              {member.desktopTitle}
            </p>

            {member.mainPart && <PartBadge label={member.mainPart} active />}
            <div className="hidden items-center gap-2 lg:flex">
              {member.subParts.map((part) => (
                <PartBadge key={part} label={part} />
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="absolute right-2 top-0 h-9 w-9 text-gray-6 transition-colors hover:text-gray-5 lg:right-3 lg:top-1"
          aria-label="모달 닫기"
        >
          <span
            className="text-[50px] font-extralight leading-none"
            aria-hidden="true"
          >
            ×
          </span>
        </button>

        <div className="mt-5 grid gap-5 lg:mt-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
          <div className="flex flex-col items-center">
            <div className="relative h-[126px] w-[106px] overflow-hidden rounded-[5px] lg:h-[243px] lg:w-[204px]">
              <Image
                src={member.imageSrc}
                alt={`${member.name} 사진`}
                fill
                sizes="(min-width: 1024px) 170px, 106px"
                quality={100}
                className="object-cover"
              />
            </div>

            <div className="lg:mt-[11px] lg:text-center">
              <p className="text-[32px] font-bold leading-none lg:text-[32px]">
                {member.name}
              </p>
              <p className="text-[14px] font-light lg:mt-[6px] lg:text-[20px]">
                {member.studentInfo}
              </p>
              <div className="mt-3 hidden text-[16px] text-light text-gray-3 leading-[1.27] lg:mt-[22px] lg:block lg:text-[18px]">
                {member.majors &&
                  member.majors.map((major) => <p key={major}>{major}</p>)}
              </div>
            </div>
          </div>

          <div className="leading-[1.27] space-y-6.5">
            <section>
              <h3 className="text-[32px] font-bold lg:text-[24px]">Connect</h3>
              <a
                href={`mailto:${member.contact}`}
                className="mt-2 inline-block text-[16px] text-gray-3 underline decoration-gray-3 underline-offset-2 lg:mt-1.75 lg:text-[20px]"
              >
                {member.contact}
              </a>
            </section>

            <section>
              <h3 className="text-[32px] font-bold lg:text-[24px]">Career</h3>
              <ul className="mt-2 leading-normal text-[14px] text-light text-gray-2 lg:mt-2 lg:text-[20px]">
                {member.career.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="text-[32px] font-bold lg:text-[24px]">Project</h3>
              <ul className="leading-normal text-[14px] text-gray-3 text-light lg:mt-2 lg:text-[20px]">
                {member.projects &&
                  member.projects.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </section>
          </div>
        </div>

        <div className="mt-6 rounded-[10px] bg-gray-6 px-3 py-2.5 text-center lg:mt-13 lg:px-4.25 lg:py-3.5">
          <div className="flex items-stretch justify-between text-white-1">
            <Image
              src="/icons/double-quotes.svg"
              alt='"'
              width={33}
              height={25}
              className="h-6.25 w-8.25 self-start"
              aria-hidden="true"
            />
            <span className="text-center text-[16px] font-medium text-white-1 lg:text-[24px]">
              {member.quote}
            </span>
            <Image
              src="/icons/double-quotes.svg"
              alt='"'
              width={33}
              height={25}
              className="h-6.25 w-8.25 rotate-180 self-end"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 운영진 소개 페이지를 렌더링합니다.
 * @returns 운영진 목록 및 상세 모달
 */
export default function StaffPage() {
  const [selectedMember, setSelectedMember] = useState<StaffMember | null>(
    null,
  );

  return (
    <section className="bg-background py-8 lg:py-20">
      <div className="mx-auto w-full px-6">
        {StaffParts.map((part) => {
          const isLeaderPart = part === "LEADER";

          return (
            <div key={part} className="mb-[32px] lg:mb-[131px]">
              <div className="mx-auto w-full lg:w-[min(1564px,calc(100vw-48px))]">
                <h2 className="mb-2.5 text-[16px] font-bold text-white-1 lg:ml-[36px] lg:mb-[21px] lg:text-[32px]">
                  {part}
                </h2>
                <div
                  className={`flex flex-col gap-[20px] lg:flex-row lg:flex-nowrap ${
                    isLeaderPart ? "lg:justify-start" : "lg:justify-center"
                  }`}
                >
                  {STAFF_MEMBERS.filter(
                    (member) => member.teamLabel === part,
                  ).map((member) => (
                    <div
                      key={member.contact}
                      className={`w-full ${
                        isLeaderPart
                          ? "lg:w-[min(580px,calc(100vw-48px))]"
                          : "lg:w-[min(508px,calc((100vw-88px)/3))]"
                      }`}
                    >
                      <StaffPreviewCard
                        member={member}
                        onClick={() => setSelectedMember(member)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedMember && (
        <StaffDetailModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </section>
  );
}
