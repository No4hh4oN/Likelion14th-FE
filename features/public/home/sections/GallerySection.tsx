const galleryItems = [
  "활동 하이라이트 A",
  "활동 하이라이트 B",
  "활동 하이라이트 C",
];

export default function GallerySection() {
  return (
    <section className="py-20 bg-white text-[#141621]">
      <div className="w-[min(1120px,92%)] mx-auto">
        <h2 className="text-[clamp(1.6rem,2vw,2.2rem)] font-bold tracking-tight">
          지난 삼육멋사 13기는 이런 활동들을 했어요
        </h2>
        <p className="mt-3 max-w-[640px] text-black/70">
          열심히 활동했던 13기 아기사자들의 1년간의 활동을 소개합니다!
        </p>
        <div className="mt-8 grid gap-5 grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
          {galleryItems.map((item) => (
            <article
              className="rounded-2xl p-5 bg-[#f4f6fb] grid gap-4"
              key={item}
            >
              <div className="h-40 rounded-2xl bg-black/10 grid place-items-center">
                이미지 자리
              </div>
              <div>
                <h3 className="text-lg font-semibold">{item}</h3>
                <p className="text-black/70">
                  활동에 대한 짧은 설명을 작성해 주세요.
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
