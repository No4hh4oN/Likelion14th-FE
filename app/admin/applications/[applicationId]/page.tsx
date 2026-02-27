import ApplicationDetailPage from "@/features/admin/applications/ApplicationDetailPage";

type AdminApplicationDetailRouteProps = {
  params: Promise<{
    applicationId: string;
  }>;
};

export default async function AdminApplicationDetailRoute({
  params,
}: AdminApplicationDetailRouteProps) {
  const resolvedParams = await params;
  const parsed = Number(resolvedParams.applicationId);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return <div className="px-4 py-16 text-white">잘못된 지원서 ID입니다.</div>;
  }
  return <ApplicationDetailPage applicationId={parsed} />;
}
