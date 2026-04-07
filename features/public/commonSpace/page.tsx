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
  resolveCommonSpaceAssignmentId,
  resolveCommonSpaceMaterialId,
  resolveCommonSpaceNoticeId,
  resolveCommonSpacePartId,
  resolveCommonSpaceQnaId,
  resolveCommonSpaceQnaMode,
  resolveCommonSpaceSectionId,
} from "./config";
import HomeSection from "./sections/HomeSection";
import AssignmentSection from "./sections/AssignmentSection";
import AssignmentDetailSection from "./sections/AssignmentDetailSection";
import MaterialDetailSection from "./sections/MaterialDetailSection";
import MaterialSection from "./sections/MaterialSection";
import NoticeDetailSection from "./sections/NoticeDetailSection";
import NoticeSection from "./sections/NoticeSection";
import QnaDetailSection from "./sections/QnaDetailSection";
import QnaSection from "./sections/QnaSection";
import QnaWriteSection from "./sections/QnaWriteSection";

export default function CommonSpacePage() {
  const searchParams = useSearchParams();
  const activePartId = resolveCommonSpacePartId(searchParams.get("part"));
  const activePart = getCommonSpacePart(activePartId);
  const activeSectionId = resolveCommonSpaceSectionId(
    activePart,
    searchParams.get("section"),
  );
  const activeNoticeId = resolveCommonSpaceNoticeId(
    searchParams.get("noticeId"),
  );
  const activeAssignmentId = resolveCommonSpaceAssignmentId(
    searchParams.get("assignmentId"),
  );
  const activeMaterialId = resolveCommonSpaceMaterialId(
    searchParams.get("materialId"),
  );
  const activeQnaId = resolveCommonSpaceQnaId(searchParams.get("qnaId"));
  const activeQnaMode = resolveCommonSpaceQnaMode(searchParams.get("qnaMode"));
  const activeSection = getCommonSpaceSection(activePart, activeSectionId);
  const pageTitle = getCommonSpaceHeading(activePart);

  const baseItemClass =
    "flex items-center justify-between gap-3 border-l-4 pl-3 text-lg transition-all hover:text-white-1 hover:font-bold xl:text-[22px]";
  const activeItemClass = "border-main-1 text-white-1 font-bold";
  const baseChildClass =
    "block border-l-4 pl-4 text-base transition-all hover:border-main-3 hover:text-white-1 xl:text-[17px]";
  const activeChildClass = "text-white-1 font-bold border-l-4 border-main-3";
  const getSectionNavLabel = (partId: string, sectionId: string, label: string) =>
    sectionId === "notices" ? (partId === "all" ? label : "트랙 공지") : label;

  return (
    <div className="mx-auto w-full max-w-[1160px] px-4 pt-8 leading-[1.27] sm:px-6 sm:pt-10 lg:px-8 lg:pt-12 xl:px-0 xl:pt-14">
      <div className="lg:hidden">
        <nav aria-label="공통 공간 카테고리">
          <div className="-mx-4 overflow-x-auto px-4 pb-3 mt-8 sm:-mx-6 sm:px-6">
            <ul className="flex min-w-max gap-2.5">
              {COMMON_SPACE_PARTS.map((part) => {
                const isActivePart = activePart.id === part.id;

                return (
                  <li key={part.id}>
                    <Link
                      href={buildCommonSpaceHref(part.id)}
                      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                        isActivePart
                          ? "border-main-1 bg-main-1 text-white-1"
                          : "border-gray-6 bg-gray-7 text-gray-3"
                      }`}
                      aria-current={isActivePart ? "page" : undefined}
                    >
                      <span>{part.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {activePart.sections.length > 0 ? (
            <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
              <ul className="flex min-w-max gap-2">
                {activePart.sections.map((section) => (
                  <li key={section.id}>
                    <Link
                      href={buildCommonSpaceHref(activePart.id, section.id)}
                      className={`flex items-center rounded-full px-3.5 py-2 text-sm transition-colors ${
                        activeSectionId === section.id
                          ? "bg-[#334EBE] text-white-1"
                          : "bg-[#2c2f38] text-gray-3"
                      }`}
                    >
                      {getSectionNavLabel(
                        activePart.id,
                        section.id,
                        section.label,
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </nav>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[150px_minmax(0,1fr)] xl:grid-cols-[150px_minmax(0,1fr)_72px] xl:gap-7">
        <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start lg:pt-32">
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
                              -
                              {getSectionNavLabel(
                                part.id,
                                section.id,
                                section.label,
                              )}
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

        <main className="min-w-0 text-white-1">
          <section className="flex items-center gap-3 pb-8 pt-3 text-[30px] font-semibold text-white-1 sm:gap-4 sm:pb-12 sm:pt-6 sm:text-[38px] lg:pb-16 lg:pt-14 lg:text-[42px] xl:pb-18 xl:pt-20 xl:text-[46px]">
            {pageTitle}
            <Image
              src={activePart.iconSrc}
              alt={activePart.iconAlt}
              width={53}
              height={53}
              className="z-10 h-9 w-9 sm:h-11 sm:w-11 lg:h-12 lg:w-12 xl:h-[53px] xl:w-[53px]"
            />
          </section>
          {activeSectionId === "notices" && activeNoticeId ? (
            <NoticeDetailSection
              partId={activePart.id}
              noticeId={activeNoticeId}
            />
          ) : activeSectionId === "assignments" && activeAssignmentId ? (
            <AssignmentDetailSection
              partId={activePart.id}
              assignmentId={activeAssignmentId}
            />
          ) : activeSectionId === "materials" && activeMaterialId ? (
            <MaterialDetailSection
              partId={activePart.id}
              materialId={activeMaterialId}
            />
          ) : activeSectionId === "qna" && activeQnaMode === "write" ? (
            <QnaWriteSection partId={activePart.id} />
          ) : activeSectionId === "qna" && activeQnaId ? (
            <QnaDetailSection partId={activePart.id} qnaId={activeQnaId} />
          ) : activeSectionId === "notices" ? (
            <NoticeSection partId={activePart.id} />
          ) : activeSectionId === "materials" ? (
            <MaterialSection partId={activePart.id} />
          ) : activeSectionId === "assignments" ? (
            <AssignmentSection partId={activePart.id} />
          ) : activeSectionId === "qna" ? (
            <QnaSection partId={activePart.id} />
          ) : activeSection ? (
            <CommonSpaceDetailSection
              part={activePart}
              section={activeSection}
            />
          ) : (
            <HomeSection partId={activePart.id} />
          )}
        </main>

        <div className="hidden xl:block" aria-hidden="true" />
      </div>
    </div>
  );
}
