import AdminRouteErrorMessage from "@/features/admin/components/AdminRouteErrorMessage";
import { parsePositiveIntegerRouteParam } from "@/features/admin/routeParams";
import { redirect } from "next/navigation";

type AdminApplicantDetailRouteProps = {
  params: Promise<{
    applicationId: string;
  }>;
};

export default async function AdminApplicantDetailRoute({
  params,
}: AdminApplicantDetailRouteProps) {
  const resolvedParams = await params;
  const applicationId = parsePositiveIntegerRouteParam(
    resolvedParams.applicationId,
  );

  if (!applicationId) {
    return (
      <AdminRouteErrorMessage
        description="지원서 ID는 1 이상의 숫자여야 합니다."
        actionHref="/admin/applications"
        actionLabel="지원자 목록으로 이동"
      />
    );
  }

  redirect(`/admin/applications/${applicationId}`);
}
