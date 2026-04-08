/**
 * 중복으로 중첩된 절대 URL을 정리해 화면에서 바로 사용할 수 있는 형태로 반환한다.
 * 예: `https://cdn.../https://cdn.../file.png` -> `https://cdn.../file.png`
 */
export function normalizeAdminAssetUrl(url?: string | null) {
  if (!url) {
    return undefined;
  }

  const trimmedUrl = url.trim();
  const nestedHttpsIndex = trimmedUrl.indexOf("https://", "https://".length);
  const nestedHttpIndex = trimmedUrl.indexOf("http://", "http://".length);
  const nestedAbsoluteUrlIndexes = [nestedHttpsIndex, nestedHttpIndex].filter(
    (index) => index >= 0,
  );

  if (nestedAbsoluteUrlIndexes.length === 0) {
    return trimmedUrl;
  }

  return trimmedUrl.slice(Math.min(...nestedAbsoluteUrlIndexes));
}
