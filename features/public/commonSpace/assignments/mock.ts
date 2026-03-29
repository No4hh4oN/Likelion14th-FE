import {
  mapCommonSpacePartIdToAssignmentTrack,
  toCommonSpaceAssignmentListItem,
} from "./adapter";
import type {
  CommonSpaceAssignmentListQuery,
  CommonSpaceAssignmentMySubmissionApiResponse,
  CommonSpaceAssignmentProjectListApiItem,
} from "./types";

/**
 * 레이아웃 검증용 과제 목록 mock 응답이다.
 */
export const COMMON_SPACE_ASSIGNMENT_MOCK_PROJECTS: CommonSpaceAssignmentProjectListApiItem[] =
  [
    {
      id: 1001,
      title: "공통 세션 3주차 : 협업을 위한 기초 세팅법",
      description: "팀 협업을 위한 기본 세팅을 과제로 진행합니다.",
      track: null,
      startDate: "2026-02-25T00:00:00",
      deadline: "2026-03-04T23:59:59",
      status: "ACTIVE",
    },
    {
      id: 1002,
      title: "공통 세션 2주차 : 떠먹여주는 기초 코딩",
      description: "기초 코딩 과제를 제출하고 평가를 확인할 수 있습니다.",
      track: null,
      startDate: "2026-02-20T00:00:00",
      deadline: "2026-03-01T23:59:59",
      status: "ACTIVE",
    },
    {
      id: 1003,
      title: "공통 세션 1주차 : 숨쉬는법진짜쉽다",
      description: "제출 후 평가 대기 상태를 검증하기 위한 과제입니다.",
      track: null,
      startDate: "2026-02-18T00:00:00",
      deadline: "2026-03-01T23:59:59",
      status: "ACTIVE",
    },
    {
      id: 1004,
      title: "공통 세션 OT : 자기소개 카드 만들기",
      description: "평가 완료 상태를 확인하기 위한 과제입니다.",
      track: null,
      startDate: "2026-02-10T00:00:00",
      deadline: "2026-02-24T23:59:59",
      status: "ACTIVE",
    },
    {
      id: 1005,
      title: "공통 세션 0주차 : OT 출석 인증",
      description: "마감 이후 미제출 상태를 확인하기 위한 과제입니다.",
      track: null,
      startDate: "2026-02-10T00:00:00",
      deadline: "2026-02-20T23:59:59",
      status: "ACTIVE",
    },
    {
      id: 2001,
      title: "프론트엔드 2주차 : React 기본 과제",
      description: "컴포넌트 분리와 상태 관리를 실습하는 프론트엔드 과제입니다.",
      track: "FRONTEND",
      startDate: "2026-03-01T00:00:00",
      deadline: "2026-03-08T23:59:59",
      status: "ACTIVE",
    },
    {
      id: 3001,
      title: "백엔드 2주차 : API 설계 과제",
      description: "REST API 설계 문서를 제출하는 백엔드 과제입니다.",
      track: "BACKEND",
      startDate: "2026-03-01T00:00:00",
      deadline: "2026-03-08T23:59:59",
      status: "ACTIVE",
    },
    {
      id: 4001,
      title: "AI/ML 2주차 : 데이터 전처리 과제",
      description: "데이터 전처리 노트북과 결과 이미지를 제출합니다.",
      track: "AI_ML",
      startDate: "2026-03-01T00:00:00",
      deadline: "2026-03-08T23:59:59",
      status: "ACTIVE",
    },
    {
      id: 5001,
      title: "기획/디자인 2주차 : 와이어프레임 제작",
      description: "피그마 링크와 와이어프레임 산출물을 제출하는 과제입니다.",
      track: "PM_DESIGN",
      startDate: "2026-03-01T00:00:00",
      deadline: "2026-03-08T23:59:59",
      status: "ACTIVE",
    },
  ];

/**
 * 로그인 사용자의 과제 제출 mock 응답이다.
 */
export const COMMON_SPACE_ASSIGNMENT_MOCK_SUBMISSION_BY_PROJECT_ID: Record<
  number,
  CommonSpaceAssignmentMySubmissionApiResponse
