import Image from "next/image";
export default function AboutSection() {
  return (
    <section id="about" className="bg-background scroll-mt-24">
      <div className="px-4.75 relative flex flex-col">
        <h2 className="font-bold text-[22px] leading-[1.27] lg:text-5xl mx-auto">
          ABOUT
        </h2>
        <Image
          src="/images/lions/peek.webp"
          alt="라이언 빼꼼"
          width={476}
          height={408}
          className="relative mt-7 left-1/2 -translate-x-1/2 w-[112px] lg:w-[340px] z-0"
          priority
        />
        {/** 카드 영역 */}
        <div className="py-8 px-7 lg:p-7 z-10 relative rounded-[40px] bg-linear-to-b from-[#5B6171] to-[#31353E] max-w-251.75 mx-auto flex flex-col items-center gap-8 lg:flex-row lg:items-stretch lg:gap-19.25">
          <div className="w-24.25 h-24.25 lg:w-71 lg:h-71 relative rounded-full bg-white grid place-items-center text-sm shrink-0">
            <Image
              src="/images/syuLikeLion.webp"
              alt="LIKELION logo"
              width={284}
              height={284}
              className="h-auto w-full object-cover"
              priority={false}
            />
          </div>
          <div className="max-w-131 text-center lg:text-left">
            <div className="font-bold flex justify-center gap-2.5 items-baseline lg:justify-start">
              <h3 className="text-[24px] lg:text-5xl">LIKELION</h3>
              <span className="text-[20px] lg:text-[40px] text-[#979797]">
                at SYU
              </span>
            </div>
            <h4 className="mt-1 lg:mt-1.5 text-[16px] lg:text-[20px] font-semibold text-main-3">
              멋쟁이사자처럼 삼육대학교
            </h4>
            <p className="mt-6.25 lg:mt-10.75 text-[#b7b7b7] font-light text-[18px] leading-[142%] break-keep">
              테크 기반의 아이디어 실현을 위한{" "}
              <span className="font-semibold text-[#E9E9E9]">
                전국 최대 규모의 대학 연합 IT 동아리
              </span>
              로 전공 상관없이 다양한 전공자들이 모여 아이디어를 실현하는
              삼육대학교 중앙동아리, SW 동아리이자 전국 연합 동아리입니다.
              <br />
              <br />
              사단법인 멋쟁이사자처럼의 각종 스터디와 네트워킹, 행사 지원을 통해
              다양한 기회를 접하고{" "}
              <span className="font-semibold text-[#E9E9E9]">
                멋사인들과 함께
              </span>{" "}
              성장할 수 있습니다!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
