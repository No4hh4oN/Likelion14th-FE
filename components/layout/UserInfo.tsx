"use client"

import { useState } from "react"
import { logout } from "@/features/public/api"

type UserInfoProps = {
    name: string
    generation?: number
    role?: string
    track?: string
    onLoggedOut?: () => void
}

export default function UserInfo({
    name,
    generation,
    role,
    track,
    onLoggedOut,
}: UserInfoProps) {
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    const generationRoleText =
        generation !== undefined && role ? `${generation}기 ${role}` : role ?? "무소속"
    const trackText = track ?? "무소속"

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
                    <span className="ml-7 rounded-4xl border bg-transparent px-2 py-1 text-sm text-gray-1">
                        {trackText}
                    </span>
                </div>
                <div className="mt-4 flex w-full justify-center gap-4">
                    <button className="h-12 w-full rounded-md bg-gray-5">마이페이지</button>
                    <button className="h-12 w-full rounded-md bg-gray-5">아기사자 페이지</button>
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
