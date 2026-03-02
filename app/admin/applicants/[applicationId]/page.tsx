import { redirect } from "next/navigation";

export function generateStaticParams() {
  return [{ applicationId: "1" }];
}

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
