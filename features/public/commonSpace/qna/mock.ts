import {
  DEFAULT_COMMON_SPACE_QNA_PAGE,
  DEFAULT_COMMON_SPACE_QNA_PAGE_SIZE,
} from "./constants";
import {
  isCommonSpaceQnaImageFileName,
  mapQnaApiPartToQuestionPartId,
} from "./adapter";
import type {
  CommonSpaceQnaAnswerItem,
  CommonSpaceQnaAnswerMutationRequest,
  CommonSpaceQnaAnswerMutationResult,
  CommonSpaceQnaDetailItem,
  CommonSpaceQnaListItem,
  CommonSpaceQnaListQuery,
  CommonSpaceQnaListResult,
  CommonSpaceQnaQuestionMutationRequest,
  CommonSpaceQnaQuestionMutationResult,
} from "./types";

/**
 * 질의응답 mock 목록 원본 데이터다.
 */
let commonSpaceQnaMockItems: CommonSpaceQnaListItem[] = [
  {
    id: 3001,
    title: "비밀번호 잃어버렸어요 ㅠㅠㅠㅠㅠㅠㅠㅠ 어떡죠",
    isSecret: true,
    questionPartId: "etc",
    answerState: "completed",
    createdAt: "2026-03-14T17:22:00",
    updatedAt: "2026-03-14T17:22:00",
    fileCount: 0,
    hasAttachments: false,
  },
  {
    id: 3002,
    title: "파트장님 나루토 챌린지 해주세요",
    isSecret: true,
    questionPartId: "front-end",
    answerState: "pending",
    createdAt: "2026-03-14T15:10:00",
    updatedAt: "2026-03-14T15:10:00",
    fileCount: 0,
    hasAttachments: false,
  },
  {
    id: 3003,
    title:
      "세션자료 가이브가 에러로 나오지 않았나요 제출수는 분할결과입니다 어디를 눌러야 할지 모르겠어요",
    isSecret: false,
    questionPartId: "pm-design",
    answerState: "completed",
    createdAt: "2026-03-13T14:30:00",
    updatedAt: "2026-03-13T14:30:00",
    fileCount: 1,
    hasAttachments: true,
  },
  {
    id: 3004,
    title: "ai가 저한테 반말하는데 정신교육 하는 법 알려주실 수 있나요",
    isSecret: false,
    questionPartId: "ai-ml",
    answerState: "completed",
    createdAt: "2026-12-14T17:22:00",
    updatedAt: "2026-12-14T17:22:00",
    fileCount: 0,
    hasAttachments: false,
  },
  {
    id: 3005,
    title: "이걸 과제라고 낸 거냐",
    isSecret: false,
    questionPartId: "back-end",
    answerState: "completed",
    createdAt: "2026-03-12T18:10:00",
    updatedAt: "2026-03-12T18:10:00",
    fileCount: 0,
    hasAttachments: false,
  },
  {
    id: 3006,
    title: "냐나냥",
    isSecret: false,
    questionPartId: "back-end",
    answerState: "completed",
    createdAt: "2026-03-12T11:10:00",
    updatedAt: "2026-03-12T11:10:00",
    fileCount: 0,
    hasAttachments: false,
  },
  {
    id: 3007,
    title: "냐나냥",
    isSecret: false,
    questionPartId: "back-end",
    answerState: "completed",
    createdAt: "2026-03-11T18:10:00",
    updatedAt: "2026-03-11T18:10:00",
    fileCount: 0,
    hasAttachments: false,
  },
  {
    id: 3008,
    title: "냐나냥",
    isSecret: false,
    questionPartId: "back-end",
    answerState: "completed",
    createdAt: "2026-03-10T18:10:00",
    updatedAt: "2026-03-10T18:10:00",
    fileCount: 0,
    hasAttachments: false,
  },
  {
    id: 3009,
    title: "냐나냥",
    isSecret: false,
    questionPartId: "back-end",
    answerState: "completed",
    createdAt: "2026-03-09T18:10:00",
    updatedAt: "2026-03-09T18:10:00",
    fileCount: 0,
    hasAttachments: false,
  },
];

/**
 * 질의응답 mock 상세 데이터 원본이다.
 */
