const desktopLions = [
  {
    id: "3",
    className: "h-[250px] w-[250px] rotate-[9.4deg] z-30",
  },
  {
    id: "1",
    className: "h-[250px] w-[250px] -ml-2 z-20",
  },
  {
    id: "4",
    className: "h-[250px] w-[250px] -ml-8 z-10",
  },
  {
    id: "2",
    className: "h-[250px] w-[250px] -ml-2 scale-x-[-1] rotate-[12deg] z-0",
  },
];

const mobileLions = [
  {
    id: "3",
    className:
      "absolute w-[200px] h-[200px] left-[-24px] top-[-8px] rotate-[-12.37deg] z-30",
  },
  {
    id: "1",
    className:
      "absolute w-[200px] h-[200px] right-[-24px] top-[54px] scale-x-[-1] z-20",
  },
  {
    id: "4",
    className:
      "absolute w-[200px] h-[200px] left-[-18px] bottom-[56px] scale-x-[-1] rotate-[-10.67deg] z-10",
  },
  {
    id: "2",
    className:
      "absolute w-[200px] h-[200px] right-[-26px] bottom-0 scale-x-[-1] rotate-[12.8deg] z-0",
  },
];

export default function HeroSection() {
  return (
    <section className="bg-foreground">
      <div className="overflow-hidden rounded-b-[50px] lg:rounded-b-[100px] bg-linear-to-b from-[#2A344A] via-background to-background">
        <div className="mx-auto max-w-[1200px] px-5 pt-8 pb-[70px] lg:pt-10 lg:pb-[77px]">
          {/* Mobile lions */}
          <ul className="relative mx-auto h-[430px] w-[320px] lg:hidden">
            {mobileLions.map((lion) => (
              <li key={`mobile-${lion.id}`} className={lion.className}>
                <img
                  src={`/images/home/TracksSection/${lion.id}.png`}
                  alt=""
                  className="h-full w-full object-contain"
                />
              </li>
            ))}
          </ul>

          {/* Desktop lions */}
          <ul className="hidden lg:flex lg:justify-center lg:items-end">
            {desktopLions.map((lion) => (
              <li key={`desktop-${lion.id}`} className={lion.className}>
                <img
                  src={`/images/home/TracksSection/${lion.id}.png`}
                  alt=""
                  className="h-full w-full object-contain"
                />
              </li>
            ))}
          </ul>

          {/* 텍스트/버튼 */}
          <div className="lg:mt-6 text-center text-white-1">
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
                2/16(월) - 3/12(목)
              </span>
            </div>
            <button className="mt-[12px] lg:mt-[18px] bg-main-1 px-[45px] py-[21px] rounded-[100px] cursor-pointer text-[24px] lg:text-[30px] font-bold">
              14기 지원서 쓰기
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
