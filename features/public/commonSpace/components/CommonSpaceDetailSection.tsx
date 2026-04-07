import type { CommonSpaceDetailSection, CommonSpacePart } from "../types";

type CommonSpaceDetailSectionProps = {
  part: CommonSpacePart;
  section: CommonSpaceDetailSection;
};

export default function CommonSpaceDetailSection({
  part,
  section,
}: CommonSpaceDetailSectionProps) {
  const audience =
    part.id === "all" ? "전체 멤버" : `${part.label} 파트 멤버`;

  return (
    <section className="pb-16">
      <div className="relative overflow-hidden rounded-[18px] border border-[#4158c7] bg-linear-to-r from-[#334EBE] to-[#0B7DE2] px-5 py-7 shadow-[0_0_17.3px_#003BA8] sm:px-8 sm:py-8 lg:rounded-[20px] lg:px-10 lg:py-9">
        <div className="absolute inset-y-0 right-0 w-1/3 bg-[radial-gradient(circle_at_center,_rgba(250,250,250,0.24),_transparent_70%)]" />
        <div className="relative z-10 flex flex-col gap-4">
          <span className="w-fit rounded-full bg-[#2a3c75] px-3 py-1.5 text-[13px] font-semibold text-white-1 sm:px-4 sm:py-2 sm:text-[15px]">
            {audience}
          </span>
          <h2 className="text-[24px] font-bold text-white-1 sm:text-[28px] lg:text-[32px]">
            {section.title}
          </h2>
          <p className="max-w-[720px] text-[15px] text-gray-1 sm:text-[17px] lg:text-[18px]">
            {section.description}
          </p>
        </div>
      </div>

      <ul className="mt-10 grid gap-5 md:grid-cols-2">
        {section.items.map((item) => (
          <li
            key={item}
            className="rounded-[16px] border border-gray-6 bg-linear-to-br from-gray-7 to-[#1f222d] px-5 py-5 sm:px-6 sm:py-6 lg:rounded-[18px]"
          >
            <p className="text-[13px] font-semibold text-main-3 sm:text-[14px]">
              {part.label} {section.label}
            </p>
            <h3 className="mt-3 text-[20px] font-bold text-white-1 sm:text-[22px]">
              {item}
            </h3>
            <p className="mt-3 text-[15px] leading-[1.6] text-gray-3 sm:text-[16px]">
              추후 API 연동 시 이 영역에 {part.label} 전용 {section.label}
              데이터가 들어옵니다.
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-10 rounded-[16px] border border-dashed border-gray-6 bg-[#202329] px-5 py-4 sm:px-6 sm:py-5 lg:rounded-[18px]">
        <p className="text-[14px] leading-[1.7] text-gray-3 sm:text-[15px]">
          현재는 공통 레이아웃 검증용 임시 화면입니다. 이후 UI 상세 구현과 API
          연결 시에도 좌측 네비게이션 구조와 URL 체계는 그대로 유지할 수
          있습니다.
        </p>
      </div>
    </section>
  );
}
