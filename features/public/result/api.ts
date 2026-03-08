import axios from "axios";
import { apiClient } from "@/lib/axios";
import type {
  ApplicationForResultResponse,
  DashboardForResultResponse,
  InterviewReservation,
  InterviewSlot,
  RecruitmentDetailResponse,
} from "./type";

/**
 * 면접 예약 실패를 화면 메시지로 매핑하기 위한 에러 코드입니다.
 */
export type InterviewReservationErrorCode =
  | "ALREADY_RESERVED"
  | "SLOT_UNAVAILABLE"
  | "RESERVATION_CLOSED"
  | "UNAUTHORIZED"
  | "UNKNOWN";

/**
 * 면접 예약 요청 실패를 분기 처리하기 위한 정규화된 에러 정보입니다.
 */
export type InterviewReservationErrorInfo = {
  code: InterviewReservationErrorCode;
  status: number | null;
  message: string | null;
};

/**
 * 모집 결과 페이지에서 사용할 모집 상세 정보를 조회합니다.
 *
 * @param recruitmentId 조회할 모집 ID
 * @returns 결과 공개/면접 선택 시각이 포함된 모집 상세 정보
 */
export async function getRecruitmentInfo(
  recruitmentId: number,
): Promise<RecruitmentDetailResponse> {
  const response = await apiClient.get<RecruitmentDetailResponse>(
    `/recruitments/${recruitmentId}`,
  );
  return response.data;
}

/**
 * 특정 지원서의 모집 ID와 상태를 조회합니다.
 *
 * @param applicationId 조회할 지원서 ID
 * @returns 결과 페이지 진입에 필요한 지원서 메타 정보
 */
export async function getApplicationForResult(
  applicationId: number,
): Promise<ApplicationForResultResponse> {
  try {
    const response = await apiClient.get<ApplicationForResultResponse>(
      `/applications/${applicationId}`,
    );
    return response.data;
  } catch (error) {
    // Some backend states return 500 for the detail endpoint. Fall back to the
    // caller's application list so result pages can still resolve recruitmentId.
    const fallbackResponse = await apiClient.get<{
      items?: Array<{
        applicationId: number;
        recruitmentId: number;
        status: string;
      }>;
    }>("/applications", {
      params: {
        size: 100,
      },
    });
    const matchedApplication = fallbackResponse.data.items?.find(
      (item) => item.applicationId === applicationId,
    );

    if (matchedApplication) {
      return {
        applicationId: matchedApplication.applicationId,
        recruitmentId: matchedApplication.recruitmentId,
        status: matchedApplication.status,
      };
    }

    throw error;
  }
}

/**
 * 결과 페이지에서 사용할 지원자 대시보드 정보를 조회합니다.
 *
 * @param recruitmentId 조회할 모집 ID
 * @returns 결과 공개 여부, 지원 상태, 예약 정보를 포함한 대시보드 응답
 */
export async function getDashboardForResult(
  recruitmentId: number,
): Promise<DashboardForResultResponse> {
  const response = await apiClient.get<DashboardForResultResponse>(
    `/me/recruitments/${recruitmentId}/dashboard`,
  );
  return response.data;
}

/**
 * 면접 슬롯 조회 시 우선순위대로 시도할 엔드포인트 목록입니다.
 *
 * @param recruitmentId 조회 대상 모집 ID
 * @returns 슬롯 조회 후보 경로 목록
 */
const interviewSlotPaths = (recruitmentId: number) => [
  `/recruitments/${recruitmentId}/interview-slots`,
  `/recruitments/${recruitmentId}/interview/slots`,
  `/me/recruitments/${recruitmentId}/interview-slots`,
  `/me/recruitments/${recruitmentId}/interview/slots`,
];

/**
 * 면접 예약 시도 시 사용할 엔드포인트 후보 목록입니다.
 * 명세 기준 경로를 우선 사용하고, 이전 호환 경로를 뒤에 둡니다.
 *
 * @param recruitmentId 모집 ID
 * @param slotId 예약할 슬롯 ID
 * @returns 예약 요청 경로와 body 후보 목록
 */
