"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAdminUserDetail } from "../api";
import type { AdminUserDetail } from "../type";

type UserDetailDummyPageProps = {
  loginId: string;
};

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-2 border-t border-[#3a3d45] px-4 py-3 text-sm">
      <dt className="text-gray-4">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default function UserDetailDummyPage({ loginId }: UserDetailDummyPageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState<AdminUserDetail | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setIsLoading(true);
      setError("");
      setUser(null);

      try {
        const response = await getAdminUserDetail(loginId);
        if (!mounted) return;
        setUser(response.user);
      } catch {
        if (!mounted) return;
        setError("유저 상세 정보를 불러오지 못했습니다. 권한 또는 loginId를 확인해 주세요.");
      } finally {
        if (!mounted) return;
        setIsLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [loginId]);

  return (
    <section className="bg-background px-4 py-10 text-white lg:px-8 lg:py-14">
      <div className="mx-auto max-w-[900px]">
        <div className="flex items-center justify-between">
          <h1 className="text-[34px] font-bold tracking-[-0.02em]">User Detail</h1>
          <Link
            href="/admin/users"
            className="rounded-lg bg-main-1 px-5 py-2.5 text-sm font-semibold"
          >
            Back to Users
          </Link>
        </div>

        <div className="mt-2 text-sm text-gray-4">Connected to `/api/admin/users/{'{loginId}'}`.</div>

        {isLoading && (
          <div className="mt-6 rounded-2xl border border-[#3a3d45] bg-[#2d3037] px-4 py-10 text-center text-gray-3">
            Loading user detail...
          </div>
        )}

        {!isLoading && error && (
          <div className="mt-6 rounded-2xl border border-[#3a3d45] bg-[#2d3037] px-4 py-10 text-center text-[#ff9ea8]">
            {error}
          </div>
        )}

        {!isLoading && !error && user && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-[#3a3d45] bg-[#2d3037]">
            <dl>
              <Row label="loginId" value={user.loginId} />
              <Row label="name" value={user.name} />
              <Row label="department" value={user.department} />
              <Row label="studentNo" value={user.studentNo} />
              <Row label="grade" value={user.grade} />
              <Row label="enrollmentStatus" value={user.enrollmentStatus} />
              <Row label="birthDate" value={user.birthDate} />
              <Row label="phone" value={user.phone} />
              <Row label="withdrawalStatus" value={user.withdrawalStatus} />
              <Row label="email" value={user.email} />
              <Row label="generation" value={user.generation} />
              <Row label="level" value={user.level} />
              <Row label="track" value={user.track} />
              <Row label="position" value={user.position} />
            </dl>
          </div>
        )}
      </div>
    </section>
  );
}
