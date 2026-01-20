export default function AboutSection() {
  return (
    <section className="py-20 bg-[#141621]">
      <div className="w-[min(1120px,92%)] mx-auto">
        <h2 className="text-[clamp(1.6rem,2vw,2.2rem)] font-bold tracking-tight">
          ABOUT
        </h2>
        <div className="mt-8 p-7 rounded-3xl bg-white/10 grid gap-6 items-center md:grid-cols-[140px_1fr]">
          <div className="w-[120px] h-[120px] rounded-full bg-white/15 grid place-items-center text-sm">
            로고 자리
          </div>
          <div className="text-white">
            <h3 className="text-xl mb-2 font-semibold">LIKELION at SYU</h3>
            <h4 className="text-lg mb-4 font-medium">
              멋쟁이 사자처럼 삼육대학교
            </h4>
            <p className="text-white/70">
              테크 기반의 아이디어 실현을 위한 전국 최대 규모의 대학 연합 IT
              동아리로 전공 상관없이 다양한 전공자들이 모여 아이디어를 실현하는
              삼육대학교 중앙동아리, SW 동아리이자 전국 연합 동아리입니다.
              사단법인 멋쟁이사자처럼의 각종 스터디와 네트워킹, 행사 지원을 통해
              다양한 기회를 접하고 멋사인들과 함께 성장할 수 있습니다!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
