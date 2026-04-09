"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import BabyLionsShell from "./BabyLionsShell";
import { evaluateSubmission, getSubmissionDetail } from "./api";
import type { SubmissionDetail, SubmissionFile } from "./types";
import { formatDateTime } from "./utils";
import { normalizeAdminAssetUrl } from "../url";

type BabyLionsSubmissionDetailPageProps = {
  submissionId: number;
};

/**
 * 제출 파일 URL에서 화면용 파일명을 추출한다.
 */
function getSubmissionFileNameFromUrl(fileUrl: string) {
  const normalizedUrl = fileUrl.split("?")[0] ?? fileUrl;
  const fileName = normalizedUrl.split("/").pop();

  return fileName ? decodeURIComponent(fileName) : "첨부파일";
}

/**
 * 제출물 상세 응답을 화면용 첨부파일 목록으로 정규화한다.
 * 명세가 단일 fileUrl만 줄 때와 files[]를 줄 때를 모두 수용한다.
 */
function resolveSubmissionFiles(detail: SubmissionDetail): SubmissionFile[] {
  if (detail.files && detail.files.length > 0) {
    return detail.files;
  }

  if (!detail.fileUrl) {
    return [];
  }

  return [
    {
      fileUrl: detail.fileUrl,
      originalFileName: detail.originalFileName ?? getSubmissionFileNameFromUrl(detail.fileUrl),
    },
  ];
}

export default function BabyLionsSubmissionDetailPage({
  submissionId,
}: BabyLionsSubmissionDetailPageProps) {
  const [detail, setDetail] = useState<SubmissionDetail | null>(null);
  const [approved, setApproved] = useState(true);
  const [feedbackText, setFeedbackText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await getSubmissionDetail(submissionId);
      setDetail(response);
      setApproved(response.status !== "REJECTED");
      setFeedbackText(response.feedback ?? "");
    } catch {
      setError("제출물 상세를 불러오지 못했습니다.");
      setDetail(null);
    } finally {
      setIsLoading(false);
    }
  }, [submissionId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleEvaluate = async () => {
    if (isSaving) return;

    setIsSaving(true);
    setMessage("");
    setError("");
    try {
      const responseMessage = await evaluateSubmission(submissionId, {
        approved,
        rejectReason: feedbackText.trim(),
      });
      setMessage(responseMessage || "평가를 저장했습니다.");
      await load();
    } catch {
      setError("평가 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * 화면에 표시할 제출 파일 목록이다.
   */
  const submissionFiles = detail ? resolveSubmissionFiles(detail) : [];

  return (
    <BabyLionsShell
      title={`제출물 상세 #${submissionId}`}
      description="제출 내용을 확인하고 승인/반려 평가를 수행합니다."
      actions={
        <Link
          href="/admin/baby-lions/projects"
          className="rounded-lg bg-[#485165] px-4 py-2 text-sm font-semibold"
        >
          과제 목록
        </Link>
      }
    >
      {error && <p className="text-sm text-[#ff9ea8]">{error}</p>}
      {message && <p className="mb-3 text-sm text-[#8fd3ff]">{message}</p>}
      {isLoading && <p className="text-sm text-gray-4">불러오는 중...</p>}

      {!isLoading && detail && (
        <div className="space-y-6">
          <section className="rounded-xl border border-[#43485a] bg-[#363c4a] p-4">
            <h2 className="text-lg font-semibold">제출 정보</h2>
            <dl className="mt-3 grid gap-2 text-sm text-gray-3 md:grid-cols-2">
              <div>
                <dt className="font-semibold text-gray-2">학생</dt>
                <dd>
                  {detail.studentName} ({detail.studentNo})
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-2">제출 상태</dt>
                <dd>{detail.status}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-2">제출 시각</dt>
                <dd>{formatDateTime(detail.submittedAt)}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-2">파일</dt>
                <dd>
                  {submissionFiles.length > 0 ? (
                    <ul className="space-y-2">
                      {submissionFiles.map((file, index) => (
                        <li key={`${file.fileId ?? file.fileUrl}-${index}`}>
                          <a
                            href={normalizeAdminAssetUrl(file.fileUrl)}
                            download
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex max-w-full items-center gap-2 rounded-md bg-[#454c5d] px-3 py-2 text-gray-2 hover:text-main-1"
                          >
                            <span className="truncate">
                              {file.originalFileName ??
                                getSubmissionFileNameFromUrl(file.fileUrl)}
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    "-"
                  )}
                </dd>
              </div>
              <div className="md:col-span-2">
                <dt className="font-semibold text-gray-2">내용</dt>
                <dd className="whitespace-pre-wrap rounded-md bg-[#454c5d] p-3 text-gray-2">
                  {detail.content}
                </dd>
              </div>
              <div className="md:col-span-2">
                <dt className="font-semibold text-gray-2">피드백</dt>
                <dd>{detail.feedback || "-"}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border border-[#43485a] bg-[#363c4a] p-4">
            <h2 className="text-lg font-semibold">평가 처리</h2>
            <div className="mt-3 flex gap-4 text-sm">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="approval"
                  checked={approved}
                  onChange={() => setApproved(true)}
                />
                승인
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="approval"
                  checked={!approved}
                  onChange={() => setApproved(false)}
                />
                반려
              </label>
            </div>

            <textarea
              value={feedbackText}
              onChange={(event) => setFeedbackText(event.target.value)}
              rows={4}
              placeholder={approved ? "과제 평가" : "반려 사유"}
              className="mt-3 w-full rounded-md border border-[#5d6478] bg-[#454c5d] p-3 text-sm outline-none focus:border-main-1"
            />

            <button
              type="button"
              onClick={handleEvaluate}
              disabled={isSaving}
              className="mt-4 rounded-lg bg-main-1 px-5 py-2 text-sm font-semibold disabled:opacity-60"
            >
              {isSaving ? "저장 중..." : "평가 저장"}
            </button>
          </section>
        </div>
      )}
    </BabyLionsShell>
  );
}

