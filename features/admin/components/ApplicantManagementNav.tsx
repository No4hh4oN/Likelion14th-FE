"use client";

import Link from "next/link";
import {
  APPLICANT_MANAGEMENT_NAV_ORDER,
  buildApplicantManagementHref,
  getApplicantManagementViewMeta,
  type AdminApplicantListView,
  type ExtendedAdminApplicationStatus,
} from "../applicantManagement";
import type { AdminApplyPart } from "../type";

type ApplicantManagementNavProps = {
  activeView: AdminApplicantListView;
  recruitmentId?: number | null;
  part?: "ALL" | AdminApplyPart | null;
  status?: "ALL" | ExtendedAdminApplicationStatus | null;
};

export default function ApplicantManagementNav({
  activeView,
  recruitmentId,
  part,
  status,
}: ApplicantManagementNavProps) {
  return (
    <aside className="rounded-2xl border border-[#3a3d45] bg-[#26282d] p-4">
      <p className="text-xs font-semibold text-gray-4">목록</p>
      <div className="mt-4 space-y-2">
        {APPLICANT_MANAGEMENT_NAV_ORDER.map((view) => {
          const meta = getApplicantManagementViewMeta(view);
          const isActive = view === activeView;

          return (
            <Link
              key={view}
              href={buildApplicantManagementHref(view, {
                recruitmentId,
                part,
                status,
              })}
              className={`block rounded-lg px-3 py-2 text-left text-[17px] transition-colors ${
                isActive
                  ? "border-l-2 border-main-1 bg-[#2f323a] text-white"
                  : "text-gray-4"
              }`}
            >
              {meta.label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
