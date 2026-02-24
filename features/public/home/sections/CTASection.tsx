import Link from "next/link";
import Image from "next/image";

export default function CTASection() {
  return (
    <section className="pt-18.25 lg:pt-13.5 pb-19.75 lg:pb-91.25 bg-background">
      <div className="px-4.5 lg:px-[clamp(18px,12vw,392px)]">
        <div className="flex flex-col items-center">
          <h2 className="text-[24px] lg:text-[48px] font-bold leading-[1.27] text-center text-[#fafafa]">
            멋쟁이사자처럼 삼육대학교는
            <br />
            지금 <span className="text-main-3">14기 아기사자 모집중!</span>
          </h2>
          <div className="flex my-8 lg:my-16.5 ml-7">
            <Image
              src="/images/lions/lion-stand-half-gradient-black.webp"
              alt="노트북을 든 멋사 라이언 캐릭터"
              width={528}
              height={516}
              className="w-54.5 lg:w-102.25 object-contain"
            />
          </div>
          <p className="text-white-1 text-center w-29.5 lg:w-auto font-normal text-[14px] lg:text-[20px]">
            아기사자 모집기간 : 2월 27일 ~ 3월 12일
          </p>
          <Link
            href="/14/faq"
            className="mt-10.25 lg:mt-11.5 cursor-pointer rounded-[100px] px-8.5 py-3.75 lg:px-19.75 lg:py-7.5 font-bold bg-main-1 text-white-1 text-[28px] lg:text-[36px]"
          >
            14기 지원하기
          </Link>
        </div>
      </div>
    </section>
  );
}
