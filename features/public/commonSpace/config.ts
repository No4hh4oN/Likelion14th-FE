import type {
  CommonSpaceDetailSection,
  CommonSpacePart,
  CommonSpacePartId,
  CommonSpaceSectionId,
} from "./types";

export const DEFAULT_COMMON_SPACE_PART: CommonSpacePartId = "all";
export const DEFAULT_COMMON_SPACE_SECTION: CommonSpaceSectionId = "home";
const DEFAULT_COMMON_SPACE_QNA_MODE = "list";

const NOTICE_SECTION: CommonSpaceDetailSection = {
  id: "notices",
  label: "전체 공지",
  title: "전체 공지",
  description: "운영진 공지와 주요 일정을 한 곳에서 확인할 수 있는 공간입니다.",
  items: [
    "이번 주 운영 공지 미리보기",
    "세션 장소 및 시간 안내",
    "중요 일정 변경 공지",
    "활동 가이드라인 안내",
  ],
};

const MATERIAL_SECTION: CommonSpaceDetailSection = {
  id: "materials",
  label: "세션 자료 공유",
  title: "세션 자료 공유",
  description: "주차별 세션 자료와 참고 링크를 파트별로 모아보는 공간입니다.",
  items: [
    "이번 주 세션 발표 자료",
    "실습 예제 코드 묶음",
    "복습용 참고 링크",
    "이전 기수 추천 자료",
  ],
};

const ASSIGNMENT_SECTION: CommonSpaceDetailSection = {
  id: "assignments",
  label: "과제 안내 & 제출",
  title: "과제 안내 & 제출",
  description:
    "주차별 과제 안내, 제출 현황, 피드백 확인 흐름이 들어갈 공간입니다.",
  items: [
    "진행 중인 과제",
    "제출 완료한 과제",
    "피드백 공개 대기 과제",
    "마감된 과제 아카이브",
  ],
};

const QNA_SECTION: CommonSpaceDetailSection = {
  id: "qna",
  label: "질의응답",
  title: "질의응답",
  description:
    "학습 중 생긴 질문과 답변 기록을 빠르게 탐색할 수 있는 공간입니다.",
  items: [
    "답변 대기 중인 질문",
    "최근 해결된 질문",
    "자주 묻는 질문 모음",
    "운영진 공지형 답변",
  ],
};

const SHARED_PART_SECTIONS = [
  NOTICE_SECTION,
  MATERIAL_SECTION,
  ASSIGNMENT_SECTION,
] as const;

export const COMMON_SPACE_PARTS: CommonSpacePart[] = [
  {
    id: "all",
    label: "ALL",
    iconSrc: "/images/lions/lion-long-hair.webp",
    iconAlt: "롱헤어 라이언",
    sections: [...SHARED_PART_SECTIONS, QNA_SECTION],
  },
  {
    id: "front-end",
    label: "FRONT-END",
    headingLabel: "프론트엔드",
    iconSrc: "/icons/frontend.webp",
    iconAlt: "프론트엔드 아이콘",
    sections: [...SHARED_PART_SECTIONS],
  },
  {
    id: "back-end",
    label: "BACK-END",
    headingLabel: "백엔드",
    iconSrc: "/icons/backend.webp",
    iconAlt: "백엔드 아이콘",
    sections: [...SHARED_PART_SECTIONS],
  },
  {
    id: "ai-ml",
    label: "AI / ML",
    iconSrc: "/icons/ai.webp",
    iconAlt: "롱헤어 라이언",
    sections: [...SHARED_PART_SECTIONS],
  },
  {
    id: "pm-design",
    label: "PM / DESIGN",
    headingLabel: "기획/디자인",
    iconSrc: "/icons/art.webp",
    iconAlt: "기획 디자인 아이콘",
    sections: [...SHARED_PART_SECTIONS],
  },
];

export function isCommonSpacePartId(
  value: string | null,
): value is CommonSpacePartId {
  return COMMON_SPACE_PARTS.some((part) => part.id === value);
}

export function resolveCommonSpacePartId(
  value: string | null,
): CommonSpacePartId {
  return isCommonSpacePartId(value) ? value : DEFAULT_COMMON_SPACE_PART;
}

export function getCommonSpacePart(partId: CommonSpacePartId): CommonSpacePart {
  return (
    COMMON_SPACE_PARTS.find((part) => part.id === partId) ??
    COMMON_SPACE_PARTS[0]
  );
}

export function isCommonSpaceSectionId(
  value: string | null,
): value is CommonSpaceSectionId {
  return (
    value === "home" ||
    COMMON_SPACE_PARTS.some((part) =>
      part.sections.some((section) => section.id === value),
    )
  );
}

export function resolveCommonSpaceSectionId(
  part: CommonSpacePart,
  value: string | null,
): CommonSpaceSectionId {
  if (!value || value === DEFAULT_COMMON_SPACE_SECTION) {
    return DEFAULT_COMMON_SPACE_SECTION;
  }

  if (!isCommonSpaceSectionId(value)) {
    return DEFAULT_COMMON_SPACE_SECTION;
  }

  return part.sections.some((section) => section.id === value)
    ? value
    : DEFAULT_COMMON_SPACE_SECTION;
}

