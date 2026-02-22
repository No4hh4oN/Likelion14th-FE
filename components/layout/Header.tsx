"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import Sidebar from "@/components/layout/Sidebar"
import Login from "@/components/layout/Login"
import UserInfo from "@/components/layout/UserInfo"
import { getMyInfo } from "@/features/public/api"
import type { MeResponse } from "@/features/public/type"
import { AUTH_CHANGED_EVENT } from "@/lib/axios"

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [me, setMe] = useState<MeResponse | null>(null)

    const checkAuth = useCallback(async () => {
        try {
            const response = await getMyInfo()
            setMe(response)
        } catch {
            setMe(null)
        }
    }, [])

    useEffect(() => {
        queueMicrotask(() => {
            void checkAuth()
        })
    }, [checkAuth])

    useEffect(() => {
        const handleAuthChanged = () => {
            checkAuth()
        }

        window.addEventListener(AUTH_CHANGED_EVENT, handleAuthChanged)
        return () => {
            window.removeEventListener(AUTH_CHANGED_EVENT, handleAuthChanged)
        }
    }, [checkAuth])

    useEffect(() => {
        if (isMenuOpen) {
            queueMicrotask(() => {
                void checkAuth()
            })
        }
    }, [isMenuOpen, checkAuth])

    const authSection = me ? (
        <UserInfo
            name={me.homepage.name}
            profileImageUrl={me.homepage.profileImage?.url ?? me.homepage.profileImageUrl ?? undefined}
            generation={me.roles[0]?.generation}
            role={me.roles[0]?.level}
            track={me.roles[0]?.track}
            onLoggedOut={() => setMe(null)}
        />
    ) : (
        <Login />
    )

    return (
        <>
            <header className="fixed top-0 w-full bg-[#262529] z-30">
                <div className="mx-auto flex h-16 w-full max-w-[1168px] items-center justify-between px-4">
                    <Link href="/" className="flex items-center">
                        <Image
                            src="/images/Logo.webp"
                            alt="LIKELION 14TH"
                            width={139}
                            height={30}
                            priority
                        />
                    </Link>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            aria-label="Open menu"
                            aria-expanded={isMenuOpen}
                            onClick={() => setIsMenuOpen(true)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-none cursor-pointer"
                        >
                            <span className="sr-only">Open menu</span>
                            <Image
                                src="/images/hamburgerIcon.webp"
                                alt=""
                                width={49}
                                height={49}
                                priority
                            />
                        </button>
                    </div>
                </div>
            </header>

            <Sidebar
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                authSection={authSection}
            />
        </>
    )
}
