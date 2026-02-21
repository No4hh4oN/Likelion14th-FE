/** 섹션별 transition 효과 */
export function SectionTransition({ type }: { type: "fade" }) {
  if (type === "fade") {
    return (
      <div className="h-[224px] bg-gradient-to-b from-transparent to-[#fafafa]" />
    );
  }

  return null;
}
