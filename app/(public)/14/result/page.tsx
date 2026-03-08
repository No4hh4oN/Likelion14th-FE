import { Suspense } from "react";
import ResultEntryPage from "@/features/public/result/ResultEntryPage";

export default function Page() {
  return (
    <Suspense
      fallback={
        <section className="min-h-screen bg-background px-4 pt-28 text-white lg:px-6">
          <div className="mx-auto w-full max-w-[820px] rounded-[14px] bg-[#343740] px-8 py-10 text-center text-[20px]">
            결과 정보를 불러오는 중입니다.
          </div>
        </section>
      }
    >
      <ResultEntryPage />
    </Suspense>
  );
}
