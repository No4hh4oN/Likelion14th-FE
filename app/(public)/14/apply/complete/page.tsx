import ApplyCompletePage from "@/features/public/apply/ApplyCompletePage";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ApplyCompletePage />
    </Suspense>
  );
}