const interviewReservationPaths = (recruitmentId: number, slotId: number) => [
  {
    path: `/interview-slots/${slotId}/reserve`,
    body: undefined,
  },
  {
    path: `/me/recruitments/${recruitmentId}/interview-reservations`,
    body: { slotId },
  },
  {
    path: `/me/recruitments/${recruitmentId}/interview/reservations`,
    body: { slotId },
  },
  {
    path: `/recruitments/${recruitmentId}/interview-reservations`,
    body: { slotId },
  },
  {
    path: `/recruitments/${recruitmentId}/interview/reservations`,
    body: { slotId },
  },
];

/**
 * 숫자 또는 숫자 문자열을 number로 변환합니다.
 *
 * @param value 서버 응답의 원시 값
 * @returns 유효한 숫자면 number, 아니면 null
 */
const toNumberOrNull = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

/**
 * 서버 에러 응답에서 사람이 읽을 수 있는 메시지를 최대한 추출합니다.
 *
 * @param value 서버 응답 body
 * @returns 추출된 메시지, 없으면 null
 */
const getErrorMessage = (value: unknown): string | null => {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }

  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const messageCandidates = [
    record.message,
    record.error,
    record.detail,
    record.reason,
  ];

  for (const candidate of messageCandidates) {
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }

  return null;
};

/**
 * Axios 에러를 면접 예약 화면에서 사용할 수 있는 형태로 정규화합니다.
 *
 * @param error 예약 요청 중 발생한 예외
 * @returns 상태 코드와 메시지가 정리된 예약 에러 정보
 */
export const getInterviewReservationErrorInfo = (
  error: unknown,
): InterviewReservationErrorInfo => {
  if (!axios.isAxiosError(error)) {
    return {
      code: "UNKNOWN",
      status: null,
      message: null,
    };
  }

  const status = error.response?.status ?? null;
  const message = getErrorMessage(error.response?.data);
  const normalizedMessage = message?.toLowerCase() ?? "";

  if (status === 401) {
    return { code: "UNAUTHORIZED", status, message };
  }

  if (
    normalizedMessage.includes("already") ||
    normalizedMessage.includes("duplicate") ||
    normalizedMessage.includes("이미")
  ) {
    return { code: "ALREADY_RESERVED", status, message };
  }

  if (
    status === 403 ||
    status === 410 ||
    normalizedMessage.includes("period") ||
    normalizedMessage.includes("window") ||
    normalizedMessage.includes("기간")
  ) {
    return { code: "RESERVATION_CLOSED", status, message };
  }

  if (
    status === 409 ||
    normalizedMessage.includes("full") ||
    normalizedMessage.includes("capacity") ||
    normalizedMessage.includes("available") ||
    normalizedMessage.includes("closed") ||
    normalizedMessage.includes("마감")
  ) {
    return { code: "SLOT_UNAVAILABLE", status, message };
  }

  return {
    code: "UNKNOWN",
    status,
    message,
  };
};

/**
 * 예약/슬롯 응답에서 공통으로 사용하는 예약 정보를 정규화합니다.
 *
 * @param value 서버에서 내려준 예약 응답 원본
 * @returns 화면에서 사용하는 예약 정보, 해석 불가 시 null
 */
const parseInterviewReservation = (value: unknown): InterviewReservation | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const slotId = toNumberOrNull(record.slotId ?? record.id);
  const startAt =
    typeof record.startAt === "string"
      ? record.startAt
      : typeof record.startsAt === "string"
        ? record.startsAt
        : null;
  const endAt =
    typeof record.endAt === "string"
      ? record.endAt
      : typeof record.endsAt === "string"
        ? record.endsAt
        : null;
  const location = typeof record.location === "string" ? record.location : null;

  if (!slotId || !startAt || !endAt) {
    return null;
  }

  return {
    slotId,
    startAt,
    endAt,
    location,
  };
};

/**
 * 슬롯 응답을 화면에서 쓰는 슬롯 타입으로 정규화합니다.
 * `available`, `capacity`, `reservedCount`를 이용해 비활성화 여부를 계산합니다.
 *
 * @param value 서버에서 내려준 슬롯 응답 원본
 * @returns 화면에서 사용하는 슬롯 정보, 해석 불가 시 null
 */
