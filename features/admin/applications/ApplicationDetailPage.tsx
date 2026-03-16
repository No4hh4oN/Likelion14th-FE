"use client";

import { getMyInfo } from "@/features/public/api";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  getApplicationsListView,
  type ExtendedAdminApplicationStatus,
} from "../applicantManagement";
import {
  getAdminApplicationDetail,
  getAdminDocumentScoresDetail,
  getMyAdminDocumentScores,
  postAdminDocumentPendingDecision,
  upsertMyAdminDocumentScores,
} from "../api";
import ApplicantManagementNav from "../components/ApplicantManagementNav";
import { canManageApplicantDecisions } from "../permissions";
import type {
  AdminApplicationDetailResponse,
  AdminApplyPart,
  AdminDocumentScoresDetailResponse,
  AdminEvaluationFilter,
} from "../type";

type ApplicationDetailPageProps = {
  applicationId: number;
  embedded?: boolean;
  onClose?: () => void;
  onStatusUpdated?: () => void;
};

type DetailTab = "document" | "score" | "review";

const DOCUMENT_QUESTION_MAX_SCORES = [10, 10, 10, 20, 20, 30] as const;
const DEFAULT_DOCUMENT_QUESTION_MAX_SCORE = 30;

const getDocumentQuestionMaxScore = (index: number) =>
  DOCUMENT_QUESTION_MAX_SCORES[index] ?? DEFAULT_DOCUMENT_QUESTION_MAX_SCORE;

function formatPart(value: string) {
  if (value === "FRONTEND") return "FRONTEND";
  if (value === "BACKEND") return "BACKEND";
  if (value === "AI_ML") return "AI/ML";
  if (value === "PM_DESIGN") return "PM/DESIGN";
  return value;
}

function formatEnrollment(value: string) {
  const upper = value.toUpperCase();
  if (upper === "ENROLLED") return "재학";
  if (upper === "LEAVE") return "휴학";
  if (upper === "GRADUATED") return "졸업";
  return value;
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Seoul",
  }).format(date);
}

