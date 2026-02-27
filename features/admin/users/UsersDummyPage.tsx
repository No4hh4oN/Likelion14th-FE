"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAdminUserDetail, getAdminUsers } from "../api";
import type { AdminUserDetail, AdminUserListItem } from "../type";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function DetailRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="grid grid-cols-[150px_1fr] gap-2 border-t border-[#3a3d45] px-4 py-3 text-sm">
      <dt className="text-gray-4">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default function UsersDummyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const [selectedLoginId, setSelectedLoginId] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [detailCache, setDetailCache] = useState<Record<string, AdminUserDetail>>({});

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await getAdminUsers();
        if (!mounted) return;
        setUsers(response.users);
        setTotalCount(response.totalCount);
      } catch {
        if (!mounted) return;
        setError("유저 목록을 불러오지 못했습니다. 로그인 상태와 관리자 권한을 확인해 주세요.");
      } finally {
        if (!mounted) return;
        setIsLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const loginIdFromQuery = searchParams.get("loginId");
    if (!loginIdFromQuery) {
      setSelectedLoginId(null);
      setDetailError("");
      return;
    }
    setSelectedLoginId(loginIdFromQuery);
  }, [searchParams]);

  useEffect(() => {
    if (!selectedLoginId) return;
    if (detailCache[selectedLoginId]) return;

    let mounted = true;
    const loadDetail = async () => {
      setDetailLoading(true);
      setDetailError("");
      try {
        const response = await getAdminUserDetail(selectedLoginId);
        if (!mounted) return;
        setDetailCache((prev) => ({
          ...prev,
          [selectedLoginId]: response.user,
        }));
      } catch {
        if (!mounted) return;
        setDetailError("유저 상세 정보를 불러오지 못했습니다.");
      } finally {
        if (!mounted) return;
        setDetailLoading(false);
      }
    };

    void loadDetail();
    return () => {
      mounted = false;
    };
  }, [selectedLoginId, detailCache]);

  const safeCount = useMemo(() => {
    if (totalCount > 0) return totalCount;
    return users.length;
  }, [totalCount, users.length]);

  const selectedDetail = selectedLoginId ? detailCache[selectedLoginId] : null;

  const handleSelect = (loginId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("loginId", loginId);
    router.replace(`/admin/users?${params.toString()}`, { scroll: false });
  };

  const handleCloseViewer = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("loginId");
    const query = params.toString();
    router.replace(query ? `/admin/users?${query}` : "/admin/users", {
      scroll: false,
    });
  };

  return (
    <section className="bg-background px-4 py-10 text-white lg:px-8 lg:py-14">
      <div className="mx-auto max-w-[1400px]">
        <h1 className="text-[34px] font-bold tracking-[-0.02em]">Users</h1>
        <p className="mt-2 text-sm text-gray-4">Connected to `/api/admin/users`.</p>

        <div className={`mt-6 grid gap-4 ${selectedLoginId ? "lg:grid-cols-[1fr_1fr]" : ""}`}>
          <div className="overflow-hidden rounded-2xl border border-[#3a3d45] bg-[#2d3037]">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-[#26282d] text-gray-4">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Profile</th>
                    <th className="px-4 py-3 font-semibold">Login ID</th>
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Department</th>
                    <th className="px-4 py-3 font-semibold">Student No</th>
                    <th className="px-4 py-3 font-semibold">Level</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading && (
                    <tr className="border-t border-[#3a3d45]">
                      <td colSpan={6} className="px-4 py-10 text-center text-gray-3">
                        Loading users...
                      </td>
                    </tr>
                  )}

                  {!isLoading && error && (
                    <tr className="border-t border-[#3a3d45]">
                      <td colSpan={6} className="px-4 py-10 text-center text-[#ff9ea8]">
                        {error}
                      </td>
                    </tr>
                  )}

                  {!isLoading && !error && users.length === 0 && (
                    <tr className="border-t border-[#3a3d45]">
                      <td colSpan={6} className="px-4 py-10 text-center text-gray-3">
                        조회된 유저가 없습니다.
                      </td>
                    </tr>
                  )}

                  {!isLoading &&
                    !error &&
                    users.map((user) => (
                      <tr
                        key={user.loginId}
                        className={`border-t border-[#3a3d45] transition-colors ${
                          selectedLoginId === user.loginId ? "bg-[#3a404d]" : "hover:bg-[#333844]"
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3b4a66] text-xs font-semibold tracking-wide"
                            style={
                              user.profileImageUrl
                                ? {
                                    backgroundImage: `url(${user.profileImageUrl})`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                  }
                                : undefined
                            }
                          >
                            {!user.profileImageUrl ? getInitials(user.name) : ""}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => handleSelect(user.loginId)}
                            className="underline decoration-[#7f889b] underline-offset-4"
                          >
                            {user.loginId}
                          </button>
                        </td>
                        <td className="px-4 py-3">{user.name}</td>
                        <td className="px-4 py-3">{user.department}</td>
                        <td className="px-4 py-3">{user.studentNo}</td>
                        <td className="px-4 py-3">{user.level}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {selectedLoginId && (
            <div className="overflow-hidden rounded-2xl border border-[#3a3d45] bg-[#2d3037]">
              <div className="flex items-center justify-between border-b border-[#3a3d45] px-4 py-3">
                <h2 className="text-base font-semibold">User Detail Viewer</h2>
                <button
                  type="button"
                  onClick={handleCloseViewer}
                  className="rounded-md bg-[#454c5a] px-3 py-1.5 text-xs"
                >
                  닫기
                </button>
              </div>

              {detailLoading && (
                <p className="px-4 py-10 text-center text-sm text-gray-3">상세 불러오는 중...</p>
              )}
              {!detailLoading && detailError && (
                <p className="px-4 py-10 text-center text-sm text-[#ff9ea8]">{detailError}</p>
              )}

              {!detailLoading && !detailError && selectedDetail && (
                <dl>
                  <DetailRow label="loginId" value={selectedDetail.loginId} />
                  <DetailRow label="name" value={selectedDetail.name} />
                  <DetailRow label="department" value={selectedDetail.department} />
                  <DetailRow label="studentNo" value={selectedDetail.studentNo} />
                  <DetailRow label="grade" value={selectedDetail.grade} />
                  <DetailRow label="enrollmentStatus" value={selectedDetail.enrollmentStatus} />
                  <DetailRow label="birthDate" value={selectedDetail.birthDate} />
                  <DetailRow label="phone" value={selectedDetail.phone} />
                  <DetailRow label="withdrawalStatus" value={selectedDetail.withdrawalStatus} />
                  <DetailRow label="email" value={selectedDetail.email} />
                  <DetailRow label="generation" value={selectedDetail.generation} />
                  <DetailRow label="level" value={selectedDetail.level} />
                  <DetailRow label="track" value={selectedDetail.track} />
                  <DetailRow label="position" value={selectedDetail.position} />
                </dl>
              )}
            </div>
          )}
        </div>

        <p className="mt-4 text-xs text-gray-4">totalCount: {safeCount}</p>
      </div>
    </section>
  );
}