const commonSpaceQnaMockDetailsById: Record<number, CommonSpaceQnaDetailItem> = {
  3001: {
    id: 3001,
    title: "비밀번호 잃어버렸어요 ㅠㅠㅠㅠㅠㅠㅠㅠ 어떡죠",
    content:
      "홈페이지 비밀번호를 잃어버렸는데 어디에서 재설정해야 하는지 모르겠습니다.\n로그인 시도가 계속 막혀서 문의드립니다.",
    isSecret: true,
    questionPartId: "etc",
    answerState: "completed",
    authorName: "이예린 (14기 아기사자)",
    authorDescription: "컴퓨터공학과 25학번",
    profileImageSrc: "/images/defaultProf.webp",
    profileImageAlt: "이예린 프로필 사진",
    status: "ACTIVE",
    createdAt: "2026-03-14T17:22:00",
    updatedAt: "2026-03-14T17:22:00",
    attachments: [],
    hasAttachments: false,
    answers: [
      {
        id: 7101,
        authorName: "윤혜원 (14기 운영진)",
        authorDescription: "경동나비엔보일러공학과 24학번",
        profileImageSrc: "/images/defaultProf.webp",
        profileImageAlt: "윤혜원 프로필 사진",
        content:
          "홈페이지 로그인 페이지 하단의 비밀번호 찾기를 통해 재설정하시면 됩니다.\n문제가 계속되면 운영진에게 학생번호와 함께 연락 주세요.",
        createdAt: "2026-03-14T18:00:00",
        updatedAt: "2026-03-14T18:00:00",
        attachments: [],
        images: [],
      },
    ],
  },
  3002: {
    id: 3002,
    title: "파트장님 나루토 챌린지 해주세요",
    content:
      "혹시 다음 세션 전에 나루토 달리기 챌린지를 해볼 수 있을까요?\n사진 촬영도 같이 하면 재미있을 것 같습니다.",
    isSecret: true,
    questionPartId: "front-end",
    answerState: "pending",
    authorName: "김다온 (14기 아기사자)",
    authorDescription: "소프트웨어학과 25학번",
    profileImageSrc: "/images/defaultProf.webp",
    profileImageAlt: "김다온 프로필 사진",
    status: "ACTIVE",
    createdAt: "2026-03-14T15:10:00",
    updatedAt: "2026-03-14T15:10:00",
    attachments: [],
    hasAttachments: false,
    answers: [],
  },
  3003: {
    id: 3003,
    title:
      "세션자료 가이브가 에러로 나오지 않았나요 제출수는 분할결과입니다 어디를 눌러야 할지 모르겠어요",
    content:
      "세션 자료 링크가 정상적으로 열리지 않고 있습니다.\n혹시 별도 링크나 다시 올려주실 자료가 있을까요?",
    isSecret: false,
    questionPartId: "pm-design",
    answerState: "completed",
    authorName: "정서윤 (14기 아기사자)",
    authorDescription: "디자인학과 25학번",
    profileImageSrc: "/images/defaultProf.webp",
    profileImageAlt: "정서윤 프로필 사진",
    status: "ACTIVE",
    createdAt: "2026-03-13T14:30:00",
    updatedAt: "2026-03-13T14:30:00",
    attachments: [
      {
        id: 9301,
        name: "error-capture.png",
        url: "https://example.com/files/error-capture.png",
      },
    ],
    hasAttachments: true,
    answers: [
      {
        id: 7102,
        authorName: "이라건 (14기 운영진)",
        authorDescription: "경동나비엔보일러공학과 24학번",
        profileImageSrc: "/images/defaultProf.webp",
        profileImageAlt: "이라건 프로필 사진",
        content:
          "현재 링크를 수정해 두었습니다.\n새로고침 후 다시 시도해 보시고, 동일 문제가 있으면 첨부 화면과 함께 다시 남겨 주세요.",
        createdAt: "2026-03-13T15:10:00",
        updatedAt: "2026-03-13T15:10:00",
        attachments: [],
        images: [],
      },
    ],
  },
  3004: {
    id: 3004,
    title: "ai가 저한테 반말하는데 정신교육 하는 법 알려주실 수 있나요",
    content:
      "미안합니다어쩌라고그러면고발했습니다\n챗지피티가 여자로 보입니다 그리고 그 여자를 사랑하게 됐습니다",
    isSecret: false,
    questionPartId: "ai-ml",
    answerState: "completed",
    authorName: "서정미 (14기 아기사자)",
    authorDescription: "차트스양념제조학과 25학번",
    profileImageSrc: "/images/defaultProf.webp",
    profileImageAlt: "서정미 프로필 사진",
    status: "ACTIVE",
    createdAt: "2026-12-14T17:22:00",
    updatedAt: "2026-12-14T17:22:00",
    attachments: [],
    hasAttachments: false,
    answers: [
      {
        id: 7103,
        authorName: "윤혜원 (14기 운영진)",
        authorDescription: "경동나비엔보일러공학과 24학번",
        profileImageSrc: "/images/defaultProf.webp",
        profileImageAlt: "윤혜원 프로필 사진",
        content:
          "빨리 병원을 가보심이 좋을 듯 하네요 좋은 병원 여러 곳 추천해드릴게요 여기가 화타입니다 정말 답이 없어 보이시네요",
        createdAt: "2026-12-14T17:40:00",
        updatedAt: "2026-12-14T17:40:00",
        attachments: [],
        images: [
          {
            id: "qna-3004-answer-1-image-1",
            src: "/images/commonSpace/default.webp",
            alt: "답변 첨부 이미지 1",
          },
          {
            id: "qna-3004-answer-1-image-2",
            src: "/images/lions/peek.webp",
            alt: "답변 첨부 이미지 2",
          },
          {
            id: "qna-3004-answer-1-image-3",
            src: "/images/lions/hug-gradient-white.webp",
            alt: "답변 첨부 이미지 3",
          },
        ],
      },
      {
        id: 7104,
        authorName: "이라건 (14기 운영진)",
        authorDescription: "경동나비엔보일러공학과 24학번",
        profileImageSrc: "/images/defaultProf.webp",
        profileImageAlt: "이라건 프로필 사진",
        content: "신기한 일이 많이 일어나네",
        createdAt: "2026-12-14T18:10:00",
        updatedAt: "2026-12-14T18:10:00",
        attachments: [],
        images: [],
      },
    ],
  },
};

