"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  createAdminNotice,
  getAdminNotices,
} from "../api";
import type { AdminNoticeListItem } from "../type";
import StaffTasksShell from "./StaffTasksShell";

const PAGE_SIZE = 10;

type CategoryFilter = "ALL" | "NOTICE" | "SESSION_DATA";
type PartFilter = "ALL" | "FRONTEND" | "BACKEND" | "AI_ML" | "PM_DESIGN" | "ETC";

const CATEGORY_OPTIONS: CategoryFilter[] = ["ALL", "NOTICE", "SESSION_DATA"];
const PART_OPTIONS: PartFilter[] = ["ALL", "FRONTEND", "BACKEND", "AI_ML", "PM_DESIGN", "ETC"];

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

export default function NoticeManagePage() {
  const [page, setPage] = useState(0);
  const [category, setCategory] = useState<CategoryFilter>("ALL");
  const [part, setPart] = useState<PartFilter>("ALL");
  const [rows, setRows] = useState<AdminNoticeListItem[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [createCategory, setCreateCategory] = useState<"NOTICE" | "SESSION_DATA">("NOTICE");
  const [createPart, setCreatePart] = useState<"FRONTEND" | "BACKEND" | "AI_ML" | "PM_DESIGN" | "ETC">(
    "FRONTEND",
  );
  const [isCreating, setIsCreating] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await getAdminNotices({
        page,
        size: PAGE_SIZE,
        category: category === "ALL" ? undefined : category,
        part: part === "ALL" ? undefined : part,
      });
      setRows(response.noticeList);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch {
      setRows([]);
      setTotalPages(0);
      setTotalElements(0);
      setError("공지사항 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [category, page, part]);

  useEffect(() => {
    void load();
  }, [load]);

  const canCreate = useMemo(
    () => title.trim().length > 0 && content.trim().length > 0,
    [content, title],
  );

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canCreate || isCreating) return;

    setIsCreating(true);
    setError("");
    setMessage("");
    try {
      const response = await createAdminNotice({
        title: title.trim(),
        content: content.trim(),
        category: createCategory,
        part: createPart,
      });
      setMessage(response.result || `공지 #${response.noticeId} 생성 완료`);
      setTitle("");
      setContent("");
      await load();
    } catch {
      setError("공지사항 작성에 실패했습니다.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <StaffTasksShell
      title="공지사항 관리"
      description="공지/세션자료를 생성하고 필터 조건으로 목록을 조회합니다."
      actions={
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-lg bg-[#485165] px-4 py-2 text-sm font-semibold"
        >
          새로고침
        </button>
      }
    >
      <div className="space-y-6">
        <form onSubmit={handleCreate} className="rounded-xl border border-[#43485a] bg-[#363c4a] p-4">
          <h2 className="text-lg font-semibold">공지/세션자료 작성</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <select
              value={createCategory}
              onChange={(event) => setCreateCategory(event.target.value as "NOTICE" | "SESSION_DATA")}
              className="h-11 rounded-md border border-[#5d6478] bg-[#454c5d] px-3 text-sm outline-none"
            >
              <option value="NOTICE">NOTICE</option>
              <option value="SESSION_DATA">SESSION_DATA</option>
            </select>
            <select
              value={createPart}
              onChange={(event) =>
                setCreatePart(event.target.value as "FRONTEND" | "BACKEND" | "AI_ML" | "PM_DESIGN" | "ETC")
              }
              className="h-11 rounded-md border border-[#5d6478] bg-[#454c5d] px-3 text-sm outline-none"
            >
              {PART_OPTIONS.filter((item) => item !== "ALL").map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="제목"
            className="mt-3 h-11 w-full rounded-md border border-[#5d6478] bg-[#454c5d] px-3 text-sm outline-none"
          />
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={5}
            placeholder="내용"
            className="mt-3 w-full rounded-md border border-[#5d6478] bg-[#454c5d] p-3 text-sm outline-none"
          />
          <button
            type="submit"
            disabled={!canCreate || isCreating}
            className="mt-4 rounded-lg bg-main-1 px-5 py-2 text-sm font-semibold disabled:opacity-60"
          >
            {isCreating ? "작성 중..." : "게시글 작성"}
          </button>
        </form>

        <section className="rounded-xl border border-[#43485a] bg-[#363c4a] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">공지사항 목록</h2>
            <div className="flex gap-2">
              <select
                value={category}
                onChange={(event) => {
                  setPage(0);
                  setCategory(event.target.value as CategoryFilter);
                }}
                className="h-10 rounded-md border border-[#5d6478] bg-[#454c5d] px-3 text-sm outline-none"
              >
                {CATEGORY_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <select
                value={part}
                onChange={(event) => {
                  setPage(0);
                  setPart(event.target.value as PartFilter);
                }}
                className="h-10 rounded-md border border-[#5d6478] bg-[#454c5d] px-3 text-sm outline-none"
              >
                {PART_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="mt-3 text-sm text-[#ff9ea8]">{error}</p>}
          {message && <p className="mt-3 text-sm text-[#8fd3ff]">{message}</p>}
          {isLoading && <p className="mt-3 text-sm text-gray-4">불러오는 중...</p>}
          {!isLoading && !error && rows.length === 0 && (
            <p className="mt-3 text-sm text-gray-4">등록된 공지사항이 없습니다.</p>
          )}

          {rows.length > 0 && (
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-gray-3">
                  <tr className="border-b border-[#4a5061]">
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">제목</th>
                    <th className="px-3 py-2">카테고리</th>
                    <th className="px-3 py-2">파트</th>
                    <th className="px-3 py-2">첨부</th>
                    <th className="px-3 py-2">작성일</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((item) => (
                    <tr key={item.noticeId} className="border-b border-[#41485a] text-gray-2">
                      <td className="px-3 py-2">{item.noticeId}</td>
                      <td className="px-3 py-2">
                        <Link
                          href={`/admin/staff-tasks/notices/${item.noticeId}`}
                          className="font-semibold hover:text-main-1"
                        >
                          {item.title}
                        </Link>
                      </td>
                      <td className="px-3 py-2">{item.category}</td>
                      <td className="px-3 py-2">{item.part}</td>
                      <td className="px-3 py-2">{item.fileCount}</td>
                      <td className="px-3 py-2 text-xs text-gray-3">{formatDateTime(item.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-gray-4">총 {totalElements.toLocaleString("ko-KR")}건</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                disabled={page <= 0}
                className="rounded-md bg-[#4c5468] px-3 py-1.5 text-xs disabled:opacity-50"
              >
                이전
              </button>
              <span className="self-center text-xs text-gray-3">
                {page + 1} / {Math.max(1, totalPages)}
              </span>
              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(Math.max(totalPages - 1, 0), prev + 1))}
                disabled={totalPages === 0 || page >= totalPages - 1}
                className="rounded-md bg-[#4c5468] px-3 py-1.5 text-xs disabled:opacity-50"
              >
                다음
              </button>
            </div>
          </div>
        </section>
      </div>
    </StaffTasksShell>
  );
}