> = {
  1001: {
    submitted: false,
    status: "NOT_SUBMITTED",
  },
  1002: {
    submitted: true,
    submissionId: 9002,
    status: "REJECTED",
    feedback:
      "열라면 순두부 물의 양은 좀 주의하셔야하는데요. 순두부에서 물이 나오기 때문에 열라면 1개당 기본 물양 500ml 보다 적게 넣어주셔야 합니다.\n저는 라면 2개 기준으로 500ml 넣었습니다. (원래는 1,000ml넣어야 함) 저는 자극적인거 좋아하는 편이라 딱 좋았어요.\n\n원 레시피도 국물의 양은 많지 않은 레시피인데 물이 제가 끓인 정도의 자작함을 보시고 국물이 더 많기를 원하시면 600-700ml 정도 조절해서 넣어주세요.\n\n제가 해먹은 레시피는 라면 두개 기준 레시피이기 때문에 ★라면 1개 끓일때는 물을 반으로 하면 너무 쫄아버리니 350ml-400ml 정도 넣어주세요★",
    fileUrl:
      "https://example.com/submissions/%EA%B2%BD%EB%8F%99%EB%82%98%EB%B9%84%EC%95%A4%EB%B3%B4%EC%9D%BC%EB%9F%AC%EA%B3%B5%ED%95%99%EA%B3%BC%2024%ED%95%99%EB%B2%88%20%EC%9C%A4%ED%98%9C%EC%9B%90%202%EC%A3%BC%EC%B0%A8(%EA%B3%B5%ED%86%B5)%20%EA%B3%BC%EC%A0%9C%20%EC%A0%9C%EC%B6%9C.jpg",
    submittedAt: "2026-02-28T16:20:00",
  },
  1003: {
    submitted: true,
    submissionId: 9003,
    status: "PENDING",
    fileUrl: "https://example.com/submissions/%EC%88%A8%EC%89%AC%EB%8A%94%EC%A4%91.mp4",
    submittedAt: "2026-02-28T15:10:00",
  },
  1004: {
    submitted: true,
    submissionId: 9004,
    status: "APPROVED",
    feedback:
      "전달하고 싶은 정보가 명확하게 정리되어 있어서 읽기 쉬웠습니다.\n타이포 위계도 잘 잡혀 있고, 컬러 사용도 안정적입니다.\n\n다음 제출부터는 텍스트와 아이콘 사이 간격만 조금 더 정리해보면 완성도가 더 올라갈 것 같습니다.",
    fileUrl:
      "https://example.com/submissions/%EC%9E%90%EA%B8%B0%EC%86%8C%EA%B0%9C%EC%B9%B4%EB%93%9C_%EC%9C%A4%ED%98%9C%EC%9B%90.png",
    submittedAt: "2026-02-23T11:40:00",
  },
  1005: {
    submitted: false,
    status: "NOT_SUBMITTED",
  },
  2001: {
    submitted: false,
    status: "NOT_SUBMITTED",
  },
  3001: {
    submitted: true,
    submissionId: 9301,
    status: "PENDING",
    fileUrl: "https://example.com/submissions/backend-api-design.pdf",
    submittedAt: "2026-03-05T10:00:00",
  },
  4001: {
    submitted: true,
    submissionId: 9401,
    status: "APPROVED",
    feedback: "전처리 과정과 결과 비교가 잘 정리되어 있습니다.",
    fileUrl: "https://example.com/submissions/data-preprocessing.ipynb",
    submittedAt: "2026-03-05T12:30:00",
  },
  5001: {
    submitted: true,
    submissionId: 9501,
    status: "REJECTED",
    feedback: "와이어프레임 구조는 좋지만 컴포넌트 명세를 조금 더 보강해 주세요.",
    fileUrl: "https://example.com/submissions/wireframe-v1.fig",
    submittedAt: "2026-03-05T13:40:00",
  },
};

/**
 * 현재 파트에 해당하는 mock 과제 목록 응답을 반환한다.
 */
export function getMockCommonSpaceAssignmentProjects(
  query: CommonSpaceAssignmentListQuery = {},
) {
  const requestedTrack = mapCommonSpacePartIdToAssignmentTrack(
    query.partId ?? "all",
  );

  return COMMON_SPACE_ASSIGNMENT_MOCK_PROJECTS.filter((project) =>
    requestedTrack ? project.track === requestedTrack : !project.track,
  );
}

/**
 * 현재 사용자의 mock 과제 제출 응답을 반환한다.
 */
export function getMockCommonSpaceAssignmentMySubmission(projectId: number) {
  return COMMON_SPACE_ASSIGNMENT_MOCK_SUBMISSION_BY_PROJECT_ID[projectId] ?? {
    submitted: false,
    status: "NOT_SUBMITTED",
  };
}

/**
 * 파트에 맞는 카드용 mock 과제 목록 결과를 만든다.
 */
export function getMockCommonSpaceAssignmentList(
  query: CommonSpaceAssignmentListQuery = {},
) {
  const projects = getMockCommonSpaceAssignmentProjects(query);
  const now = new Date("2026-03-02T12:00:00");

  return {
    items: projects.map((project) =>
      toCommonSpaceAssignmentListItem(
        project,
        getMockCommonSpaceAssignmentMySubmission(project.id),
        now,
      ),
    ),
  };
}
