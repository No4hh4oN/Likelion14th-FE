"use client";

import Link from "next/link";
import Image from "next/image";

type FinalPassedSectionProps = {
  userName?: string | null;
};

const OT_INFO = {
  dateTime: "2026년 3월 27일(금) 17시 30분",
  location: "위치 나오면 수정",
  notes: [
    "오리엔테이션은 약 1시간 정도 소요될 예정입니다.",
    "오리엔테이션에서는 향후 활동 계획 안내 및 아이스브레이킹 프로그램이 진행됩니다.",
    "부득이하게 지각하거나 늦게 참석하시는 경우, 사전에 반드시 연락해 주시기 바랍니다.",
    "오리엔테이션 종료 후, 화끈한 뒷풀이가 진행될 예정입니다.",
  ],
} as const;

type CommunityInfoItem = {
  title: string;
  imageSrc: string;
  imageAlt: string;
  description?: string;
};

const COMMUNITY_INFO: CommunityInfoItem[] = [
  {
    title: "삼육대학교 멋쟁이사자처럼\n14기 디스코드",
    imageSrc: "/images/passedSection/discord.webp",
    imageAlt: "삼육대학교 멋쟁이사자처럼 14기 디스코드 안내 이미지",
    description: "*QR 코드를 스캔하여 안내된 링크에 입장해 주시기 바랍니다.",
  },
  {
    title: "삼육대학교 멋쟁이사자처럼\n인스타그램",
    imageSrc: "/images/passedSection/instagram.webp",
    imageAlt: "삼육대학교 멋쟁이사자처럼 인스타그램 안내 이미지",
  },
] as const;

type CommunityCardProps = {
  title: string;
  imageSrc: string;
  imageAlt: string;
  description?: string;
};

function CommunityCard({
  title,
  imageSrc,
  imageAlt,
  description,
}: CommunityCardProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="">
        <Image
          src={imageSrc}
          alt={imageAlt}
          width={204}
          height={204}
          className="h-[204px] w-[204px] object-cover"
        />
      </div>
      <p className="mt-7 whitespace-pre-line text-center text-[18px] font-semibold leading-[1.27] text-white-1 lg:mt-12 lg:text-[24px]">
        {title}
      </p>
      {description && (
        <p className="mt-6 text-center text-[12px] font-medium leading-[1.55] text-gray-6 lg:mt-7 lg:text-[16px]">
          {description}
        </p>
      )}
    </div>
  );
}

export default function FinalPassedSection({
  userName,
}: FinalPassedSectionProps) {
  const displayName = userName?.trim() ? `${userName.trim()}` : "지원자";

  return (
    <section className="min-h-screen bg-background px-4 pb-20 pt-12 text-white lg:px-6 lg:pt-16">
      <div className="mx-auto w-full max-w-[1440px] pt-9.25 lg:pt-36">
        <h1 className="text-center leading-[1.27] text-[24px] font-bold lg:text-[48px]">
          <span className="block text-main-3">LIKELION at SYU 14th</span>
          <span className="block text-white-1">
            아기사자 모집 최종 결과 발표
          </span>
        </h1>

        <div className="z-0 mt-12 lg:mt-20 mx-auto w-[110px] lg:w-[167px]">
          <Image
            src="/images/lions/peek.webp"
            alt="라이언 빼꼼"
            width={476}
            height={408}
            className="h-auto w-full object-contain"
          />
        </div>

        <div className="mx-auto w-full rounded-[14px] bg-gray-7 px-6 py-7 text-center text-[14px] leading-[1.27] text-gray-3 lg:px-12 lg:py-9 lg:text-[24px]">
          {displayName}님께서는 멋쟁이사자처럼 삼육대학교 14기 아기사자 모집에{" "}
          <span className="text-main-1">최종합격</span>하셨음을 안내드립니다.
          <br />
          <br className="block lg:hidden" />
          아래에 안내된 OT 일정을 확인하신 후, 디스코드 서버에 가입해 주시기
          바랍니다.
        </div>

        <div className="mt-18.25 lg:mt-30.5">
          <h2 className="text-[22px] font-bold text-center lg:text-left lg:text-[32px]">
            OT 일정 및 장소
          </h2>
          <div className="mt-5 grid gap-6 lg:mt-7 lg:grid-cols-[1.07fr_1fr] lg:items-start">
            <div className="relative h-[260px] overflow-hidden rounded-[8px] bg-[#DCE1EA] lg:h-[390px]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_25%,#c8d1e1,transparent_42%),radial-gradient(circle_at_82%_62%,#bec9dc,transparent_42%),linear-gradient(140deg,#eef1f6,#d6dce8)]" />
              <div className="absolute left-[-14%] top-[10%] h-[67%] w-[72%] rounded-[160px] border-[18px] border-[#C4CCDA]/90" />
              <div className="absolute left-[8%] top-[29%] h-[58%] w-[72%] rounded-[140px] border-[16px] border-[#D3D9E4]/95" />
              <div className="absolute right-[9%] top-[6%] h-[47%] w-[48%] rounded-[140px] border-[14px] border-[#C9D1DF]/90" />
              <div className="absolute right-[11%] top-[48%] h-[43%] w-[54%] rounded-[120px] border-[12px] border-[#CFD6E2]/95" />
              <div className="absolute left-[62%] top-[48%] h-5 w-5 rounded-full bg-main-3/90 shadow-[0_0_0_6px_rgba(80,137,255,0.22)]" />
              <span className="absolute left-[58%] top-[56%] rounded bg-white/78 px-2 py-1 text-[11px] font-semibold text-[#5A6273] lg:text-[13px]">
                다니엘관
              </span>
            </div>

            <div className="space-y-5">
              <p className="text-[18px] font-semibold text-center leading-[1.82] lg:leading-[1.27] lg:text-left text-white-1 lg:text-[32px]">
                시간 : {OT_INFO.dateTime}
                <br />
                위치 : {OT_INFO.location}
              </p>
              <ul className="text-[12px] leading-[1.55] text-gray-4 lg:text-[18px]">
                {OT_INFO.notes.map((note) => (
                  <li key={note}>*{note}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-10 md:grid-cols-2 lg:mt-20 lg:gap-8">
          {COMMUNITY_INFO.map((item) => (
            <CommunityCard
              key={item.title}
              title={item.title}
              imageSrc={item.imageSrc}
              imageAlt={item.imageAlt}
              description={item.description}
            />
          ))}
        </div>

        <div className="mt-20 flex justify-center lg:mt-36.25">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-gray-6 px-5.5 py-4.5 text-[14px] font-bold text-white-1 hover:bg-gray-5 lg:px-12.75 lg:py-4.25 lg:text-[32px]"
          >
            메인페이지로 돌아가기
          </Link>
        </div>
      </div>
    </section>
  );
}
