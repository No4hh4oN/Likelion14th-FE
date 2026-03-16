"use client";

import { getMyInfo } from "@/features/public/api";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getApplicantManagementViewMeta,
  getFixedStatusForView,
  getInterviewsListView,
} from "../applicantManagement";
import {
  getAdminApplications,
  getAdminFinalPendingPasses,
  getAdminInterviewCandidates,
  getMyAdminInterviewScore,
  getRecruitments,
  postAdminFinalFinalize,
} from "../api";
import ApplicantFilters from "../components/ApplicantFilters";
import ApplicantManagementNav from "../components/ApplicantManagementNav";
import ApplicantPagination from "../components/ApplicantPagination";
import ApplicantTable from "../components/ApplicantTable";
import FinalPendingPassTable from "../components/FinalPendingPassTable";
import InterviewCandidateTable from "../components/InterviewCandidateTable";
import { canManageApplicantDecisions } from "../permissions";
import type {
  AdminApplicationListResponse,
  AdminApplyPart,
  AdminEvaluationFilter,
  AdminFinalPendingPassListResponse,
  AdminInterviewCandidateListResponse,
  AdminRecruitmentListItem,
} from "../type";
import InterviewCandidateDetailPage from "./InterviewCandidateDetailPage";

const PAGE_SIZE = 12;
const PAGE_BUTTON_LIMIT = 10;

const EMPTY_APPLICATION_PAGE: AdminApplicationListResponse = {
  items: [],
  page: {
    page: 0,
    size: PAGE_SIZE,
    totalElements: 0,
    totalPages: 0,
  },
};

const EMPTY_CANDIDATE_PAGE: AdminInterviewCandidateListResponse = {
  items: [],
  page: {
    page: 0,
    size: PAGE_SIZE,
    totalElements: 0,
    totalPages: 0,
  },
};

