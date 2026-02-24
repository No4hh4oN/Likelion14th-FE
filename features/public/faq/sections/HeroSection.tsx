import Link from "next/link";

const desktopLions = [
  {
    id: "head-back",
    className: "h-[220px] w-[220px] rotate-[10deg] translate-y-[10px]",
  },
  {
    id: "head-design",
    className: "h-[220px] w-[220px] rotate-[2deg]",
  },
  {
    id: "head-ai",
    className: "h-[220px] w-[220px] rotate-[-6deg]",
  },
  {
    id: "head-front",
    className: "h-[220px] w-[220px] rotate-[8deg] -translate-y-[6px]",
  },
];

const mobileLions = [
  {
    id: "head-back",
    className:
      "absolute w-[165px] h-[165px] left-[-8px] top-[32px] rotate-[-12.37deg] z-30",
  },
  {
    id: "head-design",
    className:
      "absolute w-[165px] h-[165px] right-[-4px] top-[86px] scale-x-[-1] z-20",
  },
  {
    id: "head-ai",
    className:
      "absolute w-[165px] h-[165px] left-[-6px] bottom-[62px] scale-x-[-1] rotate-[-10.67deg] z-10",
  },
  {
    id: "head-front",
    className:
      "absolute w-[160px] h-[160px] right-[-8px] bottom-2 rotate-[12.8deg] z-0",
  },
];

export default function HeroSection() {
  return (
    <section className="bg-foreground">
      <div className="overflow-hidden rounded-b-[50px] lg:rounded-b-[100px] bg-linear-to-b from-[#2A344A] via-background to-background">
        <div className="mx-auto max-w-[1200px] px-5 pt-12 pb-[70px] lg:pt-35 lg:pb-[77px]">
          {/* Mobile lions */}
          <ul className="relative mx-auto h-[430px] w-[320px] lg:hidden">
            {mobileLions.map((lion) => (
              <li key={`mobile-${lion.id}`} className={lion.className}>
                <img
                  src={`/images/lions/${lion.id}.webp`}
                  alt="#"
                  className="h-full w-full object-contain"
                />
              </li>
            ))}
          </ul>

          {/* Desktop lions */}
          <ul className="hidden lg:flex lg:justify-center lg:items-end lg:gap-6">
            {desktopLions.map((lion) => (
              <li key={`desktop-${lion.id}`} className={lion.className}>
                <img
                  src={`/images/lions/${lion.id}.webp`}
                  alt=""
                  className="h-full w-full object-contain"
                />
              </li>
            ))}
          </ul>

          {/* 텍스트/버튼 */}
          <div className="lg:mt-16 text-center text-white-1">
            <p className="font-bold text-[28px] lg:text-[48px] leading-[1.27]">
              <span className="text-main-3">LIKELION at SYU 14th</span>
              <br />
              아기사자 모집중!
            </p>
            <div className="mt-[45px] lg:mt-[63px] flex gap-[12px] justify-center">
              <span className="font-semibold text-[18px] lg:text-[20px]">
                서류 모집
              </span>
              <span className="font-normal text-[16px] lg:text-[18px]">
                2/27(월) - 3/12(목)
              </span>
            </div>
            <div className="mt-[28px] lg:mt-[30px]">
              <Link
                href="/14/apply"
                className="bg-main-1 px-[45px] py-[21px] rounded-[100px] cursor-pointer text-[24px] lg:text-[30px] font-bold"
              >
                14기 지원서 쓰기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
