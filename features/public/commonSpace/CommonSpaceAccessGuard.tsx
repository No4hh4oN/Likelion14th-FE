"use client";

import { getMyProfile } from "@/features/public/mypage/api";
import { getAccessToken } from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

type CommonSpaceAccessGuardProps = {
  children: ReactNode;
};

const COMMON_SPACE_ALLOWED_LEVELS = new Set([
  "STAFF",
  "ADMIN",
  "ROLE_STAFF",
  "ROLE_ADMIN",
  "BABY_LION",
  "BABYLION",
  "ROLE_BABY_LION",
]);

function isCommonSpaceAllowed(level?: string) {
  const normalizedLevel = level?.trim().toUpperCase();

  if (!normalizedLevel) {
    return false;
  }

  return COMMON_SPACE_ALLOWED_LEVELS.has(normalizedLevel);
}

export default function CommonSpaceAccessGuard({
  children,
}: CommonSpaceAccessGuardProps) {
  const router = useRouter();
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function verifyAccess() {
      const accessToken = getAccessToken();

      if (!accessToken) {
        router.replace("/auth");
        return;
      }

      try {
        const profile = await getMyProfile();
        const activeRole =
          profile.roles.find((role) => role.active) ?? profile.roles[0];

        if (!isCommonSpaceAllowed(activeRole?.level)) {
          window.alert("아기사자 등급만 접근 가능합니다.");
          router.replace("/");
          return;
        }

        if (isMounted) {
          setIsAllowed(true);
        }
      } catch {
        router.replace("/auth");
      }
    }

    verifyAccess();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (!isAllowed) {
    return (
      <section className="min-h-[calc(100dvh-4rem)] bg-background px-4 py-16 text-white-1">
        <div className="mx-auto w-full max-w-[720px] rounded-[10px] border border-white/10 bg-[#2E313A]/95 p-6 text-center text-[14px] text-white/80">
          공통 공간 접근 권한을 확인하는 중입니다.
        </div>
      </section>
    );
  }

  return <>{children}</>;
}
