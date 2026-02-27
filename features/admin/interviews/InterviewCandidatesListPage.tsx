"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAdminInterviewCandidates, getRecruitments } from "../api";
import type {
  AdminApplicationListResponse,
  AdminRecruitmentListItem,
} from "../type";
import ApplicantPagination from "../components/ApplicantPagination";
import ApplicantTable from "../components/ApplicantTable";
import InterviewCandidateDetailPage from "./InterviewCandidateDetailPage";

const PAGE_SIZE = 12;
const PAGE_BUTTON_LIMIT = 10;

const EMPTY_PAGE: AdminApplicationListResponse = {
  items: [],
  page: {
    page: 0,
    size: PAGE_SIZE,
    totalElements: 0,
    totalPages: 0,
  },
};

export default function InterviewCandidatesListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [recruitments, setRecruitments] = useState<AdminRecruitmentListItem[]>([]);
  const [isRecruitmentsLoading, setIsRecruitmentsLoading] = useState(false);
  const [selectedRecruitmentId, setSelectedRecruitmentId] = useState("");
  const [recruitmentId, setRecruitmentId] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AdminApplicationListResponse>(EMPTY_PAGE);

  const selectedApplicationId = useMemo(() => {
    const parsed = Number(searchParams.get("applicationId"));
    if (!Number.isInteger(parsed) || parsed <= 0) return null;
    return parsed;
  }, [searchParams]);

  useEffect(() => {
    const pageParam = Number(searchParams.get("page"));

    if (Number.isInteger(pageParam) && pageParam >= 0) {
      setPage(pageParam);
    }
  }, [searchParams]);

  useEffect(() => {
    let mounted = true;
    const loadRecruitments = async () => {
      setIsRecruitmentsLoading(true);
      try {
        const response = await getRecruitments({ page: 0, size: 20 });
        if (!mounted) return;
        setRecruitments(response.items);
      } catch {
        if (!mounted) return;
        setRecruitments([]);
        setError("모집 목록을 불러오지 못했습니다.");
      } finally {
        if (!mounted) return;
        setIsRecruitmentsLoading(false);
      }
    };

    void loadRecruitments();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (recruitments.length === 0) {
      setSelectedRecruitmentId("");
      setRecruitmentId(null);
      return;
    }

    const recruitmentIdParam = Number(searchParams.get("recruitmentId"));
    const hasQueryRecruitment =
      Number.isInteger(recruitmentIdParam) &&
      recruitmentIdParam > 0 &&
      recruitments.some((item) => item.recruitmentId === recruitmentIdParam);

    const initialRecruitmentId = hasQueryRecruitment
      ? recruitmentIdParam
      : recruitments[0].recruitmentId;

    setSelectedRecruitmentId(String(initialRecruitmentId));
    setRecruitmentId(initialRecruitmentId);
  }, [recruitments, searchParams]);

  useEffect(() => {
    if (!recruitmentId) return;

    let mounted = true;
    const load = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await getAdminInterviewCandidates({
          recruitmentId,
          page,
          size: PAGE_SIZE,
        });
        if (!mounted) return;
        setResult(response);
      } catch {
        if (!mounted) return;
        setError("합격자 목록을 불러오지 못했습니다.");
        setResult(EMPTY_PAGE);
      } finally {
        if (!mounted) return;
        setIsLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [recruitmentId, page]);

  const updateQuery = (next: {
    recruitmentId?: number;
    page?: number;
    applicationId?: number | null;
  }) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next.recruitmentId) params.set("recruitmentId", String(next.recruitmentId));
    if (typeof next.page === "number") params.set("page", String(next.page));
    params.delete("part");
    if (typeof next.applicationId === "number") {
      params.set("applicationId", String(next.applicationId));
    } else if (next.applicationId === null) {
      params.delete("applicationId");
    }
    router.push(`/admin/interviews/candidates?${params.toString()}`, { scroll: false });
  };

  const handleApplyRecruitmentId = () => {
    const parsed = Number(selectedRecruitmentId);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      setError("모집을 선택해 주세요.");
      return;
    }
    setPage(0);
    setError("");
    setRecruitmentId(parsed);
  };

  const handleSelectApplication = (applicationId: number) => {
    updateQuery({
      recruitmentId: recruitmentId ?? undefined,
      page: result.page.page,
      applicationId,
    });
  };

  const handleCloseViewer = () => {
    updateQuery({
      recruitmentId: recruitmentId ?? undefined,
      page: result.page.page,
      applicationId: null,
    });
  };

  return (
    <section className="bg-background px-4 py-10 text-white lg:px-8 lg:py-14">
      <div className="mx-auto max-w-[1200px]">
        <h1 className="text-[34px] font-bold tracking-[-0.02em]">Interview Candidates</h1>

        {!selectedApplicationId && (
          <div className="mt-8 grid items-start gap-4 lg:grid-cols-[220px_1fr]">
            <aside className="rounded-2xl border border-[#3a3d45] bg-[#26282d] p-4">
              <p className="text-xs font-semibold text-gray-4">목록</p>
              <div className="mt-4 space-y-2">
                <Link
                  href="/admin/applications"
                  className="block rounded-lg px-3 py-2 text-left text-[17px] text-gray-4"
                >
                  1차 지원자 목록
                </Link>
                <Link
                  href="/admin/interviews/candidates"
                  className="block rounded-lg border-l-2 border-main-1 bg-[#2f323a] px-3 py-2 text-left text-[17px] text-white"
                >
                  1차 합격자 목록
                </Link>
              </div>
            </aside>

            <div className="rounded-2xl border border-[#3a3d45] bg-[#2d3037] p-4 lg:p-6">
              <div className="grid gap-2 lg:grid-cols-[1fr_auto]">
                <select
                  value={selectedRecruitmentId}
                  onChange={(event) => setSelectedRecruitmentId(event.target.value)}
                  disabled={isRecruitmentsLoading || recruitments.length === 0}
                  className="h-11 rounded-lg border border-[#535968] bg-[#3a3f4d] px-3 text-sm text-white outline-none focus:border-main-1 disabled:opacity-60"
                >
                  {isRecruitmentsLoading && <option value="">모집 목록 불러오는 중...</option>}
                  {!isRecruitmentsLoading && recruitments.length === 0 && (
                    <option value="">모집 목록 없음</option>
                  )}
                  {!isRecruitmentsLoading &&
                    recruitments.map((item) => (
                      <option key={item.recruitmentId} value={item.recruitmentId}>
                        {`[${item.generation}기] ${item.title} (#${item.recruitmentId})`}
                      </option>
                    ))}
                </select>

                <button
                  type="button"
                  onClick={handleApplyRecruitmentId}
                  disabled={!selectedRecruitmentId}
                  className="h-11 rounded-lg bg-main-1 px-5 text-sm font-semibold disabled:opacity-60"
                >
                  조회
                </button>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <p className="text-sm text-gray-3">1차 합격자 목록</p>
                <p className="text-xs text-gray-4">
                  총 {result.page.totalElements.toLocaleString("ko-KR")}명
                </p>
              </div>

              {error && <p className="mt-3 text-sm text-[#ff9ea8]">{error}</p>}
              {!recruitmentId && !error && (
                <p className="mt-3 text-sm text-gray-4">모집을 선택해 주세요.</p>
              )}

              <ApplicantTable
                result={result}
                isLoading={isLoading}
                hasRecruitmentId={Boolean(recruitmentId)}
                selectedApplicationId={null}
                compact={false}
                onSelectApplication={handleSelectApplication}
              />

              <ApplicantPagination
                page={result.page.page}
                totalPages={result.page.totalPages}
                isLoading={isLoading}
                disabled={!recruitmentId}
                pageButtonLimit={PAGE_BUTTON_LIMIT}
                onChangePage={(nextPage) => {
                  setPage(nextPage);
                  updateQuery({
                    recruitmentId: recruitmentId ?? undefined,
                    page: nextPage,
                    applicationId: null,
                  });
                }}
              />
            </div>
          </div>
        )}

        {selectedApplicationId && (
          <div className="mt-8 grid items-start gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(0,7fr)]">
            <div className="space-y-4 self-start">
              <aside className="rounded-2xl border border-[#3a3d45] bg-[#26282d] p-4">
                <p className="text-xs font-semibold text-gray-4">목록</p>
                <div className="mt-4 space-y-2">
                  <Link
                    href="/admin/applications"
                    className="block rounded-lg px-3 py-2 text-left text-[17px] text-gray-4"
                  >
                    1차 지원자 목록
                  </Link>
                  <Link
                    href="/admin/interviews/candidates"
                    className="block rounded-lg border-l-2 border-main-1 bg-[#2f323a] px-3 py-2 text-left text-[17px] text-white"
                  >
                    1차 합격자 목록
                  </Link>
                </div>
              </aside>

              <div className="rounded-2xl border border-[#3a3d45] bg-[#2d3037] p-4 lg:p-6">
                <div className="grid gap-2 lg:grid-cols-[1fr_auto]">
                  <select
                    value={selectedRecruitmentId}
                    onChange={(event) => setSelectedRecruitmentId(event.target.value)}
                    disabled={isRecruitmentsLoading || recruitments.length === 0}
                    className="h-11 rounded-lg border border-[#535968] bg-[#3a3f4d] px-3 text-sm text-white outline-none focus:border-main-1 disabled:opacity-60"
                  >
                    {isRecruitmentsLoading && <option value="">모집 목록 불러오는 중...</option>}
                    {!isRecruitmentsLoading && recruitments.length === 0 && (
                      <option value="">모집 목록 없음</option>
                    )}
                    {!isRecruitmentsLoading &&
                      recruitments.map((item) => (
                        <option key={item.recruitmentId} value={item.recruitmentId}>
                          {`[${item.generation}기] ${item.title} (#${item.recruitmentId})`}
                        </option>
                      ))}
                  </select>

                  <button
                    type="button"
                    onClick={handleApplyRecruitmentId}
                    disabled={!selectedRecruitmentId}
                    className="h-11 rounded-lg bg-main-1 px-5 text-sm font-semibold disabled:opacity-60"
                  >
                    조회
                  </button>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <p className="text-sm text-gray-3">1차 합격자 목록</p>
                  <p className="text-xs text-gray-4">
                    총 {result.page.totalElements.toLocaleString("ko-KR")}명
                  </p>
                </div>

                {error && <p className="mt-3 text-sm text-[#ff9ea8]">{error}</p>}
                {!recruitmentId && !error && (
                  <p className="mt-3 text-sm text-gray-4">모집을 선택해 주세요.</p>
                )}

                <ApplicantTable
                  result={result}
                  isLoading={isLoading}
                  hasRecruitmentId={Boolean(recruitmentId)}
                  selectedApplicationId={selectedApplicationId}
                  compact
                  onSelectApplication={handleSelectApplication}
                />

                <ApplicantPagination
                  page={result.page.page}
                  totalPages={result.page.totalPages}
                  isLoading={isLoading}
                  disabled={!recruitmentId}
                  pageButtonLimit={PAGE_BUTTON_LIMIT}
                  onChangePage={(nextPage) => {
                    setPage(nextPage);
                    updateQuery({
                      recruitmentId: recruitmentId ?? undefined,
                      page: nextPage,
                      applicationId: selectedApplicationId,
                    });
                  }}
                />
              </div>
            </div>

            <div className="self-start">
              <InterviewCandidateDetailPage
                applicationId={selectedApplicationId}
                embedded
                onClose={handleCloseViewer}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
