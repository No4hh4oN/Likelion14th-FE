import {
  DEFAULT_COMMON_SPACE_NOTICE_PAGE,
  DEFAULT_COMMON_SPACE_NOTICE_PAGE_SIZE,
} from "./constants";
import type {
  CommonSpaceNoticeDetailItem,
  CommonSpaceNoticeListItem,
  CommonSpaceNoticeListQuery,
  CommonSpaceNoticeListResult,
} from "./types";

/**
 * 레이아웃 검증용 전체 공지 mock 목록이다.
 * 실제 UI 구현 시에는 이 데이터를 섹션 외부에서 주입하는 기준 데이터로 사용한다.
 */
export const COMMON_SPACE_NOTICE_MOCK_ITEMS: CommonSpaceNoticeListItem[] = [
  {
    id: 101,
    title: "3/11 5주차 공통 세션 예정입니다.",
    partId: "all",
    createdAt: "2026-03-25T10:00:00",
    fileCount: 1,
    hasAttachments: true,
    isPinned: true,
    isNew: true,
  },
  {
    id: 102,
    title: "세션의 규칙을 안내드립니다. (첨부파일 참조)",
    partId: "all",
    createdAt: "2026-03-24T15:00:00",
    fileCount: 1,
    hasAttachments: true,
    isPinned: false,
    isNew: true,
  },
  {
    id: 103,
    title: "공통 세션 장소 및 시간대 안내",
    partId: "all",
    createdAt: "2026-03-23T19:30:00",
    fileCount: 0,
    hasAttachments: false,
    isPinned: false,
    isNew: false,
  },
  {
    id: 104,
    title: "과제 미제출 시 불이익",
    partId: "all",
    createdAt: "2026-03-22T18:20:00",
    fileCount: 0,
    hasAttachments: false,
    isPinned: false,
    isNew: false,
  },
  {
    id: 105,
    title: "과제 제출 가이드라인 안내",
    partId: "all",
    createdAt: "2026-03-21T14:10:00",
    fileCount: 1,
    hasAttachments: true,
    isPinned: false,
    isNew: false,
  },
  {
    id: 106,
    title: "OT 출석 체크 방법",
    partId: "all",
    createdAt: "2026-03-20T11:00:00",
    fileCount: 0,
    hasAttachments: false,
    isPinned: false,
    isNew: false,
  },
  {
    id: 107,
    title: "Discord 역할 지급 일정",
    partId: "all",
    createdAt: "2026-03-19T16:00:00",
    fileCount: 0,
    hasAttachments: false,
    isPinned: false,
    isNew: false,
  },
  {
    id: 108,
    title: "공통 세션 촬영 안내",
    partId: "all",
    createdAt: "2026-03-18T09:30:00",
    fileCount: 0,
    hasAttachments: false,
    isPinned: false,
    isNew: false,
  },
  {
    id: 109,
    title: "회비 납부 기간 재공지",
    partId: "all",
    createdAt: "2026-03-17T13:00:00",
    fileCount: 0,
    hasAttachments: false,
    isPinned: false,
    isNew: false,
  },
  {
    id: 110,
    title: "공통 세션 준비물 체크",
    partId: "all",
    createdAt: "2026-03-16T18:30:00",
    fileCount: 0,
    hasAttachments: false,
    isPinned: false,
    isNew: false,
  },
  {
    id: 111,
    title: "운영진 연락 채널 안내",
    partId: "all",
    createdAt: "2026-03-15T08:10:00",
    fileCount: 0,
    hasAttachments: false,
    isPinned: false,
    isNew: false,
  },
  {
    id: 112,
    title: "활동 인증 업로드 기준",
    partId: "all",
    createdAt: "2026-03-14T17:45:00",
    fileCount: 1,
    hasAttachments: true,
    isPinned: false,
    isNew: false,
  },
  {
    id: 113,
    title: "중간고사 기간 공지",
    partId: "all",
    createdAt: "2026-03-13T20:15:00",
    fileCount: 0,
    hasAttachments: false,
    isPinned: false,
    isNew: false,
  },
  {
    id: 114,
    title: "수료 기준 재안내",
    partId: "all",
    createdAt: "2026-03-12T12:40:00",
    fileCount: 1,
    hasAttachments: true,
    isPinned: false,
    isNew: false,
  },
  {
    id: 201,
    title: "프론트엔드 2주차 세션 공지",
    partId: "front-end",
    createdAt: "2026-03-24T13:30:00",
    fileCount: 2,
    hasAttachments: true,
    isPinned: true,
    isNew: true,
  },
  {
    id: 202,
    title: "React 과제 제출 형식 안내",
    partId: "front-end",
    createdAt: "2026-03-22T10:00:00",
    fileCount: 1,
    hasAttachments: true,
    isPinned: false,
    isNew: false,
  },
  {
    id: 301,
    title: "백엔드 과제 제출 방식 변경 안내",
    partId: "back-end",
    createdAt: "2026-03-20T18:10:00",
    fileCount: 0,
    hasAttachments: false,
    isPinned: true,
    isNew: false,
  },
  {
    id: 302,
    title: "Spring 세션 준비사항 안내",
    partId: "back-end",
    createdAt: "2026-03-18T12:30:00",
    fileCount: 1,
    hasAttachments: true,
    isPinned: false,
    isNew: false,
  },
  {
    id: 401,
    title: "AI/ML 실습 환경 세팅 체크리스트",
    partId: "ai-ml",
    createdAt: "2026-03-19T11:15:00",
    fileCount: 1,
    hasAttachments: true,
    isPinned: true,
    isNew: true,
  },
  {
    id: 402,
    title: "데이터셋 다운로드 링크 모음",
    partId: "ai-ml",
    createdAt: "2026-03-17T14:10:00",
    fileCount: 1,
    hasAttachments: true,
    isPinned: false,
    isNew: false,
  },
  {
    id: 501,
    title: "기획/디자인 피그마 파일 공유",
    partId: "pm-design",
    createdAt: "2026-03-18T15:45:00",
    fileCount: 3,
    hasAttachments: true,
    isPinned: true,
    isNew: false,
  },
  {
    id: 502,
    title: "와이어프레임 제출 기준 안내",
    partId: "pm-design",
    createdAt: "2026-03-16T11:50:00",
    fileCount: 1,
    hasAttachments: true,
    isPinned: false,
    isNew: false,
  },
];

