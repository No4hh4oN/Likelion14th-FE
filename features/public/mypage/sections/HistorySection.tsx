"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getDashboard, getMyApplicationHistory } from "../api";
import type {
  ApplicationHistoryItem,
  DashboardItem,
  MyPageUser,
} from "../types";
import ActionButton from "../components/ActionButton";

type HistorySectionProps = {
  user: MyPageUser;
  onBack: () => void;
};

export default function HistorySection({ user, onBack }: HistorySectionProps) {
  const router = useRouter();
  const [historyItems, setHistoryItems] = useState<ApplicationHistoryItem[]>(
    [],
  );
  const [dashboardByRecruitment, setDashboardByRecruitment] = useState<
    Record<number, DashboardItem>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    if (user.role !== "게스트") {
      setIsLoading(false);
      return () => {
        isMounted = false;
      };
    }

    const fetchHistory = async () => {
      setIsLoading(true);
      setErrorMessage("");
      setDashboardByRecruitment({});

      try {
        const response = await getMyApplicationHistory();

        if (!isMounted) {
          return;
        }

        const items = response.items ?? [];
        setHistoryItems(items);

        const recruitmentIds = Array.from(
          new Set(items.map((item) => item.recruitmentId)),
        );

        if (recruitmentIds.length === 0) {
          setDashboardByRecruitment({});
          return;
        }

        const dashboardResults = await Promise.allSettled(
          recruitmentIds.map(async (recruitmentId) => ({
            recruitmentId,
            dashboard: await getDashboard(recruitmentId),
          })),
        );

        if (!isMounted) {
          return;
        }

        const nextDashboardByRecruitment: Record<number, DashboardItem> = {};
        dashboardResults.forEach((result) => {
          if (result.status === "fulfilled") {
            nextDashboardByRecruitment[result.value.recruitmentId] =
              result.value.dashboard;
          }
        });

        setDashboardByRecruitment(nextDashboardByRecruitment);
      } catch {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          "지원 내역을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchHistory();

    return () => {
      isMounted = false;
    };
  }, [user.role]);

  const visibleRecords = useMemo(() => {
    return historyItems
      .filter((item) => item.status !== "DRAFT")
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  }, [historyItems]);

  const formatDateTime = (value: string | null | undefined) => {
    if (!value) {
      return "-";
    }

    const parsed = Date.parse(value);
    if (!Number.isFinite(parsed)) {
      return value;
    }

    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Seoul",
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(new Date(parsed));

    const getPart = (type: Intl.DateTimeFormatPartTypes) =>
      parts.find((part) => part.type === type)?.value ?? "";

    return `${getPart("year")}.${getPart("month")}.${getPart("day")} ${getPart(
      "hour",
    )}:${getPart("minute")}`;
  };

  const getActionVisibility = (record: ApplicationHistoryItem) => {
    const dashboard = dashboardByRecruitment[record.recruitmentId];
    const canEdit = dashboard?.myApplication.canEdit ?? record.canEdit;
    const canSubmit = dashboard?.myApplication.canSubmit ?? record.canSubmit;

    return {
      canShowEditButton: canEdit === true,
      canShowResultButton: canEdit === false && canSubmit === false,
    };
  };

  const handleEditClick = (applicationId: number) => {
    router.push(`/14/apply?applicationId=${applicationId}`);
  };

  const handleResultClick = (applicationId: number) => {
    // TODO: 전형별 결과 확인 페이지 연결
    console.log("결과 확인", applicationId);
  };

  if (user.role !== "게스트") {
    return (
      <section className="min-h-screen bg-background px-4 text-white-1 lg:px-6">
        <div className="mx-auto w-full max-w-[960px] rounded-[8px] border border-white/10 bg-[#2E313A]/95 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.28)] lg:p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-[24px] font-bold lg:text-[30px]">
              나의 지원 내역
            </h1>
            <ActionButton
              text="돌아가기"
              onClick={onBack}
              className="text-[12px]"
              hoverClassName="hover:bg-gray-5"
            />
          </div>
          <p className="mt-4 text-[14px] text-white/75 lg:text-[16px]">
            지원 내역은 게스트 등급에서만 확인할 수 있습니다.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-background px-4 text-white-1 lg:px-6">
      <div className="mx-auto w-full max-w-[1300px] rounded-[8px] border border-white/10 bg-[#2E313A]/95 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.28)] lg:p-8">
        <div className="relative flex items-start justify-between gap-3">
          <div className="flex-1 text-center">
            <h1 className="text-[26px] font-bold lg:text-[36px]">
              나의 지원 내역
            </h1>
            <p className="mt-2 text-[12px] text-white/55 lg:text-[14px]">
              14기 이후 내역부터 확인 가능합니다
            </p>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="absolute right-0 top-0 h-8 w-8 text-[36px] leading-none text-gray-6 transition-colors hover:text-white/80"
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[920px] border-separate border-spacing-0 text-center text-[12px] lg:text-[14px]">
            <thead>
              <tr className="text-white/80">
                <th className="border-b border-white/15 px-3 py-3 font-semibold">
                  No.
                </th>
                <th className="border-b border-white/15 px-3 py-3 font-semibold">
                  기수
                </th>
                <th className="border-b border-white/15 px-3 py-3 font-semibold">
                  전형
                </th>
                <th className="border-b border-white/15 px-3 py-3 font-semibold">
                  지원일시
                </th>
                <th className="border-b border-white/15 px-3 py-3 font-semibold">
                  수정일시
                </th>
                <th className="border-b border-white/15 px-3 py-3 font-semibold">
                  면접일시
                </th>
                <th className="border-b border-white/15 px-3 py-3 font-semibold">
                  수정하기
                </th>
                <th className="border-b border-white/15 px-3 py-3 font-semibold">
                  결과 확인
                </th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="border-b border-white/10 px-3 py-10 text-center text-white/70"
                  >
                    지원 내역을 불러오는 중입니다.
                  </td>
                </tr>
              ) : null}

              {!isLoading && errorMessage ? (
                <tr>
                  <td
                    colSpan={8}
                    className="border-b border-white/10 px-3 py-10 text-center text-[#ff9ea8]"
                  >
                    {errorMessage}
                  </td>
                </tr>
              ) : null}

              {!isLoading && !errorMessage && visibleRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="border-b border-white/10 px-3 py-10 text-center text-white/70"
                  >
                    제출된 지원 내역이 없습니다.
                  </td>
                </tr>
              ) : null}

              {!isLoading && !errorMessage
                ? visibleRecords.map((record) => {
                    const { canShowEditButton, canShowResultButton } =
                      getActionVisibility(record);

                    return (
                      <tr key={record.applicationId} className="text-white/85">
                        <td className="border-b border-white/10 px-3 py-3">
                          {record.applicationId}
                        </td>
                        <td className="border-b border-white/10 px-3 py-3">
                          {record.generation}기
                        </td>
                        <td className="border-b border-white/10 px-3 py-3">
                          서류
                        </td>
                        <td className="border-b border-white/10 px-3 py-3">
                          {formatDateTime(record.submittedAt)}
                        </td>
                        <td className="border-b border-white/10 px-3 py-3">
                          {formatDateTime(record.updatedAt)}
                        </td>
                        <td className="border-b border-white/10 px-3 py-3">
                          -
                        </td>
                        <td className="border-b border-white/10 px-3 py-3">
                          {canShowEditButton ? (
                            <ActionButton
                              text="수정하기"
                              onClick={() =>
                                handleEditClick(record.applicationId)
                              }
                              className="bg-main-3 px-5 py-2.25 text-[14px] leading-none"
                              hoverClassName="hover:bg-amber-600"
                            />
                          ) : (
                            <span className="text-white/50">-</span>
                          )}
                        </td>
                        <td className="border-b border-white/10 px-3 py-3">
                          {canShowResultButton ? (
                            <ActionButton
                              text="결과 확인"
                              onClick={() =>
                                handleResultClick(record.applicationId)
                              }
                              className="bg-main-1 px-5 py-2.25 text-[14px] leading-none"
                              hoverClassName="hover:bg-[#2289E6]"
                            />
                          ) : (
                            <span className="text-white/50">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                : null}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
