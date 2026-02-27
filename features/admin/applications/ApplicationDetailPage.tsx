"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  getAdminApplicationDetail,
  getAdminDocumentScoresDetail,
  getMyAdminDocumentScores,
  postAdminDocumentPendingDecision,
  upsertMyAdminDocumentScores,
} from "../api";
import type {
  AdminApplicationDetailResponse,
  AdminDocumentScoresDetailResponse,
} from "../type";
import { getMyInfo } from "@/features/public/api";

type ApplicationDetailPageProps = {
  applicationId: number;
  embedded?: boolean;
  onClose?: () => void;
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

function getTabLabel(tab: DetailTab) {
  if (tab === "document") return "서류 보기";
  if (tab === "score") return "점수 매기기";
  return "점수 현황";
}

export default function ApplicationDetailPage({
  applicationId,
  embedded = false,
  onClose,
}: ApplicationDetailPageProps) {
  const searchParams = useSearchParams();
  const listQuery = searchParams.toString();
  const listHref = `/admin/applications${listQuery ? `?${listQuery}` : ""}`;

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

        const [meResult, myScoreResult, scoreDetailResult] =
          await Promise.allSettled([
            getMyInfo(),
            getMyAdminDocumentScores(applicationId),
            getAdminDocumentScoresDetail(applicationId),
          ]);

        if (!mounted) return;

        if (meResult.status === "fulfilled") {
          const hasAdminRole =
            meResult.value.sso.ssoRole === "ADMIN" ||
            meResult.value.roles.some(
              (role) =>
                role.level === "ADMIN" ||
                role.position === "PRESIDENT" ||
                role.position === "VICE_PRESIDENT",
            );
          setIsAdmin(hasAdminRole);
        } else {
          setIsAdmin(false);
        }

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
            "내 점수 정보를 불러오지 못했습니다. 점수 매기기 탭 저장 시 다시 시도됩니다.",
          );
        }

        if (scoreDetailResult.status === "fulfilled") {
          setDocumentScoreDetail(scoreDetailResult.value);
        } else {
          setDocumentScoreDetail(null);
          setScoreError(
            "운영진 점수 현황을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
          );
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

  const handleSave = async () => {
    if (!detail || isSaving) return;
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
    if (!detail || !isAdmin || isPendingDecisionLoading) return;
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
          ? "서류 합격 예정으로 처리했습니다."
          : "서류 불합격 예정으로 처리했습니다.",
      );
    } catch {
      setScoreError("합격/불합격 예정 처리에 실패했습니다.");
    } finally {
      setIsPendingDecisionLoading(false);
    }
  };

  const detailBody = (
    <div className={`${embedded ? "" : "mt-6"} rounded-2xl bg-[#323640] p-6 lg:p-8`}>
      <h2 className="text-[36px] font-bold lg:text-[44px]">{formatPart(detail?.applyPart ?? "-")}</h2>

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
              평가 {documentScoreDetail.reviewCount}명, 평균 점수{" "}
              {documentScoreDetail.average.toFixed(2)}
            </p>
          )}
        </>
      )}

      <div className="mt-6 flex flex-wrap gap-2 border-b border-[#606673] pb-4">
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

      {isLoading && <p className="mt-6 text-sm text-gray-3">로딩 중...</p>}
      {!isLoading && detailError && (
        <p className="mt-6 text-sm text-[#ff9ea8]">{detailError}</p>
      )}

      {!isLoading && detail && activeTab === "document" && (
        <div className="mt-8 space-y-8">
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
          <div className="space-y-8">
            {scoredQuestions.map((item, index) => (
              <article key={item.questionId} className="space-y-3">
                <h3 className="text-lg font-semibold">
                  문항 {index + 1}. {item.content}
                </h3>
                <p className="whitespace-pre-wrap rounded-lg bg-[#404654] p-4 text-sm text-gray-2">
                  {item.answer}
                </p>
                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-3">문항 점수</label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    step={1}
                    value={item.score}
                    onChange={(event) => {
                      const numeric = Number(event.target.value);
                      const next = Number.isFinite(numeric)
                        ? Math.max(0, Math.min(10, numeric))
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
            ))}
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
              {isSaving ? "저장 중..." : "점수 저장"}
            </button>
          </div>
        </div>
      )}

      {!isLoading && detail && activeTab === "review" && (
        <div className="mt-8 space-y-5">
          {documentScoreDetail ? (
            <>
              <div className="rounded-lg bg-[#404654] px-4 py-3 text-sm text-gray-2">
                리뷰어 수: {documentScoreDetail.reviewCount}명, 평균:{" "}
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

              {isAdmin && (
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handlePendingDecision("PASS")}
                    disabled={isPendingDecisionLoading}
                    className="rounded-lg bg-[#1f9d55] px-6 py-2.5 text-sm font-semibold disabled:opacity-60"
                  >
                    서류 합격 예정
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePendingDecision("FAIL")}
                    disabled={isPendingDecisionLoading}
                    className="rounded-lg bg-[#cc3a3a] px-6 py-2.5 text-sm font-semibold disabled:opacity-60"
                  >
                    서류 불합격 예정
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-3">점수 상세 정보를 불러오지 못했습니다.</p>
          )}
        </div>
      )}

      {scoreError && <p className="mt-4 text-sm text-[#ff9ea8]">{scoreError}</p>}
      {saveMessage && <p className="mt-2 text-sm text-[#8fd3ff]">{saveMessage}</p>}
      {pendingDecisionMessage && (
        <p className="mt-2 text-sm text-[#8fd3ff]">{pendingDecisionMessage}</p>
      )}
    </div>
  );

  if (embedded) {
    return (
      <div className="rounded-2xl border border-[#3a3d45] bg-[#2d3037] p-4">
        <div className="mb-3 flex items-center justify-between">
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
          <aside className="rounded-2xl border border-[#3a3d45] bg-[#26282d] p-4">
            <p className="text-xs font-semibold text-gray-4">목록</p>
            <div className="mt-4 space-y-2">
              <Link
                href="/admin/applications"
                className="block rounded-lg border-l-2 border-main-1 bg-[#2f323a] px-3 py-2 text-left text-[17px] text-white"
              >
                서류 지원서 목록
              </Link>
              <Link
                href="/admin/interviews/candidates"
                className="block rounded-lg px-3 py-2 text-left text-[17px] text-gray-4"
              >
                서류 합격자 목록
              </Link>
            </div>
          </aside>

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
