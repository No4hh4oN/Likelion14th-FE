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

const COMMUNITY_INFO = [
  {
    title: "삼육대학교 멋쟁이 사자처럼\n14기 디스코드",
    seed: "discord-likelion-syu-14",
  },
  {
    title: "삼육대학교 멋쟁이 사자처럼\n인스타그램",
    seed: "instagram-likelion-syu",
  },
] as const;

const QR_GRID_SIZE = 29;

const toCellIndex = (x: number, y: number) => y * QR_GRID_SIZE + x;

const isInBounds = (x: number, y: number) =>
  x >= 0 && x < QR_GRID_SIZE && y >= 0 && y < QR_GRID_SIZE;

const drawFinderPattern = (
  cells: boolean[],
  reserved: boolean[],
  originX: number,
  originY: number,
) => {
  for (let y = 0; y < 7; y += 1) {
    for (let x = 0; x < 7; x += 1) {
      const targetX = originX + x;
      const targetY = originY + y;
      if (!isInBounds(targetX, targetY)) {
        continue;
      }

      const index = toCellIndex(targetX, targetY);
      const isBorder = x === 0 || x === 6 || y === 0 || y === 6;
      const isCenter = x >= 2 && x <= 4 && y >= 2 && y <= 4;

      cells[index] = isBorder || isCenter;
      reserved[index] = true;
    }
  }

  // Reserve the white separator ring around each finder.
  for (let y = -1; y <= 7; y += 1) {
    for (let x = -1; x <= 7; x += 1) {
      const targetX = originX + x;
      const targetY = originY + y;
      if (!isInBounds(targetX, targetY)) {
        continue;
      }

      reserved[toCellIndex(targetX, targetY)] = true;
    }
  }
};

const drawAlignmentPattern = (
  cells: boolean[],
  reserved: boolean[],
  centerX: number,
  centerY: number,
) => {
  for (let y = -2; y <= 2; y += 1) {
    for (let x = -2; x <= 2; x += 1) {
      const targetX = centerX + x;
      const targetY = centerY + y;
      if (!isInBounds(targetX, targetY)) {
        continue;
      }

      const index = toCellIndex(targetX, targetY);
      const isBorder =
        Math.abs(x) === 2 || Math.abs(y) === 2 || (x === 0 && y === 0);
      cells[index] = isBorder;
      reserved[index] = true;
    }
  }
};

const hashSeed = (seed: string) => {
  let hash = 2166136261;

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
};

const createPseudoQrCells = (seed: string) => {
  const cellCount = QR_GRID_SIZE * QR_GRID_SIZE;
  const cells = new Array<boolean>(cellCount).fill(false);
  const reserved = new Array<boolean>(cellCount).fill(false);

  drawFinderPattern(cells, reserved, 0, 0);
  drawFinderPattern(cells, reserved, QR_GRID_SIZE - 7, 0);
  drawFinderPattern(cells, reserved, 0, QR_GRID_SIZE - 7);

  for (let position = 8; position < QR_GRID_SIZE - 8; position += 1) {
    const horizontalIndex = toCellIndex(position, 6);
    const verticalIndex = toCellIndex(6, position);
    const value = position % 2 === 0;

    cells[horizontalIndex] = value;
    cells[verticalIndex] = value;
    reserved[horizontalIndex] = true;
    reserved[verticalIndex] = true;
  }

  drawAlignmentPattern(cells, reserved, QR_GRID_SIZE - 7, QR_GRID_SIZE - 7);

  let state = hashSeed(seed);
  for (let y = 0; y < QR_GRID_SIZE; y += 1) {
    for (let x = 0; x < QR_GRID_SIZE; x += 1) {
      const index = toCellIndex(x, y);
      if (reserved[index]) {
        continue;
      }

      state =
        (Math.imul(state ^ (x * 131 + y * 173 + 17), 1664525) + 1013904223) >>>
        0;
      cells[index] = ((state >>> 30) & 1) === 1;
    }
  }

  return cells;
};

type PseudoQrProps = {
  seed: string;
};

