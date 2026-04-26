import { Suspense } from "react";
import InterviewCandidateDetailPage from "@/features/admin/interviews/InterviewCandidateDetailPage";
import AdminRouteErrorMessage from "@/features/admin/components/AdminRouteErrorMessage";
import { parsePositiveIntegerRouteParam } from "@/features/admin/routeParams";

type AdminInterviewCandidateDetailRouteProps = {
  params: Promise<{
    applicationId: string;
  }>;
};

export default async function AdminInterviewCandidateDetailRoute({
  params,
}: AdminInterviewCandidateDetailRouteProps) {
  const resolvedParams = await params;
  const applicationId = parsePositiveIntegerRouteParam(
    resolvedParams.applicationId,
  );

  if (!applicationId) {
    return (
      <AdminRouteErrorMessage
        description="지원서 ID는 1 이상의 숫자여야 합니다."
        actionHref="/admin/interviews/candidates"
        actionLabel="면접 대상자 목록으로 이동"
      />
    );
  }

  return (
    <Suspense
      fallback={
        <section className="bg-background px-4 py-10 text-white lg:px-8 lg:py-14">
          <div className="mx-auto max-w-[900px] rounded-2xl border border-[#3a3d45] bg-[#2d3037] px-4 py-10 text-center text-gray-3">
            면접 대상자 정보를 불러오는 중입니다.
          </div>
        </section>
      }
    >
      <InterviewCandidateDetailPage applicationId={applicationId} />
    </Suspense>
  );
}
