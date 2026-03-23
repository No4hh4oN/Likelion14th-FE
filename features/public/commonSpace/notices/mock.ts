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
    title: "14기 OT 장소 및 진행 순서 안내",
    partId: "all",
    createdAt: "2026-03-22T09:00:00",
    fileCount: 1,
    hasAttachments: true,
  },
  {
    id: 102,
    title: "프론트엔드 2주차 세션 공지",
    partId: "front-end",
    createdAt: "2026-03-21T13:30:00",
    fileCount: 2,
    hasAttachments: true,
  },
  {
    id: 103,
    title: "백엔드 과제 제출 방식 변경 안내",
    partId: "back-end",
    createdAt: "2026-03-20T18:10:00",
    fileCount: 0,
    hasAttachments: false,
  },
  {
    id: 104,
    title: "AI/ML 실습 환경 세팅 체크리스트",
    partId: "ai-ml",
    createdAt: "2026-03-19T11:15:00",
    fileCount: 1,
    hasAttachments: true,
  },
  {
    id: 105,
    title: "기획/디자인 피그마 파일 공유",
    partId: "pm-design",
    createdAt: "2026-03-18T15:45:00",
    fileCount: 3,
    hasAttachments: true,
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
    title: "14기 OT 장소 및 진행 순서 안내",
    content:
      "OT는 대강당에서 진행됩니다.\n입실 시간과 좌석 배치표는 첨부파일을 확인해 주세요.",
    partId: "all",
    status: "ACTIVE",
    createdAt: "2026-03-22T09:00:00",
    updatedAt: "2026-03-22T09:00:00",
    attachments: [
      {
        id: 9001,
        name: "OT_안내문.pdf",
        url: "https://example.com/files/ot-guide.pdf",
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

  const filteredItems =
    partId === "all"
      ? COMMON_SPACE_NOTICE_MOCK_ITEMS
      : COMMON_SPACE_NOTICE_MOCK_ITEMS.filter((item) => item.partId === partId);

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