function formatFileSize(size: number) {
  if (!Number.isFinite(size) || size <= 0) return "-";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function getTabLabel(tab: DetailTab) {
  if (tab === "document") return "서류 보기";
  if (tab === "score") return "점수 매기기";
  return "점수 현황";
}

function isDraftApplicationStatus(value?: string | null) {
  return (value?.toUpperCase?.() ?? "") === "DRAFT";
}

export default function ApplicationDetailPage({
  applicationId,
  embedded = false,
  onClose,
  onStatusUpdated,
}: ApplicationDetailPageProps) {
  const searchParams = useSearchParams();
  const listQuery = searchParams.toString();
  const listHref = `/admin/applications${listQuery ? `?${listQuery}` : ""}`;
  const activeView = useMemo(
    () => getApplicationsListView(searchParams.get("view")),
    [searchParams],
  );

  const [activeTab, setActiveTab] = useState<DetailTab>("document");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [scoreError, setScoreError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [detail, setDetail] = useState<AdminApplicationDetailResponse | null>(
    null,
  );
  const [scores, setScores] = useState<Record<number, number>>({});
  const [comment, setComment] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPendingDecisionLoading, setIsPendingDecisionLoading] = useState(false);
  const [pendingDecisionMessage, setPendingDecisionMessage] = useState("");
  const [documentScoreDetail, setDocumentScoreDetail] =
    useState<AdminDocumentScoresDetailResponse | null>(null);
  const canManageDocumentPendingDecision = isAdmin;

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setIsLoading(true);
      setDetailError("");
      setScoreError("");
      setSaveMessage("");
      setPendingDecisionMessage("");

      try {
        const detailResponse = await getAdminApplicationDetail(applicationId);
        if (!mounted) return;
        setDetail(detailResponse);
        const isDraft = isDraftApplicationStatus(detailResponse.status);
        const meResult = await Promise.allSettled([getMyInfo()]);

        if (!mounted) return;

        if (meResult[0]?.status === "fulfilled") {
          setIsAdmin(canManageApplicantDecisions(meResult[0].value));
        } else {
          setIsAdmin(false);
        }

        if (isDraft) {
          setScores({});
          setComment("");
          setDocumentScoreDetail(null);
          return;
        }

        const [myScoreResult, scoreDetailResult] = await Promise.allSettled([
          getMyAdminDocumentScores(applicationId),
          getAdminDocumentScoresDetail(applicationId),
        ]);

        if (!mounted) return;

        if (myScoreResult.status === "fulfilled") {
          setScores(
            Object.fromEntries(
              myScoreResult.value.scores.map((item) => [item.questionId, item.score]),
            ) as Record<number, number>,
          );
          setComment(myScoreResult.value.comment ?? "");
        } else {
          setScores({});
          setComment("");
          setScoreError(
            "내 점수 정보를 불러오지 못했습니다. 점수 매기기 탭에서 다시 시도해 주세요.",
          );
        }

        if (scoreDetailResult.status === "fulfilled") {
          setDocumentScoreDetail(scoreDetailResult.value);
        } else {
          setDocumentScoreDetail(null);
          setScoreError("운영진 점수 현황을 불러오지 못했습니다.");
        }
      } catch {
        if (!mounted) return;
        setDetailError("지원서 상세를 불러오지 못했습니다.");
      } finally {
        if (!mounted) return;
        setIsLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [applicationId]);

  const scoredQuestions = useMemo(() => {
    if (!detail) return [];
    return detail.answers.map((answer) => ({
      questionId: answer.questionId,
      content: answer.content,
      answer: answer.answer,
      score: scores[answer.questionId] ?? 0,
    }));
  }, [detail, scores]);
  const isDraftApplication = isDraftApplicationStatus(detail?.status);

  const handleSave = async () => {
    if (!detail || isSaving || isDraftApplication) return;
    setIsSaving(true);
    setSaveMessage("");
    setScoreError("");

    try {
      await upsertMyAdminDocumentScores(applicationId, {
        scores: scoredQuestions.map((item) => ({
          questionId: item.questionId,
          score: item.score,
        })),
        comment,
      });
      setSaveMessage("점수를 저장했습니다.");
    } catch {
      setScoreError("점수 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePendingDecision = async (decision: "PASS" | "FAIL") => {
    if (!detail || !isAdmin || isPendingDecisionLoading || isDraftApplication) return;
    setIsPendingDecisionLoading(true);
    setPendingDecisionMessage("");
    setScoreError("");

    try {
      await postAdminDocumentPendingDecision({
        recruitmentId: detail.recruitmentId,
        passIds: decision === "PASS" ? [detail.applicationId] : [],
        failIds: decision === "FAIL" ? [detail.applicationId] : [],
      });
      setPendingDecisionMessage(
        decision === "PASS"
          ? "서류 예비 합격으로 처리했습니다."
          : "서류 예비 합격을 취소했습니다.",
      );
      onStatusUpdated?.();
    } catch {
      setScoreError("서류 예비 합격 처리에 실패했습니다.");
    } finally {
      setIsPendingDecisionLoading(false);
    }
  };

  const detailBody = (
    <div
      className={`${embedded ? "" : "mt-6"} rounded-2xl bg-[#323640] p-6 lg:p-8 print:rounded-none print:bg-transparent print:p-0 print:text-black`}
    >
      <h2 className="text-[36px] font-bold lg:text-[44px]">
        {formatPart(detail?.applyPart ?? "-")}
      </h2>

      {detail && (
        <>
          <dl className="mt-6 grid grid-cols-[110px_1fr] gap-y-2 text-sm text-gray-3 lg:max-w-[520px]">
            <dt className="font-semibold text-gray-2">학과</dt>
            <dd>{detail.applicant.department}</dd>
            <dt className="font-semibold text-gray-2">학번</dt>
            <dd>{detail.applicant.studentNoPrefix}학번</dd>
            <dt className="font-semibold text-gray-2">학적상태</dt>
            <dd>
              {detail.applicant.grade}학년 {formatEnrollment(detail.applicant.enrollment)}
            </dd>
            <dt className="font-semibold text-gray-2">지원일시</dt>
            <dd>{formatDateTime(detail.submittedAt)}</dd>
          </dl>

          {documentScoreDetail && (
            <p className="mt-4 text-sm text-gray-4">
              평균 {documentScoreDetail.reviewCount}명 평균 점수{" "}
              {documentScoreDetail.average.toFixed(2)}
            </p>
          )}
        </>
      )}

      <div className="mt-6 flex flex-wrap gap-2 border-b border-[#606673] pb-4 print:hidden">
        {(["document", "score", "review"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            disabled={isDraftApplication && tab !== "document"}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === tab
                ? "bg-main-1 text-white"
                : "bg-[#454c5a] text-gray-2 hover:bg-[#565f70]"
            } ${isDraftApplication && tab !== "document" ? "cursor-not-allowed opacity-50 hover:bg-[#454c5a]" : ""}`}
          >
            {getTabLabel(tab)}
          </button>
        ))}
      </div>

      {isLoading && <p className="mt-6 text-sm text-gray-3">로딩 중입니다.</p>}
      {!isLoading && detailError && (
        <p className="mt-6 text-sm text-[#ff9ea8]">{detailError}</p>
      )}

      {!isLoading && detail && activeTab === "document" && (
        <div className="mt-8 space-y-8">
          <article className="space-y-3">
            <h3 className="text-lg font-semibold">포트폴리오</h3>
            <div className="rounded-lg bg-[#404654] p-4 text-sm text-gray-2">
              <dl className="space-y-3">
                <div className="grid grid-cols-[90px_1fr] items-start gap-2">
                  <dt className="text-gray-4">링크</dt>
                  <dd className="min-w-0">
                    {detail.portfolioUrl && detail.portfolioUrl.trim().length > 0 ? (
                      <a
                        href={detail.portfolioUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="break-all text-[#8fd3ff] underline underline-offset-2"
                      >
                        {detail.portfolioUrl}
                      </a>
                    ) : (
                      <span className="text-gray-4">-</span>
                    )}
                  </dd>
                </div>
                <div className="grid grid-cols-[90px_1fr] items-start gap-2">
                  <dt className="text-gray-4">첨부 파일</dt>
                  <dd className="min-w-0">
                    {detail.files.length > 0 ? (
                      <ul className="space-y-2">
                        {detail.files.map((file) => (
                          <li key={file.fileId}>
                            {file.url && file.url.trim().length > 0 ? (
                              <a
                                href={file.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex max-w-full items-center gap-2 text-[#8fd3ff] underline underline-offset-2"
                              >
                                <span className="truncate">{file.originalName}</span>
                                <span className="shrink-0 text-xs text-gray-4">
                                  ({formatFileSize(file.size)})
                                </span>
                              </a>
                            ) : (
                              <span className="inline-flex max-w-full items-center gap-2 text-gray-2">
                                <span className="truncate">{file.originalName}</span>
                                <span className="shrink-0 text-xs text-gray-4">
                                  ({formatFileSize(file.size)})
                                </span>
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-gray-4">-</span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </article>

          {detail.answers.map((answer, index) => (
            <article key={answer.questionId} className="space-y-3">
              <h3 className="text-lg font-semibold">
                문항 {index + 1}. {answer.content}
              </h3>
              <p className="whitespace-pre-wrap rounded-lg bg-[#404654] p-4 text-sm text-gray-2">
                {answer.answer}
              </p>
            </article>
          ))}
        </div>
      )}

      {!isLoading && detail && activeTab === "score" && (
        <div className="mt-8">
          {isDraftApplication && (
            <p className="mb-6 rounded-lg border border-[#5d6473] bg-[#404654] px-4 py-3 text-sm text-gray-2">
              임시저장 지원서는 점수를 매길 수 없습니다. 제출 완료 후 평가를 진행해
              주세요.
            </p>
          )}
          <div className="space-y-8">
            {scoredQuestions.map((item, index) => {
              const maxScore = getDocumentQuestionMaxScore(index);

              return (
                <article key={item.questionId} className="space-y-3">
                  <h3 className="text-lg font-semibold">
                    문항 {index + 1}. {item.content}
                  </h3>
                  <p className="whitespace-pre-wrap rounded-lg bg-[#404654] p-4 text-sm text-gray-2">
                    {item.answer}
                  </p>
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-gray-3">
                      문항 점수 (최대 {maxScore}점)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={maxScore}
                      step={1}
                      value={item.score}
                      disabled={isDraftApplication}
                      onChange={(event) => {
                        const numeric = Number(event.target.value);
                        const next = Number.isFinite(numeric)
                          ? Math.max(0, Math.min(maxScore, numeric))
                          : 0;
                        setScores((prev) => ({
                          ...prev,
                          [item.questionId]: next,
                        }));
                      }}
                      className="h-9 w-24 rounded-md border border-[#666d7d] bg-[#505767] px-3 text-sm outline-none focus:border-main-1"
                    />
                  </div>
                </article>
              );
            })}
          </div>

          <div className="my-8 h-px bg-[#606673]" />

          <div className="space-y-3">
            <h3 className="text-[22px] font-semibold">총평 코멘트</h3>
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={5}
              placeholder="코멘트를 입력해 주세요."
              disabled={isDraftApplication}
              className="w-full resize-none rounded-xl border border-[#62697A] bg-[#4C5262] p-4 text-sm text-white placeholder:text-gray-4 outline-none focus:border-main-1"
            />
          </div>

          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || isDraftApplication}
              className="rounded-lg bg-main-1 px-10 py-3 text-sm font-semibold disabled:opacity-60"
            >
              {isSaving ? "저장 중..." : "점수 저장"}
            </button>
          </div>
        </div>
      )}

      {!isLoading && detail && activeTab === "review" && (
        <div className="mt-8 space-y-5">
          {isDraftApplication && (
            <p className="rounded-lg border border-[#5d6473] bg-[#404654] px-4 py-3 text-sm text-gray-2">
              임시저장 지원서는 평가 내역을 조회할 수 없습니다.
            </p>
          )}
          {!isDraftApplication && documentScoreDetail ? (
            <>
              <div className="rounded-lg bg-[#404654] px-4 py-3 text-sm text-gray-2">
                리뷰어 {documentScoreDetail.reviewCount}명 평균:{" "}
                {documentScoreDetail.average.toFixed(2)}
              </div>

              {documentScoreDetail.canViewOthersScores &&
                documentScoreDetail.reviews.map((review, idx) => (
                  <article
                    key={`${review.reviewer.name}-${idx}`}
                    className="rounded-xl border border-[#4a5162] bg-[#3a404d] p-4"
                  >
                    <p className="text-sm font-semibold">
                      {review.reviewer.name} ({review.reviewer.part})
                    </p>
                    <p className="mt-1 text-xs text-gray-4">총점: {review.total}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {review.scores.map((score) => (
                        <span
                          key={score.questionId}
                          className="rounded-md bg-[#4f5668] px-2 py-1 text-xs"
                        >
                          Q{score.questionId}: {score.score}
                        </span>
                      ))}
                    </div>
                    <p className="mt-3 whitespace-pre-wrap rounded-md bg-[#454c5a] p-3 text-sm text-gray-2">
                      {review.comment || "-"}
                    </p>
                  </article>
                ))}

              {canManageDocumentPendingDecision && !isDraftApplication && (
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handlePendingDecision("PASS")}
                    disabled={isPendingDecisionLoading}
                    className="rounded-lg bg-[#1f9d55] px-6 py-2.5 text-sm font-semibold disabled:opacity-60"
                  >
                    서류 예비 합격
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePendingDecision("FAIL")}
                    disabled={isPendingDecisionLoading}
                    className="rounded-lg bg-[#cc3a3a] px-6 py-2.5 text-sm font-semibold disabled:opacity-60"
                  >
                    서류 예비 합격 취소
                  </button>
                </div>
              )}
            </>
          ) : !isDraftApplication ? (
            <p className="text-sm text-gray-3">점수 상세 정보를 불러오지 못했습니다.</p>
          ) : null}
        </div>
      )}

      {scoreError && <p className="mt-4 text-sm text-[#ff9ea8] print:hidden">{scoreError}</p>}
      {saveMessage && <p className="mt-2 text-sm text-[#8fd3ff] print:hidden">{saveMessage}</p>}
      {pendingDecisionMessage && (
        <p className="mt-2 text-sm text-[#8fd3ff] print:hidden">{pendingDecisionMessage}</p>
      )}
    </div>
  );

  if (embedded) {
    return (
      <div className="rounded-2xl border border-[#3a3d45] bg-[#2d3037] p-4 print:rounded-none print:border-0 print:bg-transparent print:p-0">
        <div className="mb-3 flex items-center justify-between print:hidden">
          <h3 className="text-sm font-semibold text-gray-2">지원서 상세</h3>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-[#454c5a] px-3 py-1.5 text-xs"
            >
              닫기
            </button>
          )}
        </div>
        {detailBody}
      </div>
    );
  }

  return (
    <section className="bg-background px-4 py-10 text-white lg:px-8 lg:py-14">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
          <ApplicantManagementNav
            activeView={activeView}
            recruitmentId={detail?.recruitmentId}
            part={searchParams.get("part") as "ALL" | AdminApplyPart | null}
            status={
              searchParams.get("status") as
                | "ALL"
                | ExtendedAdminApplicationStatus
                | null
            }
            evaluationFilter={
              searchParams.get("evaluation") as AdminEvaluationFilter | null
            }
          />

          <div className="rounded-2xl border border-[#3a3d45] bg-[#2d3037] p-4 lg:p-6">
            <div className="flex justify-end">
              <Link
                href={listHref}
                className="rounded-lg bg-main-1 px-6 py-3 text-sm font-semibold"
              >
                목록 보기
              </Link>
            </div>
            {detailBody}
          </div>
        </div>
      </div>
    </section>
  );
}
