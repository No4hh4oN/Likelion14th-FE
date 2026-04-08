/**
 * 확장자 기준으로 브라우저 업로드 파일의 MIME 타입을 보정한다.
 * 일부 압축파일은 브라우저/OS 조합에 따라 비표준 타입이나 빈 문자열로 잡혀
 * 서버 검증에서 거절될 수 있어, 알려진 압축 포맷은 안정적인 타입으로 정규화한다.
 */
export function normalizeUploadFileForMultipart(file: File) {
  const normalizedExtension = file.name.split(".").pop()?.toLowerCase();

  if (!normalizedExtension) {
    return file;
  }

  const normalizedMimeTypeByExtension: Partial<Record<string, string>> = {
    zip: "application/zip",
    rar: "application/vnd.rar",
    "7z": "application/x-7z-compressed",
    tar: "application/x-tar",
    gz: "application/gzip",
    tgz: "application/gzip",
    bz2: "application/x-bzip2",
    xz: "application/x-xz",
  };

  const nextMimeType = normalizedMimeTypeByExtension[normalizedExtension];

  if (!nextMimeType || file.type === nextMimeType) {
    return file;
  }

  return new File([file], file.name, {
    type: nextMimeType,
    lastModified: file.lastModified,
  });
}
