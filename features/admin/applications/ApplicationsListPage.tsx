"use client";

import { getMyInfo } from "@/features/public/api";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getApplicantManagementViewMeta,
  getApplicationsListView,
  type ExtendedAdminApplicationStatus,
} from "../applicantManagement";
import {
  getAdminApplications,
  getAdminDocumentPendingPasses,
  getMyAdminDocumentScores,
  getRecruitments,
  postAdminDocumentFinalize,
} from "../api";
import ApplicantFilters from "../components/ApplicantFilters";
import ApplicantManagementNav from "../components/ApplicantManagementNav";
import ApplicantPagination from "../components/ApplicantPagination";
import ApplicantPendingPassTable from "../components/ApplicantPendingPassTable";
import ApplicantTable from "../components/ApplicantTable";
import { canManageApplicantDecisions } from "../permissions";
import type {
  AdminApplicationListResponse,
  AdminApplicationStatus,
  AdminApplyPart,
  AdminDocumentPendingPassListResponse,
  AdminEvaluationFilter,
  AdminRecruitmentListItem,
} from "../type";
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

const EMPTY_PENDING_PAGE: AdminDocumentPendingPassListResponse = {
  items: [],
  page: {
    page: 0,
    size: PAGE_SIZE,
    totalElements: 0,
    totalPages: 0,
  },
};

function parsePartParam(value: string | null) {
  if (
    value === "ALL" ||
    value === "FRONTEND" ||
    value === "BACKEND" ||
    value === "AI_ML" ||
    value === "PM_DESIGN"
  ) {
    return value;
  }

  return "ALL";
}

function parseStatusParam(value: string | null) {
  if (
    value === "ALL" ||
    value === "DRAFT" ||
    value === "SUBMITTED" ||
    value === "DOC_PASSED" ||
    value === "DOC_FAILED" ||
    value === "FINAL_PASSED" ||
    value === "FINAL_FAILED"
  ) {
    return value;
  }

  return "ALL";
}

function parseEvaluationFilterParam(value: string | null): AdminEvaluationFilter {
  if (value === "NOT_REVIEWED" || value === "REVIEWED") {
    return value;
  }

  return "ALL";
}

