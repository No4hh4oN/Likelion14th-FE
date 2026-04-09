import type { AssignmentSubmittedFile } from "../types";

const ASSIGNMENT_SUBMISSION_FILE_STORAGE_KEY =
  "common-space-assignment-submission-file-map";

type AssignmentSubmissionFileMap = Record<string, AssignmentSubmittedFile[]>;

/**
 * 제출 파일 캐시에 사용할 과제 식별자 키를 생성한다.
 */
function getAssignmentSubmissionFileCacheKey(projectId: number) {
  return String(projectId);
}

/**
 * 브라우저에서 제출 파일 캐시 맵을 읽는다.
 */
function readAssignmentSubmissionFileMap() {
  if (typeof window === "undefined") {
    return {} satisfies AssignmentSubmissionFileMap;
  }

  const storedValue = window.localStorage.getItem(
    ASSIGNMENT_SUBMISSION_FILE_STORAGE_KEY,
  );

  if (!storedValue) {
    return {} satisfies AssignmentSubmissionFileMap;
  }

  try {
    const parsedValue = JSON.parse(storedValue) as AssignmentSubmissionFileMap;
    return parsedValue ?? {};
  } catch {
    return {} satisfies AssignmentSubmissionFileMap;
  }
}

/**
 * 브라우저에 제출 파일 캐시 맵을 저장한다.
 */
function writeAssignmentSubmissionFileMap(value: AssignmentSubmissionFileMap) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    ASSIGNMENT_SUBMISSION_FILE_STORAGE_KEY,
    JSON.stringify(value),
  );
}

/**
 * 특정 과제의 최근 제출 파일 목록을 브라우저에 캐시한다.
 */
export function cacheAssignmentSubmissionFiles(
  projectId: number,
  files: AssignmentSubmittedFile[],
) {
  const nextMap = readAssignmentSubmissionFileMap();
  nextMap[getAssignmentSubmissionFileCacheKey(projectId)] = files;
  writeAssignmentSubmissionFileMap(nextMap);
}

/**
 * 특정 과제의 최근 제출 파일 목록을 브라우저 캐시에서 읽는다.
 */
export function getCachedAssignmentSubmissionFiles(projectId: number) {
  const fileMap = readAssignmentSubmissionFileMap();
  return fileMap[getAssignmentSubmissionFileCacheKey(projectId)] ?? [];
}

/**
 * 특정 과제의 최근 제출 파일 캐시를 삭제한다.
 */
export function clearCachedAssignmentSubmissionFiles(projectId: number) {
  const nextMap = readAssignmentSubmissionFileMap();
  delete nextMap[getAssignmentSubmissionFileCacheKey(projectId)];
  writeAssignmentSubmissionFileMap(nextMap);
}

/**
 * 레거시 단일 파일 캐시 호출부를 호환하기 위한 래퍼다.
 */
export function cacheAssignmentSubmissionFileName(
  projectId: number,
  fileName: string,
) {
  cacheAssignmentSubmissionFiles(projectId, [{ name: fileName }]);
}

/**
 * 레거시 단일 파일명 조회 호출부를 호환하기 위한 래퍼다.
 */
export function getCachedAssignmentSubmissionFileName(projectId: number) {
  return getCachedAssignmentSubmissionFiles(projectId)[0]?.name;
}
