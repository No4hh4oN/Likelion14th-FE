import clsx from "clsx";
import type {
  CommonSpaceQnaAnswerState,
  CommonSpaceQnaQuestionPartId,
} from "../qna/types";

/**
 * 질문 종류 뱃지에 표시할 라벨 매핑이다.
 */
const QNA_PART_LABEL_BY_ID: Record<CommonSpaceQnaQuestionPartId, string> = {
  "front-end": "FRONT-END",
  "back-end": "BACK-END",
  "ai-ml": "AI / ML",
  "pm-design": "PM / DESIGN",
  etc: "기타",
};

/**
 * 답변 상태 뱃지에 표시할 라벨 매핑이다.
 */
const QNA_ANSWER_STATE_LABEL_BY_ID: Record<CommonSpaceQnaAnswerState, string> =
  {
    pending: "답변 대기",
    completed: "답변 완료",
  };

/**
 * 질문 종류 뱃지 공통 클래스다.
 */
const QNA_PART_BADGE_CLASS_NAME =
  "inline-flex h-[34px] shrink-0 items-center whitespace-nowrap rounded-full bg-background/50 px-4 text-[16px] font-light leading-none text-white-1";

/**
 * 답변 상태 뱃지 색상 클래스다.
 */
const QNA_ANSWER_STATE_BADGE_CLASS_NAME_BY_ID: Record<
  CommonSpaceQnaAnswerState,
  string
> = {
  pending: "bg-[#FFD9C9] text-red-1",
  completed: "bg-[#D9FFDB] text-[#19C524]",
};

/**
 * 질문 종류 뱃지를 렌더링한다.
 */
export function QnaPartBadge({
  questionPartId,
  className,
}: {
  questionPartId: CommonSpaceQnaQuestionPartId;
  className?: string;
}) {
  return (
    <span className={clsx("font-light", QNA_PART_BADGE_CLASS_NAME, className)}>
      {QNA_PART_LABEL_BY_ID[questionPartId]}
    </span>
  );
}

/**
 * 답변 상태 뱃지를 렌더링한다.
 */
export function QnaAnswerStateBadge({
  answerState,
  className,
}: {
  answerState: CommonSpaceQnaAnswerState;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex h-[34px] shrink-0 items-center whitespace-nowrap rounded-full px-3 text-[16px] font-semibold leading-none",
        QNA_ANSWER_STATE_BADGE_CLASS_NAME_BY_ID[answerState],
        className,
      )}
    >
      {QNA_ANSWER_STATE_LABEL_BY_ID[answerState]}
    </span>
  );
}