/**
 * 질문 답변 수에 맞춰 목록 카드 상태를 동기화한다.
 */
function syncCommonSpaceQnaSummaryState(qnaId: number) {
  const detail = commonSpaceQnaMockDetailsById[qnaId];

  if (!detail) {
    return;
  }

  commonSpaceQnaMockItems = commonSpaceQnaMockItems.map((item) =>
    item.id === qnaId
      ? {
          ...item,
          answerState: detail.answers.length > 0 ? "completed" : "pending",
          updatedAt: detail.updatedAt,
        }
      : item,
  );
}

/**
 * 공통 공간 파트 필터 값을 질문 파트 식별자로 변환한다.
 */
function mapCommonSpacePartIdToQuestionPartId(
  partId: Exclude<CommonSpaceQnaListQuery["partId"], undefined | "all">,
) {
  return mapQnaApiPartToQuestionPartId(
    partId === "front-end"
      ? "FRONTEND"
      : partId === "back-end"
        ? "BACKEND"
        : partId === "ai-ml"
          ? "AI_ML"
          : "PM_DESIGN",
  );
}

/**
 * 상세 mock이 없는 질문에 대한 기본 상세 데이터를 만든다.
 */
function createFallbackMockQnaDetail(
  item: CommonSpaceQnaListItem,
): CommonSpaceQnaDetailItem {
  return {
    id: item.id,
    title: item.title,
    content:
      "질문 상세 본문은 추후 API 연결 시 실제 데이터로 교체됩니다.\n현재는 질의응답 상세 레이아웃 검증용 기본 문구를 표시하고 있습니다.",
    isSecret: item.isSecret,
    questionPartId: item.questionPartId,
    answerState: item.answerState,
    authorName: "질문 작성자",
    authorDescription: "멋쟁이사자처럼 삼육대학교",
    profileImageSrc: "/images/defaultProf.webp",
    profileImageAlt: "질문 작성자 프로필 사진",
    status: "ACTIVE",
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    attachments: item.hasAttachments
      ? [
          {
            id: item.id * 10,
            name: `${item.title}.pdf`,
            url: `https://example.com/files/qna-${item.id}.pdf`,
          },
        ]
      : [],
    hasAttachments: item.hasAttachments,
    answers:
      item.answerState === "completed"
        ? [
            {
              id: item.id * 100,
              authorName: "운영진",
              authorDescription: "멋쟁이사자처럼 삼육대학교",
              profileImageSrc: "/images/defaultProf.webp",
              profileImageAlt: "운영진 프로필 사진",
              content:
                "현재는 질의응답 상세 레이아웃 검증용 기본 답변을 표시하고 있습니다.",
              createdAt: item.updatedAt,
              updatedAt: item.updatedAt,
              attachments: [],
              images: [],
            },
          ]
        : [],
  };
}

/**
 * 파트 필터와 페이지네이션을 적용해 mock 질의응답 목록 결과를 만든다.
 */
