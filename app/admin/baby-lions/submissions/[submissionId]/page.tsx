import BabyLionsSubmissionDetailPage from "@/features/admin/babyLions/BabyLionsSubmissionDetailPage";

export const dynamic = "force-dynamic";

type AdminBabyLionsSubmissionDetailRouteProps = {
  params: { submissionId: string };
};

export default async function AdminBabyLionsSubmissionDetailRoutePage(
  props: AdminBabyLionsSubmissionDetailRouteProps,
) {
  const params = props.params;
  const submissionId = Number(params.submissionId);

  if (!Number.isInteger(submissionId) || submissionId <= 0) {
    return null;
  }

  return <BabyLionsSubmissionDetailPage submissionId={submissionId} />;
}
