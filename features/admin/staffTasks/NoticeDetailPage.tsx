"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  deleteAdminNotice,
  deleteAdminNoticeFile,
  getAdminNoticeDetail,
  restoreAdminNotice,
  updateAdminNotice,
  uploadAdminNoticeFiles,
} from "../api";
import StaffTasksShell from "./StaffTasksShell";

type NoticeDetailPageProps = {
  noticeId: number;
};

type NoticeCategory = "NOTICE" | "SESSION_DATA";
type NoticePart = "FRONTEND" | "BACKEND" | "AI_ML" | "PM_DESIGN" | "ETC";

function formatDateTime(value: string): string {
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

export default function NoticeDetailPage({ noticeId }: NoticeDetailPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<NoticeCategory>("NOTICE");
  const [part, setPart] = useState<NoticePart>("FRONTEND");
  const [isPinned, setIsPinned] = useState(false);
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE" | string>("ACTIVE");
  const [createdAt, setCreatedAt] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");
  const [files, setFiles] = useState<
    { fileId: number; originalFileName: string; fileUrl: string }[]
  >([]);

  const [newFiles, setNewFiles] = useState<File[]>([]);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await getAdminNoticeDetail(noticeId);
      setTitle(response.notice.title);
      setContent(response.notice.content);
      setCategory((response.notice.category as NoticeCategory) ?? "NOTICE");
      setPart((response.notice.noticePart as NoticePart) ?? "FRONTEND");
      setIsPinned(response.notice.pinned);
      setStatus(response.notice.status);
      setCreatedAt(response.notice.createdAt);
      setUpdatedAt(response.notice.updatedAt);
      setFiles(response.files);
    } catch {
      setError("공지사항 상세를 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [noticeId]);

  useEffect(() => {
    void load();
  }, [load]);

  const canSave = useMemo(
    () => title.trim().length > 0 && content.trim().length > 0,
    [content, title],
  );

  const handleUpdate = async () => {
    if (!canSave || isSaving) return;
    setIsSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await updateAdminNotice(
        noticeId,
        {
          title: title.trim(),
          content: content.trim(),
          category,
          part,
          pinned: isPinned,
        },
        newFiles,
      );
      setMessage(response.result || "공지사항을 수정했습니다.");
      setNewFiles([]);
      await load();
    } catch {
      setError("공지사항 수정에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (isSaving || !confirm("이 공지사항을 삭제(비활성화)할까요?")) return;
    setIsSaving(true);
    setError("");
    setMessage("");
    try {
      const result = await deleteAdminNotice(noticeId);
      setMessage(result || "공지사항을 삭제했습니다.");
      await load();
    } catch {
      setError("공지사항 삭제에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestore = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setError("");
    setMessage("");
    try {
      const result = await restoreAdminNotice(noticeId);
      setMessage(result || "공지사항을 복구했습니다.");
      await load();
    } catch {
      setError("공지사항 복구에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadFiles = async () => {
    if (isSaving || newFiles.length === 0) return;
    setIsSaving(true);
    setError("");
    setMessage("");
    try {
      const result = await uploadAdminNoticeFiles(noticeId, newFiles);
      setMessage(result || "첨부파일을 업로드했습니다.");
      setNewFiles([]);
      await load();
    } catch {
      setError("첨부파일 업로드에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    if (isSaving || !confirm(`첨부파일 #${fileId}를 삭제할까요?`)) return;
    setIsSaving(true);
    setError("");
    setMessage("");
    try {
      const result = await deleteAdminNoticeFile(noticeId, fileId);
      setMessage(result || "첨부파일을 삭제했습니다.");
      await load();
    } catch {
      setError("첨부파일 삭제에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <StaffTasksShell
      title={`공지사항 상세 #${noticeId}`}
      description="공지 본문 수정, 첨부파일 관리, 삭제/복구 작업을 수행합니다."
      actions={
        <Link
          href="/admin/staff-tasks/notices"
          className="rounded-lg bg-[#485165] px-4 py-2 text-sm font-semibold"
        >
          목록
        </Link>
      }
    >
      {error && <p className="text-sm text-[#ff9ea8]">{error}</p>}
      {message && <p className="mb-3 text-sm text-[#8fd3ff]">{message}</p>}
      {isLoading && <p className="text-sm text-gray-4">불러오는 중...</p>}

      {!isLoading && (
        <div className="space-y-6">
          <section className="rounded-xl border border-[#43485a] bg-[#363c4a] p-4">
            <div className="grid gap-3 md:grid-cols-2">
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value as NoticeCategory)}
                className="h-11 rounded-md border border-[#5d6478] bg-[#454c5d] px-3 text-sm outline-none"
              >
                <option value="NOTICE">NOTICE</option>
                <option value="SESSION_DATA">SESSION_DATA</option>
              </select>
              <select
                value={part}
                onChange={(event) => setPart(event.target.value as NoticePart)}
                className="h-11 rounded-md border border-[#5d6478] bg-[#454c5d] px-3 text-sm outline-none"
              >
                <option value="FRONTEND">FRONTEND</option>
                <option value="BACKEND">BACKEND</option>
                <option value="AI_ML">AI_ML</option>
                <option value="PM_DESIGN">PM_DESIGN</option>
                <option value="ETC">ETC</option>
              </select>
            </div>
            <label className="mt-3 inline-flex items-center gap-2 text-sm text-gray-2">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(event) => setIsPinned(event.target.checked)}
                className="h-4 w-4 rounded border border-[#5d6478] bg-[#454c5d]"
              />
              상단 고정 공지
            </label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-3 h-11 w-full rounded-md border border-[#5d6478] bg-[#454c5d] px-3 text-sm outline-none"
            />
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={8}
              className="mt-3 w-full rounded-md border border-[#5d6478] bg-[#454c5d] p-3 text-sm outline-none"
            />
            <div className="mt-3 text-xs text-gray-4">
              상태: {status} | 생성: {formatDateTime(createdAt)} | 수정: {formatDateTime(updatedAt)}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleUpdate}
                disabled={!canSave || isSaving}
                className="rounded-lg bg-main-1 px-4 py-2 text-sm font-semibold disabled:opacity-60"
              >
                {isSaving ? "처리 중..." : "공지 수정"}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSaving}
                className="rounded-lg bg-[#a63f4a] px-4 py-2 text-sm font-semibold disabled:opacity-60"
              >
                삭제(비활성화)
              </button>
              {status === "INACTIVE" && (
                <button
                  type="button"
                  onClick={handleRestore}
                  disabled={isSaving}
                  className="rounded-lg bg-[#2f78d8] px-4 py-2 text-sm font-semibold disabled:opacity-60"
                >
                  공지 복구
                </button>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-[#43485a] bg-[#363c4a] p-4">
            <h2 className="text-lg font-semibold">첨부파일 관리</h2>
            <input
              type="file"
              multiple
              onChange={(event) => setNewFiles(Array.from(event.target.files ?? []))}
              className="mt-3 block w-full text-sm text-gray-3 file:mr-3 file:rounded-md file:border-0 file:bg-main-1 file:px-3 file:py-2 file:text-white"
            />
            <button
              type="button"
              onClick={handleUploadFiles}
              disabled={isSaving || newFiles.length === 0}
              className="mt-3 rounded-lg bg-[#58627d] px-4 py-2 text-sm font-semibold disabled:opacity-60"
            >
              파일 추가 업로드
            </button>

            {files.length === 0 && <p className="mt-3 text-sm text-gray-4">첨부파일이 없습니다.</p>}
            {files.length > 0 && (
              <ul className="mt-3 space-y-2 text-sm">
                {files.map((file) => (
                  <li
                    key={file.fileId}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-[#434b5e] px-3 py-2"
                  >
                    <a href={file.fileUrl} target="_blank" rel="noreferrer" className="hover:text-main-1">
                      #{file.fileId} {file.originalFileName}
                    </a>
                    <button
                      type="button"
                      onClick={() => void handleDeleteFile(file.fileId)}
                      disabled={isSaving}
                      className="rounded bg-[#a63f4a] px-2 py-1 text-xs font-semibold disabled:opacity-60"
                    >
                      삭제
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </StaffTasksShell>
  );
}

