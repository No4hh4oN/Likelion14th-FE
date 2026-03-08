import { Suspense } from "react";
import ApplicationDetailPage from "@/features/admin/applications/ApplicationDetailPage";

export function generateStaticParams() {
  return [{ applicationId: "1" }];
}

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

  return (
    <Suspense
      fallback={
        <section className="bg-background px-4 py-10 text-white lg:px-8 lg:py-14">
          <div className="mx-auto max-w-[900px] rounded-2xl border border-[#3a3d45] bg-[#2d3037] px-4 py-10 text-center text-gray-3">
            지원서 상세 정보를 불러오는 중입니다.
          </div>
        </section>
      }
    >
      <ApplicationDetailPage applicationId={parsed} />
    </Suspense>
  );
}
