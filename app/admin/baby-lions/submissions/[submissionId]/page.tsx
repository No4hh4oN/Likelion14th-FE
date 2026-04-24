import BabyLionsSubmissionDetailPage from "@/features/admin/babyLions/BabyLionsSubmissionDetailPage";

export const dynamic = "force-dynamic";

type AdminBabyLionsSubmissionDetailRouteProps = {
  params: Promise<{ submissionId: string }>;
};

export default async function AdminBabyLionsSubmissionDetailRoutePage(
  props: AdminBabyLionsSubmissionDetailRouteProps,
) {
  const params = await props.params;
  const submissionId = Number(params.submissionId);

  if (!Number.isInteger(submissionId) || submissionId <= 0) {
    return null;
  }

  return <BabyLionsSubmissionDetailPage submissionId={submissionId} />;
}
