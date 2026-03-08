"use client";

import { useState } from "react";
import type { MyPageSection, MyPageTab, MyPageUser, UserRole } from "../types";
import ActionButton from "../components/ActionButton";
import MyActivityTab from "./MyActivityTab";

type ProfileSectionProps = {
  user: MyPageUser;
  onNavigate: (section: MyPageSection) => void;
  onLogout: () => void;
  isLoggingOut: boolean;
};

function getRoleChipClassName(role: UserRole) {
  if (role === "운영진") {
    return "border border-main-3/40 bg-main-3/20 text-main-3";
  }

  if (role === "아기사자") {
    return "border border-[#82A7FF]/40 bg-[#82A7FF]/20 text-[#82A7FF]";
  }

  return "border border-white/20 bg-white/10 text-white/80";
}

function getGuestActivityMessage() {
  return {
    title: "기본 계정 정보만 확인할 수 있습니다.",
    description: "아기사자 선발 후 추가 정보 메뉴가 열립니다.",
  };
}

function getTaskTabMessage(role: UserRole) {
  if (role === "운영진") {
    return {
      title: "운영진 전용 페이지 준비 중입니다.",
      description: "운영 기능은 인증/권한 API 연동 이후 제공됩니다.",
    };
  }

  if (role === "게스트") {
    return {
      title: "아기사자 권한이 없습니다.",
      description: "아기사자만 열람 가능합니다.",
    };
  }

  return {
    title: "과제 내역이 아직 없습니다.",
    description: "과제를 제출하면 이 영역에서 확인할 수 있습니다.",
  };
}

export default function ProfileSection({
  user,
  onNavigate,
  onLogout,
  isLoggingOut,
}: ProfileSectionProps) {
  const [activeTab, setActiveTab] = useState<MyPageTab>("내 활동");
  const isGuest = user.role === "게스트";
  const shouldShowActivityContent = activeTab === "내 활동" && !isGuest;
  const message =
    activeTab === "내 활동"
      ? getGuestActivityMessage()
      : getTaskTabMessage(user.role);

  return (
    <section className="min-h-screen bg-background px-4 text-white-1 lg:px-6">
      <div
        className={`relative mx-auto w-full ${
          shouldShowActivityContent ? "max-w-[980px]" : "max-w-[760px]"
        }`}
      >
        <ActionButton
          text={isLoggingOut ? "로그아웃 중..." : "로그아웃"}
          onClick={onLogout}
          disabled={isLoggingOut}
          className="absolute top-[-46px] right-[18px] text-[11px] lg:min-w-[86px]"
          hoverClassName="hover:bg-gray-5"
        />
        <div className="rounded-[10px] bg-gray-7 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.28)] lg:p-8.5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-center gap-4 lg:gap-8 leading-[1.27]">
              <div className="h-16 w-16 overflow-hidden rounded-full bg-[radial-gradient(circle_at_30%_25%,#D8DEF2_0%,#9AA8D2_54%,#6B74A3_100%)] lg:h-36.75 lg:w-36.75">
                {user.profileImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.profileImageUrl}
                    alt={`${user.name} 프로필 이미지`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[24px] font-bold text-[#2F3648] lg:text-[30px]">
                    {user.name.slice(0, 1) || "M"}
                  </div>
                )}
              </div>

              <div>
                <p className="text-[16px] font-medium lg:text-[28px]">
                  <span className="text-[24px] lg:text-[36px] font-semibold">
                    {user.name}
                  </span>{" "}
                  님
                </p>
                <p className="mt-2 lg:mt-5 text-[12px] font-light text-white-1 lg:text-[20px]">
                  {user.major} {user.generation}
                </p>
                <span
                  className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium lg:text-[12px] ${getRoleChipClassName(
                    user.role,
                  )}`}
                >
                  {user.role}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 lg:gap-3 lg:grid-cols-1 lg:justify-items-end">
              <ActionButton
                text="정보 수정"
                onClick={() => onNavigate("edit")}
                className="text-[11px] lg:min-w-[86px]"
                hoverClassName="hover:bg-gray-5"
              />
              <ActionButton
                text="지원 내역"
                onClick={() => onNavigate("history")}
                className="text-[11px] lg:min-w-[86px]"
                hoverClassName="hover:bg-gray-5"
              />
            </div>
          </div>

          <div className="mt-5 border-b border-white/15">
            <div className="flex">
              {(["내 활동", "과제"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`relative min-w-[84px] px-3 pb-2 pt-1 text-[13px] font-medium transition-colors lg:min-w-[90px] lg:text-[14px] ${
                    activeTab === tab ? "text-main-1" : "text-white/35"
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <span className="absolute inset-x-0 bottom-[-1px] h-[2px] bg-main-1" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {shouldShowActivityContent ? <MyActivityTab user={user} /> : null}

          {!shouldShowActivityContent ? (
            <div className="flex min-h-[150px] flex-col items-center justify-center px-2 text-center lg:min-h-[170px]">
              <p className="text-[14px] font-semibold text-white lg:text-[16px]">
                {message.title}
              </p>
              <p className="mt-1.5 text-[12px] text-white/35 lg:text-[13px]">
                {message.description}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
