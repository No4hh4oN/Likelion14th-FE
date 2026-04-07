import { QnaAnswerStateBadge, QnaPartBadge } from "./QnaBadges";
import type {
  CommonSpaceQnaAnswerState,
  CommonSpaceQnaQuestionPartId,
} from "../qna/types";

export type QnaCardProps = {
  questionPartId: CommonSpaceQnaQuestionPartId;
  answerState: CommonSpaceQnaAnswerState;
  title: string;
  isSecret?: boolean;
  onClick?: () => void;
};

function QnaSecretIcon() {
  return (
    <svg
      width="12"
      height="15"
      viewBox="0 0 12 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-[15px] w-[12px] shrink-0 text-[#9EA3B2]"
      aria-hidden="true"
    >
      <path
        d="M9.75 5.25H9.375V3.75C9.375 1.67906 7.69594 0 5.625 0C3.55406 0 1.875 1.67906 1.875 3.75V5.25H1.5C0.671578 5.25 0 5.92158 0 6.75V13.5C0 14.3284 0.671578 15 1.5 15H9.75C10.5784 15 11.25 14.3284 11.25 13.5V6.75C11.25 5.92158 10.5784 5.25 9.75 5.25ZM3.375 3.75C3.375 2.50734 4.38234 1.5 5.625 1.5C6.86766 1.5 7.875 2.50734 7.875 3.75V5.25H3.375V3.75ZM6.375 10.5281V12H4.875V10.5281C4.42734 10.2684 4.125 9.78469 4.125 9.23438C4.125 8.40594 4.79658 7.73438 5.625 7.73438C6.45342 7.73438 7.125 8.40594 7.125 9.23438C7.125 9.78469 6.82266 10.2684 6.375 10.5281Z"
        fill="currentColor"
      />
    </svg>
  );
}

function QnaCardArrowIcon() {
  return (
    <svg
      width="12"
      height="24"
      viewBox="0 0 12 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-3 shrink-0 text-white-1"
      aria-hidden="true"
    >
      <path
        d="M2 2L10 12L2 22"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

export default function QnaCard({
  questionPartId,
  answerState,
  title,
  isSecret = false,
  onClick,
}: QnaCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full flex-col items-start gap-4 rounded-[14px] bg-linear-to-r from-[#484D5A] to-[#303136] px-5 py-5 text-left text-white-1 transition-shadow hover:shadow-[0_0_12px_white] sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7 cursor-pointer"
      aria-label={`${title} 질문 열기`}
    >
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2.5 sm:gap-3">
        <QnaPartBadge questionPartId={questionPartId} />
        <QnaAnswerStateBadge answerState={answerState} />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <p className="min-w-0 max-w-full truncate text-[17px] font-bold leading-[1.35] text-white-1 sm:text-[19px] lg:text-[20px]">
              {title}
            </p>
            {isSecret ? <QnaSecretIcon /> : null}
          </div>
        </div>
      </div>

      <div className="self-end sm:self-auto">
        <QnaCardArrowIcon />
      </div>
    </button>
  );
}
