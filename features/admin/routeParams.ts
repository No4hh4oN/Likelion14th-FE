/**
 * admin 동적 route param을 양의 정수 ID로 변환합니다.
 *
 * @param value URL route param에서 읽은 원본 문자열
 * @returns 유효한 양의 정수 ID 또는 잘못된 값일 때 null
 */
export function parsePositiveIntegerRouteParam(value: string): number | null {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

/**
 * URL 인코딩된 admin route param을 비어 있지 않은 문자열로 정규화합니다.
 *
 * @param value URL route param에서 읽은 원본 문자열
 * @returns decode 후 trim한 문자열 또는 빈 값일 때 null
 */
export function parseNonEmptyRouteParam(value: string): string | null {
  let decoded = "";

  try {
    decoded = decodeURIComponent(value).trim();
  } catch {
    return null;
  }

  return decoded.length > 0 ? decoded : null;
}
