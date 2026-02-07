const tracks = [
  {
    part: 1,
    title: "기획 & UX/UI 디자인",
    titleColor: "text-[#FF0066CC]",
    description:
      "아이디어를 감각적으로 시각화하는 기획 & UX/UI 디자인 트랙은 사용자 경험(UX)과 인터페이스(UI)를 설계하고, 서비스의 흐름과 기능을 기획하여 사용자가 편리하게 이용할 수 있도록 합니다.",
    imageSize: "h-[214px] w-[214px] lg:h-[480px] lg:w-[480px]",
  },
  {
    part: 2,
    title: "프론트엔드",
    titleColor: "text-[var(--main-1)]",
    description:
      "웹페이지의 시각적인 부분을 담당하는 프론트엔드 트랙은 사용자와 직접 상호작용하는 화면과 기능을 개발하는 역할로, HTML, CSS, JavaScript 등을 활용하여 웹이나 앱의 UI를 구현합니다.",
    imageSize: "h-[240px] w-[240px] lg:h-[548px] lg:w-[548px]",
  },
  {
    part: 3,
    title: "백엔드",
    titleColor: "text-[var(--green-1)]",
    description:
      "사용자 눈에 보이지 않는 서버를 담당하는 백엔드 트랙은 데이터베이스, 서버, API 등을 관리하며, 프론트엔드와 연결되어 웹이나 앱이 원활하게 동작하도록 로직을 개발합니다.",
    imageSize: "h-[230px] w-[230px] lg:h-[496px] lg:w-[496px]",
  },
  {
    part: 4,
    title: "AI / ML",
    titleColor: "text-[#7C2CD8]",
    description:
      "인공지능과 머신러닝을 활용해 데이터를 분석하고 모델을 적용하는 AI/ML 트랙은 LLM 기반 자연어 처리나 간단한 컴퓨터 비전 기술을 웹서비스에 적용하여, 실제 서비스에서 활용 가능한 AI 기능을 구현하는 것을 목표로 합니다.",
    imageSize: "h-[256px] w-[256px] lg:h-[534px] lg:w-[534px]",
  },
];

export default function TracksSection() {
  return (
    <section className="pt-65.75 pb-101 bg-background text-[#141621]">
      <div className="w-[min(1120px,92%)] mx-auto">
        <h2 className="mb-7.25 lg:mb-38.25 text-white-1 text-[22px] lg:text-[48px] font-bold leading-[1.27] text-center">
          멋쟁이사자처럼 삼육대학교만의 <br />
          세분화된 트랙별 커리큘럼
        </h2>
        {/* 지그재그 배치 */}
        <div className="flex flex-col">
          {tracks.map((track, i) => (
            <div
              key={track.title}
              className={`flex flex-col items-center lg:flex-row lg:justify-between ${
                i % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
            >
              {/** 캐릭터 이미지
               * i가 홀수일 때는 가로 반전
               * 백엔드(part 3, i=2)일 때는 약간 회전
               */}
              <div
                className={`flex shrink-0 items-center justify-center -mb-5 lg:mb-0 ${
                  track.imageSize
                } ${i % 2 !== 0 ? "scale-x-[-1]" : ""} ${
                  i === 2 ? "-rotate-[11.5deg]" : ""
                }`}
              >
                <img
                  src={`/images/home/TracksSection/${track.part}.png`}
                  alt=""
                  className="h-full w-full object-contain"
                />
              </div>

              {/* 카드 + PART */}
              <div
                className={`flex w-full max-w-155 flex-col gap-1 items-end lg:gap-3 ${
                  i % 2 === 0 ? "lg:items-end" : "lg:items-start"
                }`}
              >
                <span className="text-[12px] lg:text-2xl mx-3.25 lg:mx-5.25 font-semibold text-white">
                  PART {track.part}
                </span>
                <div
                  className={`flex h-auto w-[min(324px, 100%)] lg:w-146.75 text-center flex-col justify-center gap-2.25 lg:gap-8.5 rounded-[10px] lg:rounded-[20px] bg-white-1 px-3.5 py-3 lg:py-11 lg:px-14 ${
                    i % 2 === 0 ? "lg:text-left" : "lg:text-right"
                  }`}
                >
                  <h3
                    className={`text-[18px] lg:text-4xl font-bold  ${track.titleColor}`}
                  >
                    {track.title}
                  </h3>
                  <p className="break-keep text-sm lg:text-base font-normal leading-[143%] text-gray-5">
                    {track.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
