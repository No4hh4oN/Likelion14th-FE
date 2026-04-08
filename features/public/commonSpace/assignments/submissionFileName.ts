const ASSIGNMENT_SUBMISSION_FILE_NAME_STORAGE_KEY =
  "common-space-assignment-submission-file-name-map";

type AssignmentSubmissionFileNameMap = Record<string, string>;

/**
 * 제출 파일명 캐시에 사용할 저장소 키를 만든다.
 */
function getAssignmentSubmissionFileNameCacheKey(projectId: number) {
  return String(projectId);
}

/**
 * 브라우저에서 제출 파일명 캐시 맵을 읽는다.
 */
function readAssignmentSubmissionFileNameMap() {
  if (typeof window === "undefined") {
    return {} satisfies AssignmentSubmissionFileNameMap;
  }

  const storedValue = window.localStorage.getItem(
    ASSIGNMENT_SUBMISSION_FILE_NAME_STORAGE_KEY,
  );

  if (!storedValue) {
    return {} satisfies AssignmentSubmissionFileNameMap;
  }

  try {
    const parsedValue = JSON.parse(storedValue) as AssignmentSubmissionFileNameMap;

    return parsedValue ?? {};
  } catch {
    return {} satisfies AssignmentSubmissionFileNameMap;
  }
}

/**
 * 브라우저에 제출 파일명 캐시 맵을 저장한다.
 */
function writeAssignmentSubmissionFileNameMap(
  value: AssignmentSubmissionFileNameMap,
) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    ASSIGNMENT_SUBMISSION_FILE_NAME_STORAGE_KEY,
    JSON.stringify(value),
  );
}

/**
 * 특정 과제의 최근 제출 파일명을 브라우저에 캐시한다.
 */
export function cacheAssignmentSubmissionFileName(
  projectId: number,
  fileName: string,
) {
  const nextMap = readAssignmentSubmissionFileNameMap();

  nextMap[getAssignmentSubmissionFileNameCacheKey(projectId)] = fileName;
  writeAssignmentSubmissionFileNameMap(nextMap);
}

/**
 * 특정 과제의 최근 제출 파일명을 브라우저 캐시에서 조회한다.
 */
export function getCachedAssignmentSubmissionFileName(projectId: number) {
  const fileNameMap = readAssignmentSubmissionFileNameMap();

  return fileNameMap[getAssignmentSubmissionFileNameCacheKey(projectId)];
}
