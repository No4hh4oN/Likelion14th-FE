import type { CommonSpacePartId } from "../types";
import { toCommonSpaceAuthorView } from "../author";
import {
  DEFAULT_COMMON_SPACE_QNA_PAGE,
  DEFAULT_COMMON_SPACE_QNA_PAGE_SIZE,
} from "./constants";
import type {
  CommonSpaceQnaAnswerApiItem,
  CommonSpaceQnaAnswerImage,
  CommonSpaceQnaAnswerItem,
  CommonSpaceQnaApiPart,
  CommonSpaceQnaAttachment,
  CommonSpaceQnaDetailApiResponse,
  CommonSpaceQnaDetailItem,
  CommonSpaceQnaFileApiItem,
  CommonSpaceQnaListApiResponse,
  CommonSpaceQnaListItem,
  CommonSpaceQnaListQuery,
  CommonSpaceQnaListResult,
  CommonSpaceQnaQuestionPartId,
  CommonSpaceQnaSummaryApiItem,
} from "./types";

type CommonSpaceQnaListApiParams = {
  page: number;
  size: number;
  part?: CommonSpaceQnaApiPart;
};

const commonSpacePartIdToQnaApiPart: Partial<
  Record<CommonSpacePartId, CommonSpaceQnaApiPart>
> = {
  "front-end": "FRONTEND",
  "back-end": "BACKEND",
  "ai-ml": "AI_ML",
  "pm-design": "PM_DESIGN",
};

const qnaApiPartToQuestionPartId: Record<
  CommonSpaceQnaApiPart,
  CommonSpaceQnaQuestionPartId
> = {
  FRONTEND: "front-end",
  BACKEND: "back-end",
  AI_ML: "ai-ml",
  PM_DESIGN: "pm-design",
  ETC: "etc",
};

/**
 * 질문 종류 뱃지 식별자를 질의응답 API 파트 값으로 변환한다.
 */
export function mapQuestionPartIdToQnaApiPart(
  questionPartId: CommonSpaceQnaQuestionPartId,
): CommonSpaceQnaApiPart {
  if (questionPartId === "front-end") {
    return "FRONTEND";
  }

  if (questionPartId === "back-end") {
    return "BACKEND";
  }

  if (questionPartId === "ai-ml") {
    return "AI_ML";
  }

  if (questionPartId === "pm-design") {
    return "PM_DESIGN";
  }

  return "ETC";
}

/**
 * 공통 공간 파트 식별자를 질의응답 API 파트 값으로 변환한다.
 * `all`은 전체 질문 목록을 의미하므로 파트 필터를 생략한다.
 */
export function mapCommonSpacePartIdToQnaApiPart(
  partId: CommonSpacePartId = "all",
) {
  return commonSpacePartIdToQnaApiPart[partId];
}

/**
 * 질의응답 API의 part 값을 질문 종류 뱃지 식별자로 정규화한다.
 * 알 수 없는 값은 기타 질문으로 처리한다.
 */
export function mapQnaApiPartToQuestionPartId(
  part: CommonSpaceQnaApiPart | string,
): CommonSpaceQnaQuestionPartId {
  if (part in qnaApiPartToQuestionPartId) {
    return qnaApiPartToQuestionPartId[part as CommonSpaceQnaApiPart];
  }

  return "etc";
}

/**
 * 질의응답 목록 조회용 API 파라미터를 생성한다.
 */
export function buildCommonSpaceQnaListParams(
  query: CommonSpaceQnaListQuery = {},
): CommonSpaceQnaListApiParams {
  const page = query.page ?? DEFAULT_COMMON_SPACE_QNA_PAGE;
  const size = query.size ?? DEFAULT_COMMON_SPACE_QNA_PAGE_SIZE;
  const part = mapCommonSpacePartIdToQnaApiPart(query.partId ?? "all");

  return {
    page,
    size,
    ...(part ? { part } : {}),
  };
}

/**
 * 이미지로 취급할 수 있는 파일명인지 판별한다.
 */
export function isCommonSpaceQnaImageFileName(fileName: string) {
  return /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(fileName);
}

/**
 * 질의응답 API 첨부파일을 화면용 첨부파일 데이터로 변환한다.
 */
