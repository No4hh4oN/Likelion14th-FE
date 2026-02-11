import React from "react";
import Image from "next/image";

const IDEAL_MEMBER = [
  "개인 노트북을 보유하고 있는 분",
  "삼육대학교 학부 재학생, 휴학생 또는 졸업 유예자",
  "동아리 기초 조견을 모두 성실히 이행할 수 있는 분",
];

const SESSION_NOTICE = [
  "정기 세션은 매주 화요일 18시에 진행됩니다.",
  "각 파트별 세션 일정은 해당 파트의 일정에 따라 추후 조정될 예정입니다.",
  "시험 전 주 및 시험 기간에는 세션이 진행되지 않습니다.",
  "활동은 1학기, 여름방학, 2학기 동안 모두 진행됩니다.",
  "활동 장소는 삼육대학교 교내 강의실 등으로, 추후 공지될 예정입니다.",
];

const NoticeSection = () => {
  return (
    <section className="w-full bg-foreground pt-[80px]">
      <div className="mx-auto w-full max-w-[1280px] px-[18px] lg:px-10">
        <h2 className="text-center text-[22px] font-bold leading-tight text-background lg:text-[40px]">
          <span className="text-main-1">지원 전</span> 꼭 읽어주세요!
        </h2>

        <div className="mt-[115px] grid items-start gap-12 lg:mt-16 lg:grid-cols-[420px_minmax(0,1fr)] lg:gap-16">
          <div className="relative mx-auto w-[260px] lg:w-[420px]">
            <Image
              src="/images/notice/NoticeSection/lion.png"
              alt="라이언 캐릭터"
              width={420}
              height={420}
              className="h-auto w-full object-contain"
              priority
            />
          </div>

          <div className="space-y-15">
            <div>
              <h3 className="text-[18px] lg:text-[24px] font-bold text-background">
                이런 <span className="text-main-3">아기사자</span>를 찾아요!
              </h3>
              <ul className="mt-2.5 lg:mt-6 pl-5 text-[14px] lg:text-[18px] font-normal list-disc list-outside marker:text-[0.8em] leading-[1.66] text-background">
                <li className="pl-1">
                  <span className="font-bold">개인 노트북</span>을 보유하고 있는
                  분
                </li>
                <li className="pl-1">
                  삼육대학교 학부{" "}
                  <span className="font-bold">재학생, 휴학생</span> 또는{" "}
                  <span className="font-bold">졸업 유예자</span>
                </li>
                <li className="pl-1">
                  동아리{" "}
                  <span className="font-bold">
                    수료 조건을 모두 성실히 이행
                  </span>
                  할 수 있는 분
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-[18px] lg:text-[24px] font-bold text-background">
                <span className="text-main-3">정기세션</span> 안내
              </h3>
              <ul className="mt-2.5 lg:mt-6 pl-5 text-[14px] lg:text-[18px] text-background list-disc list-outside marker:text-[0.8em] leading-[1.66] font-normal">
                <li className="pl-1">
                  정기 세션은{" "}
                  <span className="font-semibold">매주 화요일 18시</span>에
                  진행됩니다.
                </li>
                <li className="pl-1">
                  각 파트별 세션 일정은 해당 파트의 일정에 따라 추후 조정될
                  예정입니다.
                </li>
                <li className="pl-1">
                  {" "}
                  <span className="font-semibold">시험 전 주 및 시험 기간</span>
                  에는 세션이 진행되지 않습니다.
                </li>
                <li className="pl-1">
                  활동은{" "}
                  <span className="font-semibold">1학기, 여름방학, 2학기</span>{" "}
                  동안 모두 진행됩니다.
                </li>
                <li className="pl-1">
                  활동 장소는 삼육대학교 교내 강의실 등으로, 추후 공지될
                  예정입니다.
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-24 lg:mt-36">
          <h2 className="text-center text-[34px] font-bold leading-tight text-background lg:text-[52px]">
            14기 아기사자 <span className="text-main-1">수료 조건</span>
          </h2>

          <div className="relative mt-16 rounded-[24px] border border-gray-3/80 bg-gray-1 px-6 pb-8 pt-10 lg:px-10 lg:pb-10 lg:pt-12">
            <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
              <Image
                src="/images/home/AboutSection/lion.png"
                alt="라이언 아이콘"
                width={112}
                height={112}
                className="h-[80px] w-[80px] object-contain lg:h-[112px] lg:w-[112px]"
              />
            </div>

            <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
              <div className="lg:border-r lg:border-gray-3/80 lg:pr-10">
                <h3 className="text-[24px] font-bold text-main-3">
                  교내 활동 평가 기준 안내
                </h3>
                <ul className="mt-4 space-y-2 text-[18px] text-background">
                  <li>
                    · 동아리 활동은{" "}
                    <span className="rounded bg-main-3/35 px-1">
                      출석, 과제 제출, 수료 행사 참여 여부
                    </span>
                    를 기준으로 종합 평가합니다.
                  </li>
                  <li>
                    · 활동 평가는 단계 누적 방식이며,{" "}
                    <span className="rounded bg-main-3/35 px-1">
                      누적 감점이 5점
                    </span>
                    에 도달할 경우 활동이 중단될 수 있습니다.
                  </li>
                </ul>

                <h4 className="mt-8 text-[22px] font-bold text-background">
                  감점 기준
                </h4>
                <ul className="mt-3 space-y-2 text-[17px] text-background">
                  <li>
                    · [결석 및 지각] 지각 10분 이내 0.5점 / 10분 초과 지각·결석
                    1점
                  </li>
                  <li>· 무단결석 2회 / 사고 고지된 일반 결석 1점</li>
                  <li>
                    · [과제 제출] 과제 미제출 2점 / 지각 제출·승인되지 않은 제출
                    1점
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-[24px] font-bold text-main-3">
                  주요 행사 참여
                </h3>
                <ul className="mt-4 space-y-2 text-[18px] text-background">
                  <li>· 아이디어톤 참여 (5월 중)</li>
                  <li>· 중앙해커톤 참여 (8월 중)</li>
                  <li>· 연합해커톤 참여 (11월 중)</li>
                </ul>

                <p className="mt-6 text-[15px] text-gray-5">
                  * 행사 일정은 내부 사정에 따라 변동될 수 있습니다.
                </p>

                <ul className="mt-6 space-y-2 text-[17px] text-background">
                  <li>
                    ·{" "}
                    <span className="rounded bg-main-3/35 px-1">
                      무단결석 3회 이상 또는 과제 미제출 3회 이상 시 수료가 불가
                    </span>
                    합니다.
                  </li>
                  <li>
                    ·{" "}
                    <span className="rounded bg-main-3/35 px-1">
                      주요 행사 참여는 필수
                    </span>{" "}
                    활동에 포함됩니다.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NoticeSection;
