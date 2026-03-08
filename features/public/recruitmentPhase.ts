/**
 * 프론트엔드에서 사용하는 모집 단계(enum) 전체 집합입니다.
 *
 * - DOC_OPEN: 서류 지원 가능
 * - DOC_CLOSED: 서류 접수 종료 직후
 * - DOC_EVALUATING: 서류 마감 후 1차 합격 발표 전 집계/평가 단계
 * - INTERVIEW_SELECT: 서류 합격자의 면접 시간 선택 단계
 * - INTERVIEW_EVALUATING: 면접 진행 후 최종 결과 발표 전 집계/평가 단계
 * - FINAL_RESULT: 최종 결과 발표 단계
 * - CLOSED: 모집 종료
 */
export type RecruitmentPhase =
  | "DOC_OPEN"
  | "DOC_CLOSED"
  | "DOC_EVALUATING"
  | "INTERVIEW_SELECT"
  | "INTERVIEW_EVALUATING"
  | "FINAL_RESULT"
  | "CLOSED";

/**
 * 현재 모집이 서류 지원을 받고 있는 단계인지 판정합니다.
 *
 * @param phase 서버가 내려준 모집 단계
 * @returns 서류 지원 가능 단계면 true
 */
export const isDocumentOpenPhase = (
  phase: RecruitmentPhase | string | null | undefined,
): phase is "DOC_OPEN" => phase === "DOC_OPEN";

/**
 * 현재 모집이 최종 결과 발표 단계인지 판정합니다.
 *
 * @param phase 서버가 내려준 모집 단계
 * @returns 최종 결과 발표 단계면 true
 */
export const isFinalResultPhase = (
  phase: RecruitmentPhase | string | null | undefined,
): phase is "FINAL_RESULT" => phase === "FINAL_RESULT";

/**
 * 모집 단계 enum을 사용자에게 보여줄 한글 라벨로 변환합니다.
 *
 * @param phase 서버가 내려준 모집 단계
 * @returns 화면 표시용 한글 라벨
 */
export const getRecruitmentPhaseLabel = (
  phase: RecruitmentPhase | string | null | undefined,
) => {
  switch (phase) {
    case "DOC_OPEN":
      return "서류 접수중";
    case "DOC_CLOSED":
      return "서류 접수 마감";
    case "DOC_EVALUATING":
      return "서류 심사중";
    case "INTERVIEW_SELECT":
      return "면접 일정 선택중";
    case "INTERVIEW_EVALUATING":
      return "면접 결과 집계중";
    case "FINAL_RESULT":
      return "최종 결과 발표";
    case "CLOSED":
      return "모집 종료";
    default:
      return phase ?? "알 수 없음";
  }
};
