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
  redirect(`/admin/applications/${resolvedParams.applicationId}`);
}
