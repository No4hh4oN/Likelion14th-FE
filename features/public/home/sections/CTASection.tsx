export default function CTASection() {
  return (
    <section className="py-20 bg-[radial-gradient(circle_at_0%_50%,rgba(255,102,0,0.4),transparent_60%),#0b0d13]">
      <div className="w-[min(1120px,92%)] mx-auto">
        <div className="p-9 rounded-[28px] bg-white/10 flex items-center justify-between gap-6 md:flex-row flex-col md:items-center md:justify-between md:text-left text-left">
          <h2 className="text-2xl font-bold">
            멋쟁이 사자처럼 삼육대학교는 지금 14기 아기사자 모집중!
          </h2>
          <p className="text-white/70 mt-2">
            아기사자 모집기간 : 00월 00일 ~ 00월 00일
          </p>
          <button
            className="rounded-full px-5 py-3 font-semibold bg-[#2f6bff] text-white"
            type="button"
          >
            14기 지원하기
          </button>
        </div>
      </div>
    </section>
  );
}
