import { Suspense } from "react";
import CommonSpaceAccessGuard from "@/features/public/commonSpace/CommonSpaceAccessGuard";
import CommonSpacePage from "@/features/public/commonSpace/page";

export default function Page() {
  return (
    <CommonSpaceAccessGuard>
      <Suspense fallback={null}>
        <CommonSpacePage />
      </Suspense>
    </CommonSpaceAccessGuard>
  );
}