const EMPTY_FINAL_PENDING_PAGE: AdminFinalPendingPassListResponse = {
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

function parseEvaluationFilterParam(value: string | null): AdminEvaluationFilter {
  if (value === "NOT_REVIEWED" || value === "REVIEWED") {
    return value;
  }

  return "ALL";
}

export default function InterviewCandidatesListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeView = useMemo(
    () => getInterviewsListView(searchParams.get("view")),
    [searchParams],
  );
  const viewMeta = getApplicantManagementViewMeta(activeView);
  const [recruitments, setRecruitments] = useState<AdminRecruitmentListItem[]>([]);
  const [isRecruitmentsLoading, setIsRecruitmentsLoading] = useState(false);
  const [selectedRecruitmentId, setSelectedRecruitmentId] = useState("");
  const [recruitmentId, setRecruitmentId] = useState<number | null>(null);
  const [part, setPart] = useState<"ALL" | AdminApplyPart>("ALL");
  const [evaluationFilter, setEvaluationFilter] =
    useState<AdminEvaluationFilter>("ALL");
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [candidateResult, setCandidateResult] =
    useState<AdminInterviewCandidateListResponse>(EMPTY_CANDIDATE_PAGE);
  const [applicationResult, setApplicationResult] =
    useState<AdminApplicationListResponse>(EMPTY_APPLICATION_PAGE);
  const [finalPendingResult, setFinalPendingResult] =
    useState<AdminFinalPendingPassListResponse>(EMPTY_FINAL_PENDING_PAGE);
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
  const isInterviewEvaluating =
    selectedRecruitment?.phaseType === "INTERVIEW_EVALUATING";
  const showPartFilter = activeView === "FINAL_PASSED";
  const showEvaluationFilter = activeView === "INTERVIEW_CANDIDATES";
  const isEvaluationFilteringActive =
    showEvaluationFilter && evaluationFilter !== "ALL";
  const resolvedPart = showPartFilter && part !== "ALL" ? part : undefined;
  const currentPageInfo =
    activeView === "INTERVIEW_CANDIDATES"
      ? candidateResult.page
      : activeView === "FINAL_PENDING"
        ? finalPendingResult.page
        : applicationResult.page;
  const currentTotalElements = currentPageInfo.totalElements;

  useEffect(() => {
    const pageParam = Number(searchParams.get("page"));

    if (Number.isInteger(pageParam) && pageParam >= 0) {
      setPage(pageParam);
    } else {
      setPage(0);
    }

    setPart(parsePartParam(searchParams.get("part")));
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
        if (activeView === "INTERVIEW_CANDIDATES") {
          const response = await getAdminInterviewCandidates({
            recruitmentId,
            page,
            size: PAGE_SIZE,
          });
          if (!mounted) return;
          setCandidateResult(response);
          setApplicationResult(EMPTY_APPLICATION_PAGE);
          setFinalPendingResult(EMPTY_FINAL_PENDING_PAGE);
          return;
        }

        if (activeView === "FINAL_PENDING") {
          const response = await getAdminFinalPendingPasses({
            recruitmentId,
            page,
            size: PAGE_SIZE,
          });
          if (!mounted) return;
          setFinalPendingResult(response);
          setCandidateResult(EMPTY_CANDIDATE_PAGE);
          setApplicationResult(EMPTY_APPLICATION_PAGE);
          return;
        }

        const response = await getAdminApplications({
          recruitmentId,
          part: resolvedPart,
          status: getFixedStatusForView(activeView),
          page,
          size: PAGE_SIZE,
        });
        if (!mounted) return;
        setApplicationResult(response);
        setCandidateResult(EMPTY_CANDIDATE_PAGE);
        setFinalPendingResult(EMPTY_FINAL_PENDING_PAGE);
      } catch {
        if (!mounted) return;
        setError(
          activeView === "FINAL_PENDING"
            ? "최종 예비 합격자 목록을 불러오지 못했습니다."
            : activeView === "FINAL_PASSED"
              ? "최종 합격자 목록을 불러오지 못했습니다."
              : "서류 합격자 목록을 불러오지 못했습니다.",
        );
        setCandidateResult(EMPTY_CANDIDATE_PAGE);
        setApplicationResult(EMPTY_APPLICATION_PAGE);
        setFinalPendingResult(EMPTY_FINAL_PENDING_PAGE);
      } finally {
        if (!mounted) return;
        setIsLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [activeView, page, recruitmentId, reloadToken, resolvedPart]);

  useEffect(() => {
    if (
      activeView !== "INTERVIEW_CANDIDATES" ||
      !showEvaluationFilter ||
      !isEvaluationFilteringActive
    ) {
      setIsEvaluationStatusLoading(false);
      setEvaluationError("");
      return;
    }

    if (candidateResult.items.length === 0) {
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
        candidateResult.items.map(async (item) => {
          const response = await getMyAdminInterviewScore(item.applicationId);
          return { applicationId: item.applicationId, exists: response.exists };
        }),
      );

      if (!mounted) return;

      const nextMap: Record<number, boolean> = {};
      let hasFailure = false;

      results.forEach((result, index) => {
        const fallbackId = candidateResult.items[index]?.applicationId;

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
    candidateResult.items,
    isEvaluationFilteringActive,
    showEvaluationFilter,
  ]);

  const displayedCandidateResult = useMemo<AdminInterviewCandidateListResponse>(() => {
    if (!isEvaluationFilteringActive) {
      return candidateResult;
    }

    return {
      ...candidateResult,
      items: candidateResult.items.filter((item) => {
        const hasReviewed = evaluationStatusMap[item.applicationId] === true;
        return evaluationFilter === "REVIEWED" ? hasReviewed : !hasReviewed;
      }),
    };
  }, [
    candidateResult,
    evaluationFilter,
    evaluationStatusMap,
    isEvaluationFilteringActive,
  ]);
  const hasEvaluationStatusesForCurrentItems = useMemo(() => {
    if (!isEvaluationFilteringActive) {
      return true;
    }

    return candidateResult.items.every((item) =>
      Object.prototype.hasOwnProperty.call(evaluationStatusMap, item.applicationId),
    );
  }, [candidateResult.items, evaluationStatusMap, isEvaluationFilteringActive]);
  const isTableLoading =
    isLoading ||
    isEvaluationStatusLoading ||
    (isEvaluationFilteringActive && !hasEvaluationStatusesForCurrentItems);

  const buildListHref = (next: {
    recruitmentId?: number | null;
    page?: number;
    part?: "ALL" | AdminApplyPart;
    evaluationFilter?: AdminEvaluationFilter;
    applicationId?: number | null;
  }) => {
    const params = new URLSearchParams();
    const nextRecruitmentId =
      next.recruitmentId !== undefined ? next.recruitmentId : recruitmentId;
    const nextPage = typeof next.page === "number" ? next.page : page;
    const nextPart = next.part ?? part;
    const nextEvaluationFilter = next.evaluationFilter ?? evaluationFilter;

    if (activeView === "FINAL_PENDING") {
      params.set("view", "final-pending");
    }

    if (activeView === "FINAL_PASSED") {
      params.set("view", "final-passed");
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
      evaluationFilter,
      applicationId: null,
    });
  };

  const handleSelectApplication = (applicationId: number) => {
    updateQuery({
      recruitmentId,
      page: currentPageInfo.page,
      part,
      evaluationFilter,
      applicationId,
    });
  };

  const handleCloseViewer = () => {
    updateQuery({
      recruitmentId,
      page: currentPageInfo.page,
      part,
      evaluationFilter,
      applicationId: null,
    });
  };

  const handleFinalizeResults = async () => {
    if (
      !recruitmentId ||
      !canManageDecisions ||
      !isInterviewEvaluating ||
      isFinalizeLoading
    ) {
      return;
    }

    setIsFinalizeLoading(true);
    setActionError("");
    setActionMessage("");

    try {
      const response = await postAdminFinalFinalize({ recruitmentId });
      setActionMessage(
        `최종 합격 일괄 처리를 완료했습니다. ${response.finalizedCount}명을 확정했습니다.`,
      );
      setPage(0);
      setReloadToken((prev) => prev + 1);
      updateQuery({
        recruitmentId,
        page: 0,
        part,
        evaluationFilter,
        applicationId: null,
      });
    } catch {
      setActionError("최종 합격 일괄 처리에 실패했습니다.");
    } finally {
      setIsFinalizeLoading(false);
    }
  };

  const renderTable = (compact: boolean) => {
    if (activeView === "INTERVIEW_CANDIDATES") {
      return (
        <InterviewCandidateTable
          result={displayedCandidateResult}
          isLoading={isTableLoading}
          hasRecruitmentId={Boolean(recruitmentId)}
          selectedApplicationId={compact ? selectedApplicationId : null}
          compact={compact}
          onSelectApplication={handleSelectApplication}
        />
      );
    }

    if (activeView === "FINAL_PENDING") {
      return (
        <FinalPendingPassTable
          result={finalPendingResult}
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
        result={applicationResult}
        isLoading={isLoading}
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
        onEvaluationFilterChange={
          showEvaluationFilter
            ? (nextEvaluationFilter) => {
                setEvaluationFilter(nextEvaluationFilter);
                setPage(0);
                updateQuery({
                  recruitmentId,
                  page: 0,
                  part,
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
          {activeView === "FINAL_PENDING" && canManageDecisions && (
            <button
              type="button"
              onClick={handleFinalizeResults}
              disabled={!recruitmentId || !isInterviewEvaluating || isFinalizeLoading}
              className="rounded-lg bg-main-1 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
            >
              {isFinalizeLoading ? "처리 중.." : "최종 합격 일괄 처리"}
            </button>
          )}
          <p className="text-xs text-gray-4">
            총 {currentTotalElements.toLocaleString("ko-KR")}명
          </p>
        </div>
      </div>

      {activeView === "FINAL_PENDING" &&
        selectedRecruitment &&
        !isInterviewEvaluating && (
          <p className="mt-3 text-sm text-gray-4">
            현재 모집 단계는 `{selectedRecruitment.phaseType}`입니다. 최종 합격
            확정은 `INTERVIEW_EVALUATING` 단계에서만 진행할 수 있습니다.
          </p>
        )}

      {activeView === "INTERVIEW_CANDIDATES" &&
        selectedRecruitment &&
        selectedRecruitment.phaseType === "INTERVIEW_SELECT" && (
          <p className="mt-3 text-sm text-gray-4">
            현재 모집 단계는 `INTERVIEW_SELECT`입니다. 면접 평가는
            `INTERVIEW_EVALUATING` 단계부터 입력하는 흐름을 권장합니다.
          </p>
        )}

      {error && <p className="mt-3 text-sm text-[#ff9ea8]">{error}</p>}
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
                evaluationFilter={showEvaluationFilter ? evaluationFilter : null}
              />
              {renderListCard(true)}
            </div>

            <div className="min-w-0 self-start print:w-full">
              <InterviewCandidateDetailPage
                applicationId={selectedApplicationId}
                embedded
                onClose={handleCloseViewer}
                onDecisionUpdated={() => setReloadToken((prev) => prev + 1)}
                recruitmentId={recruitmentId}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
