import Link from "next/link";
import Image from "next/image";

export type ResultPhase = "FIRST" | "FINAL";

type ResultPageProps = {
  phase?: ResultPhase;
};

const RESULT_COPY: Record<
  ResultPhase,
  { titleSuffix: string; scheduleText: string }
> = {
  FIRST: {
    titleSuffix: "1차 결과 발표",
    scheduleText: "1차 발표 : 3월 13일 10시",
  },
  FINAL: {
    titleSuffix: "최종 결과 발표",
    scheduleText: "최종 발표 : 3월 18일 10시",
  },
};

export default function ResultPage({ phase = "FIRST" }: ResultPageProps) {
  const copy = RESULT_COPY[phase];

  return (
    <section className="pt-20 lg:pt-37.5 pb-19.75 lg:pb-91.25 bg-background">
      <div className="px-4.5 lg:px-[clamp(18px,12vw,392px)]">
        <div className="flex flex-col items-center">
          <h2 className="text-[22px] lg:text-[48px] font-bold leading-[1.27] text-center text-white-1">
            멋쟁이사자처럼
            <br />
            <span className="text-main-3">14기 아기사자 모집</span>{" "}
            {copy.titleSuffix}
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
          <p className="text-white-1 text-center w-auto lg:w-auto font-normal text-[14px] lg:text-[20px]">
            {copy.scheduleText}
          </p>
          <Link
            href="#"
            className="mt-10 lg:mt-4 cursor-pointer rounded-[100px] px-11.75 lg:px-[132px] py-4.5 font-bold bg-main-1 text-white-1 text-[14px] lg:text-[36px]"
          >
            결과 확인하기
          </Link>
        </div>
      </div>
    </section>
  );
}
