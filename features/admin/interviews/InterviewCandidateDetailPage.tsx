"use client";

import { getMyInfo } from "@/features/public/api";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getInterviewsListView } from "../applicantManagement";
import {
  getAdminDocumentScoresDetail,
  getAdminInterviewCandidateDetail,
  getAdminInterviewScoreDetail,
  getMyAdminInterviewScore,
  postAdminFinalPendingDecision,
  upsertMyAdminInterviewScore,
} from "../api";
import ApplicantManagementNav from "../components/ApplicantManagementNav";
import { canManageApplicantDecisions } from "../permissions";
import type {
  AdminApplyPart,
  AdminDocumentScoresDetailResponse,
  AdminEvaluationFilter,
  AdminInterviewCandidateDetailResponse,
  AdminInterviewScoreDetailResponse,
} from "../type";

type InterviewCandidateDetailPageProps = {
  applicationId: number;
  embedded?: boolean;
  onClose?: () => void;
  onDecisionUpdated?: () => void;
  recruitmentId?: number | null;
};

type DetailTab = "document" | "score" | "review";

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
  if (tab === "document") return "지원서 보기";
  if (tab === "score") return "점수 매기기";
  return "점수 현황";
}

export default function InterviewCandidateDetailPage({
  applicationId,
  embedded = false,
  onClose,
  onDecisionUpdated,
  recruitmentId,
}: InterviewCandidateDetailPageProps) {
  const searchParams = useSearchParams();
  const listQuery = searchParams.toString();
  const listHref = `/admin/interviews/candidates${listQuery ? `?${listQuery}` : ""}`;
  const activeView = useMemo(
    () => getInterviewsListView(searchParams.get("view")),
    [searchParams],
  );
  const searchRecruitmentId = Number(searchParams.get("recruitmentId"));
  const effectiveRecruitmentId =
    recruitmentId ??
    (Number.isInteger(searchRecruitmentId) && searchRecruitmentId > 0
      ? searchRecruitmentId
      : null);
  const canManageFinalPendingDecision = effectiveRecruitmentId !== null;

  const [activeTab, setActiveTab] = useState<DetailTab>("document");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [decisionMessage, setDecisionMessage] = useState("");
  const [detail, setDetail] = useState<AdminInterviewCandidateDetailResponse | null>(
    null,
  );
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState("");
  const [interviewScoreDetail, setInterviewScoreDetail] =
    useState<AdminInterviewScoreDetailResponse | null>(null);
  const [documentScoreDetail, setDocumentScoreDetail] =
    useState<AdminDocumentScoresDetailResponse | null>(null);
  const [canManageDecisions, setCanManageDecisions] = useState(false);
  const [isPendingDecisionLoading, setIsPendingDecisionLoading] = useState(false);
  const portfolioLink =
    detail?.portfolioUrl?.trim() || detail?.portfolioLink?.trim() || "";

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setIsLoading(true);
      setError("");
      setSaveMessage("");
      setDecisionMessage("");

      try {
        const detailResponse = await getAdminInterviewCandidateDetail(applicationId);
        if (!mounted) return;
        setDetail(detailResponse);

        const [meResult, myScoreResult, scoreDetailResult, documentScoreResult] =
          await Promise.allSettled([
            getMyInfo(),
            getMyAdminInterviewScore(applicationId),
            getAdminInterviewScoreDetail(applicationId),
            getAdminDocumentScoresDetail(applicationId),
          ]);

        if (!mounted) return;

        if (meResult.status === "fulfilled") {
          setCanManageDecisions(canManageApplicantDecisions(meResult.value));
        } else {
          setCanManageDecisions(false);
        }

        if (myScoreResult.status === "fulfilled") {
          setScore(myScoreResult.value.score ?? 0);
          setComment(myScoreResult.value.comment ?? "");
        } else {
          setScore(0);
          setComment("");
        }

        if (scoreDetailResult.status === "fulfilled") {
          setInterviewScoreDetail(scoreDetailResult.value);
        } else {
          setInterviewScoreDetail(null);
        }

        if (documentScoreResult.status === "fulfilled") {
          setDocumentScoreDetail(documentScoreResult.value);
        } else {
          setDocumentScoreDetail(null);
        }
      } catch {
        if (!mounted) return;
        setError("면접 대상자 상세를 불러오지 못했습니다.");
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

  const handleSave = async () => {
    if (!detail || isSaving) return;
    setIsSaving(true);
    setSaveMessage("");
    setDecisionMessage("");
    setError("");

    try {
      await upsertMyAdminInterviewScore(applicationId, {
        score,
        comment: comment.trim(),
      });
      setSaveMessage("면접 점수를 저장했습니다.");
    } catch {
      setError("면접 점수 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePendingDecision = async (decision: "PASS" | "FAIL") => {
    if (
      !detail ||
      !canManageDecisions ||
      !canManageFinalPendingDecision ||
      !effectiveRecruitmentId ||
      isPendingDecisionLoading
    ) {
      return;
    }

    setIsPendingDecisionLoading(true);
    setDecisionMessage("");
    setSaveMessage("");
    setError("");

    try {
      await postAdminFinalPendingDecision({
        recruitmentId: effectiveRecruitmentId,
        passIds: decision === "PASS" ? [detail.applicationId] : [],
        failIds: decision === "FAIL" ? [detail.applicationId] : [],
      });
      setDecisionMessage(
        decision === "PASS"
          ? "최종 예비 합격으로 처리했습니다."
          : "최종 예비 합격을 취소했습니다.",
      );
      onDecisionUpdated?.();
    } catch {
      setError("최종 예비 합격 처리에 실패했습니다.");
    } finally {
      setIsPendingDecisionLoading(false);
    }
  };

  const documentSectionClass =
    activeTab === "document"
      ? "mt-8 space-y-8"
      : "hidden print:block print:mt-8 print:space-y-8";

  const detailBody = (
    <div
      className={`${embedded ? "" : "mt-6"} rounded-2xl bg-[#323640] p-6 lg:p-8 print:rounded-none print:bg-transparent print:p-0 print:text-black`}
    >
      {isLoading && <p className="text-sm text-gray-3">로딩 중입니다.</p>}
      {!isLoading && error && <p className="text-sm text-[#ff9ea8]">{error}</p>}

      {!isLoading && detail && (
        <>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-4 print:text-gray-600">
            Interview Candidate
          </p>
          <h2 className="mt-2 text-[36px] font-bold lg:text-[44px]">
            {detail.applicant.name}
          </h2>
          <p className="mt-2 text-lg text-gray-3 print:text-gray-700">
            {formatPart(detail.applyPart)}
          </p>

          <dl className="mt-6 grid grid-cols-[110px_1fr] gap-y-2 text-sm text-gray-3 lg:max-w-[620px]">
            <dt className="font-semibold text-gray-2">이름</dt>
            <dd>{detail.applicant.name}</dd>
            <dt className="font-semibold text-gray-2">학과</dt>
            <dd>{detail.applicant.department}</dd>
            <dt className="font-semibold text-gray-2">학번</dt>
            <dd>{detail.applicant.studentNo}</dd>
            <dt className="font-semibold text-gray-2">학적상태</dt>
            <dd>
              {detail.applicant.grade}학년 {formatEnrollment(detail.applicant.enrollment)}
            </dd>
            <dt className="font-semibold text-gray-2">전화번호</dt>
            <dd>{detail.applicant.phone}</dd>
            <dt className="font-semibold text-gray-2">이메일</dt>
            <dd>{detail.applicant.email}</dd>
            <dt className="font-semibold text-gray-2">지원일시</dt>
            <dd>{formatDateTime(detail.submittedAt)}</dd>
          </dl>

          <div className="mt-6 flex flex-wrap gap-2 border-b border-[#606673] pb-4 print:hidden">
            {(["document", "score", "review"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  activeTab === tab
                    ? "bg-main-1 text-white"
                    : "bg-[#454c5a] text-gray-2 hover:bg-[#565f70]"
                }`}
              >
                {getTabLabel(tab)}
              </button>
            ))}
          </div>

          <div className={documentSectionClass}>
            {detail.reservation && (
              <div className="rounded-lg bg-[#404654] px-4 py-3 text-sm text-gray-2 print:border print:border-black/20 print:bg-transparent print:text-black">
                면접 예약: {formatDateTime(detail.reservation.startAt)} -{" "}
                {formatDateTime(detail.reservation.endAt).slice(-5)}
              </div>
            )}

            <article className="space-y-3">
              <h3 className="text-lg font-semibold">포트폴리오</h3>
              <div className="rounded-lg bg-[#404654] p-4 text-sm text-gray-2 print:border print:border-black/20 print:bg-transparent print:text-black">
                <dl className="space-y-3">
                  <div className="grid grid-cols-[90px_1fr] items-start gap-2">
                    <dt className="text-gray-4 print:text-gray-700">링크</dt>
                    <dd className="min-w-0">
                      {portfolioLink ? (
                        <a
                          href={portfolioLink}
                          target="_blank"
                          rel="noreferrer"
                          className="break-all text-[#8fd3ff] underline underline-offset-2 print:text-black"
                        >
                          {portfolioLink}
                        </a>
                      ) : (
                        <span className="text-gray-4 print:text-gray-700">-</span>
                      )}
                    </dd>
                  </div>
                  <div className="grid grid-cols-[90px_1fr] items-start gap-2">
                    <dt className="text-gray-4 print:text-gray-700">첨부 파일</dt>
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
                                  className="inline-flex max-w-full items-center gap-2 text-[#8fd3ff] underline underline-offset-2 print:text-black"
                                >
                                  <span className="truncate">{file.originalName}</span>
                                  <span className="shrink-0 text-xs text-gray-4 print:text-gray-700">
                                    ({formatFileSize(file.size)})
                                  </span>
                                </a>
                              ) : (
                                <span className="inline-flex max-w-full items-center gap-2 text-gray-2 print:text-black">
                                  <span className="truncate">{file.originalName}</span>
                                  <span className="shrink-0 text-xs text-gray-4 print:text-gray-700">
                                    ({formatFileSize(file.size)})
                                  </span>
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-gray-4 print:text-gray-700">-</span>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            </article>

            <div className="space-y-8">
              {detail.answers.map((item, index) => (
                <article key={item.questionId} className="space-y-3">
                  <h3 className="text-lg font-semibold">
                    문항 {index + 1}. {item.content}
                  </h3>
                  <p className="whitespace-pre-wrap rounded-lg bg-[#404654] p-4 text-sm text-gray-2 print:border print:border-black/20 print:bg-transparent print:text-black">
                    {item.answer}
                  </p>
                </article>
              ))}
            </div>

            {documentScoreDetail && (
              <>
                <div className="h-px bg-[#606673] print:bg-black/20" />

                <section className="space-y-5">
                  <div>
                    <h3 className="text-[22px] font-semibold">서류 평가 요약</h3>
                    <p className="mt-2 text-sm text-gray-4 print:text-gray-700">
                      리뷰어 {documentScoreDetail.reviewCount}명, 평균 점수{" "}
                      {documentScoreDetail.average.toFixed(2)}
                    </p>
                  </div>

                  {documentScoreDetail.canViewOthersScores &&
                    documentScoreDetail.reviews.map((review, idx) => (
                      <article
                        key={`${review.reviewer.name}-${idx}`}
                        className="rounded-xl border border-[#4a5162] bg-[#3a404d] p-4 print:border-black/20 print:bg-transparent"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="text-sm font-semibold">
                            {review.reviewer.name} ({review.reviewer.part})
                          </p>
                          <p className="text-xs text-gray-4 print:text-gray-700">
                            총점 {review.total}
                          </p>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {review.scores.map((scoreItem) => (
                            <span
                              key={scoreItem.questionId}
                              className="rounded-md bg-[#4f5668] px-2 py-1 text-xs print:border print:border-black/20 print:bg-transparent"
                            >
                              Q{scoreItem.questionId}: {scoreItem.score}
                            </span>
                          ))}
                        </div>
                        <p className="mt-3 whitespace-pre-wrap rounded-md bg-[#454c5a] p-3 text-sm text-gray-2 print:border print:border-black/20 print:bg-transparent print:text-black">
                          {review.comment || "-"}
                        </p>
                      </article>
                    ))}
                </section>
              </>
            )}
          </div>

          {activeTab === "score" && (
            <div className="mt-8 print:hidden">
              <div className="space-y-3">
                <h3 className="text-[22px] font-semibold">면접 점수 입력</h3>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="text-sm text-gray-3">면접 점수</label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={score}
                    onChange={(event) => {
                      const numeric = Number(event.target.value);
                      setScore(Number.isFinite(numeric) ? Math.max(0, numeric) : 0);
                    }}
                    className="h-9 w-28 rounded-md border border-[#666d7d] bg-[#505767] px-3 text-sm outline-none focus:border-main-1"
                  />
                </div>
              </div>

              <div className="my-8 h-px bg-[#606673]" />

              <div className="space-y-3">
                <h3 className="text-[22px] font-semibold">총평 코멘트</h3>
                <textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  rows={5}
                  placeholder="코멘트를 입력해 주세요."
                  className="w-full resize-none rounded-xl border border-[#62697A] bg-[#4C5262] p-4 text-sm text-white placeholder:text-gray-4 outline-none focus:border-main-1"
                />
              </div>

              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="rounded-lg bg-main-1 px-10 py-3 text-sm font-semibold disabled:opacity-60"
                >
                  {isSaving ? "저장 중..." : "평가 저장"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "review" && (
            <div className="mt-8 space-y-5 print:hidden">
              {interviewScoreDetail ? (
                <>
                  <div className="rounded-lg bg-[#404654] px-4 py-3 text-sm text-gray-2">
                    리뷰어 {interviewScoreDetail.reviewCount}명 평균:{" "}
                    {interviewScoreDetail.average.toFixed(2)}
                  </div>

                  {interviewScoreDetail.canViewOthersScores &&
                  interviewScoreDetail.reviews.length > 0 ? (
                    interviewScoreDetail.reviews.map((review, idx) => (
                      <article
                        key={`${review.reviewerUserUuid}-${idx}`}
                        className="rounded-xl border border-[#4a5162] bg-[#3a404d] p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="text-sm font-semibold">
                            리뷰어 {idx + 1}
                          </p>
                          <p className="text-xs text-gray-4">총점: {review.score}</p>
                        </div>
                        <p className="mt-3 whitespace-pre-wrap rounded-md bg-[#454c5a] p-3 text-sm text-gray-2">
                          {review.comment || "-"}
                        </p>
                      </article>
                    ))
                  ) : (
                    <p className="text-sm text-gray-3">
                      다른 평가자의 상세 점수 현황은 API 연동 시 이 영역에 표시됩니다.
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-3">
                  면접 점수 현황 데이터가 준비되면 이 영역에 표시됩니다.
                </p>
              )}

              {canManageDecisions &&
                activeView !== "FINAL_PASSED" &&
                canManageFinalPendingDecision && (
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => handlePendingDecision("PASS")}
                      disabled={isPendingDecisionLoading}
                      className="rounded-lg bg-[#1f9d55] px-6 py-2.5 text-sm font-semibold disabled:opacity-60"
                    >
                      최종 예비 합격
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePendingDecision("FAIL")}
                      disabled={isPendingDecisionLoading}
                      className="rounded-lg bg-[#cc3a3a] px-6 py-2.5 text-sm font-semibold disabled:opacity-60"
                    >
                      최종 예비 합격 취소
                    </button>
                  </div>
                )}

              {canManageDecisions && !effectiveRecruitmentId && (
                <p className="mt-4 text-sm text-gray-4">
                  recruitmentId가 없어 최종 예비 합격 처리를 실행할 수 없습니다.
                </p>
              )}
            </div>
          )}

          {saveMessage && (
            <p className="mt-3 text-center text-sm text-[#8fd3ff] print:hidden">
              {saveMessage}
            </p>
          )}
          {decisionMessage && (
            <p className="mt-3 text-center text-sm text-[#8fd3ff] print:hidden">
              {decisionMessage}
            </p>
          )}
        </>
      )}
    </div>
  );

  if (embedded) {
    return (
      <div className="rounded-2xl border border-[#3a3d45] bg-[#2d3037] p-4 print:rounded-none print:border-0 print:bg-transparent print:p-0">
        <div className="mb-3 flex items-center justify-between print:hidden">
          <h3 className="text-sm font-semibold text-gray-2">지원자 상세</h3>
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
    <section className="bg-background px-4 py-10 text-white lg:px-8 lg:py-14 print:bg-white print:px-0 print:py-0 print:text-black">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid gap-4 lg:grid-cols-[220px_1fr] print:block">
          <div className="print:hidden">
            <ApplicantManagementNav
              activeView={activeView}
              recruitmentId={effectiveRecruitmentId}
              part={searchParams.get("part") as "ALL" | AdminApplyPart | null}
              evaluationFilter={
                searchParams.get("evaluation") as AdminEvaluationFilter | null
              }
            />
          </div>

          <div className="rounded-2xl border border-[#3a3d45] bg-[#2d3037] p-4 lg:p-6 print:w-full print:rounded-none print:border-0 print:bg-transparent print:p-0">
            <div className="flex justify-end print:hidden">
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
