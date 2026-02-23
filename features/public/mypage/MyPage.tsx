"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MOCK_AUTH_STATUS, MOCK_USER } from "./mock";
import ProfileSection from "./sections/ProfileSection";
import EditSection from "./sections/EditSection";
import HistorySection from "./sections/HistorySection";
import type { MyPageSection } from "./types";

export default function MyPage() {
  const router = useRouter();
  const [currentSection, setCurrentSection] =
    useState<MyPageSection>("profile");

  useEffect(() => {
    if (MOCK_AUTH_STATUS === "unauthenticated") {
      router.replace("/auth");
    }
  }, [router]);

  if (MOCK_AUTH_STATUS === "unauthenticated") {
    return null;
  }

  const renderCurrentSection = () => {
    if (currentSection === "edit") {
      return (
        <EditSection
          user={MOCK_USER}
          onBack={() => setCurrentSection("profile")}
        />
      );
    }

    if (currentSection === "history") {
      return (
        <HistorySection
          user={MOCK_USER}
          onBack={() => setCurrentSection("profile")}
        />
      );
    }

    return (
      <ProfileSection
        user={MOCK_USER}
        onNavigate={setCurrentSection}
        onLogout={() => router.replace("/auth")}
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
