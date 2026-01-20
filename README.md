# LIKELION 14TH – Frontend Repository

멋쟁이사자처럼 14기 신입 부원 모집 및 운영을 위한 프론트엔드 레포지토리입니다.

---

## Deployment

* Production: [https://syu-likelion.org](https://syu-likelion.org)
* Admin: [https://syu-likelion.org/admin](https://syu-likelion.org/admin)

---

## Tech Stack

* Framework: Next.js (App Router)
* Language: TypeScript
* UI: React, Global CSS
* Data Fetching: Axios (Instance + Interceptor)
* Collaboration: GitHub, Figma

---

## Project Structure

```bash
app/                # Next.js App Router (Routing & Layout)
├─ (public)/        # 공개 페이지 (모집, 소개 등)
├─ admin/           # 관리자 페이지
└─ api/             # 서버 API Route

features/           # 도메인/기능 단위 모듈
├─ public/
└─ admin/

components/         # 공통 컴포넌트
├─ ui/              # Button, Modal 등 재사용 UI
└─ layout/          # Header, Footer 등 레이아웃 컴포넌트

lib/                # 공통 유틸, axios, auth 로직
styles/             # 글로벌 스타일
types/              # 전역 타입 정의
public/             # 정적 자원 (images, fonts)
```

### Structure Policy

* app 디렉토리는 라우팅과 레이아웃만 담당합니다.
* 실제 비즈니스 로직은 features 단위로 분리합니다.
* 재사용 가능한 UI는 components/ui에 위치시킵니다.

---

## Getting Started

```bash
npm install
npm run dev
```

---

## Collaboration Rule

### Branch Strategy

* main: 배포 브랜치
* dev: 개발 브랜치
* feat/#: 이슈별 작업 브랜치

예시:

* feat/#45

---

## Admin Page

* 인증 미들웨어를 통해 접근 제어를 적용할 예정입니다.
* 모집 관리 및 지원자 관리 기능을 제공합니다.

---

## Contributors

* Frontend: 장준익, 박정우