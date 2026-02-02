export default function CTASection() {
  return (
    <section className="py-[54px] bg-[#262529]">
      <div className="px-4.5 lg:px-[clamp(18px,12vw,392px)]">
        <div className="flex flex-col items-center justify-between">
          <h2 className="text-[48px] font-bold leading-[1.27] text-center text-[#fafafa]">
            멋쟁이 사자처럼 삼육대학교는 <br />
            지금 <span className="text-main-3">14기 아기사자 모집중!</span>
          </h2>
          <div className="flex mt-[66px]">FIXME: 이미지 삽입</div>
          <p className="text-white-1 font-normal text-[20px] mt-[79px]">
            아기사자 모집기간 : 2월 16일 ~ 3월 12일
          </p>
          <button
            className="mt-[46px] cursor-pointer rounded-[100px] px-[79px] py-[30px] font-bold bg-main-1 text-white-1 text-[36px]"
            type="button"
          >
            14기 지원하기
          </button>
        </div>
      </div>
    </section>
  );
}