const parseInterviewSlot = (value: unknown): InterviewSlot | null => {
  const reservation = parseInterviewReservation(value);
  if (!reservation) {
    return null;
  }

  const record = value as Record<string, unknown>;
  const capacity = toNumberOrNull(record.capacity);
  const reservedCount = toNumberOrNull(record.reservedCount);
  const remainingCountByCapacity =
    typeof capacity === "number" && typeof reservedCount === "number"
      ? Math.max(capacity - reservedCount, 0)
      : null;
  const remainingCount =
    toNumberOrNull(
      record.remainingCount ?? record.availableCount ?? record.leftCount,
    ) ??
    remainingCountByCapacity ??
    null;

  const closedByField =
    typeof record.closed === "boolean"
      ? record.closed
      : typeof record.status === "string"
        ? record.status.toUpperCase() === "CLOSED"
        : false;
  const closedByAvailability =
    typeof record.available === "boolean" ? !record.available : false;
  const available =
    typeof record.available === "boolean"
      ? record.available
      : !(closedByField || (typeof remainingCount === "number" && remainingCount <= 0));

  const closed =
    closedByField ||
    closedByAvailability ||
    (typeof remainingCount === "number" && remainingCount <= 0);

  return {
    ...reservation,
    location: typeof record.location === "string" ? record.location : reservation.location ?? null,
    available,
    remainingCount,
    closed,
  };
};

/**
 * 배열 또는 `{ slots: [] }`, `{ items: [] }` 형태의 응답을 배열로 평탄화합니다.
 *
 * @param value 서버 응답 데이터
 * @returns 슬롯 파싱 대상으로 사용할 배열
 */
const toUnknownArray = (value: unknown): unknown[] => {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  const record = value as Record<string, unknown>;
  if (Array.isArray(record.slots)) {
    return record.slots;
  }

  if (Array.isArray(record.items)) {
    return record.items;
  }

  return [];
};

/**
 * 후보 경로를 순서대로 요청해 가장 먼저 성공한 응답 데이터를 반환합니다.
 *
 * @param paths 순차 시도할 API 경로 목록
 * @returns 첫 성공 응답의 data
 * @throws 모든 경로가 실패하거나 404만 반환한 경우 에러
 */
async function getFirstSuccessfulData(paths: string[]): Promise<unknown> {
  let lastError: unknown = null;

  for (const path of paths) {
    try {
      const response = await apiClient.get(path, {
        validateStatus: (status) => status === 200 || status === 404,
      });

      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) {
    throw lastError;
  }

  throw new Error("INTERVIEW_SLOT_ENDPOINT_NOT_FOUND");
}

/**
 * 모집별 면접 슬롯 목록을 조회해 화면용 타입으로 정규화합니다.
 *
 * @param recruitmentId 조회할 모집 ID
 * @returns 시간순으로 정렬된 슬롯 목록
 */
export async function getInterviewSlots(
  recruitmentId: number,
): Promise<InterviewSlot[]> {
  const data = await getFirstSuccessfulData(interviewSlotPaths(recruitmentId));
  return toUnknownArray(data)
    .map(parseInterviewSlot)
    .filter((slot): slot is InterviewSlot => slot !== null)
    .sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt));
}

/**
 * 선택한 슬롯으로 면접 예약을 확정합니다.
 *
 * @param recruitmentId 모집 ID
 * @param slotId 예약할 슬롯 ID
 * @returns 예약이 생성된 경우 예약 정보, 응답 본문이 없으면 null
 * @throws 모든 예약 엔드포인트 시도가 실패한 경우 에러
 */
export async function reserveInterviewSlot(
  recruitmentId: number,
  slotId: number,
): Promise<InterviewReservation | null> {
  for (const candidate of interviewReservationPaths(recruitmentId, slotId)) {
    try {
      const response = await apiClient.post(candidate.path, candidate.body, {
        validateStatus: (status) =>
          status === 200 || status === 201 || status === 204 || status === 404,
      });

      if (response.status === 404) {
        continue;
      }

      if (response.status === 204) {
        return null;
      }

      const parsedReservation =
        parseInterviewReservation(response.data) ||
        parseInterviewReservation(
          (response.data as { myReservation?: unknown } | null | undefined)
            ?.myReservation,
        ) ||
        parseInterviewReservation(
          (response.data as { reservation?: unknown } | null | undefined)
            ?.reservation,
        );

      if (!parsedReservation) {
        return null;
      }

      return parsedReservation;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        continue;
      }

      throw error;
    }
  }

  throw new Error("INTERVIEW_RESERVATION_ENDPOINT_NOT_FOUND");
}
