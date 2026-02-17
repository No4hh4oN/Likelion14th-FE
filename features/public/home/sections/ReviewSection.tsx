const reviews = [
  {
    title: "기획/디자인",
    titleColor: "text-[#FF0066CC]",
    summary: [
      {
        title: "외부 대학과 교류할 수 있는 귀한 기회",
        content:
          "학교에서 혼자 과제에 파묻혀 살 때는 알지 못했던 다양한 사람들과의 교류, 만남으로 프로젝트를 대하는 시야를 넓힐 수 있었습니다. 아이디어톤, 해커톤과 같이 다양한 대회를 차근차근 해나가며 협업에 대한 진입장벽과 걱정이 많이 사라진 것 같아서 즐거웠습니다!",
        people: "13기 윤O원",
      },
      {
        title: "실무와 협업을 경험할 수 있는 곳",
        content:
          "디자인 수업만으로는 하기 어려운 실제 프로젝트를 직접 해보면서 툴이나 실무 방식도 자연스럽게 배울 수 있었습니다. 선배들이랑 타과 친구들이랑 같이 협업하는 과정도 재밌었고 덕분에 좋은 사람들과의 네트워크도 많이 쌓을 수 있었습니다. 실무 감각을 몸으로 배워보고 싶은 분들께 추천하고 싶은 동아리입니다!",
        people: "13기 임O현",
      },
    ],
  },
  {
    title: "프론트엔드",
    titleColor: "text-[var(--main-1)]",
    summary: [
      {
        title: "이론을 넘어, ‘만들 수 있다’는 자신감으로",
        content:
          "멋쟁이사자처럼에서는 강의를 넘어 직접 프로젝트를 진행하며 기획부터 구현, 협업까지 전 과정을 경험할 수 있었고, 사용자 관점까지 고민하는 프론트엔드 개발자의 시선을 갖게 되었습니다. 그 결과 원하는 기능을 직접 구현할 수 있다는 자신감이 생겼고, 새로운 기술에도 도전하고 싶다는 마음을 갖게 되었습니다. 개발에 관심은 있지만 아직 막연하다면, 멋사에서 직접 부딪히며 성장하고 개발의 흐름과 자신감을 함께 얻어가길 추천합니다.",
        people: "13기 박O우",
      },
      {
        title: "혼자가 아닌 함께 성장할 수 있었던 경험",
        content:
          "리액트를 처음부터 배울 수 있도록 운영진 분들께서 많은 도움을 주신 덕분에 큰 어려움 없이 학습할 수 있었습니다. 또한 학과 활동만으로는 쉽게 접하기 어려운 해커톤과 여러 경진대회에 참여하며 협업 경험을 쌓을 수 있었던 점도 매우 만족스러웠습니다. 그 과정에서 만난 팀원들과 좋은 관계를 유지하며 이후에도 대회를 비롯한 다양한 프로젝트 활동에 함께 참여할 수 있었던 점이 인상 깊었습니다.",
        people: "13기 이O규 ",
      },
    ],
  },
  {
    title: "백엔드",
    titleColor: "text-[var(--green-1)]",
    summary: [
      {
        title: "백엔드 초보의 우당탕탕 성장기",
        content:
          "백엔드 노베이스로 시작해 막막함이 컸지만, 13기 멋사 활동을 통해 많이 달라졌습니다. 타 대학생들과 함께한 해커톤과 연합 프로젝트를 통해 다양한 기술 스택의 팀원들과 협업하며 실전 경험을 쌓을 수 있었고, 이제는 주도적으로 소통하며 프로젝트를 이끌 수 있게 되었습니다. 실전 프로젝트 경험과 인적 네트워크를 모두 얻은 의미 있는 시간이었습니다.",
        people: "13기 왕O휘",
      },
      {
        title: "어느새 풀스택을 바라보며!",
        content:
          "영어영문학과에서 컴퓨터공학부로 전과한 특이한 케이스지만, 수업에서 배우지 않는 다양한 것들을 직접 배우며 성장할 수 있었습니다! 여러 대회와 프로젝트를 통해 캡스톤에서 PM도 경험했고, 어느새 풀스택을 향해 나아가고 있었어요. 백엔드였지만 프론트 스터디까지 경험하며 시야를 넓힐 수 있었고, 낙오하지 않을 자신이 있다면 멋쟁이사자처럼에서 저처럼 직접 부딪히며 성장할 기회를 추천드립니다!",
        people: "13기 신O연",
      },
    ],
  },
];

type ReviewSummary = {
  summary: {
    title: string;
    content: string;
    people: string;
  }[];
};

function ReviewCards({ summary }: ReviewSummary) {
  return (
    <div className="flex w-full flex-col lg:flex-row gap-6 lg:gap-20">
      {summary.map((item) => (
        <div
          key={item.title}
          className="relative flex flex-1 basis-0 min-w-0 flex-col gap-1.75 lg:gap-4 border-gray-2 border-2 rounded-[10px] lg:rounded-[30px] py-5.75 lg:py-10.75 px-3.75 lg:px-8.75"
        >
          <div className="flex flex-col lg:flex-row gap-1.75 lg:gap-2.75 w-full items-center">
            <img
              className="w-10.5 h-9.75 lg:w-7.25 lg:h-6.75"
              src="/images/home/meotsam.png"
              alt="#"
            />
            <h4 className="text-[16px] lg:text-[clamp(12px,1.4vw,28px)] font-semibold text-main-1">
              {item.title}
            </h4>
          </div>
          <p className="text-gray-6 font-normal text-[14px] lg:text-base leading-[1.65] tracking-[-0.022em] break-keep">
            {item.content}
          </p>
          <p className="absolute text-[12px] lg:text-[16px] bottom-auto lg:bottom-3 top-2.75 lg:top-auto right-2.75 lg:right-8 text-gray-5">
            {item.people}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function ReviewSection() {
  return (
    <section className="relative bg-[#fafafa] pb-45 lg:pb-128.5 overflow-y-hidden scrollbar-hide">
      <div className="px-4.5 lg:px-[clamp(18px,12vw,392px)]">
        <h2 className="text-[22px] lg:text-[48px] font-semibold leading-[1.27] text-center text-background mb-8.5 lg:mb-34.75">
          삼육멋사 <span className="text-main-3">13기</span> <br />
          아기사자들의 생생한 후기
        </h2>
        <div className="flex flex-col gap-15 lg:gap-18.25 items-center">
          {reviews.map((review) => (
            <div
              className="flex flex-col w-full gap-2.25 lg:gap-8"
              key={review.title}
            >
              <h3
                className={`text-[18px] lg:text-[32px] font-bold ${review.titleColor}`}
              >
                {review.title}
              </h3>
              <ReviewCards summary={review.summary} />
            </div>
          ))}
        </div>
      </div>
      <div className="absolute left-1/2 bottom-0 h-[200vw] w-[200vw] -translate-x-1/2 translate-y-13/14 rounded-full bg-[#262529]" />
    </section>
  );
}