function PseudoQr({ seed }: PseudoQrProps) {
  const cells = createPseudoQrCells(seed);

  return (
    <svg
      viewBox={`0 0 ${QR_GRID_SIZE} ${QR_GRID_SIZE}`}
      className="h-[168px] w-[168px] rounded-[2px] bg-white"
      aria-hidden
    >
      <rect width={QR_GRID_SIZE} height={QR_GRID_SIZE} fill="#FFFFFF" />
      {cells.map((isFilled, index) => {
        if (!isFilled) {
          return null;
        }

        return (
          <rect
            key={index}
            x={index % QR_GRID_SIZE}
            y={Math.floor(index / QR_GRID_SIZE)}
            width={1}
            height={1}
            fill="#0D0D0D"
          />
        );
      })}
    </svg>
  );
}

type CommunityCardProps = {
  title: string;
  seed: string;
};

function CommunityCard({ title, seed }: CommunityCardProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="rounded-[10px] bg-white p-3 shadow-[0_18px_36px_rgba(0,0,0,0.24)]">
        <PseudoQr seed={seed} />
      </div>
      <p className="mt-5 whitespace-pre-line text-center text-[24px] font-semibold leading-[1.35] text-white lg:text-[42px]">
        {title}
      </p>
    </div>
  );
}

export default function FinalPassedSection({
  userName,
}: FinalPassedSectionProps) {
  const displayName = userName?.trim()
    ? `${userName.trim()}님께서는`
    : "지원자님께서는";

  return (
    <section className="min-h-screen bg-background px-4 pb-20 pt-12 text-white lg:px-6 lg:pt-16">
      <div className="mx-auto w-full max-w-[1220px] pt-9.25 lg:pt-36">
        <h1 className="text-center leading-[1.22]">
          <span className="block text-[42px] font-bold text-main-3 lg:text-[70px]">
            LIKELION at SYU 14th
          </span>
          <span className="mt-1 block text-[38px] font-bold text-white-1 lg:mt-2 lg:text-[68px]">
            아기사자 모집 최종 결과 발표
          </span>
        </h1>

        <div className="relative mt-8 flex justify-center lg:mt-12">
          <Image
            src="/images/lions/peek.webp"
            alt="최종 합격 안내 사자 이미지"
            width={220}
            height={220}
            className="z-10 h-[130px] w-[130px] lg:h-[190px] lg:w-[190px]"
            priority
          />
          <div className="absolute bottom-0 h-16 w-full bg-gradient-to-t from-background to-transparent" />
        </div>

        <div className="mx-auto mt-[-8px] w-full rounded-[16px] bg-[#343740]/90 px-6 py-7 text-center text-[22px] leading-[1.7] text-[#E6EAF2] lg:px-14 lg:py-10 lg:text-[40px]">
          {displayName} 멋쟁이사자처럼 삼육대학교 14기 아기사자 모집에{" "}
          <span className="text-main-1">최종합격</span>하셨음을 안내드립니다.
          <br />
          아래에 안내된 OT 일정을 확인하신 후, 디스코드 서버에 가입해 주시기
          바랍니다.
        </div>

        <div className="mt-14 lg:mt-20">
          <h2 className="text-[42px] font-bold lg:text-[62px]">
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
              <p className="text-[22px] font-bold leading-[1.4] text-white lg:text-[48px]">
                시간 : {OT_INFO.dateTime}
                <br />
                위치 : {OT_INFO.location}
              </p>
              <ul className="space-y-1 text-[12px] leading-[1.55] text-white/60 lg:text-[22px]">
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
              key={item.seed}
              title={item.title}
              seed={item.seed}
            />
          ))}
        </div>

        <p className="mt-6 text-center text-[11px] text-white/35 lg:mt-8 lg:text-[16px]">
          *QR 코드를 스캔하여 안내된 링크에 입장해 주시기 바랍니다.
        </p>

        <div className="mt-10 flex justify-center lg:mt-14">
          <Link
            href="/"
            className="inline-flex h-[68px] min-w-[320px] items-center justify-center rounded-full bg-[#5A6173] px-10 text-[30px] font-bold text-white transition-colors hover:bg-[#697188] lg:h-[84px] lg:min-w-[470px] lg:text-[52px]"
          >
            메인페이지로 돌아가기
          </Link>
        </div>
      </div>
    </section>
  );
}
