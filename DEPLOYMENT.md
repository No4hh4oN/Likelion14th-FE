# 배포 가이드

이 프로젝트는 admin 동적 라우트와 인증 기반 화면을 사용하므로 더 이상 `out/` 정적 export 방식으로 배포하지 않습니다. 백엔드팀에 전달하는 기본 산출물은 Next.js standalone 서버 번들입니다.

## 정적 HTML 산출물이 없는 이유

`frontend-standalone.zip`은 정적 사이트 산출물이 아니므로 `index.html` 파일이 없는 것이 정상입니다. 압축 파일의 진입점은 HTML 파일이 아니라 `server.js`입니다.

Next.js standalone 번들은 요청이 들어올 때 `server.js`가 라우트별 HTML과 정적 자산을 처리합니다. 따라서 백엔드 통합 배포에서는 압축을 푼 뒤 Node 프로세스로 `server.js`를 실행하고, reverse proxy가 브라우저 요청을 Next.js 프론트 서버로 전달해야 합니다.

## 배포 산출물 만들기

```powershell
npm ci
npm.cmd run build
npm run package:standalone
```

패키징 스크립트는 다음 파일을 `release/frontend-standalone.zip`으로 묶습니다.

- `.next/standalone`
- `.next/static`
- `public`

## admin 라우트 기준

- 실제 지원자 관리 기준 경로는 `/admin/applications/**`입니다.
- 기존 호환을 위해 `/admin/applicants/**`는 유지하며, 유효한 지원서 ID는 `/admin/applications/{applicationId}`로 redirect합니다.

## 백엔드팀 실행 방식

압축을 해제한 디렉터리에서 다음 명령으로 Next.js 서버를 실행합니다.

```bash
PORT=3000 HOSTNAME=0.0.0.0 node server.js
```

Windows PowerShell에서는 다음처럼 실행할 수 있습니다.

```powershell
$env:PORT="3000"
$env:HOSTNAME="0.0.0.0"
node server.js
```

## API 프록시 계약

production 통합 배포의 기본 계약은 다음과 같습니다.

```env
NEXT_PUBLIC_API_BASE_URL=/api
```

백엔드 reverse proxy는 요청 경로를 아래처럼 분리합니다.

```text
/api/*  -> 백엔드 API 서버
/*      -> Next.js 프론트 서버
```

프론트 서버는 HTML, Next.js 동적 라우트, 정적 자산을 처리하고, `/api` 요청은 백엔드 서버가 처리합니다.

## 확인 항목

- `npm.cmd run build`가 성공해야 합니다.
- `npm run package:standalone` 실행 후 `release/frontend-standalone.zip`이 생성되어야 합니다.
- 압축 해제 후 `node server.js`로 `/admin`, `/admin/applications`, admin 동적 상세 라우트에 접근할 수 있어야 합니다.
- 브라우저 네트워크 탭에서 API 요청이 `/api/...`로 나가는지 확인합니다.
