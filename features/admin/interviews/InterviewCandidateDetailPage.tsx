"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getAdminInterviewCandidateDetail,
  getAdminInterviewScoreDetail,
  getMyAdminInterviewScore,
  upsertMyAdminInterviewScore,
} from "../api";
import type { AdminApplicationDetailResponse } from "../type";

type InterviewCandidateDetailPageProps = {
  applicationId: number;
  embedded?: boolean;
  onClose?: () => void;
};

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

export default function InterviewCandidateDetailPage({
  applicationId,
  embedded = false,
  onClose,
}: InterviewCandidateDetailPageProps) {
  const searchParams = useSearchParams();
  const listQuery = searchParams.toString();
  const listHref = `/admin/interviews/candidates${listQuery ? `?${listQuery}` : ""}`;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [detail, setDetail] = useState<AdminApplicationDetailResponse | null>(
    null,
  );
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState("");
  const [average, setAverage] = useState<number | null>(null);
  const [reviewCount, setReviewCount] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setIsLoading(true);
      setError("");

      try {
        const detailResponse = await getAdminInterviewCandidateDetail(applicationId);
        if (!mounted) return;
        setDetail(detailResponse);

        const myScore = await getMyAdminInterviewScore(applicationId);
        if (!mounted) return;
        setScore(myScore.score ?? 0);
        setComment(myScore.comment ?? "");

        try {
          const scoreDetail = await getAdminInterviewScoreDetail(applicationId);
          if (!mounted) return;
          setAverage(scoreDetail.average);
          setReviewCount(scoreDetail.reviewCount);
        } catch {
          if (!mounted) return;
          setAverage(null);
          setReviewCount(null);
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

  const detailBody = (
    <div className={`${embedded ? "" : "mt-6"} rounded-2xl bg-[#323640] p-6 lg:p-8`}>
      {isLoading && <p className="text-sm text-gray-3">로딩 중...</p>}
      {!isLoading && error && <p className="text-sm text-[#ff9ea8]">{error}</p>}

      {!isLoading && detail && (
        <>
          <h2 className="text-[36px] font-bold lg:text-[44px]">
            {formatPart(detail.applyPart)}
          </h2>

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

          {reviewCount !== null && average !== null && (
            <p className="mt-4 text-sm text-gray-4">
              평가 {reviewCount}명 평균 점수 {average.toFixed(2)}
            </p>
          )}

          <div className="my-8 h-px bg-[#606673]" />

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

          <div className="space-y-8">
            {detail.answers.map((item, index) => (
              <article key={item.questionId} className="space-y-3">
                <h3 className="text-lg font-semibold">
                  문항 {index + 1}. {item.content}
                </h3>
                <p className="whitespace-pre-wrap rounded-lg bg-[#404654] p-4 text-sm text-gray-2">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>

          <div className="my-8 h-px bg-[#606673]" />

          <div className="mb-8 flex items-center gap-3">
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
              {isSaving ? "저장 중..." : "확인"}
            </button>
          </div>

          {saveMessage && (
            <p className="mt-3 text-center text-sm text-[#8fd3ff]">{saveMessage}</p>
          )}
        </>
      )}
    </div>
  );

  if (embedded) {
    return (
      <div className="rounded-2xl border border-[#3a3d45] bg-[#2d3037] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-2">1차 합격 상세</h3>
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
                className="block rounded-lg px-3 py-2 text-left text-[17px] text-gray-4"
              >
                서류 지원서 목록
              </Link>
              <Link
                href="/admin/interviews/candidates"
                className="block rounded-lg border-l-2 border-main-1 bg-[#2f323a] px-3 py-2 text-left text-[17px] text-white"
              >
                면접 대상자 목록
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
