export default function HeroSection() {
  return (
    <section className="py-20 bg-[radial-gradient(circle_at_10%_20%,rgba(64,112,255,0.4),transparent_70%),linear-gradient(140deg,#0b0d13_0%,#111a36_55%,#0b0d13_100%)]">
      <div className="w-[min(1120px,92%)] mx-auto">
        <div className="grid gap-12 items-center md:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col gap-5">
            <h1 className="text-[clamp(2.4rem,4vw,3.6rem)] leading-tight font-extrabold">
              LIKELION
            </h1>
            <h2 className="text-[clamp(2.4rem,4vw,3.6rem)] leading-tight font-extrabold">
              at SYU 14th
            </h2>
            <p className="text-[1.05rem] text-white/80 max-w-[520px]">
              LIKELION
            </p>
            <p className="text-[1.05rem] text-white/80 max-w-[520px]">
              at SYU 14th
            </p>
            <div>logo</div>
            <div className="flex flex-wrap gap-3">
              <button
                className="rounded-full px-5 py-3 font-semibold bg-[#FF9B43] text-white"
                type="button"
              >
                14기 지원하기
              </button>
            </div>
            {/* TODO : 추후 피그마 이미지 반영 */}
            <div className="flex flex-wrap gap-2.5 text-white/70">
              {["React", "Figma", "PyTorch"].map((chip) => (
                <span
                  className="px-3 py-1.5 rounded-full bg-white/10 text-sm"
                  key={chip}
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
