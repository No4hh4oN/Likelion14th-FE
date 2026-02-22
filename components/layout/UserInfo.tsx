"use client"

import Link from "next/link"
import { useState } from "react"
import { logout } from "@/features/public/api"

type UserInfoProps = {
    name: string
    generation?: number
    role?: string
    track?: string
    onLoggedOut?: () => void
}

function getRoleLabel(role?: string): string {
    if (!role) {
        return "게스트"
    }

    switch (role) {
        case "STAFF":
            return "운영진"
        case "BABY_LION":
            return "아기사자"
        case "OUTSIDER":
            return "게스트"
        default:
            return role
    }
}

export default function UserInfo({
    name,
    generation,
    role,
    track,
    onLoggedOut,
}: UserInfoProps) {
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    const roleLabel = getRoleLabel(role)
    const generationRoleText = generation !== undefined ? `${generation}기 ${roleLabel}` : roleLabel
    const trackText = track ?? ""
    const isStaff = role === "STAFF"
    const rolePageLabel = isStaff ? "운영진 페이지" : "아기사자 페이지"
    const rolePageHref = isStaff ? "/admin" : "/14/home"

    const handleLogout = async () => {
        if (isLoggingOut) {
            return
        }

        setIsLoggingOut(true)

        try {
            await logout()
            onLoggedOut?.()
        } finally {
            setIsLoggingOut(false)
        }
    }

    return (
        <>
            <div className="rounded-md bg-gray-6 px-3.5 pb-3.5 pt-7">
                <div className="flex items-start justify-start px-3.5">
                    <p className="ml-3.5 h-20 w-20 rounded-full bg-amber-300">img</p>
                    <div className="ml-5 self-center">
                        <p className="text-2xl font-bold text-white">
                            {name}
                            <span className="text-xl font-medium">님</span>
                        </p>
                        <p className="text-xs text-gray-4">{generationRoleText}</p>
                    </div>
                    {trackText ? (
                        <span className="ml-7 rounded-4xl border bg-transparent px-2 py-1 text-sm text-gray-1">
                            {trackText}
                        </span>
                    ) : null}
                </div>
                <div className="mt-4 flex w-full justify-center gap-4">
                    <button type="button" className="h-12 w-full rounded-md bg-gray-5">
                        마이페이지
                    </button>
                    <Link
                        href={rolePageHref}
                        className="inline-flex h-12 w-full items-center justify-center rounded-md bg-gray-5"
                    >
                        {rolePageLabel}
                    </Link>
                </div>
            </div>
            <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="mt-2 flex w-full justify-end text-sm text-gray-3 disabled:opacity-60"
            >
                {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
            </button>
        </>
    )
}
