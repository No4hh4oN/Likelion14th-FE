"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import BabyLionsShell from "./BabyLionsShell";
import {
  deleteProject,
  deleteProjectSubmission,
  getProjectDetail,
  getProjectStatus,
  submitProject,
  updateProject,
  updateProjectSubmission,
} from "./api";
import type { ProjectDetail, ProjectStatusItem, Track } from "./types";
import {
  fileListToArray,
  formatDateTime,
  fromLocalDateTimeInputValue,
  parseNumberList,
  toLocalDateTimeInputValue,
  TRACK_OPTIONS,
} from "./utils";

type BabyLionsProjectDetailPageProps = {
  projectId: number;
};

type EditFormState = {
  title: string;
  description: string;
  track: "" | Track;
  startDate: string;
  endDate: string;
  deleteFileIdsText: string;
};

const EMPTY_EDIT_FORM: EditFormState = {
  title: "",
  description: "",
  track: "",
  startDate: "",
  endDate: "",
  deleteFileIdsText: "",
};

export default function BabyLionsProjectDetailPage({
  projectId,
}: BabyLionsProjectDetailPageProps) {
  const [detail, setDetail] = useState<ProjectDetail | null>(null);
  const [statusBoard, setStatusBoard] = useState<ProjectStatusItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [editForm, setEditForm] = useState<EditFormState>(EMPTY_EDIT_FORM);
  const [editFiles, setEditFiles] = useState<File[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const [submitRequestText, setSubmitRequestText] = useState('{"content":""}');
  const [submitFiles, setSubmitFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const loadDetail = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const [detailResponse, statusResponse] = await Promise.all([
        getProjectDetail(projectId),
        getProjectStatus(projectId),
      ]);
      setDetail(detailResponse);
      setStatusBoard(statusResponse);

      setEditForm({
        title: detailResponse.title,
        description: detailResponse.description,
        track: detailResponse.track ?? "",
        startDate: toLocalDateTimeInputValue(detailResponse.startDate),
        endDate: toLocalDateTimeInputValue(detailResponse.endDate),
        deleteFileIdsText: "",
      });
    } catch {
      setError("과제 상세 정보를 불러오지 못했습니다.");
      setDetail(null);
      setStatusBoard([]);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  const canUpdate = useMemo(() => {
    return (
      editForm.title.trim().length > 0 &&
      editForm.description.trim().length > 0 &&
      editForm.startDate.length > 0 &&
      editForm.endDate.length > 0
    );
  }, [editForm]);

  const handleUpdateProject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canUpdate || isUpdating) return;

    setIsUpdating(true);
    setMessage("");
    setError("");

    try {
      const request = {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        track: editForm.track || null,
        startDate: fromLocalDateTimeInputValue(editForm.startDate),
        endDate: fromLocalDateTimeInputValue(editForm.endDate),
        deleteFileIds: parseNumberList(editForm.deleteFileIdsText),
      };
      const responseMessage = await updateProject(projectId, request, editFiles);
      setMessage(responseMessage || "과제를 수정했습니다.");
      setEditFiles([]);
      await loadDetail();
    } catch {
      setError("과제 수정에 실패했습니다.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteProject = async () => {
    if (isUpdating || !confirm("이 과제를 비활성화할까요?")) return;

    setIsUpdating(true);
    setMessage("");
    setError("");
    try {
      const responseMessage = await deleteProject(projectId);
      setMessage(responseMessage || "과제를 비활성화했습니다.");
      await loadDetail();
    } catch {
      setError("과제 삭제(비활성화)에 실패했습니다.");
    } finally {
      setIsUpdating(false);
    }
  };

  const parseSubmitRequest = (): unknown | null => {
    try {
      return JSON.parse(submitRequestText);
    } catch {
      setError("제출 request JSON 형식이 올바르지 않습니다.");
      return null;
    }
  };

  const handleCreateSubmission = async () => {
    if (isSubmitting) return;
    const request = parseSubmitRequest();
    if (!request) return;

    setIsSubmitting(true);
    setMessage("");
    setError("");
    try {
      const responseMessage = await submitProject(projectId, request, submitFiles);
      setMessage(responseMessage || "과제를 제출했습니다.");
      await loadDetail();
    } catch {
      setError("과제 제출에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSubmission = async () => {
    if (isSubmitting) return;
    const request = parseSubmitRequest();
    if (!request) return;

    setIsSubmitting(true);
    setMessage("");
    setError("");
    try {
      const responseMessage = await updateProjectSubmission(projectId, request, submitFiles);
      setMessage(responseMessage || "제출물을 수정했습니다.");
      await loadDetail();
    } catch {
      setError("제출 수정에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubmission = async () => {
    if (isSubmitting || !confirm("제출을 취소(삭제)할까요?")) return;

    setIsSubmitting(true);
    setMessage("");
    setError("");
    try {
      const responseMessage = await deleteProjectSubmission(projectId);
      setMessage(responseMessage || "제출을 삭제했습니다.");
      await loadDetail();
    } catch {
      setError("제출 삭제에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BabyLionsShell
      title={`과제 상세 #${projectId}`}
      description="과제 내용을 수정하고 제출 현황/제출 API를 함께 관리합니다."
      actions={
        <div className="flex items-center gap-2">
          <Link
            href="/admin/baby-lions/projects"
            className="rounded-lg bg-[#485165] px-4 py-2 text-sm font-semibold"
          >
            목록
          </Link>
          <button
            type="button"
            onClick={() => void loadDetail()}
            className="rounded-lg bg-[#485165] px-4 py-2 text-sm font-semibold"
          >
            새로고침
          </button>
        </div>
      }
    >
      {error && <p className="text-sm text-[#ff9ea8]">{error}</p>}
      {message && <p className="mb-3 text-sm text-[#8fd3ff]">{message}</p>}

      {isLoading && <p className="text-sm text-gray-4">불러오는 중...</p>}

      {!isLoading && detail && (
        <div className="space-y-6">
          <section className="rounded-xl border border-[#43485a] bg-[#363c4a] p-4">
            <h2 className="text-lg font-semibold">기본 정보</h2>
            <dl className="mt-3 grid gap-2 text-sm text-gray-3 md:grid-cols-2">
              <div>
                <dt className="font-semibold text-gray-2">제목</dt>
                <dd>{detail.title}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-2">트랙</dt>
                <dd>{detail.track ?? "ALL"}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-2">시작</dt>
                <dd>{formatDateTime(detail.startDate)}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-2">마감</dt>
                <dd>{formatDateTime(detail.endDate)}</dd>
              </div>
              <div className="md:col-span-2">
                <dt className="font-semibold text-gray-2">설명</dt>
                <dd className="whitespace-pre-wrap">{detail.description}</dd>
              </div>
            </dl>
            <div className="mt-3">
              <p className="text-sm font-semibold text-gray-2">첨부 파일</p>
              {detail.files.length === 0 && <p className="text-sm text-gray-4">없음</p>}
              {detail.files.length > 0 && (
                <ul className="mt-2 space-y-1 text-sm text-gray-3">
                  {detail.files.map((file) => (
                    <li key={file.fileId}>
                      <a
                        href={file.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-main-1"
                      >
                        #{file.fileId} {file.originalFileName}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <form
            onSubmit={handleUpdateProject}
            className="rounded-xl border border-[#43485a] bg-[#363c4a] p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">과제 수정</h2>
              <button
                type="button"
                onClick={handleDeleteProject}
                disabled={isUpdating}
                className="rounded-lg bg-[#a63f4a] px-4 py-2 text-sm font-semibold disabled:opacity-60"
              >
                과제 비활성화
              </button>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <input
                value={editForm.title}
                onChange={(event) =>
                  setEditForm((prev) => ({ ...prev, title: event.target.value }))
                }
                className="h-11 rounded-md border border-[#5d6478] bg-[#454c5d] px-3 text-sm outline-none focus:border-main-1"
              />
              <select
                value={editForm.track}
                onChange={(event) =>
                  setEditForm((prev) => ({ ...prev, track: event.target.value as "" | Track }))
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
                value={editForm.startDate}
                onChange={(event) =>
                  setEditForm((prev) => ({ ...prev, startDate: event.target.value }))
                }
                className="h-11 rounded-md border border-[#5d6478] bg-[#454c5d] px-3 text-sm outline-none focus:border-main-1"
              />
              <input
                type="datetime-local"
                value={editForm.endDate}
                onChange={(event) =>
                  setEditForm((prev) => ({ ...prev, endDate: event.target.value }))
                }
                className="h-11 rounded-md border border-[#5d6478] bg-[#454c5d] px-3 text-sm outline-none focus:border-main-1"
              />
            </div>

            <textarea
              value={editForm.description}
              rows={4}
              onChange={(event) =>
                setEditForm((prev) => ({ ...prev, description: event.target.value }))
              }
              className="mt-3 w-full rounded-md border border-[#5d6478] bg-[#454c5d] p-3 text-sm outline-none focus:border-main-1"
            />

            <input
              value={editForm.deleteFileIdsText}
              onChange={(event) =>
                setEditForm((prev) => ({ ...prev, deleteFileIdsText: event.target.value }))
              }
              placeholder="삭제할 fileId 목록 (예: 1,2,3)"
              className="mt-3 h-11 w-full rounded-md border border-[#5d6478] bg-[#454c5d] px-3 text-sm outline-none focus:border-main-1"
            />

            <label className="mt-3 block text-sm text-gray-3">추가 첨부 파일</label>
            <input
              type="file"
              multiple
              onChange={(event) => setEditFiles(fileListToArray(event.target.files))}
              className="mt-1 block w-full text-sm text-gray-3 file:mr-3 file:rounded-md file:border-0 file:bg-main-1 file:px-3 file:py-2 file:text-white"
            />

            <button
              type="submit"
              disabled={!canUpdate || isUpdating}
              className="mt-4 rounded-lg bg-main-1 px-5 py-2 text-sm font-semibold disabled:opacity-60"
            >
              {isUpdating ? "수정 중..." : "과제 수정"}
            </button>
          </form>

          <section className="rounded-xl border border-[#43485a] bg-[#363c4a] p-4">
            <h2 className="text-lg font-semibold">과제 제출 API 테스트/운영</h2>
            <p className="mt-1 text-sm text-gray-4">
              제출/수정/삭제 API를 이 화면에서 바로 실행할 수 있습니다.
            </p>

            <textarea
              value={submitRequestText}
              onChange={(event) => setSubmitRequestText(event.target.value)}
              rows={5}
              className="mt-3 w-full rounded-md border border-[#5d6478] bg-[#454c5d] p-3 font-mono text-xs outline-none focus:border-main-1"
            />
            <input
              type="file"
              multiple
              onChange={(event) => setSubmitFiles(fileListToArray(event.target.files))}
              className="mt-2 block w-full text-sm text-gray-3 file:mr-3 file:rounded-md file:border-0 file:bg-[#56607a] file:px-3 file:py-2 file:text-white"
            />

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleCreateSubmission}
                disabled={isSubmitting}
                className="rounded-lg bg-main-1 px-4 py-2 text-sm font-semibold disabled:opacity-60"
              >
                제출 생성
              </button>
              <button
                type="button"
                onClick={handleUpdateSubmission}
                disabled={isSubmitting}
                className="rounded-lg bg-[#56607a] px-4 py-2 text-sm font-semibold disabled:opacity-60"
              >
                제출 수정
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmission}
                disabled={isSubmitting}
                className="rounded-lg bg-[#a63f4a] px-4 py-2 text-sm font-semibold disabled:opacity-60"
              >
                제출 삭제
              </button>
            </div>
          </section>

          <section className="rounded-xl border border-[#43485a] bg-[#363c4a] p-4">
            <h2 className="text-lg font-semibold">제출 현황판</h2>
            {statusBoard.length === 0 && (
              <p className="mt-2 text-sm text-gray-4">
                아기사자로 등록된 학생이 없어 제출 현황이 없습니다.
              </p>
            )}
            {statusBoard.length > 0 && (
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-gray-3">
                    <tr className="border-b border-[#4a5061]">
                      <th className="px-3 py-2">유저</th>
                      <th className="px-3 py-2">상태</th>
                      <th className="px-3 py-2">제출물</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statusBoard.map((item) => (
                      <tr key={item.userId} className="border-b border-[#41485a] text-gray-2">
                        <td className="px-3 py-2">{item.name}</td>
                        <td className="px-3 py-2">{item.status}</td>
                        <td className="px-3 py-2">
                          {item.submissionId ? (
                            <Link
                              href={`/admin/baby-lions/submissions/${item.submissionId}`}
                              className="font-semibold hover:text-main-1"
                            >
                              #{item.submissionId} 상세/평가
                            </Link>
                          ) : (
                            <span className="text-gray-4">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
    </BabyLionsShell>
  );
}

