import UserDetailDummyPage from "@/features/admin/users/UserDetailDummyPage";
import AdminRouteErrorMessage from "@/features/admin/components/AdminRouteErrorMessage";
import { parseNonEmptyRouteParam } from "@/features/admin/routeParams";

type AdminUserDetailPageProps = {
  params: Promise<{
    loginId: string;
  }>;
};

export default async function AdminUserDetailPage({
  params,
}: AdminUserDetailPageProps) {
  const { loginId: rawLoginId } = await params;
  const loginId = parseNonEmptyRouteParam(rawLoginId);

  if (!loginId) {
    return (
      <AdminRouteErrorMessage
        description="사용자 loginId가 비어 있습니다."
        actionHref="/admin/users"
        actionLabel="사용자 목록으로 이동"
      />
    );
  }

  return <UserDetailDummyPage loginId={loginId} />;
}