export function toCommonSpaceQnaAttachment(
  file: CommonSpaceQnaFileApiItem,
): CommonSpaceQnaAttachment {
  return {
    id: file.fileId,
    name: file.originalFileName,
    url: file.fileUrl,
  };
}

/**
 * 질의응답 답변 첨부파일을 이미지 미리보기 데이터로 변환한다.
 */
export function toCommonSpaceQnaAnswerImage(
  file: CommonSpaceQnaFileApiItem,
): CommonSpaceQnaAnswerImage {
  return {
    id: `qna-answer-image-${file.fileId}`,
    src: file.fileUrl,
    alt: file.originalFileName,
  };
}

/**
 * 목록 API 단일 항목을 화면용 목록 아이템으로 변환한다.
 */
export function toCommonSpaceQnaListItem(
  item: CommonSpaceQnaSummaryApiItem,
): CommonSpaceQnaListItem {
  return {
    id: item.qnaId,
    title: item.title,
    isSecret: item.isSecret,
    questionPartId: mapQnaApiPartToQuestionPartId(item.part),
    answerState: item.hasAnswer ? "completed" : "pending",
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    fileCount: item.fileCount,
    hasAttachments: item.fileCount > 0,
  };
}

/**
 * 목록 API 응답을 화면용 목록 결과로 변환한다.
 */
export function toCommonSpaceQnaListResult(
  response: CommonSpaceQnaListApiResponse,
  query: CommonSpaceQnaListQuery = {},
): CommonSpaceQnaListResult {
  return {
    items: response.qnaList.map(toCommonSpaceQnaListItem),
    page: {
      page: query.page ?? DEFAULT_COMMON_SPACE_QNA_PAGE,
      size: query.size ?? DEFAULT_COMMON_SPACE_QNA_PAGE_SIZE,
      totalPages: response.totalPages,
      totalElements: response.totalElements,
    },
  };
}

/**
 * 답변 API 응답을 화면용 답변 아이템으로 변환한다.
 */
export function toCommonSpaceQnaAnswerItem(
  answer: CommonSpaceQnaAnswerApiItem,
): CommonSpaceQnaAnswerItem {
  const imageFiles = answer.files.filter((file) =>
    isCommonSpaceQnaImageFileName(file.originalFileName),
  );
  const attachmentFiles = answer.files.filter(
    (file) => !isCommonSpaceQnaImageFileName(file.originalFileName),
  );

  const authorView = toCommonSpaceAuthorView(answer.author, {
    fallbackName: "운영진",
  });

  return {
    id: answer.answerId,
    authorName: authorView.authorName ?? "운영진",
    authorDescription: authorView.authorDescription,
    profileImageSrc: authorView.profileImageSrc,
    profileImageAlt: authorView.profileImageAlt,
    content: answer.content,
    createdAt: answer.createdAt,
    updatedAt: answer.updatedAt,
    attachments: attachmentFiles.map(toCommonSpaceQnaAttachment),
    images: imageFiles.map(toCommonSpaceQnaAnswerImage),
  };
}

/**
 * 질의응답 상세 API 응답을 화면용 상세 데이터로 변환한다.
 */
export function toCommonSpaceQnaDetailItem(
  response: CommonSpaceQnaDetailApiResponse,
): CommonSpaceQnaDetailItem {
  const authorView = toCommonSpaceAuthorView(response.author, {
    fallbackName: "질문 작성자",
  });
  const attachments = response.files.map(toCommonSpaceQnaAttachment);
  const answers = response.answers
    .filter((answer) => answer.status !== "DELETED")
    .map(toCommonSpaceQnaAnswerItem);

  return {
    id: response.qna.qnaId,
    title: response.qna.title,
    content: response.qna.content,
    isSecret: response.qna.isSecret,
    questionPartId: mapQnaApiPartToQuestionPartId(response.qna.qnaPart),
    answerState: answers.length > 0 ? "completed" : "pending",
    authorName: authorView.authorName ?? "질문 작성자",
    authorDescription: authorView.authorDescription,
    profileImageSrc: authorView.profileImageSrc,
    profileImageAlt: authorView.profileImageAlt,
    status: response.qna.status,
    createdAt: response.qna.createdAt,
    updatedAt: response.qna.updatedAt,
    attachments,
    hasAttachments: attachments.length > 0,
    answers,
  };
}
