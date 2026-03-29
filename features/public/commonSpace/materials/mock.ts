import type { CommonSpaceNoticeCommentItem } from "../notices/types";
import {
  DEFAULT_COMMON_SPACE_MATERIAL_PAGE,
  DEFAULT_COMMON_SPACE_MATERIAL_PAGE_SIZE,
} from "./constants";
import type {
  CommonSpaceMaterialDetailItem,
  CommonSpaceMaterialListItem,
  CommonSpaceMaterialListQuery,
  CommonSpaceMaterialListResult,
} from "./types";

/**
 * 레이아웃 검증용 세션 자료 mock 목록이다.
 */
export const COMMON_SPACE_MATERIAL_MOCK_ITEMS: CommonSpaceMaterialListItem[] = [
  {
    id: 1001,
    title: "3/11 5주차 공통 세션 예정입니다.",
    summary:
      "이번 주 공통 세션 일정과 실습 준비사항을 확인해 주세요. 장소와 준비물, 과제 안내를 한 번에 정리했습니다.",
    thumbnailSrc: "/images/lions/head-back.webp",
    thumbnailAlt: "공통 세션 안내 썸네일",
    partId: "all",
    createdAt: "2026-03-15T10:00:00",
    fileCount: 1,
    hasAttachments: true,
    isPinned: true,
    isNew: true,
  },
  {
    id: 1002,
    title: "발로 해도 따라할 수 있는 기초 코딩 추천! 왜 기다려도 참고할 수 있다는!!",
    summary:
      "기초 세션에서 바로 따라 하기 좋았던 자료들을 묶어 두었습니다. 세션 실습 전에 미리 읽어 오면 이해가 훨씬 빠릅니다.",
    thumbnailSrc: "/images/lions/head-front.webp",
    thumbnailAlt: "프론트엔드 세션 자료 썸네일",
    partId: "all",
    createdAt: "2026-03-03T10:00:00",
    fileCount: 2,
    hasAttachments: true,
    isPinned: false,
    isNew: true,
  },
  {
    id: 1003,
    title: "저는 사진을 올리기 싫어요 안 올리면 어떻게 되죠!",
    summary:
      "대표 이미지 없이도 본문과 첨부파일만으로 글을 올릴 수 있습니다. 이미지가 없어도 카드 레이아웃은 자연스럽게 유지됩니다.",
    partId: "all",
    createdAt: "2026-03-03T10:00:00",
    fileCount: 1,
    hasAttachments: true,
    isPinned: false,
    isNew: false,
  },
  {
    id: 1004,
    title: "제목이 길 때는 두 줄로 넘어가게 하고 잘립니다 반복복붙 제목이 길 때는 두 줄로 넘어가게...",
    summary:
      "긴 제목과 요약문이 함께 들어오는 경우를 확인하기 위한 목업 데이터입니다. 카드 높이는 유지하면서 텍스트만 자연스럽게 잘립니다.",
    thumbnailSrc: "/images/lions/head-design.webp",
    thumbnailAlt: "디자인 세션 자료 썸네일",
    partId: "all",
    createdAt: "2026-03-03T10:00:00",
    fileCount: 1,
    hasAttachments: true,
    isPinned: false,
    isNew: false,
  },
  {
    id: 1005,
    title: "발로 해도 따라할 수 있는 기초 코딩 추천! 왜 기다려도 참고할 수 있다는!!",
    summary:
      "기초 세션 내용을 복습할 수 있도록 슬라이드와 요약 노트를 함께 올렸습니다. 요약문이 길어져도 카드 높이는 안정적으로 유지됩니다.",
    thumbnailSrc: "/images/lions/head-ai.webp",
    thumbnailAlt: "AI 세션 자료 썸네일",
    partId: "all",
    createdAt: "2026-03-03T10:00:00",
    fileCount: 1,
    hasAttachments: true,
    isPinned: false,
    isNew: false,
  },
  {
    id: 1006,
    title: "발로 해도 따라할 수 있는 기초 코딩 추천! 왜 기다려도 참고할 수 있다는!!",
    summary:
      "대표 이미지가 있는 카드와 없는 카드를 섞어서 노출하는 예시입니다. 실제 데이터 연결 시 섬네일 필드는 선택값으로 다룹니다.",
    thumbnailSrc: "/images/lions/peek.webp",
    thumbnailAlt: "세션 자료 썸네일",
    partId: "all",
    createdAt: "2026-03-03T10:00:00",
    fileCount: 1,
    hasAttachments: true,
    isPinned: false,
    isNew: false,
  },
  {
    id: 1007,
    title: "발로 해도 따라할 수 있는 기초 코딩 추천! 왜 기다려도 참고할 수 있다는!!",
    summary:
      "본문 미리보기가 길더라도 세 줄까지만 노출되도록 처리할 예정입니다. 날짜는 카드 하단에 고정 배치됩니다.",
    partId: "all",
    createdAt: "2026-03-03T10:00:00",
    fileCount: 0,
    hasAttachments: false,
    isPinned: false,
    isNew: false,
  },
  {
    id: 1008,
    title: "발표 자료 압축본과 실습 링크를 함께 정리했어요",
    summary:
      "세션 자료 PDF와 녹화본 링크, 실습 저장소 주소를 하나의 글에 함께 정리한 예시입니다.",
    thumbnailSrc: "/images/lions/hug-gradient-white.webp",
    thumbnailAlt: "세션 자료 썸네일",
    partId: "all",
    createdAt: "2026-03-02T10:00:00",
    fileCount: 3,
    hasAttachments: true,
    isPinned: false,
    isNew: false,
  },
  {
    id: 1101,
    title: "프론트엔드 2주차 세션 자료 모음",
    summary:
      "React 실습 코드, 발표 자료, 참고 링크를 한 번에 모아둔 자료입니다.",
    thumbnailSrc: "/images/lions/head-front.webp",
    thumbnailAlt: "프론트엔드 자료 썸네일",
    partId: "front-end",
    createdAt: "2026-03-04T10:00:00",
    fileCount: 2,
    hasAttachments: true,
    isPinned: true,
    isNew: true,
  },
  {
    id: 1102,
    title: "컴포넌트 분리 예제 코드",
    summary:
      "세션 실습에 사용한 예제 코드를 다시 정리해 올렸습니다.",
    partId: "front-end",
    createdAt: "2026-03-02T10:00:00",
    fileCount: 1,
    hasAttachments: true,
    isPinned: false,
    isNew: false,
  },
  {
    id: 1201,
    title: "백엔드 3주차 세션 자료",
    summary:
      "Spring Boot 실습 예제와 데이터베이스 설계 참고 자료를 함께 제공합니다.",
    thumbnailSrc: "/images/lions/head-back.webp",
    thumbnailAlt: "백엔드 자료 썸네일",
    partId: "back-end",
    createdAt: "2026-03-04T10:00:00",
    fileCount: 2,
    hasAttachments: true,
    isPinned: true,
    isNew: false,
  },
  {
    id: 1301,
    title: "AI/ML 실습 환경 세팅 자료",
    summary:
      "Colab 환경 세팅과 데이터셋 다운로드 링크를 함께 정리했습니다.",
    thumbnailSrc: "/images/lions/head-ai.webp",
    thumbnailAlt: "AI/ML 자료 썸네일",
    partId: "ai-ml",
    createdAt: "2026-03-04T10:00:00",
    fileCount: 2,
    hasAttachments: true,
    isPinned: true,
    isNew: true,
  },
  {
    id: 1401,
    title: "기획/디자인 세션 피그마 자료",
    summary:
      "와이어프레임 예시와 컴포넌트 정리본을 함께 올려둔 자료입니다.",
    thumbnailSrc: "/images/lions/head-design.webp",
    thumbnailAlt: "기획 디자인 자료 썸네일",
    partId: "pm-design",
    createdAt: "2026-03-04T10:00:00",
    fileCount: 2,
    hasAttachments: true,
    isPinned: true,
    isNew: false,
  },
];

