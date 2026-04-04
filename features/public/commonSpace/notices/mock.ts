import {
  DEFAULT_COMMON_SPACE_NOTICE_PAGE,
  DEFAULT_COMMON_SPACE_NOTICE_PAGE_SIZE,
} from "./constants";
import { isCommonSpaceNoticeNew } from "./adapter";
import type {
  CommonSpaceNoticeCommentItem,
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
 * 공지별 댓글 레이아웃 검증용 mock 데이터다.
 */
export const COMMON_SPACE_NOTICE_MOCK_COMMENTS_BY_ID: Record<
  number,
  CommonSpaceNoticeCommentItem[]
> = {
  101: [
    {
      id: 1,
      authorName: "윤혜원 (14기 운영진)",
      authorDescription: "경동나비엔보일러공학과 24학번",
      profileImageSrc: "/images/defaultProf.webp",
      profileImageAlt: "윤혜원 프로필 사진",
      content:
        "빨리 병원을 가보심이 좋을 듯 하네요 좋은 병원 여러 곳 추천해드릴게요 여기가 화타입니다 정말 답이 없어 보이네요",
      images: [
        {
          id: "comment-1-image-1",
          src: "/images/commonSpace/default.webp",
          alt: "댓글 첨부 이미지 1",
        },
        {
          id: "comment-1-image-2",
          src: "/images/lions/peek.webp",
          alt: "댓글 첨부 이미지 2",
        },
        {
          id: "comment-1-image-3",
          src: "/images/lions/hug-gradient-white.webp",
          alt: "댓글 첨부 이미지 3",
        },
      ],
    },
    {
      id: 2,
      authorName: "이라건 (14기 운영진)",
      authorDescription: "경동나비엔보일러공학과 24학번",
      profileImageSrc: "/images/defaultProf.webp",
      profileImageAlt: "이라건 프로필 사진",
      content: "신기한 일이 많이 일어나네",
      images: [],
    },
  ],
};

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
    authorName: "윤혜원",
    authorDescription: "멋쟁이사자처럼 삼육대학교 24학번",
    content:
      "레시피\n\n재료: 진짬뽕 5봉지, 썰은 소고기, 미역국(또는 냉동된 된장국), 반쪽 계란(개당 4등분)\n1. 냄비에 소고기 미역국 500ml(기본 진짬뽕 물 양 550ml)와 된장국을 넣고 색이 날 때까지 고기를 넣고 한번 볶습니다.\n2. 미역국이 끓으면 분말스프를 넣고 감칠맛을 더합니다.\n3. 육수가 끓기 전에 면 사리를 부어 면이 탄력을 살리도록 천천히 끓여 줍니다.\n4. 쫄깃한 면 위에 미역과 소고기를 얹습니다.\n\n그냥 집에서 끓인 미역국으로 만들어도 되는 것 같지만 저는 집에 미역국이 있어서 기존 국물 레시피 그대로 끓였고 그대로 넣어서 스프가 미역국이랑 잘 어울리더라고요! 면이랑 계란이 포인트라 입맛 없을 때 진짜 좋아요.\n\n만약 미역국 대신 김칫국이나 라면국물이 강하면 불리니까 추천하지는 않고요. 두부나 콩나물만 얹어 먹어도 괜찮더라고요. 전체적으로 입맛 없을 때 한 그릇으로도 충분히 배부른 조합이었습니다.",
    bodyImageSrc: "/images/commonSpace/default.webp",
    bodyImageAlt: "공지 본문 예시 이미지",
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
    comments: getMockCommonSpaceNoticeComments(101),
  },
  102: {
    id: 102,
    title: "세션의 규칙을 안내드립니다. (첨부파일 참조)",
    authorName: "운영진",
    authorDescription: "멋쟁이사자처럼 삼육대학교",
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
    comments: getMockCommonSpaceNoticeComments(102),
  },
  201: {
    id: 201,
    title: "프론트엔드 2주차 세션 공지",
    authorName: "프론트엔드 운영진",
    authorDescription: "멋쟁이사자처럼 삼육대학교",
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
    comments: getMockCommonSpaceNoticeComments(201),
  },
};

/**
 * 상세 mock이 없는 공지에 대한 기본 상세 데이터를 만든다.
 */
function createFallbackMockNoticeDetail(
  item: CommonSpaceNoticeListItem,
): CommonSpaceNoticeDetailItem {
  return {
    id: item.id,
    title: item.title,
    authorName: "운영진",
    authorDescription: "멋쟁이사자처럼 삼육대학교",
    content:
      "상세 본문은 추후 API 연결 시 실제 데이터로 교체됩니다.\n현재는 공지 상세 레이아웃 검증용 기본 문구를 표시하고 있습니다.",
    partId: item.partId,
    status: "ACTIVE",
    createdAt: item.createdAt,
    updatedAt: item.createdAt,
    attachments: item.hasAttachments
      ? [
          {
            id: item.id * 10,
            name: `${item.title}.pdf`,
            url: `https://example.com/files/notice-${item.id}.pdf`,
          },
        ]
      : [],
    hasAttachments: item.hasAttachments,
    comments: getMockCommonSpaceNoticeComments(item.id),
  };
}

/**
 * 파트 필터와 페이지네이션을 적용해 mock 공지 목록 결과를 만든다.
 */
export function getMockCommonSpaceNoticeList(
  query: CommonSpaceNoticeListQuery = {},
): CommonSpaceNoticeListResult {
  const page = query.page ?? DEFAULT_COMMON_SPACE_NOTICE_PAGE;
  const size = query.size ?? DEFAULT_COMMON_SPACE_NOTICE_PAGE_SIZE;
  const partId = query.partId ?? "all";
  const now = new Date();

  const filteredItems = COMMON_SPACE_NOTICE_MOCK_ITEMS.filter(
    (item) => item.partId === partId,
  );

  const startIndex = page * size;
  const items = filteredItems
    .slice(startIndex, startIndex + size)
    .map((item) => ({
      ...item,
      isNew: isCommonSpaceNoticeNew(item.createdAt, now),
    }));

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
  if (COMMON_SPACE_NOTICE_MOCK_DETAIL_BY_ID[noticeId]) {
    return COMMON_SPACE_NOTICE_MOCK_DETAIL_BY_ID[noticeId];
  }

  const noticeItem = COMMON_SPACE_NOTICE_MOCK_ITEMS.find((item) => item.id === noticeId);
  return noticeItem ? createFallbackMockNoticeDetail(noticeItem) : null;
}

/**
 * 공지별 댓글 mock 데이터를 반환한다.
 */
export function getMockCommonSpaceNoticeComments(noticeId: number) {
  return COMMON_SPACE_NOTICE_MOCK_COMMENTS_BY_ID[noticeId] ?? [];
}
