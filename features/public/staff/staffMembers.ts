export type StaffMember = {
  teamLabel: string;
  desktopTitle: string;
  mainPart?: string;
  subParts: string[];
  name: string;
  studentInfo: string;
  majors?: string[];
  contact: string;
  previewCareer: string[];
  career: string[];
  projects?: string[];
  quote: string;
  quoteMobile?: string;
  imageSrc: string;
};

export const STAFF_MEMBERS: StaffMember[] = [
  {
    teamLabel: "LEADER",
    desktopTitle: "대표",
    mainPart: "LEADER",
    subParts: ["BACK-END", "AI / ML"],
    name: "구교승",
    studentInfo: "컴퓨터공학부 24학번",
    majors: ["컴퓨터공학부 (2024~)", "동물자원과학과(2026~)"],
    contact: "gyoseung@syu-likelion.org",
    previewCareer: [
      "멋쟁이사자처럼 12기 아기사자",
      "멋쟁이사자처럼 13기 대표",
      "멋쟁이사자처럼 14기 대표",
      "GDGoC SYU Team Member",
    ],
    career: [
      "멋쟁이사자처럼 12기 아기사자",
      "멋쟁이사자처럼 13기 대표",
      "멋쟁이사자처럼 14기 대표",
      "GDGoC SYU Team Member (2024~)",
    ],
    projects: [
      "2024 멋쟁이사자처럼 대학연합 해커톤 '간지톤' 최우수상",
      "2025 삼육대학교 SW프로젝트 경진대회 우수상",
      "삼육대학교 개교 119주년 천보축제 홈페이지 백엔드 개발",
    ],
    quote: "개발보다는 고양이발",
    imageSrc: "/images/staff/구교승.png",
  },
  {
    teamLabel: "PM / DESIGN",
    desktopTitle: "기획 / 디자인 트랙장",
    subParts: ["PM / DESIGN"],
    name: "임나현",
    studentInfo: "아트앤디자인학과 23학번",
    contact: "nh201100@syu-likelion.org",
    previewCareer: [
      "멋쟁이사자처럼 13기 아기사자",
      "멋쟁이사자처럼 14기 기획/디자인 트랙장",
      "아트앤디자인학과 3D디자인 취업동아리 부원",
    ],
    career: [
      "멋쟁이사자처럼 13기 아기사자",
      "멋쟁이사자처럼 14기 기획/디자인 트랙장",
      "아트앤디자인학과 3D디자인 취업동아리 부원",
      "2025년 평균 학점 4.5",
    ],
    projects: [
      "삼육대학교 개교 119주년 천보축제 홈페이지 백엔드 개발",
      "2025 경기도 브랜드 홍보 콘텐츠 공모전 숏폼부분 장려상",
      "멋쟁이사자처럼 at SYU 14th 홈페이지 제작",
    ],
    quote: "우리 디자인 정상영업 합니다.",
    imageSrc: "/images/staff/임나현.png",
  },
  {
    teamLabel: "PM / DESIGN",
    desktopTitle: "기획 / 디자인 운영진",
    subParts: ["PM / DESIGN"],
    name: "윤혜원",
    studentInfo: "아트앤디자인학과 24학번",
    contact: "you_stem1022@syu-likelion.org",
    previewCareer: [
      "멋쟁이사자처럼 13기 아기사자",
      "멋쟁이사자처럼 14기 기획/디자인 운영진",
      "아트앤디자인학과 UXUI 취업동아리 'U&I' 부원",
    ],
    career: [
      "멋쟁이사자처럼 13기 아기사자",
      "멋쟁이사자처럼 14기 기획/디자인 운영진",
      "아트앤디자인학과 UXUI 취업동아리 'U&I' 부원",
      "3학기째 전공 학점 4.5 유지 중",
    ],
    projects: [
      "2025 삼육대학교 SW프로젝트 경진대회 우수상",
      "2025 관광데이터 공모전 1차 합격",
      "멋쟁이사자처럼 at SYU 14th 홈페이지 제작",
    ],
    quote: "Design과 Death의 앞글자가 같은 건 우연일까요?",
    quoteMobile: "Design과 Death의\n앞글자가 같은 건 우연일까요?",
    imageSrc: "/images/staff/윤혜원.png",
  },
  {
    teamLabel: "PM / DESIGN",
    desktopTitle: "기획 / 디자인 운영진",
    subParts: ["PM / DESIGN"],
    name: "한우영",
    studentInfo: "아트앤디자인학과 23학번",
    contact: "wooyoung0423@syu-likelion.org",
    previewCareer: [
      "멋쟁이사자처럼 14기 기획/디자인 운영진",
      "120주년 불암산 소책자 '제명호의 동물들' 편집팀장",
      "학점 나쁘지 않음",
    ],
    career: [
      "멋쟁이사자처럼 14기 기획/디자인 운영진",
      "120주년 불암산 소책자 '제명호의 동물들' 편집팀장",
      "학점 나쁘지 않음",
    ],
    projects: [
      "삼육대학교 120주년 불암산 소책자 '제명호의 동물들' 총편집",
      "동물자원과학과 동물행동과학연구실 로고 제작",
      "멋쟁이사자처럼 at SYU 14th 홈페이지 제작",
    ],
    quote: "살자, 제발",
    imageSrc: "/images/staff/한우영.png",
  },
  {
    teamLabel: "FRONT-END",
    desktopTitle: "프론트엔드 트랙장",
    subParts: ["FRONT-END"],
    name: "이영규",
    studentInfo: "데이터클라우드공학과 24학번",
    contact: "iyeong@syu-likelion.org",
    previewCareer: [
      "멋쟁이사자처럼 13기 아기사자",
      "멋쟁이사자처럼 14기 프론트엔드 트랙장",
    ],
    career: [
      "멋쟁이사자처럼 13기 아기사자",
      "멋쟁이사자처럼 14기 프론트엔드 트랙장",
    ],
    projects: [
      "2024 삼육대학교 SW프로젝트 경진대회 최우수상",
      "2025 대학연합 해커톤 '간지톤' TOP6",
    ],
    quote: "롱패딩 보다 짧은건 int패딩",
    imageSrc: "/images/staff/이영규.png",
  },
  {
    teamLabel: "FRONT-END",
    desktopTitle: "프론트엔드 운영진",
    subParts: ["FRONT-END"],
    name: "박정우",
    studentInfo: "컴퓨터공학부 21학번",
    contact: "joungou.park@syu-likelion.org",
    previewCareer: [
      "멋쟁이사자처럼 10기 아기사자",
      "멋쟁이사자처럼 13기 아기사자",
      "2025 컴퓨터공학부 학회",
      "멋쟁이사자처럼 14기 운영진",
    ],
    career: [
      "선린인터넷고등학교 IWOP 20,21기 운영진",
      "멋쟁이사자처럼 10기 아기사자",
      "멋쟁이사자처럼 13기 아기사자",
      "2025 컴퓨터공학부 학회",
      "멋쟁이사자처럼 14기 운영진",
    ],
    projects: [
      "서강대 게임 아이디어 공모전 장려상",
      "MSW 해커톤 척척박사상",
      "2025 삼육대학교 SW프로젝트 경진대회 최우수상",
      "멋쟁이사자처럼 at SYU 14th 홈페이지 제작",
    ],
    quote: "탐사, 이해, 수립, 연결",
    imageSrc: "/images/staff/박정우.png",
  },
  {
    teamLabel: "FRONT-END",
    desktopTitle: "프론트엔드 운영진",
    subParts: ["FRONT-END"],
    name: "김성수",
    studentInfo: "컴퓨터공학부 21학번",
    contact: "seongsu@syu-likelion.org",
    previewCareer: [
      "GDGoC SYU Team Member",
      "카카오 유니브 미르미 3기",
      "카카오 유니브 미르미 4기 운영진",
      "멋쟁이사자처럼 14기 운영진",
    ],
    career: [
      "GDG 2024년 3월 ~ 2025년 9월 [세션 진행]",
      "카카오 유니브 2024년 6월 ~ 12월 [미르미] - 3기",
      "2025년 2월 ~ 12월 [운영진] - 4기",
      "멋쟁이사자처럼 13기 아기사자",
      "멋쟁이사자처럼 14기 운영진",
      "오픈소스 기여모임 참여",
    ],
    projects: [
      "오픈소스 컨트리뷰터",
      "-> toss suspensive / toss granite",
      "다수의 해커톤 출전 경험",
      "1년 동안 2k Github contributions",
    ],
    quote: "빡세게 굴려드립니다 ^^",
    imageSrc: "/images/staff/김성수.png",
  },
  {
    teamLabel: "BACK-END",
    desktopTitle: "백엔드 트랙장",
    subParts: ["BACK-END"],
    name: "왕종휘",
    studentInfo: "컴퓨터공학부 22학번",
    contact: "kingbell@syu-likelion.org",
    previewCareer: [
      "멋쟁이사자처럼 13기 아기사자",
      "멋쟁이사자처럼 14기 백엔드 트랙장",
    ],
    career: [
      "멋쟁이사자처럼 13기 아기사자",
      "멋쟁이사자처럼 14기 백엔드 트랙장",
    ],
    projects: [
      "2025 삼육대학교 SW프로젝트 경진대회 최우수상",
      "2025 대학연합 해커톤 '간지톤' TOP6",
      "멋쟁이사자처럼 at SYU 14th 홈페이지 제작",
    ],
    quote: "서버는 200 OK, 건강은 500 Error",
    imageSrc: "/images/staff/왕종휘.png",
  },
  {
    teamLabel: "BACK-END",
    desktopTitle: "백엔드 운영진",
    subParts: ["BACK-END"],
    name: "신가연",
    studentInfo: "컴퓨터공학부 22학번",
    contact: "9ay20n@syu-likelion.org",
    previewCareer: [
      "멋쟁이사자처럼 13기 아기사자",
      "멋쟁이사자처럼 14시 중앙 운영단",
      "제64대 총학생회비상대책위원회 대외협력국 국장",
    ],
    career: [
      "멋쟁이사자처럼 13기 아기사자",
      "멋쟁이사자처럼 14기 백엔드 운영진",
      "멋쟁이사자처럼 14시 중앙 운영단",
      "제64대 총학생회비상대책위원회 대외협력국 국장",
      "직전학기 평균 평점 4.43",
    ],
    projects: [
      "2025 삼육대학교 SW프로젝트 경진대회 우수상",
      "2025 한이음 프로젝트 AI 활용 수학문제 개발",
      "2025 캡스톤 디자인 PM",
      "2024 천보축전 기획 및 총장네컷 디자인",
    ],
    quote: "뒤(BACK)끝(END) 맡고 있습니다.",
    imageSrc: "/images/staff/신가연.png",
  },
  {
    teamLabel: "BACK-END",
    desktopTitle: "백엔드 운영진",
    subParts: ["BACK-END"],
    name: "이찬영",
    studentInfo: "컴퓨터공학부 25학번",
    contact: "chan0@syu-likelion.org",
    previewCareer: [
      "멋쟁이사자처럼 13기 아기사자",
      "멋쟁이사자처럼 14기 백엔드 운영진",
    ],
    career: [
      "멋쟁이사자처럼 13기 아기사자",
      "멋쟁이사자처럼 14기 백엔드 운영진",
    ],
    projects: [
      "2025 삼육대학교 SW프로젝트 경진대회 우수상",
      "2025 멋쟁이사자처럼 해커톤 백엔드 개발",
    ],
    quote: "여긴 어디 나는 누구",
    imageSrc: "/images/staff/이찬영.png",
  },
  {
    teamLabel: "AI / ML",
    desktopTitle: "AI / ML 트랙장",
    subParts: ["AI / ML"],
    name: "오현학",
    studentInfo: "컴퓨터공학부 23학번",
    majors: ["컴퓨터공학부 (2023~)", "인공지능융합학부"],
    contact: "mhyunhak@syu-likelion.org",
    previewCareer: [
      "멋쟁이사자처럼 13기 아기사자",
      "멋쟁이사자처럼 14기 AI / ML 트랙장",
      "GDGoC SYU Team Member",
    ],
    career: [
      "멋쟁이사자처럼 13기 아기사자",
      "멋쟁이사자처럼 14기 AI / ML 트랙장",
      "GDGoC SYU Team Member (2025~)",
    ],
    projects: [
      "Drone Payload Classification (개인 Role: ML Engineer)",
      "Stack: Python, PyTorch, Librosa, Mel-Spectrogram, CNN",
      "What I did: 오디오 전처리·세그먼트화, 커스텀 Dataset/Loader, 피처 설계/정규화 실험",
    ],
    quote: "안되면 거기까지",
    imageSrc: "/images/staff/오현학.png",
  },
  {
    teamLabel: "AI / ML",
    desktopTitle: "AI / ML 운영진",
    subParts: ["AI / ML"],
    name: "김지연",
    studentInfo: "인공지능융합학부 22학번",
    contact: "jiyeon@syu-likelion.org",
    previewCareer: [
      "멋쟁이사자처럼 11기 아기사자",
      "멋쟁이사자처럼 12기 운영진",
      "멋쟁이사자처럼 13기 운영진",
      "멋쟁이사자처럼 14기 부대표",
    ],
    career: [
      "멋쟁이사자처럼 11기 아기사자",
      "멋쟁이사자처럼 12기 운영진",
      "멋쟁이사자처럼 13기 운영진",
      "멋쟁이사자처럼 14기 부대표",
    ],
    quote: "운영만 합니다.",
    imageSrc: "/images/staff/김지연.png",
  },
];
