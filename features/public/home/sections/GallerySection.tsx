"use client";

import { useRef, useState, MouseEvent } from "react";

const galleryItems = [
  {
    title: "정기세션",
    image: "/images/home/act-1.jpg",
    titleColor: "text-[var(--green-1)]",
    description:
      "개발, 기획, 디자인까지 실무 중심의 배움과 네트워킹을 경험하세요. 매주 새로운 인사이트와 실전 노하우를 얻을 수 있는 기회!",
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
      "멋쟁이사자처럼 중앙 해커톤에서 아이디어를 현실로 구현해 볼 수 있는 경험. 개발자, 디자이너, 기획자가 한 팀이 되어 프로젝트를 만들어보세요!",
  },
  {
    title: "연합해커톤",
    image: "/images/home/act-4.jpg",
    titleColor: "text-[#7C2CD8]",
    description:
      "학교를 넘어 열정적인 멋사인들과 프로젝트를 만들어보세요. 타대학 멋사인들과 협력하며 프로젝트를 완성한 결과, 삼육멋사가 소속된 팀에서 대상 & 최우수상 & 우수상을 수상했습니다.",
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
    <section className="pt-60 bg-[#fafafa] text-[#141621] overflow-hidden">
      <div className="relative px-[clamp(18px,6vw,48px)] lg:px-[clamp(18px,12vw,120px)] max-w-350 mx-auto">
        {/* 헤더 섹션 */}
        <div className="relative flex items-center mb-8 lg:mb-26.75">
          <div className="flex-1 z-20">
            <h2 className="text-[22px] lg:text-[48px] font-bold leading-tight mb-4 lg:mb-6">
              지난
              <br />
              삼육멋사 13기는
              <br />
              이런 <span className="text-main-3">활동</span>들을 했어요
            </h2>
            <p className="w-42.5 lg:w-auto text-[12px] lg:text-[22px] text-[#868686] font-medium">
              열심히 활동했던 13기 아기사자들의 1년간의 활동을 소개합니다!
            </p>
          </div>

          {/* 마스코트 이미지 자리 */}
          <div className="absolute -right-10 -top-13 lg:top-auto lg:left-150">
            <div className="relative top-4 z-10 w-50 h-50 lg:w-[clamp(500px,20vw,635px)] lg:h-[clamp(500px,20vw,635px)]">
              <img
                src="/images/home/GallerySection/lion.png"
                alt="멋삼이"
                className="w-full h-full object-contain rotate-[8.03deg] lg:rotate-[4.29deg]"
              />
              <div className="absolute bottom-0 left-0 w-full h-23/50 bg-linear-to-t from-[#fafafa] via-[#fafafa] to-transparent" />
            </div>
          </div>
        </div>
      </div>

      {/* 갤러리 카드 - 가로 스크롤 */}
      <div
        ref={scrollRef}
        className="relative z-20 w-full overflow-x-auto scrollbar-hide pb-32.5 lg:pb-100 cursor-grab active:cursor-grabbing"
        onMouseDown={onMouseDown}
        onMouseLeave={onMouseLeave}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
      >
        <div className="flex px-[clamp(18px,6vw,48px)] lg:px-[max(clamp(18px,12vw,120px),calc((100vw-1400px)/2+clamp(18px,12vw,120px)))] min-w-max">
          {galleryItems.map((item, index) => (
            <div
              key={item.title}
              className="flex flex-col items-center shrink-0 mr-8 last:mr-0"
            >
              {/* 프로그레스 점 표시 */}
              <div className="relative flex justify-center items-center w-full mb-2 lg:mb-5 h-8">
                <div className="z-10 rounded-full bg-main-1 w-2.5 lg:w-5 h-2.5 lg:h-5" />
                {index < galleryItems.length - 1 && (
                  <div className="absolute left-1/2 top-0 w-[calc(100%+32px)] h-full flex pointer-events-none">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex-1 relative">
                        {i < 4 && (
                          <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-1.75 lg:h-2.5 w-1.75 lg:w-2.5 rounded-full bg-[#75acd6]" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="w-61.75 lg:w-139.25">
                {/* 말풍선 포인터 */}
                <div className="flex justify-center">
                  <svg
                    className="w-6 h-10 lg:w-10.25 lg:h-16.75"
                    viewBox="0 0 41 67"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15.2981 3.69736C16.6282 -1.23279 23.6228 -1.23277 24.9529 3.69739L40.0758 59.7518C40.9331 62.9294 38.5396 66.0542 35.2484 66.0542H5.00257C1.71138 66.0542 -0.682107 62.9294 0.175172 59.7518L15.2981 3.69736Z"
                      fill="#0B7DE2"
                    />
                  </svg>
                </div>

                {/* 이미지 카드 */}
                <div className="mb-2.5 lg:mb-8 -mt-2 relative">
                  <div className="relative w-61.75 h-36.75 lg:w-139.25 lg:h-83 rounded-[10px] lg:rounded-[20px] border-5 lg:border-13 border-main-1 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover object-[50%_100%]"
                    />
                    {/* 그라데이션 오버레이 */}
                    <div className="absolute w-full h-3/5 lg:h-4/5 bottom-0 bg-linear-to-t from-[#0071C8] via-transparent to-transparent" />
                    {/* 카드 내 타이틀 */}
                    <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center lg:pb-4">
                      <span className="text-white font-bold text-[20px] lg:text-[40px]">
                        {item.title}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 텍스트 콘텐츠 */}
                <div className="px-1.25 lg:px-2">
                  <h3
                    className={`text-[18px] lg:text-[40px] font-bold mb-1.75 lg:mb-5 ${item.titleColor}`}
                  >
                    {item.title}
                  </h3>
                  <p className="text-[14px] lg:text-[20px] font-normal text-gray-5 whitespace-pre-line break-keep">
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
