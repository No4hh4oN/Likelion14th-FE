import { Suspense } from "react";
import CommonSpacePage from "@/features/public/commonSpace/page";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CommonSpacePage />
    </Suspense>
  );
}
