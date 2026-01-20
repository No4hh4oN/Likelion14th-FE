const tracks = [
  {
    title: "기획 & UX/UI 디자인",
    description:
      "아이디어를 감각적으로 시각화하는 기획 & UX/UI 디자인 트랙은 사용자 경험(UX)과 인터페이스(UI)를 설계하고, 서비스의 흐름과 기능을 기획하여 사용자가 편리하게 이용할 수 있도록 합니다.",
  },
  {
    title: "프론트엔드",
    description:
      "웹페이지의 시각적인 부분을 담당하는 프론트엔드 트랙은 사용자와 직접 상호작용하는 화면과 기능을 개발하는 역할로, HTML, CSS, JavaScript 등을 활용하여 웹이나 앱의 UI를 구현합니다.",
  },
  {
    title: "백엔드",
    description:
      "사용자 눈에 보이지 않는 서버를 담당하는 백엔드 트랙은 데이터베이스, 서버, API 등을 관리하며, 프론트엔드와 연결되어 웹이나 앱이 원활하게 동작하도록 로직을 개발합니다.",
  },
  {
    title: "AI / ML",
    description:
      "인공지능과 머신러닝을 활용해 데이터를 분석하고 모델을 적용하는 AI/ML 트랙은 LLM 기반 자연어 처리나 간단한 컴퓨터 비전 기술을 웹서비스에 적용하여, 실제 서비스에서 활용 가능한 AI 기능을 구현하는 것을 목표로 합니다.",
  },
];

export default function TracksSection() {
  return (
    <section className="py-20 bg-[#f6f7ff] text-[#141621]">
      <div className="w-[min(1120px,92%)] mx-auto">
        <h2 className="text-[clamp(1.6rem,2vw,2.2rem)] font-bold tracking-tight">
          멋쟁이사자처럼 삼육대학교만의 세분화된 트랙별 커리큘럼
        </h2>
        <p className="mt-3 max-w-[640px] text-black/70">
          파트별 커리큘럼을 요약해 소개하는 영역입니다.
        </p>
        <div className="mt-8 grid gap-5 grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
          {tracks.map((track) => (
            <article
              className="p-6 rounded-2xl bg-white shadow-[0_16px_32px_rgba(16,24,40,0.08)] flex flex-col gap-3"
              key={track.title}
            >
              <h3 className="text-lg font-semibold">{track.title}</h3>
              <p className="text-black/70">{track.description}</p>
              <span className="text-sm text-black/60">Part</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
