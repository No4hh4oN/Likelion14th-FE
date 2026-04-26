"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Login from "@/components/layout/Login";
import UserInfo from "@/components/layout/UserInfo";
import { getMyInfo } from "@/features/public/api";
import { canAccessAdmin } from "@/features/admin/permissions";
import { getActiveRecruitment } from "@/features/public/home/api";
import type { MeResponse } from "@/features/public/type";
import type { ActiveRecruitmentResponse } from "@/features/public/home/types";
import { isDocumentOpenPhase } from "@/features/public/recruitmentPhase";
import { AUTH_CHANGED_EVENT } from "@/lib/axios";

const kstDateTimePattern = /(Z|[+-]\d{2}:\d{2})$/;

const parseKstDateTime = (value: string) => {
  const normalized = kstDateTimePattern.test(value) ? value : `${value}+09:00`;
  return Date.parse(normalized);
};

function calculateDday(endAt: string) {
  const now = Date.now();
  const end = parseKstDateTime(endAt);
  const diffMs = end - now;
  const remainDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return remainDays - 1;
}

function formatRemainingTime(diffMs: number) {
  const totalSeconds = Math.max(Math.floor(diffMs / 1000), 0);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

function isUrgentDeadline(endAt: string) {
  const diffMs = parseKstDateTime(endAt) - Date.now();
  return diffMs > 0 && diffMs <= 1000 * 60 * 60;
}

function formatDDayLabel(endAt: string) {
  const now = Date.now();
  const end = parseKstDateTime(endAt);
  const diffMs = end - now;

  if (diffMs <= 0) {
    return "마감";
  }

  if (diffMs <= 1000 * 60 * 60 * 24) {
    return formatRemainingTime(diffMs);
  }

  const remainDays = calculateDday(endAt);

  if (remainDays > 0) {
    return `D-${remainDays}`;
  }

  if (remainDays === 0) {
    return "D-day";
  }

  return "마감";
}

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [me, setMe] = useState<MeResponse | null>(null);
  const [ddayText, setDdayText] = useState("D-00");
  const [isDocOpen, setIsDocOpen] = useState(false);
  const [activeEndAt, setActiveEndAt] = useState<string | null>(null);
  const [isDeadlineUrgent, setIsDeadlineUrgent] = useState(false);
  const isFaqPage = pathname.startsWith("/14/faq");

  const checkAuth = useCallback(async () => {
    try {
      const response = await getMyInfo();
      setMe(response);
    } catch {
      setMe(null);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void checkAuth();
    });
  }, [checkAuth]);

  useEffect(() => {
    const handleAuthChanged = () => {
      checkAuth();
    };

    window.addEventListener(AUTH_CHANGED_EVENT, handleAuthChanged);
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, handleAuthChanged);
    };
  }, [checkAuth]);

  useEffect(() => {
    if (isMenuOpen) {
      queueMicrotask(() => {
        void checkAuth();
      });
    }
  }, [isMenuOpen, checkAuth]);

  useEffect(() => {
    let isMounted = true;

    const fetchActiveRecruitment = async () => {
      try {
        const response: ActiveRecruitmentResponse | null =
          await getActiveRecruitment();

        if (!isMounted) {
          return;
        }

        if (isDocumentOpenPhase(response?.phaseType)) {
          setDdayText(formatDDayLabel(response.endAt));
          setIsDocOpen(true);
          setActiveEndAt(response.endAt);
          setIsDeadlineUrgent(isUrgentDeadline(response.endAt));
          return;
        }

        setIsDocOpen(false);
        setActiveEndAt(null);
        setIsDeadlineUrgent(false);
      } catch {
        if (isMounted) {
          setIsDocOpen(false);
          setActiveEndAt(null);
          setIsDeadlineUrgent(false);
        }
      }
    };

    void fetchActiveRecruitment();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!activeEndAt) {
      return;
    }

    const timerId = window.setInterval(() => {
      setDdayText(formatDDayLabel(activeEndAt));
      setIsDeadlineUrgent(isUrgentDeadline(activeEndAt));
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [activeEndAt]);

  const activeRole = me?.roles.find((role) => role.active) ?? me?.roles[0];
  const canUseAdminPage = me ? canAccessAdmin(me) : false;

  const authSection = me ? (
    <UserInfo
      name={me.homepage.name}
      profileImageUrl={
        me.homepage.profileImage?.url ??
        me.homepage.profileImageUrl ??
        undefined
      }
      generation={activeRole?.generation}
      role={activeRole?.level}
      track={activeRole?.track}
      canAccessAdmin={canUseAdminPage}
      onLoggedOut={() => setMe(null)}
    />
  ) : (
    <Login />
  );

  return (
    <>
      <header className="fixed top-0 z-40 w-full bg-[#262529] print:hidden">
        <div className="mx-auto flex h-16 w-full max-w-[1168px] items-center justify-between px-4">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/Logo.webp"
              alt="LIKELION 14TH"
              width={139}
              height={30}
              priority
            />
          </Link>

          <div className="flex items-center gap-3 lg:gap-8">
            {isDocOpen ? (
              <>
                <p
                  className={`whitespace-nowrap text-[12px] font-medium text-white-1 sm:text-[14px] ${
                    isFaqPage ? "block" : "hidden md:block"
                  }`}
                >
                  지원 마감까지{" "}
                  <span
                    className={`font-bold ${
                      isDeadlineUrgent ? "text-[#FF5A5A]" : "text-main-3"
                    }`}
                  >
                    {ddayText}
                  </span>
                </p>
                <Link
                  href="/14/apply"
                  className="hidden md:inline-flex items-center rounded-full bg-white-1 px-4 py-2.5 text-[14px] font-bold text-main-1 hover:bg-main-1 hover:text-white-1"
                >
                  아기사자 지원하기
                </Link>
              </>
            ) : null}
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-none cursor-pointer"
            >
              <span className="sr-only">Open menu</span>
              <Image
                src="/images/hamburgerIcon.webp"
                alt=""
                width={49}
                height={49}
                priority
              />
            </button>
          </div>
        </div>
      </header>

      <div className="print:hidden">
        <Sidebar
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          authSection={authSection}
        />
      </div>
    </>
  );
}

