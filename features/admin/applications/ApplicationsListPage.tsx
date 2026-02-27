"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getAdminApplications, getRecruitments } from "../api";
import type {
  AdminApplicationListResponse,
  AdminApplicationStatus,
  AdminApplyPart,
  AdminRecruitmentListItem,
} from "../type";
import ApplicantFilters from "../components/ApplicantFilters";
import ApplicantPagination from "../components/ApplicantPagination";
import ApplicantTable from "../components/ApplicantTable";
import ApplicationDetailPage from "./ApplicationDetailPage";

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

export default function ApplicationsListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [recruitments, setRecruitments] = useState<AdminRecruitmentListItem[]>([]);
  const [isRecruitmentsLoading, setIsRecruitmentsLoading] = useState(false);
  const [selectedRecruitmentId, setSelectedRecruitmentId] = useState("");
  const [recruitmentId, setRecruitmentId] = useState<number | null>(null);
  const [part, setPart] = useState<"ALL" | AdminApplyPart>("ALL");
  const [status, setStatus] = useState<"ALL" | AdminApplicationStatus>("ALL");
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AdminApplicationListResponse>(EMPTY_PAGE);

  const selectedApplicationId = useMemo(() => {
    const parsed = Number(searchParams.get("applicationId"));
    if (!Number.isInteger(parsed) || parsed <= 0) return null;
    return parsed;
  }, [searchParams]);

  const resolvedStatus = useMemo(
    () => (status === "ALL" ? undefined : status),
    [status],
  );
  const resolvedPart = part === "ALL" ? undefined : part;

  useEffect(() => {
    const pageParam = Number(searchParams.get("page"));
    const partParam = searchParams.get("part");
    const statusParam = searchParams.get("status");

    if (Number.isInteger(pageParam) && pageParam >= 0) {
      setPage(pageParam);
    }

    if (
      partParam === "ALL" ||
      partParam === "FRONTEND" ||
      partParam === "BACKEND" ||
      partParam === "AI_ML" ||
      partParam === "PM_DESIGN"
    ) {
      setPart(partParam);
    }

    if (
      statusParam === "ALL" ||
      statusParam === "DRAFT" ||
      statusParam === "SUBMITTED" ||
      statusParam === "DOC_PASSED" ||
      statusParam === "DOC_FAILED" ||
      statusParam === "FINAL_PASSED" ||
      statusParam === "FINAL_FAILED"
    ) {
      setStatus(statusParam);
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
        const response = await getAdminApplications({
          recruitmentId,
          part: resolvedPart,
          status: resolvedStatus,
          page,
          size: PAGE_SIZE,
        });
        if (!mounted) return;
        setResult(response);
      } catch {
        if (!mounted) return;
        setError("지원자 목록을 불러오지 못했습니다.");
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
  }, [recruitmentId, resolvedPart, resolvedStatus, page]);

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

  const updateQuery = (next: {
    recruitmentId?: number;
    page?: number;
    part?: string;
    status?: string;
    applicationId?: number | null;
  }) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next.recruitmentId) params.set("recruitmentId", String(next.recruitmentId));
    if (typeof next.page === "number") params.set("page", String(next.page));
    if (next.part) params.set("part", next.part);
    if (next.status) params.set("status", next.status);
    if (typeof next.applicationId === "number") {
      params.set("applicationId", String(next.applicationId));
    } else if (next.applicationId === null) {
      params.delete("applicationId");
    }
    router.push(`/admin/applications?${params.toString()}`, { scroll: false });
  };

  const handleSelectApplication = (applicationId: number) => {
    updateQuery({
      recruitmentId: recruitmentId ?? undefined,
      page: result.page.page,
      part,
      status,
      applicationId,
    });
  };

  const handleCloseViewer = () => {
    updateQuery({
      recruitmentId: recruitmentId ?? undefined,
      page: result.page.page,
      part,
      status,
      applicationId: null,
    });
  };

  return (
    <section className="bg-background px-4 py-10 text-white lg:px-8 lg:py-14">
      <div className="mx-auto max-w-[1200px]">
        <h1 className="text-[34px] font-bold tracking-[-0.02em]">Applications</h1>

        {!selectedApplicationId && (
          <div className="mt-8 grid items-start gap-4 lg:grid-cols-[220px_1fr]">
            <aside className="rounded-2xl border border-[#3a3d45] bg-[#26282d] p-4">
              <p className="text-xs font-semibold text-gray-4">목록</p>
              <div className="mt-4 space-y-2">
                <Link
                  href="/admin/applications"
                  className="block rounded-lg border-l-2 border-main-1 bg-[#2f323a] px-3 py-2 text-left text-[17px] text-white"
                >
                  1차 지원자 목록
                </Link>
                <Link
                  href="/admin/interviews/candidates"
                  className="block rounded-lg px-3 py-2 text-left text-[17px] text-gray-4"
                >
                  1차 합격자 목록
                </Link>
              </div>
            </aside>

            <div className="rounded-2xl border border-[#3a3d45] bg-[#2d3037] p-4 lg:p-6">
              <ApplicantFilters
                recruitments={recruitments}
                selectedRecruitmentId={selectedRecruitmentId}
                isRecruitmentsLoading={isRecruitmentsLoading}
                compact={false}
                part={part}
                status={status}
                onRecruitmentChange={setSelectedRecruitmentId}
                onPartChange={(nextPart) => {
                  setPart(nextPart);
                  setPage(0);
                }}
                onStatusChange={(nextStatus) => {
                  setStatus(nextStatus);
                  setPage(0);
                }}
                onApply={handleApplyRecruitmentId}
              />

              <div className="mt-5 flex items-center justify-between">
                <p className="text-sm text-gray-3">1차 지원자 목록</p>
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
                    part,
                    status,
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
                    className="block rounded-lg border-l-2 border-main-1 bg-[#2f323a] px-3 py-2 text-left text-[17px] text-white"
                  >
                    1차 지원자 목록
                  </Link>
                  <Link
                    href="/admin/interviews/candidates"
                    className="block rounded-lg px-3 py-2 text-left text-[17px] text-gray-4"
                  >
                    1차 합격자 목록
                  </Link>
                </div>
              </aside>

              <div className="rounded-2xl border border-[#3a3d45] bg-[#2d3037] p-4 lg:p-6">
                <ApplicantFilters
                  recruitments={recruitments}
                  selectedRecruitmentId={selectedRecruitmentId}
                  isRecruitmentsLoading={isRecruitmentsLoading}
                  compact
                  part={part}
                  status={status}
                  onRecruitmentChange={setSelectedRecruitmentId}
                  onPartChange={(nextPart) => {
                    setPart(nextPart);
                    setPage(0);
                  }}
                  onStatusChange={(nextStatus) => {
                    setStatus(nextStatus);
                    setPage(0);
                  }}
                  onApply={handleApplyRecruitmentId}
                />

                <div className="mt-5 flex items-center justify-between">
                  <p className="text-sm text-gray-3">1차 지원자 목록</p>
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
                      part,
                      status,
                      applicationId: selectedApplicationId,
                    });
                  }}
                />
              </div>
            </div>

            <div className="self-start">
              <ApplicationDetailPage
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
