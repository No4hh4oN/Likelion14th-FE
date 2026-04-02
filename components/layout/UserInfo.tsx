"use client";

import Link from "next/link";
import { useState } from "react";
import { logout } from "@/features/public/api";

type UserInfoProps = {
  name: string;
  profileImageUrl?: string;
  generation?: number | null;
  role?: string;
  track?: string;
  onLoggedOut?: () => void;
};

function getRoleLabel(role?: string): string {
  if (!role) {
    return "게스트";
  }

  switch (role) {
    case "STAFF":
      return "운영진";
    case "BABY_LION":
      return "아기사자";
    case "OUTSIDER":
      return "게스트";
    default:
      return role;
  }
}

export default function UserInfo({
  name,
  profileImageUrl,
  generation,
  role,
  track,
  onLoggedOut,
}: UserInfoProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const roleLabel = getRoleLabel(role);
  const hasGeneration =
    typeof generation === "number" && Number.isFinite(generation);
  const generationRoleText = hasGeneration
    ? `${generation}기 ${roleLabel}`
    : roleLabel;
  const trackText = track ?? "";
  const isStaff = role === "STAFF";
  const myPageHref = "/14/mypage";
  const rolePageLabel = isStaff ? "운영진 페이지" : "아기사자 페이지";
  const rolePageHref = isStaff ? "/admin" : "/14/commonSpace";

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await logout();
      onLoggedOut?.();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <div className="md:hidden">
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="mb-2 text-xs text-gray-4 disabled:opacity-60"
        >
          {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
        </button>

        <div className="rounded-xl bg-[#4b5162] p-3">
          <div className="flex flex-col items-center text-center">
            {profileImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profileImageUrl}
                alt={`${name} 프로필 이미지`}
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-gray-400" />
            )}
            <div className="mt-2">
              <p className="text-2xl font-bold text-white">
                {name}
                <span className="text-xl font-medium">님</span>
              </p>
              <p className="text-xs text-gray-4">{generationRoleText}</p>
            </div>
            {trackText ? (
              <span className="mt-2 rounded-4xl border border-gray-2 px-2.5 py-0.5 text-xs text-gray-1">
                {trackText}
              </span>
            ) : null}
          </div>
          <div className="mt-4 flex w-full flex-col gap-3">
            <Link
              href={myPageHref}
              className="inline-flex h-10 w-full items-center justify-center rounded-md bg-[#959aaa] text-sm text-white"
            >
              마이 페이지
            </Link>
            <Link
              href={rolePageHref}
              className="inline-flex h-10 w-full items-center justify-center rounded-md bg-[#959aaa] text-sm text-white"
            >
              {rolePageLabel}
            </Link>
          </div>
        </div>
      </div>

      <div className="hidden md:block">
        <div className="rounded-md bg-gray-6 px-3.5 pb-3.5 pt-7">
          <div className="flex items-start justify-start px-3.5">
            {profileImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profileImageUrl}
                alt={`${name} 프로필 이미지`}
                className="ml-3.5 h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <div className="ml-3.5 h-20 w-20 rounded-full bg-amber-300" />
            )}
            <div className="ml-5 self-center">
              <p className="text-2xl font-bold text-white">
                {name}
                <span className="text-xl font-medium">님</span>
              </p>
              <p className="text-xs text-gray-4">{generationRoleText}</p>
            </div>
            {trackText ? (
              <span className="ml-7 rounded-4xl border bg-transparent px-2 py-1 text-sm text-gray-1">
                {trackText}
              </span>
            ) : null}
          </div>
          <div className="mt-4 flex w-full justify-center gap-4">
            <Link
              href={myPageHref}
              className="inline-flex h-12 w-full items-center justify-center rounded-md bg-gray-5"
            >
              마이페이지
            </Link>
            <Link
              href={rolePageHref}
              className="inline-flex h-12 w-full items-center justify-center rounded-md bg-gray-5"
            >
              {rolePageLabel}
            </Link>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="mt-2 flex w-full justify-end text-sm text-gray-3 disabled:opacity-60"
        >
          {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
        </button>
      </div>
    </>
  );
}
