import {
  getCommonSpaceAssignmentMySubmission,
  getCommonSpaceAssignmentProjects,
} from "./api";
import {
  getMockCommonSpaceAssignmentList,
  getMockCommonSpaceAssignmentMySubmission,
  getMockCommonSpaceAssignmentProjects,
} from "./mock";
import { toCommonSpaceAssignmentListItem } from "./adapter";
import type {
  CommonSpaceAssignmentListQuery,
  CommonSpaceAssignmentListResult,
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
};

/**
 * 레이아웃 검증과 스토리 성격 작업에 사용할 mock 데이터 소스다.
 */
export const commonSpaceAssignmentMockDataSource: CommonSpaceAssignmentDataSource = {
  async getList(query = {}) {
    return getMockCommonSpaceAssignmentList(query);
  },
};

/**
 * 목업 과제 목록과 제출 응답을 개별적으로 확인할 때 사용하는 헬퍼다.
 */
export function getMockCommonSpaceAssignmentData(query: CommonSpaceAssignmentListQuery = {}) {
  return {
    projects: getMockCommonSpaceAssignmentProjects(query),
    getSubmission: getMockCommonSpaceAssignmentMySubmission,
  };
}
