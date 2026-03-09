import NoticeDetailPage from "@/features/admin/staffTasks/NoticeDetailPage";

type AdminStaffNoticeDetailPageProps = {
  params: Promise<{ noticeId: string }>;
};

export default async function AdminStaffNoticeDetailPage(
  props: AdminStaffNoticeDetailPageProps,
) {
  const params = await props.params;
  const noticeId = Number(params.noticeId);

  if (!Number.isInteger(noticeId) || noticeId <= 0) {
    return null;
  }

  return <NoticeDetailPage noticeId={noticeId} />;
}

