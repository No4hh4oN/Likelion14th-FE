# Admin API 후속 요청

이 문서는 admin 배포/안정화 1차 마일스톤에서 즉시 구현하지 않고 백엔드 API 협의가 필요한 항목을 모아둡니다. 현재 프론트 구현은 `api-docs.json` 명세를 기준으로 유지합니다.

## 지원자/면접 평가 상태 필터

현재 프론트는 목록 페이지에 표시된 지원자마다 아래 API를 추가 호출해 "내 평가 완료/미평가"를 판별합니다.

- `GET /api/admin/applications/{applicationId}/document-scores/me`
- `GET /api/admin/interviews/{applicationId}/score/me`

이 방식은 현재 페이지 항목에만 적용되므로 전체 페이지네이션의 `totalElements`와 필터링된 화면 결과가 다를 수 있고, 페이지당 N개의 추가 요청이 발생합니다.

백엔드에 요청할 수 있는 개선 방향은 다음 중 하나입니다.

- 지원자/면접 목록 응답 item에 `myScoreExists` 같은 내 평가 여부 필드를 포함합니다.
- 목록 API query에 `evaluation=REVIEWED | NOT_REVIEWED` 필터를 추가해 서버 페이지네이션 기준으로 필터링합니다.
- 여러 applicationId를 받아 내 평가 여부를 한 번에 반환하는 batch API를 추가합니다.

## admin 목록 검색/필터

사용자 관리 화면은 현재 `/api/admin/users` 전체 응답을 받은 뒤 클라이언트에서 학과, 레벨, 정렬을 처리합니다. 사용자 수가 늘어나면 서버 검색/필터 API가 필요합니다.

백엔드에 요청할 수 있는 개선 방향은 다음과 같습니다.

- `/api/admin/users/search` 명세를 기준으로 프론트에서 사용할 query 파라미터와 응답 pagination shape를 확정합니다.
- 학과, 레벨, 정렬, 페이지네이션을 서버 기준으로 처리합니다.