export default function ApplicationsListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeView = useMemo(
    () => getApplicationsListView(searchParams.get("view")),
    [searchParams],
  );
  const viewMeta = getApplicantManagementViewMeta(activeView);
  const [recruitments, setRecruitments] = useState<AdminRecruitmentListItem[]>([]);
  const [isRecruitmentsLoading, setIsRecruitmentsLoading] = useState(false);
  const [selectedRecruitmentId, setSelectedRecruitmentId] = useState("");
  const [recruitmentId, setRecruitmentId] = useState<number | null>(null);
  const [part, setPart] = useState<"ALL" | AdminApplyPart>("ALL");
  const [status, setStatus] = useState<"ALL" | AdminApplicationStatus>("ALL");
  const [evaluationFilter, setEvaluationFilter] =
    useState<AdminEvaluationFilter>("ALL");
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [applicationResult, setApplicationResult] =
    useState<AdminApplicationListResponse>(EMPTY_PAGE);
  const [pendingResult, setPendingResult] =
    useState<AdminDocumentPendingPassListResponse>(EMPTY_PENDING_PAGE);
  const [reloadToken, setReloadToken] = useState(0);
  const [canManageDecisions, setCanManageDecisions] = useState(false);
  const [isFinalizeLoading, setIsFinalizeLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [evaluationStatusMap, setEvaluationStatusMap] = useState<Record<number, boolean>>(
    {},
  );
  const [isEvaluationStatusLoading, setIsEvaluationStatusLoading] = useState(false);
  const [evaluationError, setEvaluationError] = useState("");

  const selectedApplicationId = useMemo(() => {
    const parsed = Number(searchParams.get("applicationId"));
    if (!Number.isInteger(parsed) || parsed <= 0) return null;
    return parsed;
  }, [searchParams]);

  const selectedRecruitment = useMemo(
    () =>
      recruitments.find((item) => item.recruitmentId === recruitmentId) ?? null,
    [recruitmentId, recruitments],
  );
  const isDocEvaluating = selectedRecruitment?.phaseType === "DOC_EVALUATING";
  const showPartFilter = activeView === "DOCUMENT_APPLICANTS";
  const showStatusFilter = activeView === "DOCUMENT_APPLICANTS";
  const showEvaluationFilter = activeView === "DOCUMENT_APPLICANTS";
  const isEvaluationFilteringActive =
    showEvaluationFilter && evaluationFilter !== "ALL";
  const resolvedPart = showPartFilter && part !== "ALL" ? part : undefined;
  const resolvedStatus = useMemo<ExtendedAdminApplicationStatus | undefined>(
    () => (status === "ALL" ? undefined : status),
    [status],
  );
  const currentPageInfo =
    activeView === "DOCUMENT_PENDING" ? pendingResult.page : applicationResult.page;
  const currentTotalElements = currentPageInfo.totalElements;

  useEffect(() => {
    const pageParam = Number(searchParams.get("page"));

    if (Number.isInteger(pageParam) && pageParam >= 0) {
      setPage(pageParam);
    } else {
      setPage(0);
    }

    setPart(parsePartParam(searchParams.get("part")));
    setStatus(parseStatusParam(searchParams.get("status")));
    setEvaluationFilter(parseEvaluationFilterParam(searchParams.get("evaluation")));
  }, [searchParams]);

  useEffect(() => {
    let mounted = true;

    const loadPermissions = async () => {
      try {
        const profile = await getMyInfo();
        if (!mounted) return;
        setCanManageDecisions(canManageApplicantDecisions(profile));
      } catch {
        if (!mounted) return;
        setCanManageDecisions(false);
      }
    };

    void loadPermissions();
    return () => {
      mounted = false;
    };
  }, []);

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
        if (activeView === "DOCUMENT_PENDING") {
          const response = await getAdminDocumentPendingPasses({
            recruitmentId,
            page,
            size: PAGE_SIZE,
          });
          if (!mounted) return;
          setPendingResult(response);
          setApplicationResult(EMPTY_PAGE);
          return;
        }

        const response = await getAdminApplications({
          recruitmentId,
          part: resolvedPart,
          status: resolvedStatus,
          page,
          size: PAGE_SIZE,
        });
        if (!mounted) return;
        setApplicationResult(response);
        setPendingResult(EMPTY_PENDING_PAGE);
      } catch {
        if (!mounted) return;
        setError(
          activeView === "DOCUMENT_PENDING"
            ? "서류 예비 합격자 목록을 불러오지 못했습니다."
            : "지원자 목록을 불러오지 못했습니다.",
        );
        setApplicationResult(EMPTY_PAGE);
        setPendingResult(EMPTY_PENDING_PAGE);
      } finally {
        if (!mounted) return;
        setIsLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [activeView, page, recruitmentId, reloadToken, resolvedPart, resolvedStatus]);

  useEffect(() => {
    if (
      activeView !== "DOCUMENT_APPLICANTS" ||
      !showEvaluationFilter ||
      !isEvaluationFilteringActive
    ) {
      setIsEvaluationStatusLoading(false);
      setEvaluationError("");
      return;
    }

    if (applicationResult.items.length === 0) {
      setEvaluationStatusMap({});
      setIsEvaluationStatusLoading(false);
      setEvaluationError("");
      return;
    }

    let mounted = true;

    const loadEvaluationStatuses = async () => {
      setIsEvaluationStatusLoading(true);
      setEvaluationError("");

      const results = await Promise.allSettled(
        applicationResult.items.map(async (item) => {
          const normalizedStatus = item.status?.toUpperCase?.() ?? "";

          if (normalizedStatus === "DRAFT") {
            return { applicationId: item.applicationId, exists: false };
          }

          const response = await getMyAdminDocumentScores(item.applicationId);
          return { applicationId: item.applicationId, exists: response.exists };
        }),
      );

      if (!mounted) return;

      const nextMap: Record<number, boolean> = {};
      let hasFailure = false;

      results.forEach((result, index) => {
        const fallbackId = applicationResult.items[index]?.applicationId;

        if (result.status === "fulfilled") {
          nextMap[result.value.applicationId] = result.value.exists;
          return;
        }

        if (typeof fallbackId === "number") {
          nextMap[fallbackId] = false;
        }
        hasFailure = true;
      });

      setEvaluationStatusMap(nextMap);
      setEvaluationError(
        hasFailure
          ? "일부 지원자의 내 평가 상태를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요."
          : "",
      );
      setIsEvaluationStatusLoading(false);
    };

    void loadEvaluationStatuses();
    return () => {
      mounted = false;
    };
  }, [
    activeView,
    applicationResult.items,
    isEvaluationFilteringActive,
    showEvaluationFilter,
  ]);

  const displayedApplicationResult = useMemo<AdminApplicationListResponse>(() => {
    if (!isEvaluationFilteringActive) {
      return applicationResult;
    }

    return {
      ...applicationResult,
      items: applicationResult.items.filter((item) => {
        const hasReviewed = evaluationStatusMap[item.applicationId] === true;
        return evaluationFilter === "REVIEWED" ? hasReviewed : !hasReviewed;
      }),
    };
  }, [
    applicationResult,
    evaluationFilter,
    evaluationStatusMap,
    isEvaluationFilteringActive,
  ]);
  const hasEvaluationStatusesForCurrentItems = useMemo(() => {
    if (!isEvaluationFilteringActive) {
      return true;
    }

    return applicationResult.items.every((item) => {
      const normalizedStatus = item.status?.toUpperCase?.() ?? "";

      if (normalizedStatus === "DRAFT") {
        return true;
      }

      return Object.prototype.hasOwnProperty.call(
        evaluationStatusMap,
        item.applicationId,
      );
    });
  }, [applicationResult.items, evaluationStatusMap, isEvaluationFilteringActive]);
  const isTableLoading =
    isLoading ||
    isEvaluationStatusLoading ||
    (isEvaluationFilteringActive && !hasEvaluationStatusesForCurrentItems);

  const buildListHref = (next: {
    recruitmentId?: number | null;
    page?: number;
    part?: "ALL" | AdminApplyPart;
    status?: "ALL" | AdminApplicationStatus;
    evaluationFilter?: AdminEvaluationFilter;
    applicationId?: number | null;
  }) => {
    const params = new URLSearchParams();
    const nextRecruitmentId =
      next.recruitmentId !== undefined ? next.recruitmentId : recruitmentId;
    const nextPage = typeof next.page === "number" ? next.page : page;
    const nextPart = next.part ?? part;
    const nextStatus = next.status ?? status;
    const nextEvaluationFilter = next.evaluationFilter ?? evaluationFilter;

    if (activeView === "DOCUMENT_PENDING") {
      params.set("view", "document-pending");
    }

    if (nextRecruitmentId) {
      params.set("recruitmentId", String(nextRecruitmentId));
    }

    if (nextPage > 0) {
      params.set("page", String(nextPage));
    }

    if (showPartFilter && nextPart !== "ALL") {
      params.set("part", nextPart);
    }

    if (showStatusFilter && nextStatus !== "ALL") {
      params.set("status", nextStatus);
    }

    if (nextEvaluationFilter !== "ALL") {
      params.set("evaluation", nextEvaluationFilter);
    }

    if (typeof next.applicationId === "number") {
      params.set("applicationId", String(next.applicationId));
    }

    const query = params.toString();
    return `${viewMeta.path}${query ? `?${query}` : ""}`;
  };

  const updateQuery = (next: {
    recruitmentId?: number | null;
    page?: number;
    part?: "ALL" | AdminApplyPart;
    status?: "ALL" | AdminApplicationStatus;
    evaluationFilter?: AdminEvaluationFilter;
    applicationId?: number | null;
  }) => {
    router.push(buildListHref(next), { scroll: false });
  };

  const handleApplyRecruitmentId = () => {
    const parsed = Number(selectedRecruitmentId);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      setError("모집을 선택해 주세요.");
      return;
    }

    setPage(0);
    setError("");
    setActionError("");
    setActionMessage("");
    setRecruitmentId(parsed);
    updateQuery({
      recruitmentId: parsed,
      page: 0,
      part,
      status,
      evaluationFilter,
      applicationId: null,
    });
  };

  const handleSelectApplication = (applicationId: number) => {
    updateQuery({
      recruitmentId,
      page: currentPageInfo.page,
      part,
      status,
      evaluationFilter,
      applicationId,
    });
  };

  const handleCloseViewer = () => {
    updateQuery({
      recruitmentId,
      page: currentPageInfo.page,
      part,
      status,
      evaluationFilter,
      applicationId: null,
    });
  };

  const handleFinalizeDocuments = async () => {
    if (
      !recruitmentId ||
      !canManageDecisions ||
      !isDocEvaluating ||
      isFinalizeLoading
    ) {
      return;
    }

    setIsFinalizeLoading(true);
    setActionError("");
    setActionMessage("");

    try {
      const response = await postAdminDocumentFinalize({ recruitmentId });
      setActionMessage(
        `서류 합격 일괄 처리를 완료했습니다. ${response.finalizedCount}명을 확정했습니다.`,
      );
      setPage(0);
      setReloadToken((prev) => prev + 1);
      updateQuery({
        recruitmentId,
        page: 0,
        part,
        status,
        evaluationFilter,
        applicationId: null,
      });
    } catch {
      setActionError("서류 합격 일괄 처리에 실패했습니다.");
    } finally {
      setIsFinalizeLoading(false);
    }
  };

  const renderTable = (compact: boolean) => {
    if (activeView === "DOCUMENT_PENDING") {
      return (
        <ApplicantPendingPassTable
          result={pendingResult}
          isLoading={isLoading}
          hasRecruitmentId={Boolean(recruitmentId)}
          selectedApplicationId={compact ? selectedApplicationId : null}
          compact={compact}
          onSelectApplication={handleSelectApplication}
        />
      );
    }

    return (
      <ApplicantTable
        result={displayedApplicationResult}
        isLoading={isTableLoading}
        hasRecruitmentId={Boolean(recruitmentId)}
        selectedApplicationId={compact ? selectedApplicationId : null}
        compact={compact}
        onSelectApplication={handleSelectApplication}
      />
    );
  };

  const renderListCard = (compact: boolean) => (
    <div className="min-w-0 rounded-2xl border border-[#3a3d45] bg-[#2d3037] p-4 lg:p-6">
      <ApplicantFilters
        recruitments={recruitments}
        selectedRecruitmentId={selectedRecruitmentId}
        isRecruitmentsLoading={isRecruitmentsLoading}
        compact={compact}
        part={showPartFilter ? part : undefined}
        status={showStatusFilter ? status : undefined}
        evaluationFilter={showEvaluationFilter ? evaluationFilter : undefined}
        onRecruitmentChange={setSelectedRecruitmentId}
        onPartChange={
          showPartFilter
            ? (nextPart) => {
                setPart(nextPart);
                setPage(0);
              }
            : undefined
        }
        onStatusChange={
          showStatusFilter
            ? (nextStatus) => {
                setStatus(nextStatus);
                setPage(0);
              }
            : undefined
        }
        onEvaluationFilterChange={
          showEvaluationFilter
            ? (nextEvaluationFilter) => {
                setEvaluationFilter(nextEvaluationFilter);
                setPage(0);
                updateQuery({
                  recruitmentId,
                  page: 0,
                  part,
                  status,
                  evaluationFilter: nextEvaluationFilter,
                  applicationId: compact ? selectedApplicationId : null,
                });
              }
            : undefined
        }
        onApply={handleApplyRecruitmentId}
      />

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-3">{viewMeta.label}</p>
        <div className="flex flex-wrap items-center gap-3">
          {activeView === "DOCUMENT_PENDING" && canManageDecisions && (
            <button
              type="button"
              onClick={handleFinalizeDocuments}
              disabled={!recruitmentId || !isDocEvaluating || isFinalizeLoading}
              className="rounded-lg bg-main-1 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
            >
              {isFinalizeLoading ? "처리 중..." : "서류 합격 일괄 처리"}
            </button>
          )}
          <p className="text-xs text-gray-4">
            총 {currentTotalElements.toLocaleString("ko-KR")}명
          </p>
        </div>
      </div>

      {activeView === "DOCUMENT_PENDING" && selectedRecruitment && !isDocEvaluating && (
        <p className="mt-3 text-sm text-gray-4">
          현재 모집 단계는 `{selectedRecruitment.phaseType}`입니다. 서류 예비 합격
          확정은 `DOC_EVALUATING` 단계에서만 진행할 수 있습니다.
        </p>
      )}

      {error && <p className="mt-3 text-sm text-[#ff9ea8]">{error}</p>}
      {activeView === "DOCUMENT_APPLICANTS" && status === "SUBMITTED" && (
        <p className="mt-3 text-xs text-gray-4">
          서류 합격/불합격 처리가 아직 되지 않은 제출 완료 지원자만 보고 있습니다.
        </p>
      )}
      {showEvaluationFilter && (
        <p className="mt-3 text-xs text-gray-4">
          내 평가 상태 필터는 현재 불러온 페이지 기준으로 적용됩니다.
        </p>
      )}
      {evaluationError && <p className="mt-2 text-sm text-[#ff9ea8]">{evaluationError}</p>}
      {actionError && <p className="mt-3 text-sm text-[#ff9ea8]">{actionError}</p>}
      {actionMessage && <p className="mt-3 text-sm text-[#8fd3ff]">{actionMessage}</p>}
      {!recruitmentId && !error && (
        <p className="mt-3 text-sm text-gray-4">모집을 선택해 주세요.</p>
      )}

      {renderTable(compact)}

      <ApplicantPagination
        page={currentPageInfo.page}
        totalPages={currentPageInfo.totalPages}
        isLoading={isTableLoading}
        disabled={!recruitmentId}
        pageButtonLimit={PAGE_BUTTON_LIMIT}
        onChangePage={(nextPage) => {
          setPage(nextPage);
          updateQuery({
            recruitmentId,
            page: nextPage,
            part,
            status,
            evaluationFilter,
            applicationId: compact ? selectedApplicationId : null,
          });
        }}
      />
    </div>
  );

  return (
    <section className="bg-background px-4 py-10 text-white lg:px-8 lg:py-14 print:bg-white print:px-0 print:py-0 print:text-black">
      <div className="mx-auto max-w-[1200px]">
        <h1 className="text-[34px] font-bold tracking-[-0.02em] print:hidden">
          {viewMeta.pageTitle}
        </h1>

        {!selectedApplicationId && (
          <div className="mt-8 grid items-start gap-4 lg:grid-cols-[220px_1fr] print:hidden">
            <ApplicantManagementNav
              activeView={activeView}
              recruitmentId={recruitmentId}
              part={showPartFilter ? part : null}
              status={showStatusFilter ? status : null}
              evaluationFilter={showEvaluationFilter ? evaluationFilter : null}
            />
            {renderListCard(false)}
          </div>
        )}

        {selectedApplicationId && (
          <div className="mt-8 grid items-start gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(0,7fr)] print:mt-0 print:block">
            <div className="min-w-0 space-y-4 self-start print:hidden">
              <ApplicantManagementNav
                activeView={activeView}
                recruitmentId={recruitmentId}
                part={showPartFilter ? part : null}
                status={showStatusFilter ? status : null}
                evaluationFilter={showEvaluationFilter ? evaluationFilter : null}
              />
              {renderListCard(true)}
            </div>

            <div className="min-w-0 self-start print:w-full">
              <ApplicationDetailPage
                applicationId={selectedApplicationId}
                embedded
                onClose={handleCloseViewer}
                onStatusUpdated={() => setReloadToken((prev) => prev + 1)}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
