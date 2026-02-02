const galleryItems = [
  {
    title: "정기세션",
    image: "/images/home/act-1.jpg",
    titleColor: "text-[var(--green-1)]",
    description:
      "개발, 기획, 디자인까지 실무 중심의 배움과 네트워킹을 경험하세요.\n매주 새로운 인사이트와 실전 노하우를 얻을 수 있는 기회!",
  },
  {
    title: "아이디어톤",
    image: "/images/home/act-2.png",
    titleColor: "text-[#FF0066CC]",
    description: "문제 해결을 위한 참신한 아이디어를 고민해보는 특별한 기회!",
  },
  {
    title: "중앙해커톤",
    image: "/images/home/act-3.jpg",
    titleColor: "text-[var(--main-1)]",
    description:
      "멋쟁이사자처럼 중앙 해커톤에서 아이디어를 현실로 구현해 볼 수 있는 경험.\n개발자, 디자이너, 기획자가 한 팀이 되어 프로젝트를 만들어보세요!",
  },
  {
    title: "연합해커톤",
    image: "/images/home/act-4.jpg",
    titleColor: "text-[#7C2CD8]",
    description:
      "학교를 넘어 열정적인 멋사인들과 프로젝트를 만들어보세요.\n타대학 멋사인들과 협력하며 프로젝트를 완성한 결과\n삼육멋사가 소속된 팀에서 대상 & 최우수상 & 우수상을 수상했습니다.",
  },
];

export default function GallerySection() {
  return (
    <section className="pt-[240px] bg-[#fafafa] text-[#141621]">
      <div className="px-4.5 lg:px-[clamp(18px,12vw,392px)]">
        <div className="flex gap-[50px] items-center">
          <div className="relative flex flex-col gap-[19px]">
            <h2 className="text-[48px] font-bold leading-[1.27]">
              지난
              <br />
              삼육멋사 13기는 <br />
              이런 <span className="text-main-3">활동</span>들을 했어요
            </h2>
            <p className="mb-[107px] font-medium text-[22px] text-[#868686]">
              열심히 활동했던 13기 아기사자들의 1년간의 활동을 소개합니다!
            </p>
          </div>
          <div className="absolute left-1/2 h-[480px] w-[480px] bg-background text-gray-2">
            FIXME: 이미지 삽입
          </div>
        </div>

        <section className="relative">
          {/* 데코 라인: 큰 원 + 작은 점 4개 반복 */}
          <div className="flex items-center gap-[113px] pb-[915px] pl-[279px] overflow-x-auto scrollbar-hide touch-pan-x">
            {galleryItems.map((item, index) => (
              <div
                key={`dot-${index}`}
                className="flex items-start gap-[113px]"
              >
                <div className="relative flex flex-col items-center">
                  <div className="h-5 w-5 rounded-full bg-main-1" />
                  <svg
                    className="mt-7"
                    width="41"
                    height="67"
                    viewBox="0 0 41 67"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15.2981 3.69736C16.6282 -1.23279 23.6228 -1.23277 24.9529 3.69739L40.0758 59.7518C40.9331 62.9294 38.5396 66.0542 35.2484 66.0542H5.00257C1.71138 66.0542 -0.682107 62.9294 0.175172 59.7518L15.2981 3.69736Z"
                      fill="#0B7DE2"
                    />
                  </svg>

                  <div className="absolute mt-[104px]">
                    <div className="relative w-[557px] h-[332px]">
                      <div className="w-full h-full rounded-[20px] border-[11px] border-main-1">
                        <div className="relative w-full h-full overflow-hidden rounded-[9px]">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="absolute bottom-0 w-full z-0"
                          />
                          <div className="absolute flex justify-center items-end bottom-0 h-[116px] left-0 right-0 bg-gradient-to-b from-transparent to-[#0071C8] z-10">
                            <span className="mb-2.25 text-white font-bold text-[40px] ">
                              {item.title}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-left ml-1 mt-8 flex flex-col gap-5">
                      <h3
                        className={`text-[40px] font-bold ${item.titleColor}`}
                      >
                        {item.title}
                      </h3>
                      <p className="text-[20px] font-regular text-gray-5 leading-[1.27]">
                        {item.description.split("\n").map((line, i) => (
                          <span key={i}>
                            {line}
                            <br />
                          </span>
                        ))}
                      </p>
                    </div>
                  </div>
                </div>
                {index < galleryItems.length - 1 && (
                  <>
                    {[0, 1, 2, 3].map((dot) => (
                      <span
                        key={`small-${index}-${dot}`}
                        className="mt-1.25 h-2.5 w-2.5 rounded-full bg-[#75acd6]"
                      />
                    ))}
                  </>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
