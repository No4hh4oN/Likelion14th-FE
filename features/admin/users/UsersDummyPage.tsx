"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAdminUserDetail, getAdminUsers } from "../api";
import type { AdminUserDetail, AdminUserListItem } from "../type";

/**
 * 회원가입 화면의 학과 enum과 동일하게 맞춘 사용자 관리 학과 필터 옵션이다.
 */
const ADMIN_USER_DEPARTMENT_OPTIONS = [
  "신학과",
  "간호학과",
  "약학과",
  "자유전공학부(창의)",
  "자유전공학부(미래)",
  "경영학과",
  "글로벌한국학과",
  "영어영문학과",
  "상담심리학과",
  "유아교육과",
  "항공관광외국어학부",
  "사회복지학과",
  "음악학과",
  "아트앤디자인학과",
  "체육학과",
  "물리치료학과",
  "식품영양학과",
  "동물자원과학과",
  "바이오융합공학과",
  "화학생명과학과",
  "환경디자인원예학과",
  "인공지능융합학부",
  "컴퓨터공학부",
  "건축학과(5년제)",
  "건축학과(4년제)",
  "데이터클라우드공학과",
  "기타",
] as const;

/**
 * 사용자 관리 목록이 지원할 정렬 키다.
 */
type AdminUserSortKey = "loginId" | "name" | "department" | "studentNo" | "level";

/**
 * 사용자 관리 목록이 지원할 정렬 방향이다.
 */
type AdminUserSortDirection = "asc" | "desc";

/**
 * level 필터 UI에 사용할 값이다.
 */
type AdminUserLevelFilterValue = "ALL" | "STAFF" | "BABY_LION" | "OUTSIDER";

/**
 * 정렬 기준 선택지다.
 */
const ADMIN_USER_SORT_OPTIONS: {
  value: AdminUserSortKey;
  label: string;
}[] = [
  { value: "loginId", label: "Login ID" },
  { value: "name", label: "이름" },
  { value: "department", label: "학과" },
  { value: "studentNo", label: "학번" },
  { value: "level", label: "레벨" },
];

/**
 * 레벨 필터 선택지다.
 */
