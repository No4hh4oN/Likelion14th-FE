const reviews = [
  {
    title: "기획/디자인",
    summary: "후기 문구 넣는 곳",
  },
  {
    title: "프론트엔드",
    summary: "후기 문구 넣는 곳",
  },
  {
    title: "백엔드",
    summary: "후기 문구 넣는 곳",
  },
];

export default function ReviewSection() {
  return (
    <section className="py-20 bg-[#0f1117]">
      <div className="w-[min(1120px,92%)] mx-auto">
        <h2 className="text-[clamp(1.6rem,2vw,2.2rem)] font-bold tracking-tight">
          삼육멋사 13기 아기사자들의 생생한 후기
        </h2>
        <div className="mt-8 grid gap-5 grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
          {reviews.map((review) => (
            <article className="rounded-2xl p-6 bg-white/10" key={review.title}>
              <h3 className="text-lg font-semibold">{review.title}</h3>
              <p className="text-white/70">{review.summary}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
