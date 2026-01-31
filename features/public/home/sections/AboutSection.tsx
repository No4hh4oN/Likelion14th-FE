export default function AboutSection() {
  return (
    <div className="bg-background">
      {/* FIXME: margin값 알잘딱 조절 */}
      <div className="mx-auto flex flex-col">
        <h2 className="font-bold text-5xl mx-auto">ABOUT</h2>
        {/* FIXME: 라이온 이미지 삽입 */}
        {/** 카드 영역 */}
        <div className="mt-8 p-7 rounded-[40px] bg-linear-to-b from-[#5B6171] to-[#31353E] max-w-251.75 mx-auto flex gap-19.25">
          <div className="w-71 h-71 rounded-full bg-white/15 grid place-items-center text-sm">
            로고 자리
            {/* FIXME: 로고 이미지 삽입 */}
          </div>
          <div className="max-w-131 text-white">
            <div className="font-bold flex gap-2.5 items-baseline">
              <h3 className="text-5xl">LIKELION</h3>
              <span className="text-[40px] text-[#979797]">at SYU</span>
            </div>
            <h4 className="mt-1.5 text-[20px] font-semibold text-main-3">
              멋쟁이 사자처럼 삼육대학교
            </h4>
            <p className="mt-10.75 text-[#b7b7b7] font-light">
              테크 기반의 아이디어 실현을 위한{" "}
              <span className="font-semibold text-[#E9E9E9]">
                전국 최대 규모의 대학 연합 IT 동아리
              </span>
              로 전공 상관없이 다양한 전공자들이 모여 아이디어를 실현하는
              삼육대학교 중앙동아리, SW 동아리이자 전국 연합 동아리입니다.
              <br />
              <br />
              사단법인 멋쟁이사자처럼의 각종 스터디와 네트워킹, 행사 지원을 통해
              다양한 기회를 접하고{" "}
              <span className="font-semibold text-[#E9E9E9]">
                멋사인들과 함께
              </span>{" "}
              성장할 수 있습니다!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