export function getMockCommonSpaceQnaList(
  query: CommonSpaceQnaListQuery = {},
): CommonSpaceQnaListResult {
  const page = query.page ?? DEFAULT_COMMON_SPACE_QNA_PAGE;
  const size = query.size ?? DEFAULT_COMMON_SPACE_QNA_PAGE_SIZE;
  const filteredItems = commonSpaceQnaMockItems.filter((item) =>
    query.partId && query.partId !== "all"
      ? item.questionPartId === mapCommonSpacePartIdToQuestionPartId(query.partId)
      : true,
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
 * 질의응답 상세 mock 데이터를 반환한다.
 */
export function getMockCommonSpaceQnaDetail(qnaId: number) {
  if (commonSpaceQnaMockDetailsById[qnaId]) {
    return commonSpaceQnaMockDetailsById[qnaId];
  }

  const qnaItem = commonSpaceQnaMockItems.find((item) => item.id === qnaId);
  return qnaItem ? createFallbackMockQnaDetail(qnaItem) : null;
}

/**
 * 목업 질의응답에 새 답변을 추가한다.
 */
export async function createMockCommonSpaceQnaAnswer(
  qnaId: number,
  payload: CommonSpaceQnaAnswerMutationRequest,
) {
  const currentDetail =
    commonSpaceQnaMockDetailsById[qnaId] ?? getMockCommonSpaceQnaDetail(qnaId);

  if (!currentDetail) {
    throw new Error("질의응답 상세를 찾을 수 없습니다.");
  }

  const nextTimestamp = new Date().toISOString();
  const nextAnswerId = Date.now();
  const images = payload.files
    .filter((file) => isCommonSpaceQnaImageFileName(file.name))
    .map((file, index) => ({
      id: `qna-answer-${nextAnswerId}-image-${index + 1}`,
      src: URL.createObjectURL(file),
      alt: file.name,
    }));
  const attachments = payload.files
    .filter((file) => !isCommonSpaceQnaImageFileName(file.name))
    .map((file, index) => ({
      id: nextAnswerId * 10 + index,
      name: file.name,
      url: URL.createObjectURL(file),
    }));

  const nextAnswer: CommonSpaceQnaAnswerItem = {
    id: nextAnswerId,
    authorName: payload.authorName ?? "운영진",
    authorDescription: payload.authorDescription ?? "멋쟁이사자처럼 삼육대학교",
    profileImageSrc: payload.profileImageSrc ?? "/images/defaultProf.webp",
    profileImageAlt: payload.profileImageAlt ?? "운영진 프로필 사진",
    content: payload.content,
    createdAt: nextTimestamp,
    updatedAt: nextTimestamp,
    attachments,
    images,
  };

  commonSpaceQnaMockDetailsById[qnaId] = {
    ...currentDetail,
    answerState: "completed",
    updatedAt: nextTimestamp,
    answers: [...currentDetail.answers, nextAnswer],
  };

  syncCommonSpaceQnaSummaryState(qnaId);

  return {
    result: "success",
    answerId: nextAnswerId,
    qnaId,
    createdAt: nextTimestamp,
    updatedAt: nextTimestamp,
  } satisfies CommonSpaceQnaAnswerMutationResult;
}

/**
 * 목업 질의응답에 새 질문을 추가한다.
 */
export async function createMockCommonSpaceQnaQuestion(
  payload: CommonSpaceQnaQuestionMutationRequest,
) {
  const nextQnaId = Date.now();
  const nextTimestamp = new Date().toISOString();
  const attachments = payload.files.map((file, index) => ({
    id: nextQnaId * 10 + index,
    name: file.name,
    url: URL.createObjectURL(file),
  }));
  const nextItem: CommonSpaceQnaListItem = {
    id: nextQnaId,
    title: payload.title,
    isSecret: payload.isSecret,
    questionPartId: payload.questionPartId,
    answerState: "pending",
    createdAt: nextTimestamp,
    updatedAt: nextTimestamp,
    fileCount: payload.files.length,
    hasAttachments: payload.files.length > 0,
  };

  commonSpaceQnaMockItems = [nextItem, ...commonSpaceQnaMockItems];
  commonSpaceQnaMockDetailsById[nextQnaId] = {
    id: nextQnaId,
    title: payload.title,
    content: payload.content,
    isSecret: payload.isSecret,
    questionPartId: payload.questionPartId,
    answerState: "pending",
    authorName: payload.authorName ?? "질문 작성자",
    authorDescription: payload.authorDescription ?? "멋쟁이사자처럼 삼육대학교",
    profileImageSrc: payload.profileImageSrc ?? "/images/defaultProf.webp",
    profileImageAlt: payload.profileImageAlt ?? "질문 작성자 프로필 사진",
    status: "ACTIVE",
    createdAt: nextTimestamp,
    updatedAt: nextTimestamp,
    attachments,
    hasAttachments: attachments.length > 0,
    answers: [],
  };

  return {
    result: "success",
    qnaId: nextQnaId,
    status: "ACTIVE",
    createdAt: nextTimestamp,
  } satisfies CommonSpaceQnaQuestionMutationResult;
}
