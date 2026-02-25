import React from "react";
import Image from "next/image";

const IDEAL_MEMBER = [
  "개인 노트북을 보유하고 있는 분",
  "삼육대학교 학부 재학생, 휴학생 또는 졸업 유예자",
  "동아리 기초 조견을 모두 성실히 이행할 수 있는 분",
];

const SESSION_NOTICE = [
  "정기세션은 매주 화요일 18시에 진행됩니다.",
  "각 파트별 세션 일정은 해당 파트의 일정에 따라 추후 조정될 예정입니다.",
  "시험 전 주 및 시험 기간에는 세션이 진행되지 않습니다.",
  "활동은 1학기, 여름방학, 2학기 동안 모두 진행됩니다.",
  "활동 장소는 삼육대학교 교내 강의실 등으로, 추후 공지될 예정입니다.",
];

const NoticeSection = () => {
  return (
    <section className="w-full bg-foreground pt-[80px]">
      <div className="mx-auto w-full max-w-[1440px] px-[18px] lg:px-[60px]">
        {/* 지원 전 안내사항 탭 */}
        <h2 className="text-center text-[22px] font-bold leading-tight text-background lg:text-[40px]">
          <span className="text-main-1">지원 전</span> 꼭 읽어주세요!
        </h2>

        <div className="mt-[9px] grid items-start gap-0 lg:mt-[41px] lg:grid-cols-[minmax(0,520px)_minmax(0,520px)] lg:items-start lg:justify-center lg:gap-[115px]">
          <div className="relative mx-auto mt-[40px] w-[200px] lg:mt-[80px] lg:w-[440px]">
            <Image
              src="/images/lions/lion-stand-half-gradient-white.webp"
              alt="라이언 캐릭터"
              width={620}
              height={700}
              className="h-auto w-full object-contain"
              priority
            />
          </div>

          <div className="relative z-10 mt-6.5 w-full max-w-[520px] space-y-5.75 lg:space-y-15 pt-0 lg:mt-0 lg:pt-[74px]">
            <div>
              <h3 className="text-[18px] lg:text-[24px] font-bold text-background">
                이런 <span className="text-main-3">아기사자</span>를 찾아요!
              </h3>
              <ul className="mt-2.5 lg:mt-6 pl-5 text-[14px] lg:text-[18px] font-normal list-disc list-outside marker:text-[0.6em] leading-[1.66] text-background">
                <li>
                  <span className="font-bold">개인 노트북</span>을 보유하고 있는
                  분
                </li>
                <li>
                  삼육대학교 학부{" "}
                  <span className="font-bold">재학생, 휴학생</span> 또는{" "}
                  <span className="font-bold">졸업 유예자</span>
                </li>
                <li>
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
              <ul className="mt-2.5 lg:mt-6 pl-5 text-[14px] lg:text-[18px] text-background list-disc list-outside marker:text-[0.6em] leading-[1.66] font-normal">
                <li>
                  정기세션은{" "}
                  <span className="font-semibold">매주 화요일 18시</span>에
                  진행됩니다.
                </li>
                <li className="lg:whitespace-nowrap">
                  각 파트별 세션 일정은 해당 파트의 일정에 따라 추후 조정될
                  예정입니다.
                </li>
                <li>
                  {" "}
                  <span className="font-semibold">시험 전 주 및 시험 기간</span>
                  에는 세션이 진행되지 않습니다.
                </li>
                <li>
                  활동은{" "}
                  <span className="font-semibold">1학기, 여름방학, 2학기</span>{" "}
                  동안 모두 진행됩니다.
                </li>
                <li>
                  활동 장소는 삼육대학교 교내 강의실 등으로, 추후 공지될
                  예정입니다.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 수료조건 탭 */}
        <div className="mt-[118px] lg:mt-[245px]">
          <h2 className="text-center text-[22px] font-semibold text-background lg:text-[36px]">
            14기 아기사자 <span className="text-main-1">수료 조건</span>
          </h2>

          <div className="relative mt-[28px] lg:mt-[71px]">
            <div className="z-0 mx-auto w-[110px] lg:w-[167px]">
              <Image
                src="/images/lions/peek.webp"
                alt="라이언 빼꼼"
                width={476}
                height={408}
                className="h-auto w-full object-contain"
              />
            </div>

            <div className="relative z-10 rounded-[20px] border border-gray-2 bg-gray-1 px-[15px] py-8 lg:px-10">
              <div className="grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-12">
                {/* 구분선용 박스 */}
                <div className="border-b border-gray-2 lg:border-b-0 lg:border-r pb-7 lg:pr-10">
                  <h3 className="text-[18px] text-center lg:text-left lg:text-[20px] font-bold text-background">
                    <span className="text-main-3">교내</span> 활동 평가 기준
                    안내
                  </h3>
                  <ul className="mt-[10px] lg:mt-[26px] leading-[1.48] text-[14px] lg:text-[16px] text-background list-disc list-outside pl-5 marker:text-[0.6em]">
                    <li>
                      동아리 활동은{" "}
                      <span className="rounded bg-main-3 px-1">
                        출석, 과제 제출, 주요 행사 참여 여부
                      </span>
                      를 기준으로 종합 평가됩니다.
                    </li>
                    <li>
                      활동 평가는{" "}
                      <span className="rounded bg-main-3 px-1">
                        감점 누적 방식(점수제)
                      </span>
                      으로 운영되며 <br className="hidden lg:block" />
                      <span className="rounded bg-main-3 px-1">
                        누적 감점이 5점
                      </span>
                      에 도달할 경우 활동이 중단(퇴출)될 수 있습니다.
                    </li>
                  </ul>

                  <h4 className="mt-5 lg:mt-9.25 text-center lg:text-left text-[16px] lg:text-[20px] font-bold text-background">
                    감점 기준
                  </h4>
                  <ul className="mt-2.5 lg:mt-3.75 leading-[1.48] text-[14px] lg:text-[16px] text-background list-none">
                    <li>[ 결석 및 지각 ]</li>
                    <li className="list-disc list-outside ml-5 marker:text-[0.6em]">
                      지각 : 10분 이하 지각: 0.5점 / 10분 초과 지각: 1점
                    </li>
                    <li className="list-disc list-outside ml-5 marker:text-[0.6em]">
                      무단결석: 2점 / 사전 고지된 일반 결석: 1점
                    </li>
                    <li className="mt-5">[ 과제 제출 ]</li>
                    <li className="list-disc list-outside ml-5 marker:text-[0.6em]">
                      과제 미제출: 2점
                    </li>
                    <li className="list-disc list-outside ml-5 marker:text-[0.6em]">
                      지각 제출 또는 승인되지 않은 제출: 1점
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-[18px] lg:text-[20px] text-center lg:text-left font-bold text-background">
                    <span className="text-main-3">주요 행사 </span>참여
                  </h3>
                  <ul className="mt-[10px] lg:mt-[26px] leading-[1.48] font-normal text-[14px] lg:text-[16px] text-background list-disc list-outside pl-5 marker:text-[0.6em]">
                    <li>아이디어톤 참여 (5월 중)</li>
                    <li>중앙해커톤 참여 (8월 중)</li>
                    <li>연합해커톤 참여 (11월 중)</li>
                  </ul>

                  <p className="mt-[12px] lg:mt-[21px] text-[12px] font-normal lg:text-[14px] text-gray-5">
                    * 행사 일정은 내부 사정에 따라 변동될 수 있습니다. <br />*
                    연합해커톤의 경우, 현재는 11월에 진행되는 간지톤 1회만
                    계획되어 있으나, 추후 연합해커톤 일정이 추가될 경우 해당
                    행사 중 1회만 참여하시면 됩니다.
                  </p>

                  <ul className="mt-[31px] leading-[1.48] text-[14px] lg:text-[16px] font-normal text-background list-disc list-outside pl-5 marker:text-[0.6em]">
                    <li>
                      <span className="rounded bg-main-3 px-1">
                        무단결석 3회 이상 또는 과제 미제출 3회 이상 시 수료가
                        불가
                      </span>
                      합니다.
                    </li>
                    <li>
                      <span className="rounded bg-main-3 px-1">
                        주요 행사 참여는 필수 활동
                      </span>
                      에 포함됩니다.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NoticeSection;