/**
 * 세션 자료 상세 레이아웃 검증용 mock 상세 데이터다.
 */
export const COMMON_SPACE_MATERIAL_MOCK_DETAIL_BY_ID: Record<
  number,
  CommonSpaceMaterialDetailItem
> = {
  1001: {
    id: 1001,
    title: "3/11 5주차 공통 세션 예정입니다.",
    authorName: "윤혜원",
    authorDescription: "멋쟁이사자처럼 삼육대학교 24학번",
    content:
      "이번 세션에서는 협업을 위한 기본 세팅과 실습 흐름을 함께 다룹니다.\n\n세션 전에 읽어 오면 좋은 링크와, 실습 중 참고할 PDF, 녹화본 링크를 함께 첨부해 두었습니다. 대표 이미지는 글 작성 시 설정한 경우에만 노출되고, 설정하지 않으면 본문 이미지 영역 없이 본문만 표시됩니다.\n\nAPI 연결 전까지는 레이아웃 검증용 목업 데이터를 사용하고 있으며, 이후 서버에서 받아오는 값으로 교체할 예정입니다.",
    bodyImageSrc: "/images/lions/head-back.webp",
    bodyImageAlt: "공통 세션 자료 대표 이미지",
    partId: "all",
    status: "ACTIVE",
    createdAt: "2026-03-15T10:00:00",
    updatedAt: "2026-03-15T10:00:00",
    attachments: [
      {
        id: 9101,
        name: "5주차_공통세션_자료집.pdf",
        url: "https://example.com/files/material-week5.pdf",
      },
    ],
    hasAttachments: true,
  },
  1002: {
    id: 1002,
    title: "발로 해도 따라할 수 있는 기초 코딩 추천! 왜 기다려도 참고할 수 있다는!!",
    authorName: "운영진",
    authorDescription: "멋쟁이사자처럼 삼육대학교",
    content:
      "기초 세션 이후 바로 따라 해볼 수 있도록 실습 예제와 참고 영상을 정리했습니다.\n\n썸네일이 있는 글과 없는 글을 함께 확인할 수 있도록 구성했으며, 실제 목록에서는 대표 이미지가 비어 있으면 이미지 박스 자체를 숨깁니다.",
    bodyImageSrc: "/images/lions/head-front.webp",
    bodyImageAlt: "세션 자료 대표 이미지",
    partId: "all",
    status: "ACTIVE",
    createdAt: "2026-03-03T10:00:00",
    updatedAt: "2026-03-03T10:00:00",
    attachments: [
      {
        id: 9102,
        name: "기초코딩_추천자료.pdf",
        url: "https://example.com/files/material-basic-guide.pdf",
      },
      {
        id: 9103,
        name: "실습코드.zip",
        url: "https://example.com/files/material-basic-code.zip",
      },
    ],
    hasAttachments: true,
  },
};

