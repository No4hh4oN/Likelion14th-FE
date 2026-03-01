import { Suspense } from "react";
import UsersDummyPage from "@/features/admin/users/UsersDummyPage";

export default function AdminUsersPage() {
  return (
    <Suspense
      fallback={
        <section className="bg-background px-4 py-10 text-white lg:px-8 lg:py-14">
          <div className="mx-auto max-w-[1200px] rounded-2xl border border-[#3a3d45] bg-[#2d3037] px-4 py-10 text-center text-gray-3">
            유저 목록을 불러오는 중입니다.
          </div>
        </section>
      }
    >
      <UsersDummyPage />
    </Suspense>
  );
}
