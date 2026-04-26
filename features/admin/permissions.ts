import type { MeResponse, UserRole } from "@/features/public/type";

/**
 * admin 접근을 허용하는 role level 값 목록입니다.
 */
const ADMIN_ACCESS_LEVELS = new Set([
  "STAFF",
  "ADMIN",
  "ROLE_STAFF",
  "ROLE_ADMIN",
]);

/**
 * 지원자 합격 처리 권한을 부여하는 role level 값 목록입니다.
 */
const APPLICANT_DECISION_LEVELS = new Set(["ADMIN", "ROLE_ADMIN"]);

/**
 * 지원자 합격 처리 권한을 부여하는 운영진 position 값 목록입니다.
 */
const APPLICANT_DECISION_POSITIONS = new Set([
  "PRESIDENT",
  "VICE_PRESIDENT",
]);

/**
 * 권한 비교에 사용할 문자열을 대소문자와 공백에 영향받지 않는 형태로 정규화합니다.
 *
 * @param value API에서 받은 role, position, ssoRole 원본 값
 * @returns 권한 비교용 대문자 문자열
 */
function normalizePermissionValue(value?: string | null): string {
  return (value ?? "").trim().toUpperCase();
}

/**
 * SSO 관리자 권한인지 확인합니다.
 *
 * @param profile 로그인한 사용자 프로필
 * @returns SSO 권한이 admin 계열이면 true
 */
function hasSsoAdminRole(profile: MeResponse): boolean {
  const ssoRole = normalizePermissionValue(profile.sso.ssoRole);
  return ssoRole === "ADMIN" || ssoRole === "ROLE_ADMIN";
}

/**
 * 단일 role이 admin 페이지 접근 권한을 가지는지 확인합니다.
 *
 * @param role 사용자에게 부여된 홈페이지 role
 * @returns admin 접근 가능한 role이면 true
 */
function hasAdminAccessRole(role: UserRole): boolean {
  return ADMIN_ACCESS_LEVELS.has(normalizePermissionValue(role.level));
}

/**
 * 단일 role이 지원자 합격 처리 권한을 가지는지 확인합니다.
 *
 * @param role 사용자에게 부여된 홈페이지 role
 * @returns 합격 처리 가능한 role 또는 position이면 true
 */
function hasApplicantDecisionRole(role: UserRole): boolean {
  return (
    APPLICANT_DECISION_LEVELS.has(normalizePermissionValue(role.level)) ||
    APPLICANT_DECISION_POSITIONS.has(normalizePermissionValue(role.position))
  );
}

/**
 * 사용자가 admin 페이지에 접근할 수 있는지 확인합니다.
 *
 * @param profile 로그인한 사용자 프로필
 * @returns admin 접근 권한이 있으면 true
 */
export function canAccessAdmin(profile: MeResponse): boolean {
  return hasSsoAdminRole(profile) || profile.roles.some(hasAdminAccessRole);
}

/**
 * 사용자가 지원자 서류/최종 합격 처리 액션을 실행할 수 있는지 확인합니다.
 *
 * @param profile 로그인한 사용자 프로필
 * @returns 합격 처리 권한이 있으면 true
 */
export function canManageApplicantDecisions(profile: MeResponse): boolean {
  return hasSsoAdminRole(profile) || profile.roles.some(hasApplicantDecisionRole);
}
