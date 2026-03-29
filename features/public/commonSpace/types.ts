/**
 * 공통 공간 좌측 카테고리 메뉴에 사용하는 단일 메뉴 항목이다.
 */
export type MenuItem = {
  /** 화면에 표시할 메뉴 라벨 */
  label: string;
  /** ALL 메뉴처럼 하위 카테고리를 가질 때 사용하는 목록 */
  children?: string[];
};

/**
 * 공통 공간에서 사용하는 파트 식별자다.
 */
export type CommonSpacePartId =
  | "all"
  | "front-end"
  | "back-end"
  | "ai-ml"
  | "pm-design";

/**
 * 공통 공간에서 사용하는 화면 식별자다.
 */
export type CommonSpaceSectionId =
  | "home"
  | "notices"
  | "materials"
  | "assignments"
  | "qna";

/**
 * 드롭다운 메뉴에 노출되는 상세 공간 정보다.
 */
export type CommonSpaceDetailSection = {
  /** 쿼리스트링에 사용하는 섹션 식별자 */
  id: Exclude<CommonSpaceSectionId, "home">;
  /** 네비게이션에 표시할 이름 */
  label: string;
  /** 본문 헤더 타이틀 */
  title: string;
  /** 본문 상단 설명 */
  description: string;
  /** 임시로 노출할 카드 목록 */
  items: string[];
};

/**
 * 하나의 파트 메뉴가 가지는 공통 공간 정보다.
 */
export type CommonSpacePart = {
  /** 파트 식별자 */
  id: CommonSpacePartId;
  /** 좌측 네비게이션에 표시할 라벨 */
  label: string;
  /** 상단 페이지 제목에 사용할 표시 이름 */
  headingLabel?: string;
  /** 상단 제목 옆에 표시할 이미지 경로 */
  iconSrc: string;
  /** 상단 제목 옆 이미지의 대체 텍스트 */
  iconAlt: string;
  /** 해당 파트에서 접근 가능한 상세 공간 목록 */
  sections: CommonSpaceDetailSection[];
};

/**
 * 카테고리 선택 시 우측 본문에 표시할 설명형 섹션 데이터다.
 */
export type SectionContent = {
  /** 섹션 제목 */
  title: string;
  /** 섹션에 대한 요약 설명 */
  description: string;
  /** 섹션 내부에서 나열할 항목 목록 */
  items: string[];
};

/**
 * 과제 제출 진행 상태를 표현한다.
 */
export type AssignmentSubmissionState =
  | "notSubmitted"
  | "submitted"
  | "rejected"
  | "closed";

/**
 * 과제 평가의 공개 여부와 진행 상태를 표현한다.
 */
export type AssignmentReviewState = "hidden" | "pending" | "published";

/**
 * 공통 공간 과제 카드 한 장을 렌더링하기 위한 상태 기반 데이터 모델이다.
 * @param title 과제 제목
 * @param deadline 마감일
 * @param submissionState 과제 제출 상태
 * @param reviewState 과제 평가 상태
 * @param bodyMessage 제출 전에는 미제출 안내 문구로, 제출 후에는 본문에 노출할 메시지
 * @param submissionFileName 제출된 파일명을 카드 본문에 노출할 때 사용하는 값
 * @param submissionFileUrl 제출 파일을 다운로드할 때 사용하는 URL
 * @param reviewContent 피드백 패널을 펼쳤을 때 보여줄 내용
 * @param canResubmit 반려 상태에서 재제출 버튼을 노출할지 여부를 결정하는 값
 * @param defaultReviewOpen 평가가 공개된 카드에서 초기 렌더링 시 피드백 패널을 열어둘지 여부를 결정하는 값
 */
export type AssignmentItem = {
  title: string;
  deadline: string;
  /** 레거시 호환용 상태 라벨 값. 실제 렌더링은 submissionState 기준으로 계산한다. */
  statusLabel?: string;
  /** 과제 제출 상태 */
  submissionState: AssignmentSubmissionState;
  /** 과제 평가 상태 */
  reviewState: AssignmentReviewState;
  /** 미제출/마감 안내 또는 제출 후 문구 */
  bodyMessage?: string;
  /** 제출된 파일명을 표시할 때 사용하는 값 */
  submissionFileName?: string;
  /** 제출 파일 다운로드 URL */
  submissionFileUrl?: string;
  /** 피드백 패널을 펼쳤을 때 보여줄 내용 */
  reviewContent?: string;
  /** 반려 상태에서 재제출 버튼을 노출할지 여부 */
  canResubmit?: boolean;
  /** 초기 렌더링 시 평가 패널을 열어둘지 여부 */
  defaultReviewOpen?: boolean;
};