const ADMIN_USER_LEVEL_FILTER_OPTIONS: {
  value: AdminUserLevelFilterValue;
  label: string;
}[] = [
  { value: "ALL", label: "전체 레벨" },
  { value: "STAFF", label: "운영진" },
  { value: "BABY_LION", label: "아기사자" },
  { value: "OUTSIDER", label: "외부인" },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/**
 * 사용자 level 문자열을 목록 필터용 표준 값으로 정규화한다.
 */
function normalizeAdminUserLevel(level: string): Exclude<
  AdminUserLevelFilterValue,
  "ALL"
> {
  const normalizedLevel = level.trim().toUpperCase();

  if (
    normalizedLevel === "STAFF" ||
    normalizedLevel === "ADMIN" ||
    normalizedLevel === "ROLE_STAFF" ||
    normalizedLevel === "ROLE_ADMIN" ||
    normalizedLevel === "운영진"
  ) {
    return "STAFF";
  }

  if (
    normalizedLevel === "BABY_LION" ||
    normalizedLevel === "BABYLION" ||
    normalizedLevel === "ROLE_BABY_LION" ||
    normalizedLevel === "아기사자"
  ) {
    return "BABY_LION";
  }

  return "OUTSIDER";
}

/**
 * URL 쿼리에서 정렬 키를 읽어 표준값으로 정규화한다.
 */
function getAdminUserSortKey(value: string | null): AdminUserSortKey {
  if (
    value === "loginId" ||
    value === "name" ||
    value === "department" ||
    value === "studentNo" ||
    value === "level"
  ) {
    return value;
  }

  return "loginId";
}

/**
 * URL 쿼리에서 정렬 방향을 읽어 표준값으로 정규화한다.
 */
function getAdminUserSortDirection(
  value: string | null,
): AdminUserSortDirection {
  return value === "desc" ? "desc" : "asc";
}

/**
 * URL 쿼리에서 레벨 필터값을 읽어 표준값으로 정규화한다.
 */
function getAdminUserLevelFilterValue(
  value: string | null,
): AdminUserLevelFilterValue {
  if (value === "STAFF" || value === "BABY_LION" || value === "OUTSIDER") {
    return value;
  }

  return "ALL";
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

  /**
   * 현재 URL 쿼리에서 읽은 정렬 기준이다.
   */
  const sortKey = getAdminUserSortKey(searchParams.get("sortKey"));

  /**
   * 현재 URL 쿼리에서 읽은 정렬 방향이다.
   */
  const sortDirection = getAdminUserSortDirection(searchParams.get("sortDirection"));

  /**
   * 현재 URL 쿼리에서 읽은 학과 필터값이다.
   */
  const selectedDepartment = searchParams.get("department") ?? "ALL";

  /**
   * 현재 URL 쿼리에서 읽은 레벨 필터값이다.
   */
  const selectedLevel = getAdminUserLevelFilterValue(searchParams.get("level"));

  /**
   * 필터와 정렬을 모두 반영한 사용자 목록이다.
   */
  const filteredUsers = useMemo(() => {
    const nextUsers = users.filter((user) => {
      const isDepartmentMatched =
        selectedDepartment === "ALL" || user.department === selectedDepartment;
      const isLevelMatched =
        selectedLevel === "ALL" ||
        normalizeAdminUserLevel(user.level) === selectedLevel;

      return isDepartmentMatched && isLevelMatched;
    });

    const sortedUsers = [...nextUsers].sort((leftUser, rightUser) => {
      const leftValue = leftUser[sortKey];
      const rightValue = rightUser[sortKey];
      const comparedValue = String(leftValue).localeCompare(String(rightValue), "ko", {
        numeric: true,
        sensitivity: "base",
      });

      return sortDirection === "asc" ? comparedValue : -comparedValue;
    });

    return sortedUsers;
  }, [selectedDepartment, selectedLevel, sortDirection, sortKey, users]);

  /**
   * 실제 필터링 후 화면에 표시되는 사용자 수다.
   */
  const filteredCount = filteredUsers.length;

  const selectedDetail = selectedLoginId ? detailCache[selectedLoginId] : null;

  /**
   * 목록 관련 쿼리스트링을 갱신한다.
   */
  const updateListQuery = (nextValues: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(nextValues).forEach(([key, value]) => {
      if (!value || value === "ALL") {
        params.delete(key);
        return;
      }

      params.set(key, value);
    });

    const query = params.toString();
    router.replace(query ? `/admin/users?${query}` : "/admin/users", {
      scroll: false,
    });
  };

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

        <div className="mt-6 grid gap-3 rounded-2xl border border-[#3a3d45] bg-[#2d3037] p-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="text-sm">
            <span className="mb-2 block text-gray-4">정렬 기준</span>
            <select
              value={sortKey}
              onChange={(event) =>
                updateListQuery({
                  sortKey: event.target.value,
                })
              }
              className="h-11 w-full rounded-md border border-[#5d6478] bg-[#454c5d] px-3 text-white outline-none"
            >
              {ADMIN_USER_SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm">
            <span className="mb-2 block text-gray-4">정렬 방향</span>
            <select
              value={sortDirection}
              onChange={(event) =>
                updateListQuery({
                  sortDirection: event.target.value,
                })
              }
              className="h-11 w-full rounded-md border border-[#5d6478] bg-[#454c5d] px-3 text-white outline-none"
            >
              <option value="asc">오름차순</option>
              <option value="desc">내림차순</option>
            </select>
          </label>

          <label className="text-sm">
            <span className="mb-2 block text-gray-4">학과 필터</span>
            <select
              value={selectedDepartment}
              onChange={(event) =>
                updateListQuery({
                  department: event.target.value,
                })
              }
              className="h-11 w-full rounded-md border border-[#5d6478] bg-[#454c5d] px-3 text-white outline-none"
            >
              <option value="ALL">전체 학과</option>
              {ADMIN_USER_DEPARTMENT_OPTIONS.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm">
            <span className="mb-2 block text-gray-4">레벨 필터</span>
            <select
              value={selectedLevel}
              onChange={(event) =>
                updateListQuery({
                  level: event.target.value,
                })
              }
              className="h-11 w-full rounded-md border border-[#5d6478] bg-[#454c5d] px-3 text-white outline-none"
            >
              {ADMIN_USER_LEVEL_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

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

                  {!isLoading && !error && filteredUsers.length === 0 && (
                    <tr className="border-t border-[#3a3d45]">
                      <td colSpan={6} className="px-4 py-10 text-center text-gray-3">
                        조회된 유저가 없습니다.
                      </td>
                    </tr>
                  )}

                  {!isLoading &&
                    !error &&
                    filteredUsers.map((user) => (
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

        <p className="mt-4 text-xs text-gray-4">
          totalCount: {safeCount} / filteredCount: {filteredCount}
        </p>
      </div>
    </section>
  );
}
