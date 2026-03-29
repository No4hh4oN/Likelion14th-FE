"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import CommonSpaceDetailSection from "./components/CommonSpaceDetailSection";
import {
  buildCommonSpaceHref,
  COMMON_SPACE_PARTS,
  getCommonSpaceHeading,
  getCommonSpacePart,
  getCommonSpaceSection,
  resolveCommonSpaceMaterialId,
  resolveCommonSpaceNoticeId,
  resolveCommonSpacePartId,
  resolveCommonSpaceSectionId,
} from "./config";
import HomeSection from "./sections/HomeSection";
import AssignmentSection from "./sections/AssignmentSection";
import MaterialDetailSection from "./sections/MaterialDetailSection";
import MaterialSection from "./sections/MaterialSection";
import NoticeDetailSection from "./sections/NoticeDetailSection";
import NoticeSection from "./sections/NoticeSection";

export default function CommonSpacePage() {
  const searchParams = useSearchParams();
  const activePartId = resolveCommonSpacePartId(searchParams.get("part"));
  const activePart = getCommonSpacePart(activePartId);
  const activeSectionId = resolveCommonSpaceSectionId(
    activePart,
    searchParams.get("section"),
  );
  const activeNoticeId = resolveCommonSpaceNoticeId(searchParams.get("noticeId"));
  const activeMaterialId = resolveCommonSpaceMaterialId(
    searchParams.get("materialId"),
  );
  const activeSection = getCommonSpaceSection(activePart, activeSectionId);
  const pageTitle = getCommonSpaceHeading(activePart);

  const baseItemClass =
    "flex items-center justify-between gap-3 border-l-5 pl-3.75 pr-2 text-[24px] transition-all hover:text-white-1 hover:font-bold";
  const activeItemClass = "border-main-1 text-white-1 font-bold";
  const baseChildClass =
    "block border-l-5 pl-4.75 text-[18px] transition-all hover:border-main-3 hover:text-white-1";
  const activeChildClass = "text-white-1 font-bold border-l-5 border-main-3";

  return (
    <div className="mx-auto max-w-[1440px] leading-[1.27] pt-16">
      <div className="grid grid-cols-1 items-start lg:grid-cols-[175px_minmax(0,1fr)_165px] lg:gap-8">
        <aside className="mt-60 lg:sticky lg:top-24 lg:self-start">
          <nav aria-label="공통 공간 카테고리">
            <ul className="flex flex-col gap-8">
              {COMMON_SPACE_PARTS.map((part) => {
                const isActivePart = activePart.id === part.id;

                return (
                  <li key={part.id}>
                    <Link
                      href={buildCommonSpaceHref(part.id)}
                      className={`${baseItemClass} hover:border-main-2 ${
                        isActivePart
                          ? activeItemClass
                          : "border-gray-6 text-gray-4 font-normal"
                      }`}
                      aria-current={isActivePart ? "page" : undefined}
                    >
                      <span>{part.label}</span>
                    </Link>
                    {isActivePart && part.sections.length > 0 ? (
                      <ul className="mt-8 flex flex-col gap-3">
                        {part.sections.map((section) => (
                          <li key={section.id}>
                            <Link
                              href={buildCommonSpaceHref(part.id, section.id)}
                              className={`${baseChildClass} ${
                                activeSectionId === section.id
                                  ? activeChildClass
                                  : "border-transparent text-gray-4 font-normal"
                              }`}
                            >
                              -{section.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        <main className="text-white-1">
          <section className="flex items-center gap-4 pt-25.5 pb-21 text-[48px] font-semibold text-white-1">
            {pageTitle}
            <Image
              src={activePart.iconSrc}
              alt={activePart.iconAlt}
              width={53}
              height={53}
              className="z-10 h-[53px] w-[53px]"
            />
          </section>
          {activeSectionId === "notices" && activeNoticeId ? (
            <NoticeDetailSection partId={activePart.id} noticeId={activeNoticeId} />
          ) : activeSectionId === "materials" && activeMaterialId ? (
            <MaterialDetailSection
              partId={activePart.id}
              materialId={activeMaterialId}
            />
          ) : activeSectionId === "notices" ? (
            <NoticeSection partId={activePart.id} />
          ) : activeSectionId === "materials" ? (
            <MaterialSection partId={activePart.id} />
          ) : activeSectionId === "assignments" ? (
            <AssignmentSection partId={activePart.id} />
          ) : activeSection ? (
            <CommonSpaceDetailSection
              part={activePart}
              section={activeSection}
            />
          ) : (
            <HomeSection />
          )}
        </main>

        <div className="hidden lg:block" aria-hidden="true" />
      </div>
    </div>
  );
}