/**
 * 세션 자료별 댓글 레이아웃 검증용 mock 데이터다.
 */
export const COMMON_SPACE_MATERIAL_MOCK_COMMENTS_BY_ID: Record<
  number,
  CommonSpaceNoticeCommentItem[]
> = {
  1001: [
    {
      id: 1,
      authorName: "윤혜원 (14기 운영진)",
      authorDescription: "경동나비엔보일러공학과 24학번",
      profileImageSrc: "/images/defaultProf.webp",
      profileImageAlt: "윤혜원 프로필 사진",
      content: "세션 자료는 본문 링크와 첨부파일 둘 다 확인해 주세요.",
      images: [],
    },
  ],
};

/**
 * 상세 mock이 없는 자료에 대한 기본 상세 데이터를 만든다.
 */
function createFallbackMockMaterialDetail(
  item: CommonSpaceMaterialListItem,
): CommonSpaceMaterialDetailItem {
  return {
    id: item.id,
    title: item.title,
    authorName: "운영진",
    authorDescription: "멋쟁이사자처럼 삼육대학교",
    content:
      "상세 본문은 추후 API 연결 시 실제 데이터로 교체됩니다.\n현재는 세션 자료 상세 레이아웃 검증용 기본 문구를 표시하고 있습니다.",
    bodyImageSrc: item.thumbnailSrc,
    bodyImageAlt: item.thumbnailAlt,
    partId: item.partId,
    status: "ACTIVE",
    createdAt: item.createdAt,
    updatedAt: item.createdAt,
    attachments: item.hasAttachments
      ? [
          {
            id: item.id * 10,
            name: `${item.title}.pdf`,
            url: `https://example.com/files/material-${item.id}.pdf`,
          },
        ]
      : [],
    hasAttachments: item.hasAttachments,
  };
}

/**
 * 파트 필터와 페이지네이션을 적용해 mock 세션 자료 목록 결과를 만든다.
 */
export function getMockCommonSpaceMaterialList(
  query: CommonSpaceMaterialListQuery = {},
): CommonSpaceMaterialListResult {
  const page = query.page ?? DEFAULT_COMMON_SPACE_MATERIAL_PAGE;
  const size = query.size ?? DEFAULT_COMMON_SPACE_MATERIAL_PAGE_SIZE;
  const partId = query.partId ?? "all";

  const filteredItems = COMMON_SPACE_MATERIAL_MOCK_ITEMS.filter(
    (item) => item.partId === partId,
  );

  const startIndex = page * size;
  const items = filteredItems.slice(startIndex, startIndex + size);

  return {
    items,
    page: {
      page,
      size,
      totalPages: Math.ceil(filteredItems.length / size) || 1,
      totalElements: filteredItems.length,
    },
  };
}

/**
 * 세션 자료 상세 mock 데이터를 반환한다.
 */
export function getMockCommonSpaceMaterialDetail(materialId: number) {
  if (COMMON_SPACE_MATERIAL_MOCK_DETAIL_BY_ID[materialId]) {
    return COMMON_SPACE_MATERIAL_MOCK_DETAIL_BY_ID[materialId];
  }

  const materialItem = COMMON_SPACE_MATERIAL_MOCK_ITEMS.find(
    (item) => item.id === materialId,
  );

  return materialItem ? createFallbackMockMaterialDetail(materialItem) : null;
}

/**
 * 세션 자료별 댓글 mock 데이터를 반환한다.
 */
export function getMockCommonSpaceMaterialComments(materialId: number) {
  return COMMON_SPACE_MATERIAL_MOCK_COMMENTS_BY_ID[materialId] ?? [];
}
