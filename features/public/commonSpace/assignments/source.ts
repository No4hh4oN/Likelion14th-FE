import {
  getCommonSpaceAssignmentDetail,
  getCommonSpaceAssignmentMySubmission,
  getCommonSpaceAssignmentProjects,
  submitCommonSpaceAssignment,
  updateCommonSpaceAssignmentSubmission,
} from "./api";
import {
  toCommonSpaceAssignmentDetailItem,
  toCommonSpaceAssignmentListItem,
} from "./adapter";
import type {
  CommonSpaceAssignmentDetailItem,
  CommonSpaceAssignmentListQuery,
  CommonSpaceAssignmentListResult,
  CommonSpaceAssignmentSubmissionMutationResult,
  CommonSpaceAssignmentSubmissionRequest,
} from "./types";

/**
 * 과제 섹션이 의존할 데이터 소스 계약이다.
 * 레이아웃 컴포넌트는 이 인터페이스만 바라보도록 분리한다.
 */
export type CommonSpaceAssignmentDataSource = {
  /**
   * 과제 목록을 조회한다.
   */
  getList(query?: CommonSpaceAssignmentListQuery): Promise<CommonSpaceAssignmentListResult>;
  /**
   * 과제 상세를 조회한다.
   */
  getDetail(projectId: number): Promise<CommonSpaceAssignmentDetailItem | null>;
  /**
   * 과제를 최초 제출한다.
   */
  submit(
    projectId: number,
    payload: CommonSpaceAssignmentSubmissionRequest,
  ): Promise<CommonSpaceAssignmentSubmissionMutationResult>;
  /**
   * 반려된 과제를 수정 제출한다.
   */
  updateSubmission(
    projectId: number,
    payload: CommonSpaceAssignmentSubmissionRequest,
  ): Promise<CommonSpaceAssignmentSubmissionMutationResult>;
};

/**
 * 실 API를 사용하는 과제 데이터 소스다.
 */
export const commonSpaceAssignmentApiDataSource: CommonSpaceAssignmentDataSource = {
  async getList(query = {}) {
    const projects = await getCommonSpaceAssignmentProjects(query);
    const submissions = await Promise.all(
      projects.map((project) =>
        getCommonSpaceAssignmentMySubmission(project.id).catch(() => null),
      ),
    );

    return {
      items: projects.map((project, index) =>
        toCommonSpaceAssignmentListItem(project, submissions[index]),
      ),
    };
  },
  async getDetail(projectId) {
    const [detail, submission] = await Promise.all([
      getCommonSpaceAssignmentDetail(projectId),
      getCommonSpaceAssignmentMySubmission(projectId).catch(() => null),
    ]);

    return toCommonSpaceAssignmentDetailItem(detail, submission);
  },
  async submit(projectId, payload) {
    return submitCommonSpaceAssignment(projectId, payload);
  },
  async updateSubmission(projectId, payload) {
    return updateCommonSpaceAssignmentSubmission(projectId, payload);
  },
};
