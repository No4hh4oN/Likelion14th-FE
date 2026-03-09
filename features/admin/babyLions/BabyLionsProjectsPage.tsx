"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import BabyLionsShell from "./BabyLionsShell";
import { createProject, getProjects } from "./api";
import type { ProjectListItem, Track } from "./types";
import {
  fileListToArray,
  formatDateTime,
  fromLocalDateTimeInputValue,
  TRACK_OPTIONS,
} from "./utils";

type ProjectFormState = {
  title: string;
  description: string;
  track: "" | Track;
  startDate: string;
  endDate: string;
};

const EMPTY_FORM: ProjectFormState = {
  title: "",
  description: "",
  track: "",
  startDate: "",
  endDate: "",
};

export default function BabyLionsProjectsPage() {
  const [trackFilter, setTrackFilter] = useState<"ALL" | Track>("ALL");
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<ProjectFormState>(EMPTY_FORM);
  const [files, setFiles] = useState<File[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [createMessage, setCreateMessage] = useState("");

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await getProjects(trackFilter === "ALL" ? undefined : trackFilter);
      setProjects(response);
    } catch {
      setError("과제 목록을 불러오지 못했습니다.");
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  }, [trackFilter]);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  const canCreate = useMemo(() => {
    return (
      form.title.trim().length > 0 &&
      form.description.trim().length > 0 &&
      form.startDate.length > 0 &&
      form.endDate.length > 0
    );
  }, [form]);

  const handleCreateProject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canCreate || isCreating) return;

    setIsCreating(true);
    setCreateMessage("");
    setError("");

    const request = {
      title: form.title.trim(),
      description: form.description.trim(),
      track: form.track || null,
      startDate: fromLocalDateTimeInputValue(form.startDate),
      endDate: fromLocalDateTimeInputValue(form.endDate),
    };

    try {
      const message = await createProject(request, files);
      setCreateMessage(message || "과제를 생성했습니다.");
      setForm(EMPTY_FORM);
      setFiles([]);
      await loadProjects();
    } catch {
      setError("과제 생성에 실패했습니다.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <BabyLionsShell
      title="과제 관리"
      description="트랙별 과제를 조회하고 신규 과제를 생성합니다."
      actions={
        <button
          type="button"
          onClick={() => void loadProjects()}
          className="rounded-lg bg-[#485165] px-4 py-2 text-sm font-semibold"
        >
          새로고침
        </button>
      }
    >
      <div className="space-y-6">
        <form
          onSubmit={handleCreateProject}
          className="rounded-xl border border-[#43485a] bg-[#363c4a] p-4"
        >
          <h2 className="text-lg font-semibold">새 과제 생성</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <input
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="과제 제목"
              className="h-11 rounded-md border border-[#5d6478] bg-[#454c5d] px-3 text-sm outline-none focus:border-main-1"
            />
            <select
              value={form.track}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, track: event.target.value as "" | Track }))
              }
              className="h-11 rounded-md border border-[#5d6478] bg-[#454c5d] px-3 text-sm outline-none focus:border-main-1"
            >
              <option value="">공통(ALL)</option>
              {TRACK_OPTIONS.map((track) => (
                <option key={track} value={track}>
                  {track}
                </option>
              ))}
            </select>
            <input
              type="datetime-local"
              value={form.startDate}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, startDate: event.target.value }))
              }
              className="h-11 rounded-md border border-[#5d6478] bg-[#454c5d] px-3 text-sm outline-none focus:border-main-1"
            />
            <input
              type="datetime-local"
              value={form.endDate}
              onChange={(event) => setForm((prev) => ({ ...prev, endDate: event.target.value }))}
              className="h-11 rounded-md border border-[#5d6478] bg-[#454c5d] px-3 text-sm outline-none focus:border-main-1"
            />
          </div>
          <textarea
            value={form.description}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, description: event.target.value }))
            }
            rows={4}
            placeholder="과제 설명"
            className="mt-3 w-full rounded-md border border-[#5d6478] bg-[#454c5d] p-3 text-sm outline-none focus:border-main-1"
          />

          <label className="mt-3 block text-sm text-gray-3">첨부 파일</label>
          <input
            type="file"
            multiple
            onChange={(event) => setFiles(fileListToArray(event.target.files))}
            className="mt-1 block w-full text-sm text-gray-3 file:mr-3 file:rounded-md file:border-0 file:bg-main-1 file:px-3 file:py-2 file:text-white"
          />

          <div className="mt-4 flex items-center gap-3">
            <button
              type="submit"
              disabled={!canCreate || isCreating}
              className="rounded-lg bg-main-1 px-5 py-2 text-sm font-semibold disabled:opacity-60"
            >
              {isCreating ? "생성 중..." : "과제 생성"}
            </button>
            {createMessage && <p className="text-sm text-[#8fd3ff]">{createMessage}</p>}
          </div>
        </form>

        <div className="rounded-xl border border-[#43485a] bg-[#363c4a] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">과제 목록</h2>
            <select
              value={trackFilter}
              onChange={(event) => setTrackFilter(event.target.value as "ALL" | Track)}
              className="h-10 rounded-md border border-[#5d6478] bg-[#454c5d] px-3 text-sm outline-none focus:border-main-1"
            >
              <option value="ALL">ALL</option>
              {TRACK_OPTIONS.map((track) => (
                <option key={track} value={track}>
                  {track}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="mt-3 text-sm text-[#ff9ea8]">{error}</p>}
          {isLoading && <p className="mt-3 text-sm text-gray-4">불러오는 중...</p>}

          {!isLoading && projects.length === 0 && !error && (
            <p className="mt-3 text-sm text-gray-4">생성된 과제가 없습니다.</p>
          )}

          {projects.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-gray-3">
                  <tr className="border-b border-[#4a5061]">
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">제목</th>
                    <th className="px-3 py-2">트랙</th>
                    <th className="px-3 py-2">기간</th>
                    <th className="px-3 py-2">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr
                      key={project.id}
                      className="border-b border-[#41485a] text-gray-2 transition hover:bg-[#3e4657]"
                    >
                      <td className="px-3 py-2">{project.id}</td>
                      <td className="px-3 py-2">
                        <Link
                          href={`/admin/baby-lions/projects/${project.id}`}
                          className="font-semibold hover:text-main-1"
                        >
                          {project.title}
                        </Link>
                        <p className="mt-1 line-clamp-2 text-xs text-gray-4">{project.description}</p>
                      </td>
                      <td className="px-3 py-2">{project.track ?? "ALL"}</td>
                      <td className="px-3 py-2 text-xs text-gray-3">
                        {formatDateTime(project.startDate)}
                        <br />
                        {formatDateTime(project.deadline)}
                      </td>
                      <td className="px-3 py-2">{project.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </BabyLionsShell>
  );
}

