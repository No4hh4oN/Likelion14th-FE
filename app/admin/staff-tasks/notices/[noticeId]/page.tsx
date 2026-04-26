import NoticeDetailPage from "@/features/admin/staffTasks/NoticeDetailPage";
import AdminRouteErrorMessage from "@/features/admin/components/AdminRouteErrorMessage";
import { parsePositiveIntegerRouteParam } from "@/features/admin/routeParams";

type AdminStaffNoticeDetailPageProps = {
  params: Promise<{ noticeId: string }>;
};

export default async function AdminStaffNoticeDetailPage(
  props: AdminStaffNoticeDetailPageProps,
) {
  const params = await props.params;
  const noticeId = parsePositiveIntegerRouteParam(params.noticeId);

  if (!noticeId) {
    return (
      <AdminRouteErrorMessage
        description="공지사항 ID는 1 이상의 숫자여야 합니다."
        actionHref="/admin/staff-tasks/notices"
        actionLabel="공지사항 목록으로 이동"
      />
    );
  }

  return <NoticeDetailPage noticeId={noticeId} />;
}
