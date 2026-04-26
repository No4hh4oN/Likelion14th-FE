import Link from "next/link";

/**
 * admin 공통 라우트 오류 화면에 전달하는 표시 문구와 이동 링크입니다.
 */
type AdminRouteErrorMessageProps = {
  title?: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
};

/**
 * admin 동적 라우트 파라미터가 잘못됐을 때 보여주는 공통 오류 화면입니다.
 */
export default function AdminRouteErrorMessage({
  title = "잘못된 관리자 경로입니다.",
  description,
  actionHref = "/admin",
  actionLabel = "관리자 홈으로 이동",
}: AdminRouteErrorMessageProps) {
  return (
    <section className="min-h-[calc(100dvh-4rem)] bg-background px-4 py-16 text-white lg:px-8">
      <div className="mx-auto max-w-[720px] rounded-2xl border border-[#3a3d45] bg-[#2d3037] px-5 py-10 text-center">
        <h1 className="text-[28px] font-bold">{title}</h1>
        <p className="mt-3 text-sm text-gray-4">{description}</p>
        <Link
          href={actionHref}
          className="mt-6 inline-flex rounded-lg bg-main-1 px-5 py-2.5 text-sm font-semibold text-white"
        >
          {actionLabel}
        </Link>
      </div>
    </section>
  );
}
