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
      className={`inline-flex items-center text-white-1 rounded-full border-1 lg:border-2 px-2 py-0.75 text-[12px] font-normal leading-none lg:px-4.5 lg:py-2.25 lg:text-[14px] ${
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
          <div className="flex gap-3">
            {/* FIXME: 뱃지 여러개 가능한지, 데이터에 따라 보이는거 다르게 가능한지 */}
            {member.mainPart && <PartBadge label={member.mainPart} active />}
            {member.subParts.map((part) => (
              <PartBadge key={part} label={part} />
            ))}
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
      className="fixed inset-0 z-[80] bg-black/60 p-3 lg:p-8"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="mx-auto h-full w-full max-w-[1120px] overflow-y-auto rounded-[18px] bg-[#323741] p-4 text-white lg:h-auto lg:max-h-[90vh] lg:rounded-[20px] lg:px-8 lg:py-7"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`${member.name} 사진`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2 lg:gap-3">
            <p className="hidden text-[50px] font-extrabold leading-none lg:block">
              {member.desktopTitle}
            </p>
            <p className="text-[34px] font-bold leading-none lg:hidden">
              {member.teamLabel}
            </p>

            {member.mainPart && <PartBadge label={member.mainPart} active />}
            <div className="hidden items-center gap-2 lg:flex">
              {member.subParts.map((part) => (
                <PartBadge key={part} label={part} />
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 rounded-full text-white/65 transition-colors hover:text-white"
            aria-label="모달 닫기"
          >
            <span className="text-[28px] leading-none" aria-hidden="true">
              ×
            </span>
          </button>
        </div>

        <div className="mt-5 grid gap-5 lg:mt-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
          <div className="flex gap-3 lg:block">
            <div className="relative h-[126px] w-[106px] overflow-hidden rounded-[8px] lg:h-[280px] lg:w-[170px] lg:rounded-[10px]">
              <Image
                src={member.imageSrc}
                alt={`${member.name} 사진`}
                fill
                sizes="(min-width: 1024px) 170px, 106px"
                quality={100}
                className="object-cover"
              />
            </div>

            <div className="pt-1 lg:pt-4 lg:text-center">
              <p className="text-[32px] font-bold leading-none lg:text-[52px]">
                {member.name}
              </p>
              <p className="mt-1 text-[14px] font-semibold text-white/90 lg:text-[34px]">
                {member.studentInfo}
              </p>
              <div className="mt-3 hidden space-y-1 text-[16px] text-gray-3 lg:block">
                {member.majors &&
                  member.majors.map((major) => <p key={major}>{major}</p>)}
              </div>
            </div>
          </div>

          <div className="space-y-5 lg:space-y-7">
            <section>
              <h3 className="text-[32px] font-bold leading-none lg:text-[48px]">
                Connect
              </h3>
              <a
                href={`mailto:${member.contact}`}
                className="mt-2 block text-[16px] text-gray-2 underline decoration-gray-2/60 underline-offset-4 lg:mt-3 lg:text-[34px]"
              >
                {member.contact}
              </a>
            </section>

            <section>
              <h3 className="text-[32px] font-bold leading-none lg:text-[48px]">
                Career
              </h3>
              <ul className="mt-2 space-y-1 text-[14px] text-gray-2 lg:mt-3 lg:text-[38px]">
                {member.career.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="text-[32px] font-bold leading-none lg:text-[48px]">
                Project
              </h3>
              <ul className="mt-2 space-y-1 text-[14px] text-gray-2 lg:mt-3 lg:text-[38px]">
                {member.projects.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        <div className="mt-6 rounded-[8px] bg-[#60687B] px-3 py-2.5 text-center lg:mt-8 lg:rounded-[12px] lg:px-6 lg:py-3.5">
          <div className="flex items-stretch justify-between text-white/45">
            <Image
              src="/icons/double-quotes.svg"
              alt=""
              width={33}
              height={25}
              className="h-[25px] w-[33px] self-start opacity-70"
              aria-hidden="true"
            />
            <span className="flex-1 text-center text-[16px] font-semibold text-white lg:text-[44px]">
              {member.quote}
            </span>
            <Image
              src="/icons/double-quotes.svg"
              alt=""
              width={33}
              height={25}
              className="h-[25px] w-[33px] rotate-180 self-end opacity-70"
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
        {StaffParts.map((part) => (
          <div key={part} className="mb-[131px]">
            <div className="mx-auto w-full lg:w-[min(1564px,calc(100vw-48px))]">
              <h2 className="mb-8 text-[32px] font-bold text-white-1 lg:ml-[36px] lg:mb-[21px] lg:text-[32px]">
                {part}
              </h2>
              <div className="flex flex-col gap-[20px] lg:flex-row lg:flex-nowrap lg:justify-center">
                {STAFF_MEMBERS.filter(
                  (member) => member.teamLabel === part,
                ).map((member) => (
                  <div
                    key={member.contact}
                    className="w-full lg:w-[min(508px,calc((100vw-88px)/3))]"
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
        ))}
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
