/**
 * commonSpace 상세/댓글 응답에서 공통으로 사용하는 작성자 정보다.
 */
export type CommonSpaceAuthorApiItem = {
  /** 작성자 식별자 */
  userId?: number;
  /** 작성자 프로필 이미지 URL */
  profileImageUrl?: string;
  /** 작성자 이름 */
  name?: string;
  /** 작성자 기수 */
  generation?: number;
  /** 작성자 트랙 */
  track?: string;
  /** 작성자 등급 */
  level?: string;
  /** 작성자 학과 */
  department?: string;
  /** 작성자 입학 연도 */
  admissionYear?: string;
};

/**
 * 화면에서 바로 렌더링할 수 있도록 정규화한 작성자 표시 정보다.
 */
export type CommonSpaceAuthorView = {
  /** 표시용 작성자 이름 */
  authorName?: string;
  /** 표시용 작성자 부가 정보 */
  authorDescription?: string;
  /** 표시용 작성자 프로필 이미지 경로 */
  profileImageSrc?: string;
  /** 표시용 작성자 프로필 이미지 대체 텍스트 */
  profileImageAlt?: string;
};

/**
 * 프로필 이미지가 없을 때 사용할 기본 프로필 이미지 경로다.
 */
export const DEFAULT_COMMON_SPACE_PROFILE_IMAGE_SRC = "/images/defaultProf.webp";

/**
 * 서버의 level 값을 화면용 한글 라벨로 변환한다.
 */
export function mapCommonSpaceAuthorLevelToLabel(level?: string) {
  const normalizedLevel = level?.trim().toUpperCase();

  if (
    normalizedLevel === "STAFF" ||
    normalizedLevel === "ADMIN" ||
    normalizedLevel === "ROLE_STAFF" ||
    normalizedLevel === "ROLE_ADMIN" ||
    normalizedLevel === "운영진"
  ) {
    return "운영진";
  }

  if (
    normalizedLevel === "BABY_LION" ||
    normalizedLevel === "BABYLION" ||
    normalizedLevel === "ROLE_BABY_LION" ||
    normalizedLevel === "아기사자"
  ) {
    return "아기사자";
  }

  if (
    normalizedLevel === "OUTSIDER" ||
    normalizedLevel === "ROLE_OUTSIDER" ||
    normalizedLevel === "게스트"
  ) {
    return "게스트";
  }

  return undefined;
}

/**
 * 작성자 이름과 기수/등급 정보를 화면용 문자열로 합친다.
 */
export function buildCommonSpaceAuthorName(
  author?: CommonSpaceAuthorApiItem | null,
  fallbackName?: string,
) {
  const baseName = author?.name || fallbackName;

  if (!baseName) {
    return undefined;
  }

  const levelLabel = mapCommonSpaceAuthorLevelToLabel(author?.level);

  if (author?.generation && levelLabel) {
    return `${baseName} (${author.generation}기 ${levelLabel})`;
  }

  if (author?.generation) {
    return `${baseName} (${author.generation}기)`;
  }

  if (levelLabel) {
    return `${baseName} (${levelLabel})`;
  }

  return baseName;
}

/**
 * 작성자의 학과/입학연도를 화면용 부가 정보 문자열로 합친다.
 */
export function buildCommonSpaceAuthorDescription(
  author?: CommonSpaceAuthorApiItem | null,
  fallbackDescription?: string,
) {
  const department = author?.department?.trim();
  const admissionYear = author?.admissionYear?.trim();

  if (department && admissionYear) {
    return `${department} ${admissionYear}학번`;
  }

  if (department) {
    return department;
  }

  if (admissionYear) {
    return `${admissionYear}학번`;
  }

  return fallbackDescription;
}

/**
 * 서버 작성자 정보를 화면 컴포넌트가 바로 쓸 수 있는 형태로 정규화한다.
 */
export function toCommonSpaceAuthorView(
  author?: CommonSpaceAuthorApiItem | null,
  options: {
    fallbackName?: string;
    fallbackDescription?: string;
    fallbackProfileImageSrc?: string;
  } = {},
): CommonSpaceAuthorView {
  const authorName = buildCommonSpaceAuthorName(author, options.fallbackName);

  return {
    authorName,
    authorDescription: buildCommonSpaceAuthorDescription(
      author,
      options.fallbackDescription,
    ),
    profileImageSrc:
      author?.profileImageUrl ||
      options.fallbackProfileImageSrc ||
      DEFAULT_COMMON_SPACE_PROFILE_IMAGE_SRC,
    profileImageAlt: authorName ? `${authorName} 프로필 사진` : undefined,
  };
}

/**
 * 내 프로필 응답을 댓글/답변 작성창에 사용할 간략 작성자명으로 변환한다.
 */
export function buildCommonSpaceViewerDisplayName(
  profile: MyPageUserApiResponse | null,
  fallbackName: string,
) {
  if (!profile) {
    return fallbackName;
  }

  const activeRole = profile.roles.find((role) => role.active) ?? profile.roles[0];

  return (
    buildCommonSpaceAuthorName(
      {
        name: profile.homepage.name,
        generation: activeRole?.generation,
        level: activeRole?.level,
      },
      fallbackName,
    ) ?? fallbackName
  );
}
import type { MyPageUserApiResponse } from "@/features/public/mypage/types";
