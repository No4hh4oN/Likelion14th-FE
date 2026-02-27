import { apiClient } from "@/lib/axios";
import type {
  ApplicationForResultResponse,
  DashboardForResultResponse,
  InterviewReservation,
  InterviewSlot,
  RecruitmentDetailResponse,
} from "./type";

/**
 * 모집 정보를 조회합니다.
 */
export async function getRecruitmentInfo(
  recruitmentId: number,
): Promise<RecruitmentDetailResponse> {
  const response = await apiClient.get<RecruitmentDetailResponse>(
    `/recruitments/${recruitmentId}`,
  );
  return response.data;
}

export async function getApplicationForResult(
  applicationId: number,
): Promise<ApplicationForResultResponse> {
  const response = await apiClient.get<ApplicationForResultResponse>(
    `/applications/${applicationId}`,
  );
  return response.data;
}

export async function getDashboardForResult(
  recruitmentId: number,
): Promise<DashboardForResultResponse> {
  const response = await apiClient.get<DashboardForResultResponse>(
    `/me/recruitments/${recruitmentId}/dashboard`,
  );
  return response.data;
}

const interviewSlotPaths = (recruitmentId: number) => [
  `/me/recruitments/${recruitmentId}/interview-slots`,
  `/me/recruitments/${recruitmentId}/interview/slots`,
  `/recruitments/${recruitmentId}/interview-slots`,
  `/recruitments/${recruitmentId}/interview/slots`,
];

const interviewReservationPaths = (recruitmentId: number) => [
  `/me/recruitments/${recruitmentId}/interview-reservations`,
  `/me/recruitments/${recruitmentId}/interview/reservations`,
  `/recruitments/${recruitmentId}/interview-reservations`,
  `/recruitments/${recruitmentId}/interview/reservations`,
];

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

  if (!slotId || !startAt || !endAt) {
    return null;
  }

  return {
    slotId,
    startAt,
    endAt,
  };
};

const parseInterviewSlot = (value: unknown): InterviewSlot | null => {
  const reservation = parseInterviewReservation(value);
  if (!reservation) {
    return null;
  }

  const record = value as Record<string, unknown>;
  const remainingCount =
    toNumberOrNull(
      record.remainingCount ?? record.availableCount ?? record.leftCount,
    ) ?? null;

  const closedByField =
    typeof record.closed === "boolean"
      ? record.closed
      : typeof record.status === "string"
        ? record.status.toUpperCase() === "CLOSED"
        : false;

  const closed =
    closedByField || (typeof remainingCount === "number" && remainingCount <= 0);

  return {
    ...reservation,
    remainingCount,
    closed,
  };
};

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

export async function getInterviewSlots(
  recruitmentId: number,
): Promise<InterviewSlot[]> {
  const data = await getFirstSuccessfulData(interviewSlotPaths(recruitmentId));
  return toUnknownArray(data)
    .map(parseInterviewSlot)
    .filter((slot): slot is InterviewSlot => slot !== null)
    .sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt));
}

export async function reserveInterviewSlot(
  recruitmentId: number,
  slotId: number,
): Promise<InterviewReservation | null> {
  let lastError: unknown = null;

  for (const path of interviewReservationPaths(recruitmentId)) {
    try {
      const response = await apiClient.post(path, { slotId }, {
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
        );

      if (!parsedReservation) {
        return null;
      }

      return parsedReservation;
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) {
    throw lastError;
  }

  throw new Error("INTERVIEW_RESERVATION_ENDPOINT_NOT_FOUND");
}
