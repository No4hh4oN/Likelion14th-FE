import BabyLionsSubmissionDetailPage from "@/features/admin/babyLions/BabyLionsSubmissionDetailPage";
import AdminRouteErrorMessage from "@/features/admin/components/AdminRouteErrorMessage";
import { parsePositiveIntegerRouteParam } from "@/features/admin/routeParams";

type AdminBabyLionsSubmissionDetailRouteProps = {
  params: Promise<{ submissionId: string }>;
};

export default async function AdminBabyLionsSubmissionDetailRoutePage(
  props: AdminBabyLionsSubmissionDetailRouteProps,
) {
  const params = await props.params;
  const submissionId = parsePositiveIntegerRouteParam(params.submissionId);

  if (!submissionId) {
    return (
      <AdminRouteErrorMessage
        description="제출물 ID는 1 이상의 숫자여야 합니다."
        actionHref="/admin/baby-lions/projects"
        actionLabel="과제 목록으로 이동"
      />
    );
  }

  return <BabyLionsSubmissionDetailPage submissionId={submissionId} />;
}
