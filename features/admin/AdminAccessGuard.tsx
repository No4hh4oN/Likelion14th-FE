"use client";

import { getMyInfo } from "@/features/public/api";
import { getAccessToken } from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { canAccessAdmin } from "./permissions";

type AdminAccessGuardProps = {
  children: ReactNode;
};

/**
 * 로그인 상태와 admin 접근 권한을 확인한 뒤 admin 하위 화면을 렌더링합니다.
 */
export default function AdminAccessGuard({ children }: AdminAccessGuardProps) {
  const router = useRouter();
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const verifyAccess = async () => {
      const accessToken = getAccessToken();

      if (!accessToken) {
        router.replace("/auth");
        return;
      }

      try {
        const profile = await getMyInfo();

        if (!canAccessAdmin(profile)) {
          router.replace("/");
          return;
        }

        if (isMounted) {
          setIsAllowed(true);
        }
      } catch {
        router.replace("/auth");
      }
    };

    verifyAccess();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (!isAllowed) {
    return (
      <section className="min-h-[calc(100dvh-4rem)] bg-background px-4 py-16 text-white-1">
        <div className="mx-auto w-full max-w-[720px] rounded-[10px] border border-white/10 bg-[#2E313A]/95 p-6 text-center text-[14px] text-white/80">
          운영진 권한을 확인하는 중입니다.
        </div>
      </section>
    );
  }

  return <>{children}</>;
}
