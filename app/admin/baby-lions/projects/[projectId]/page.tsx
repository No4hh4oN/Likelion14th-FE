import BabyLionsProjectDetailPage from "@/features/admin/babyLions/BabyLionsProjectDetailPage";

export function generateStaticParams() {
  return [{ projectId: "1" }];
}

type AdminBabyLionsProjectDetailRouteProps = {
  params: Promise<{ projectId: string }>;
};

export default async function AdminBabyLionsProjectDetailPage(
  props: AdminBabyLionsProjectDetailRouteProps,
) {
  const params = await props.params;
  const projectId = Number(params.projectId);

  if (!Number.isInteger(projectId) || projectId <= 0) {
    return null;
  }

  return <BabyLionsProjectDetailPage projectId={projectId} />;
}
