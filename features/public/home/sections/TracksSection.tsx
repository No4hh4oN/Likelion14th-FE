const tracks = [
  {
    part: 1,
    title: "기획 & UX/UI 디자인",
    titleColor: "text-[#FF0066CC]",
    description:
      "아이디어를 감각적으로 시각화하는 기획 & UX/UI 디자인 트랙은 사용자 경험(UX)과 인터페이스(UI)를 설계하고, 서비스의 흐름과 기능을 기획하여 사용자가 편리하게 이용할 수 있도록 합니다.",
  },
  {
    part: 2,
    title: "프론트엔드",
    titleColor: "text-[var(--main-1)]",
    description:
      "웹페이지의 시각적인 부분을 담당하는 프론트엔드 트랙은 사용자와 직접 상호작용하는 화면과 기능을 개발하는 역할로, HTML, CSS, JavaScript 등을 활용하여 웹이나 앱의 UI를 구현합니다.",
  },
  {
    part: 3,
    title: "백엔드",
    titleColor: "text-[var(--green-1)]",
    description:
      "사용자 눈에 보이지 않는 서버를 담당하는 백엔드 트랙은 데이터베이스, 서버, API 등을 관리하며, 프론트엔드와 연결되어 웹이나 앱이 원활하게 동작하도록 로직을 개발합니다.",
  },
  {
    part: 4,
    title: "AI / ML",
    titleColor: "text-[#7C2CD8]",
    description:
      "인공지능과 머신러닝을 활용해 데이터를 분석하고 모델을 적용하는 AI/ML 트랙은 LLM 기반 자연어 처리나 간단한 컴퓨터 비전 기술을 웹서비스에 적용하여, 실제 서비스에서 활용 가능한 AI 기능을 구현하는 것을 목표로 합니다.",
  },
];

export default function TracksSection() {
  return (
    <section className="pt-65.75 pb-101 bg-background text-[#141621]">
      <div className="w-[min(1120px,92%)] mx-auto">
        <h2 className="mb-38.25 text-white text-[48px] font-bold leading-[1.27] text-center">
          멋쟁이사자처럼 삼육대학교만의 <br />
          세분화된 트랙별 커리큘럼
        </h2>
        {/* 지그재그 배치 */}
        <div className="flex flex-col gap-[200px]">
          {/* FIXME: 반응형 디자인 */}
          {tracks.map((track, i) => (
            <div key={track.title} className="relative">
              {/* 캐릭터 이미지 */}
              <div
                className={`${
                  i % 2 === 0 ? "left-0" : "right-0"
                } absolute top-1/2 -translate-y-1/2 z-20 flex h-[480px] w-[480px] items-center justify-center bg-white/5 text-sm text-white/70`}
              >
                캐릭터 이미지 삽입
              </div>

              {/* 카드 + PART */}
              <div
                className={`${
                  i % 2 === 0
                    ? "ml-auto items-end text-left"
                    : "mr-auto items-start text-right"
                } flex w-full max-w-[620px] flex-col gap-3`}
              >
                <span className="text-2xl mx-5.25 font-semibold text-white">
                  PART {track.part}
                </span>
                <div className="rounded-[20px] w-[590px] h-[242px] bg-[#E5E5E5] gap-[34px] flex flex-col justify-center px-[56px]">
                  <h3 className={`text-4xl font-bold ${track.titleColor}`}>
                    {track.title}
                  </h3>
                  <p className="font-sans text-[18px] font-normal text-[#7b7b7b] leading-[143%] break-keep">
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
