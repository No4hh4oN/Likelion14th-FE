import type { ResultStatus } from "./type";

/**
 * 결과 페이지에서 유효한 지원 상태 목록입니다.
 */
const VALID_STATUSES: ResultStatus[] = [
  "DRAFT",
  "SUBMITTED",
  "DOC_FAILED",
  "DOC_PASSED",
  "FINAL_FAILED",
  "FINAL_PASSED",
];

/**
 * 서버에서 내려준 상태 문자열을 결과 페이지에서 사용하는 enum으로 정규화합니다.
 *
 * @param value 서버 응답의 상태 문자열
 * @returns 지원 상태로 해석 가능하면 정규화된 상태, 아니면 null
 */
export const normalizeStatus = (
  value: string | null | undefined,
): ResultStatus | null => {
  if (!value) {
    return null;
  }

  const normalized = value.toUpperCase();
  return VALID_STATUSES.includes(normalized as ResultStatus)
    ? (normalized as ResultStatus)
    : null;
};

/**
 * 문서 결과 문자열을 지원 상태 enum으로 변환합니다.
 *
 * @param value documentResult.result 원본 문자열
 * @returns 결과 상태로 해석 가능하면 정규화된 상태, 아니면 null
 */
export const parseStatusFromDocumentResult = (
  value: string | null | undefined,
): ResultStatus | null => {
  if (!value) {
    return null;
  }

  const normalized = value
    .toUpperCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/-/g, "_");

  const normalizedAsStatus = normalizeStatus(normalized);
  if (normalizedAsStatus) {
    return normalizedAsStatus;
  }

  if (normalized.includes("FINAL") && normalized.includes("PASS")) {
    return "FINAL_PASSED";
  }

  if (normalized.includes("FINAL") && normalized.includes("FAIL")) {
    return "FINAL_FAILED";
  }

  if (normalized.includes("DOC") && normalized.includes("PASS")) {
    return "DOC_PASSED";
  }

  if (normalized.includes("DOC") && normalized.includes("FAIL")) {
    return "DOC_FAILED";
  }

  if (normalized === "PASS" || normalized === "PASSED") {
    return "DOC_PASSED";
  }

  if (normalized === "FAIL" || normalized === "FAILED") {
    return "DOC_FAILED";
  }

  return null;
};

/**
 * 대시보드, 지원서, 문서 결과 응답을 종합해 화면에 표시할 최종 상태를 결정합니다.
 *
 * @param params 상태 판정에 필요한 원본 값 묶음
 * @returns 화면 분기에 사용할 결과 상태
 */
export const resolveResultStatus = (params: {
  dashboardStatus: string | null | undefined;
  applicationStatus: ResultStatus | null;
  isDocumentResultVisible: boolean;
  documentResult: string | null | undefined;
}): ResultStatus | null => {
  const statusFromDashboard = normalizeStatus(params.dashboardStatus);
  if (statusFromDashboard) {
    return statusFromDashboard;
  }

  if (params.applicationStatus) {
    return params.applicationStatus;
  }

  if (!params.isDocumentResultVisible) {
    return null;
  }

  return parseStatusFromDocumentResult(params.documentResult);
};
