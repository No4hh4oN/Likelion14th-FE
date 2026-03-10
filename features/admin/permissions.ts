import type { MeResponse } from "@/features/public/type";

export function canManageApplicantDecisions(profile: MeResponse) {
  return (
    profile.sso.ssoRole === "ADMIN" ||
    profile.roles.some(
      (role) =>
        role.level === "ADMIN" ||
        role.position === "PRESIDENT" ||
        role.position === "VICE_PRESIDENT",
    )
  );
}
