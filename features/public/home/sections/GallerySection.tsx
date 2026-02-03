"use client";

import { useRef, useState, MouseEvent } from "react";

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const onMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const onMouseLeave = () => {
    setIsDragging(false);
  };

  const onMouseUp = () => {
    setIsDragging(false);
  };

  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <section className="pt-[80px] bg-[#fafafa] text-[#141621] overflow-hidden">
      <div className="px-4 lg:px-[clamp(18px,12vw,120px)] max-w-[1400px] mx-auto">
        {/* 헤더 섹션 */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start lg:items-center mb-20">
          <div className="flex-1">
            <h2 className="text-[40px] lg:text-[48px] font-bold leading-tight mb-6">
              지난
              <br />
              삼육멋사 13기는
              <br />
              이런 <span className="text-main-3">활동</span>들을 했어요
            </h2>
            <p className="text-[16px] lg:text-[22px] text-[#868686] font-medium">
              열심히 활동했던 13기 아기사자들의 1년간의 활동을 소개합니다!
            </p>
          </div>

          {/* 마스코트 이미지 자리 */}
          <div className="flex-shrink-0 w-full lg:w-auto">
            <div className="w-[280px] h-[280px] lg:w-[380px] lg:h-[380px] rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
              <span className="text-gray-300 text-center">
                마스코트 이미지
                <br />
                (480x480)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 갤러리 카드 - 가로 스크롤 */}
      <div
        ref={scrollRef}
        className="w-full overflow-x-auto scrollbar-hide pb-24 cursor-grab active:cursor-grabbing"
        onMouseDown={onMouseDown}
        onMouseLeave={onMouseLeave}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
      >
        <div className="flex px-[max(16px,calc((100vw_-_1400px)_/_2_+_16px))] lg:px-[max(clamp(18px,12vw,120px),calc((100vw_-_1400px)_/_2_+_clamp(18px,12vw,120px)))] min-w-max">
          {galleryItems.map((item, index) => (
            <div
              key={item.title}
              className="flex flex-col items-center flex-shrink-0 mr-8 last:mr-0"
            >
              {/* 프로그레스 점 표시 */}
              <div className="relative flex justify-center items-center w-full mb-8 h-8">
                <div
                  className={`z-10 rounded-full ${
                    index === 0
                      ? "bg-[var(--main-1)] w-4 h-4"
                      : "bg-[#75acd6] w-3 h-3"
                  }`}
                />
                {index < galleryItems.length - 1 && (
                  <div className="absolute left-1/2 top-0 w-[calc(100%_+_32px)] h-full flex pointer-events-none">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex-1 relative">
                        {i < 4 && (
                          <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-2 w-2 rounded-full bg-[#b8d5e8]" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="w-[320px] lg:w-[420px]">
                {/* 말풍선 포인터 */}
                <div className="flex justify-center mb-6">
                  <div className="relative w-0 h-0 border-l-[20px] border-r-[20px] border-t-[30px] border-l-transparent border-r-transparent border-t-[var(--main-1)]" />
                </div>

                {/* 이미지 카드 */}
                <div className="mb-8 relative">
                  <div className="relative w-full aspect-video rounded-[20px] border-[8px] border-[var(--main-1)] overflow-hidden bg-gray-200">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    {/* 그라데이션 오버레이 */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0071C8] via-transparent to-transparent opacity-60" />
                    {/* 카드 내 타이틀 */}
                    <div className="absolute bottom-0 left-0 right-0 h-[80px] flex items-end justify-center pb-4">
                      <span className="text-white font-bold text-[32px]">
                        {item.title}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 텍스트 콘텐츠 */}
                <div className="px-2">
                  <h3
                    className={`text-[32px] font-bold mb-4 ${item.titleColor}`}
                  >
                    {item.title}
                  </h3>
                  <p className="text-[15px] text-[#666666] leading-relaxed whitespace-pre-line">
                    {item.description}
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