export function getCommonSpaceSection(
  part: CommonSpacePart,
  sectionId: CommonSpaceSectionId,
): CommonSpaceDetailSection | null {
  if (sectionId === DEFAULT_COMMON_SPACE_SECTION) {
    return null;
  }

  return part.sections.find((section) => section.id === sectionId) ?? null;
}

export function buildCommonSpaceHref(
  partId: CommonSpacePartId,
  sectionId: CommonSpaceSectionId = DEFAULT_COMMON_SPACE_SECTION,
) {
  const params = new URLSearchParams();

  if (partId !== DEFAULT_COMMON_SPACE_PART) {
    params.set("part", partId);
  }

  if (sectionId !== DEFAULT_COMMON_SPACE_SECTION) {
    params.set("section", sectionId);
  }

  const query = params.toString();
  return query ? `/14/commonSpace?${query}` : "/14/commonSpace";
}

/**
 * 공지 상세 화면으로 이동할 href를 생성한다.
 */
export function buildCommonSpaceNoticeDetailHref(
  partId: CommonSpacePartId,
  noticeId: number,
) {
  const params = new URLSearchParams();

  if (partId !== DEFAULT_COMMON_SPACE_PART) {
    params.set("part", partId);
  }

  params.set("section", "notices");
  params.set("noticeId", String(noticeId));

  return `/14/commonSpace?${params.toString()}`;
}

/**
 * 세션 자료 상세 화면으로 이동할 href를 생성한다.
 */
export function buildCommonSpaceMaterialDetailHref(
  partId: CommonSpacePartId,
  materialId: number,
) {
  const params = new URLSearchParams();

  if (partId !== DEFAULT_COMMON_SPACE_PART) {
    params.set("part", partId);
  }

  params.set("section", "materials");
  params.set("materialId", String(materialId));

  return `/14/commonSpace?${params.toString()}`;
}

/**
 * 과제 상세 화면으로 이동할 href를 생성한다.
 */
export function buildCommonSpaceAssignmentDetailHref(
  partId: CommonSpacePartId,
  assignmentId: number,
) {
  const params = new URLSearchParams();

  if (partId !== DEFAULT_COMMON_SPACE_PART) {
    params.set("part", partId);
  }

  params.set("section", "assignments");
  params.set("assignmentId", String(assignmentId));

  return `/14/commonSpace?${params.toString()}`;
}

/**
 * 질의응답 상세 화면으로 이동할 href를 생성한다.
 */
export function buildCommonSpaceQnaDetailHref(
  partId: CommonSpacePartId,
  qnaId: number,
) {
  const params = new URLSearchParams();

  if (partId !== DEFAULT_COMMON_SPACE_PART) {
    params.set("part", partId);
  }

  params.set("section", "qna");
  params.set("qnaId", String(qnaId));

  return `/14/commonSpace?${params.toString()}`;
}

/**
 * 질의응답 작성 화면으로 이동할 href를 생성한다.
 */
export function buildCommonSpaceQnaWriteHref(partId: CommonSpacePartId) {
  const params = new URLSearchParams();

  if (partId !== DEFAULT_COMMON_SPACE_PART) {
    params.set("part", partId);
  }

  params.set("section", "qna");
  params.set("qnaMode", "write");

  return `/14/commonSpace?${params.toString()}`;
}

/**
 * 상세 식별자 query 값을 숫자로 정규화한다.
 */
function resolveCommonSpaceDetailId(value: string | null) {
  if (!value) {
    return null;
  }

  const parsedValue = Number(value);
  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : null;
}

/**
 * 공지 식별자 query 값을 숫자로 정규화한다.
 */
export function resolveCommonSpaceNoticeId(value: string | null) {
  return resolveCommonSpaceDetailId(value);
}

/**
 * 세션 자료 식별자 query 값을 숫자로 정규화한다.
 */
export function resolveCommonSpaceMaterialId(value: string | null) {
  return resolveCommonSpaceDetailId(value);
}

/**
 * 과제 식별자 query 값을 숫자로 정규화한다.
 */
export function resolveCommonSpaceAssignmentId(value: string | null) {
  return resolveCommonSpaceDetailId(value);
}

/**
 * 질의응답 식별자 query 값을 숫자로 정규화한다.
 */
export function resolveCommonSpaceQnaId(value: string | null) {
  return resolveCommonSpaceDetailId(value);
}

/**
 * 질의응답 화면 모드를 정규화한다.
 */
export function resolveCommonSpaceQnaMode(value: string | null) {
  return value === "write" ? "write" : DEFAULT_COMMON_SPACE_QNA_MODE;
}

export function getCommonSpaceHeading(part: CommonSpacePart) {
  return part.id === "all"
    ? "멋쟁이사자처럼 SYU 공통 공간"
    : `멋쟁이사자처럼 SYU ${part.headingLabel ?? part.label} 공간`;
}
