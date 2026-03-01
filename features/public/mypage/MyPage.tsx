"use client";

import { getAccessToken } from "@/lib/axios";
import { logout } from "@/features/public/api";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMyProfile } from "./api";
import ProfileSection from "./sections/ProfileSection";
import EditSection from "./sections/EditSection";
import HistorySection from "./sections/HistorySection";
import type { MyPageSection, MyPageUser, MyPageUserApiResponse } from "./types";

const DEFAULT_MY_PAGE_USER: MyPageUser = {
  name: "사용자",
  major: "-",
  generation: "학번 미등록",
  role: "게스트",
  track: null,
  profileImageUrl: null,
};

function mapRoleLevelToUserRole(
  level: string | undefined,
  fallbackRole: MyPageUser["role"],
): MyPageUser["role"] {
  if (level === "STAFF") {
    return "운영진" as MyPageUser["role"];
  }

  if (level === "BABY_LION") {
    return "아기사자" as MyPageUser["role"];
  }

  if (level === "OUTSIDER") {
    return "게스트" as MyPageUser["role"];
  }

  return fallbackRole;
}

function mapTrackToUserTrack(
  track: string | undefined,
  fallbackTrack: MyPageUser["track"],
): MyPageUser["track"] {
  if (
    track === "FRONTEND" ||
    track === "BACKEND" ||
    track === "AI_ML" ||
    track === "PM_DESIGN" ||
    track === "ETC"
  ) {
    return track;
  }

  return fallbackTrack;
}

function toStudentNoGeneration(
  studentNo: string | undefined,
  fallbackGeneration: string,
): string {
  const normalized = (studentNo ?? "").trim();

  //studentNo가 4~10자리 숫자인지 확인
  if (!/^\d{4,10}$/.test(normalized)) {
    return fallbackGeneration;
  }

  //앞자리 4개 slice후 19xx/20xx 패턴인지 확인
  const admissionYear = normalized.slice(0, 4);
  if (!/^(19|20)\d{2}$/.test(admissionYear)) {
    return fallbackGeneration;
  }

  return `${admissionYear.slice(2)}학번`;
}
function mapProfileToMyPageUser(profile: MyPageUserApiResponse): MyPageUser {
  const activeRole =
    profile.roles.find((role) => role.active) ?? profile.roles[0];
  const generation = toStudentNoGeneration(
    profile.homepage.studentNo,
    DEFAULT_MY_PAGE_USER.generation,
  );

  return {
    name:
      profile.homepage.name ||
      profile.sso.loginId ||
      DEFAULT_MY_PAGE_USER.name,
    major: profile.homepage.department || DEFAULT_MY_PAGE_USER.major,
    generation,
    role: mapRoleLevelToUserRole(activeRole?.level, DEFAULT_MY_PAGE_USER.role),
    track: mapTrackToUserTrack(activeRole?.track, DEFAULT_MY_PAGE_USER.track),
    profileImageUrl: profile.homepage.profileImage?.url ?? null,
  };
}

export default function MyPage() {
  const router = useRouter();
  const [currentSection, setCurrentSection] =
    useState<MyPageSection>("profile");
  const [user, setUser] = useState<MyPageUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const accessToken = getAccessToken();

    if (!accessToken) {
      if (isMounted) {
        setIsAuthenticated(false);
        setIsProfileLoading(false);
      }
      router.replace("/auth");

      return () => {
        isMounted = false;
      };
    }

    setIsAuthenticated(true);

    const fetchMyProfile = async () => {
      setIsProfileLoading(true);

      try {
        const response = await getMyProfile();
        if (!isMounted) {
          return;
        }
        setUser(mapProfileToMyPageUser(response));
      } catch {
        if (!isMounted) {
          return;
        }
        setIsAuthenticated(false);
        setUser(null);
        router.replace("/auth");
      } finally {
        if (isMounted) {
          setIsProfileLoading(false);
        }
      }
    };

    fetchMyProfile();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (isAuthenticated === false) {
    return null;
  }

  if (isProfileLoading) {
    return (
      <div className="flex flex-col gap-[61px] mt-[110px] leading-[1.27] text-white-1 lg:mt-[137px]">
        <h1 className="text-center text-[22px] font-bold lg:text-[40px]">
          My Page
        </h1>
        <section className="min-h-screen bg-background px-4 text-white-1 lg:px-6">
          <div className="mx-auto w-full max-w-[760px] rounded-[10px] bg-gray-7 p-6 text-center text-[14px] text-white/80">
            내 정보를 불러오는 중입니다.
          </div>
        </section>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await logout();
    } catch {
      // Keep redirect behavior even when logout API fails.
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      setIsLoggingOut(false);
      router.replace("/auth");
    }
  };

  const renderCurrentSection = () => {
    if (currentSection === "edit") {
      return (
        <EditSection user={user} onBack={() => setCurrentSection("profile")} />
      );
    }

    if (currentSection === "history") {
      return (
        <HistorySection
          user={user}
          onBack={() => setCurrentSection("profile")}
        />
      );
    }

    return (
      <ProfileSection
        user={user}
        onNavigate={setCurrentSection}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
      />
    );
  };

  return (
    <div className="flex flex-col gap-[61px] mt-[110px] leading-[1.27] text-white-1 lg:mt-[137px]">
      <h1 className="text-center text-[22px] font-bold lg:text-[40px]">
        My Page
      </h1>
      {renderCurrentSection()}
    </div>
  );
}
