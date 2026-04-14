import BabyLionsProjectDetailPage from "@/features/admin/babyLions/BabyLionsProjectDetailPage";

export const dynamic = "force-dynamic";

type AdminBabyLionsProjectDetailRouteProps = {
  params: { projectId: string };
};

export default async function AdminBabyLionsProjectDetailPage(
  props: AdminBabyLionsProjectDetailRouteProps,
) {
  const params = props.params;
  const projectId = Number(params.projectId);

  if (!Number.isInteger(projectId) || projectId <= 0) {
    return null;
  }

  return <BabyLionsProjectDetailPage projectId={projectId} />;
}
