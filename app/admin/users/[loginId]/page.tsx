import UserDetailDummyPage from "@/features/admin/users/UserDetailDummyPage";

export function generateStaticParams() {
  return [{ loginId: "admin" }];
}

type AdminUserDetailPageProps = {
  params: Promise<{
    loginId: string;
  }>;
};

export default async function AdminUserDetailPage({ params }: AdminUserDetailPageProps) {
  const { loginId } = await params;
  return <UserDetailDummyPage loginId={decodeURIComponent(loginId)} />;
}