/**
 * 공지 상세 레이아웃 검증용 mock 상세 데이터다.
 */
export const COMMON_SPACE_NOTICE_MOCK_DETAIL_BY_ID: Record<
  number,
  CommonSpaceNoticeDetailItem
> = {
  101: {
    id: 101,
    title: "3/11 5주차 공통 세션 예정입니다.",
    content:
      "이번 주 공통 세션은 대면으로 진행됩니다.\n세부 시간표와 준비물은 첨부파일을 확인해 주세요.",
    partId: "all",
    status: "ACTIVE",
    createdAt: "2026-03-25T10:00:00",
    updatedAt: "2026-03-25T10:00:00",
    attachments: [
      {
        id: 9001,
        name: "5주차_공통세션_안내.pdf",
        url: "https://example.com/files/common-session-week5.pdf",
      },
    ],
    hasAttachments: true,
  },
  102: {
    id: 102,
    title: "세션의 규칙을 안내드립니다. (첨부파일 참조)",
    content:
      "세션 참여 규칙과 출결 기준을 다시 안내드립니다.\n첨부된 가이드 문서를 함께 확인해 주세요.",
    partId: "all",
    status: "ACTIVE",
    createdAt: "2026-03-24T15:00:00",
    updatedAt: "2026-03-24T15:00:00",
    attachments: [
      {
        id: 9002,
        name: "세션_운영_가이드.pdf",
        url: "https://example.com/files/session-guide.pdf",
      },
    ],
    hasAttachments: true,
  },
  201: {
    id: 201,
    title: "프론트엔드 2주차 세션 공지",
    content:
      "프론트엔드 2주차 세션은 React 상태 관리 기초를 다룹니다.\n사전 과제와 세션 링크를 확인해 주세요.",
    partId: "front-end",
    status: "ACTIVE",
    createdAt: "2026-03-24T13:30:00",
    updatedAt: "2026-03-24T13:30:00",
    attachments: [
      {
        id: 9201,
        name: "frontend-week2.pdf",
        url: "https://example.com/files/frontend-week2.pdf",
      },
    ],
    hasAttachments: true,
  },
};

/**
 * 파트 필터와 페이지네이션을 적용해 mock 공지 목록 결과를 만든다.
 */
export function getMockCommonSpaceNoticeList(
  query: CommonSpaceNoticeListQuery = {},
): CommonSpaceNoticeListResult {
  const page = query.page ?? DEFAULT_COMMON_SPACE_NOTICE_PAGE;
  const size = query.size ?? DEFAULT_COMMON_SPACE_NOTICE_PAGE_SIZE;
  const partId = query.partId ?? "all";

  const filteredItems = COMMON_SPACE_NOTICE_MOCK_ITEMS.filter(
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
 * 공지 상세 mock 데이터를 반환한다.
 */
export function getMockCommonSpaceNoticeDetail(noticeId: number) {
  return COMMON_SPACE_NOTICE_MOCK_DETAIL_BY_ID[noticeId] ?? null;
}
