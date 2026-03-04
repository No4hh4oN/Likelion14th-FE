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

  const closed =
    closedByField ||
    closedByAvailability ||
    (typeof remainingCount === "number" && remainingCount <= 0);

  return {
    ...reservation,
    location: typeof record.location === "string" ? record.location : reservation.location ?? null,
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
      lastError = error;
    }
  }

  if (lastError) {
    throw lastError;
  }

  throw new Error("INTERVIEW_RESERVATION_ENDPOINT_NOT_FOUND");
}
