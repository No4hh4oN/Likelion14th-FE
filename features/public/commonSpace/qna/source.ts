import {
  getCommonSpaceQnaDetail,
  getCommonSpaceQnaList,
  submitCommonSpaceQnaQuestion,
  submitCommonSpaceQnaAnswer,
} from "./api";
import type {
  CommonSpaceQnaAnswerMutationRequest,
  CommonSpaceQnaAnswerMutationResult,
  CommonSpaceQnaDetailItem,
  CommonSpaceQnaListQuery,
  CommonSpaceQnaListResult,
  CommonSpaceQnaQuestionMutationRequest,
  CommonSpaceQnaQuestionMutationResult,
} from "./types";

/**
 * 질의응답 섹션이 의존할 데이터 소스 계약이다.
 * 레이아웃 컴포넌트는 이 인터페이스만 바라보도록 분리한다.
 */
export type CommonSpaceQnaDataSource = {
  /**
   * 질의응답 목록을 조회한다.
   */
  getList(query?: CommonSpaceQnaListQuery): Promise<CommonSpaceQnaListResult>;
  /**
   * 질의응답 상세를 조회한다.
   */
  getDetail(qnaId: number): Promise<CommonSpaceQnaDetailItem | null>;
  /**
   * 질의응답 질문을 작성한다.
   */
  createQuestion(
    payload: CommonSpaceQnaQuestionMutationRequest,
  ): Promise<CommonSpaceQnaQuestionMutationResult>;
  /**
   * 질의응답 답변을 작성한다.
   */
  createAnswer(
    qnaId: number,
    payload: CommonSpaceQnaAnswerMutationRequest,
  ): Promise<CommonSpaceQnaAnswerMutationResult>;
};

/**
 * 실 API를 사용하는 질의응답 데이터 소스다.
 */
export const commonSpaceQnaApiDataSource: CommonSpaceQnaDataSource = {
  async getList(query = {}) {
    return getCommonSpaceQnaList(query);
  },
  async getDetail(qnaId) {
    return getCommonSpaceQnaDetail(qnaId);
  },
  async createQuestion(payload) {
    return submitCommonSpaceQnaQuestion(payload);
  },
  async createAnswer(qnaId, payload) {
    return submitCommonSpaceQnaAnswer(qnaId, payload);
  },
};
