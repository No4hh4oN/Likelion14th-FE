import { getAccessToken } from "@/lib/axios";
import type { AssignmentSubmittedFile } from "../types";

const ASSIGNMENT_SUBMISSION_FILE_STORAGE_KEY =
  "common-space-assignment-submission-file-map";

type AssignmentSubmissionFileMap = Record<string, AssignmentSubmittedFile[]>;

/**
 * 현재 로그인 계정을 구분할 수 있는 캐시 스코프 키를 만든다.
 * 토큰 payload에서 식별자를 읽고, 실패하면 토큰 문자열 자체를 fallback으로 사용한다.
 */
function getAssignmentSubmissionScopeKey() {
  if (typeof window === "undefined") {
    return "anonymous";
  }

  const accessToken = getAccessToken();

  if (!accessToken) {
    return "anonymous";
  }

  try {
    const [, payloadToken = ""] = accessToken.split(".");
    const normalizedPayloadToken = payloadToken
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const paddedPayloadToken = normalizedPayloadToken.padEnd(
      Math.ceil(normalizedPayloadToken.length / 4) * 4,
      "=",
    );
    const decodedPayload = window.atob(paddedPayloadToken);
    const parsedPayload = JSON.parse(decodedPayload) as {
      sub?: string;
      loginId?: string;
      userId?: number | string;
    };

    return (
      parsedPayload.loginId ??
      parsedPayload.sub ??
      String(parsedPayload.userId ?? accessToken)
    );
  } catch {
    return accessToken;
  }
}

/**
 * 제출 파일 캐시에 사용할 과제 식별자 키를 생성한다.
 */
function getAssignmentSubmissionFileCacheKey(projectId: number) {
  return `${getAssignmentSubmissionScopeKey()}:${projectId}`;
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
