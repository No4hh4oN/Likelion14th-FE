import BabyLionsProjectDetailPage from "@/features/admin/babyLions/BabyLionsProjectDetailPage";
import AdminRouteErrorMessage from "@/features/admin/components/AdminRouteErrorMessage";
import { parsePositiveIntegerRouteParam } from "@/features/admin/routeParams";

type AdminBabyLionsProjectDetailRouteProps = {
  params: Promise<{ projectId: string }>;
};

export default async function AdminBabyLionsProjectDetailPage(
  props: AdminBabyLionsProjectDetailRouteProps,
) {
  const params = await props.params;
  const projectId = parsePositiveIntegerRouteParam(params.projectId);

  if (!projectId) {
    return (
      <AdminRouteErrorMessage
        description="과제 ID는 1 이상의 숫자여야 합니다."
        actionHref="/admin/baby-lions/projects"
        actionLabel="과제 목록으로 이동"
      />
    );
  }

  return <BabyLionsProjectDetailPage projectId={projectId} />;
}
