"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getApplicantManagementViewMeta,
  getFixedStatusForView,
  getInterviewsListView,
} from "../applicantManagement";
import { getAdminApplications, getAdminInterviewCandidates, getRecruitments } from "../api";
import ApplicantFilters from "../components/ApplicantFilters";
import ApplicantManagementNav from "../components/ApplicantManagementNav";
import ApplicantPagination from "../components/ApplicantPagination";
import ApplicantTable from "../components/ApplicantTable";
import InterviewCandidateTable from "../components/InterviewCandidateTable";
import type {
  AdminApplicationListResponse,
  AdminApplyPart,
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
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [candidateResult, setCandidateResult] =
    useState<AdminInterviewCandidateListResponse>(EMPTY_CANDIDATE_PAGE);
  const [applicationResult, setApplicationResult] =
    useState<AdminApplicationListResponse>(EMPTY_APPLICATION_PAGE);
  const [reloadToken, setReloadToken] = useState(0);

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
  const resolvedPart = showPartFilter && part !== "ALL" ? part : undefined;
  const currentPageInfo =
    activeView === "INTERVIEW_CANDIDATES"
      ? candidateResult.page
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
        if (activeView === "INTERVIEW_CANDIDATES") {
          const response = await getAdminInterviewCandidates({
            recruitmentId,
            page,
            size: PAGE_SIZE,
          });
          if (!mounted) return;
          setCandidateResult(response);
          setApplicationResult(EMPTY_APPLICATION_PAGE);
          return;
        }

        if (activeView === "FINAL_PENDING") {
          if (!mounted) return;
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
      } catch {
        if (!mounted) return;
        setError(
          activeView === "FINAL_PASSED"
            ? "최종 합격자 목록을 불러오지 못했습니다."
            : "서류 합격자 목록을 불러오지 못했습니다.",
        );
        setCandidateResult(EMPTY_CANDIDATE_PAGE);
        setApplicationResult(EMPTY_APPLICATION_PAGE);
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

  const buildListHref = (next: {
    recruitmentId?: number | null;
    page?: number;
    part?: "ALL" | AdminApplyPart;
    applicationId?: number | null;
  }) => {
    const params = new URLSearchParams();
    const nextRecruitmentId =
      next.recruitmentId !== undefined ? next.recruitmentId : recruitmentId;
    const nextPage = typeof next.page === "number" ? next.page : page;
    const nextPart = next.part ?? part;

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
    setRecruitmentId(parsed);
    updateQuery({
      recruitmentId: parsed,
      page: 0,
      part,
      applicationId: null,
    });
  };

  const handleSelectApplication = (applicationId: number) => {
    updateQuery({
      recruitmentId,
      page: currentPageInfo.page,
      part,
      applicationId,
    });
  };

  const handleCloseViewer = () => {
    updateQuery({
      recruitmentId,
      page: currentPageInfo.page,
      part,
      applicationId: null,
    });
  };

  const renderTable = (compact: boolean) => {
    if (activeView === "INTERVIEW_CANDIDATES") {
      return (
        <InterviewCandidateTable
          result={candidateResult}
          isLoading={isLoading}
          hasRecruitmentId={Boolean(recruitmentId)}
          selectedApplicationId={compact ? selectedApplicationId : null}
          compact={compact}
          onSelectApplication={handleSelectApplication}
        />
      );
    }

    if (activeView === "FINAL_PENDING") {
      return (
        <div className="mt-4 rounded-xl border border-[#4a4f5b] bg-[#2d3037] px-4 py-12 text-center text-sm text-gray-4">
          API 명세에는 최종 예비 합격자 목록 조회 엔드포인트가 아직 없습니다.
          <br />
          면접 평가는 진행할 수 있지만, 예비 합격자 집계 목록은 백엔드 조회 API가
          추가되어야 연결할 수 있습니다.
        </div>
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
    <div className="rounded-2xl border border-[#3a3d45] bg-[#2d3037] p-4 lg:p-6">
      <ApplicantFilters
        recruitments={recruitments}
        selectedRecruitmentId={selectedRecruitmentId}
        isRecruitmentsLoading={isRecruitmentsLoading}
        compact={compact}
        part={showPartFilter ? part : undefined}
        onRecruitmentChange={setSelectedRecruitmentId}
        onPartChange={
          showPartFilter
            ? (nextPart) => {
                setPart(nextPart);
                setPage(0);
              }
            : undefined
        }
        onApply={handleApplyRecruitmentId}
      />

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-3">{viewMeta.label}</p>
        <p className="text-xs text-gray-4">
          총 {currentTotalElements.toLocaleString("ko-KR")}명
        </p>
      </div>

      {activeView === "FINAL_PENDING" &&
        selectedRecruitment &&
        !isInterviewEvaluating && (
          <p className="mt-3 text-sm text-gray-4">
            현재 모집 단계는 `{selectedRecruitment.phaseType}`입니다. 최종 예비 합격
            집계는 `INTERVIEW_EVALUATING` 단계에서 진행하는 흐름으로 맞추는 것이
            안전합니다.
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
      {!recruitmentId && !error && (
        <p className="mt-3 text-sm text-gray-4">모집을 선택해 주세요.</p>
      )}

      {renderTable(compact)}

      {activeView !== "FINAL_PENDING" && (
        <ApplicantPagination
          page={currentPageInfo.page}
          totalPages={currentPageInfo.totalPages}
          isLoading={isLoading}
          disabled={!recruitmentId}
          pageButtonLimit={PAGE_BUTTON_LIMIT}
          onChangePage={(nextPage) => {
            setPage(nextPage);
            updateQuery({
              recruitmentId,
              page: nextPage,
              part,
              applicationId: compact ? selectedApplicationId : null,
            });
          }}
        />
      )}
    </div>
  );

  return (
    <section className="bg-background px-4 py-10 text-white lg:px-8 lg:py-14">
      <div className="mx-auto max-w-[1200px]">
        <h1 className="text-[34px] font-bold tracking-[-0.02em]">{viewMeta.pageTitle}</h1>

        {!selectedApplicationId && (
          <div className="mt-8 grid items-start gap-4 lg:grid-cols-[220px_1fr]">
            <ApplicantManagementNav
              activeView={activeView}
              recruitmentId={recruitmentId}
              part={showPartFilter ? part : null}
            />
            {renderListCard(false)}
          </div>
        )}

        {selectedApplicationId && (
          <div className="mt-8 grid items-start gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(0,7fr)]">
            <div className="space-y-4 self-start">
              <ApplicantManagementNav
                activeView={activeView}
                recruitmentId={recruitmentId}
                part={showPartFilter ? part : null}
              />
              {renderListCard(true)}
            </div>

            <div className="self-start">
              <InterviewCandidateDetailPage
                applicationId={selectedApplicationId}
                embedded
                onClose={handleCloseViewer}
                onDecisionUpdated={() => setReloadToken((prev) => prev + 1)}
                recruitmentId={recruitmentId}
                recruitmentPhase={selectedRecruitment?.phaseType}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
