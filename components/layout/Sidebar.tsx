"use client"

import Image from "next/image"
import type { MouseEvent, ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

type SidebarProps = {
    isOpen: boolean
    onClose: () => void
    authSection?: ReactNode
}

export default function Sidebar({ isOpen, onClose, authSection }: SidebarProps) {
    const pathname = usePathname()
    const [currentHash, setCurrentHash] = useState("")
    const [isAboutActiveByScroll, setIsAboutActiveByScroll] = useState(false)
    const menus = [
        { label: "Main", href: "/" },
        { label: "About", href: "/#about" },
        { label: "FAQ", href: "/faq" },
    ] as const

    useEffect(() => {
        const syncHash = () => {
            setCurrentHash(window.location.hash)
        }

        syncHash()
        window.addEventListener("hashchange", syncHash)
        window.addEventListener("popstate", syncHash)

        return () => {
            window.removeEventListener("hashchange", syncHash)
            window.removeEventListener("popstate", syncHash)
        }
    }, [pathname, isOpen])

    useEffect(() => {
        if (!isOpen) {
            return
        }

        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = "hidden"

        return () => {
            document.body.style.overflow = previousOverflow
        }
    }, [isOpen])

    useEffect(() => {
        if (pathname !== "/") {
            return
        }

        const onScroll = () => {
            const aboutSection = document.getElementById("about")
            if (!aboutSection) {
                return
            }

            const aboutTop = aboutSection.getBoundingClientRect().top + window.scrollY
            const threshold = 120
            setIsAboutActiveByScroll(window.scrollY >= aboutTop - threshold)
        }

        onScroll()
        window.addEventListener("scroll", onScroll, { passive: true })

        return () => {
            window.removeEventListener("scroll", onScroll)
        }
    }, [pathname])

    const activeIndex = menus.findIndex((menu) => {
        if (menu.href === "/") {
            return pathname === "/" && currentHash !== "#about" && !isAboutActiveByScroll
        }

        if (menu.href === "/#about") {
            return pathname === "/" && (currentHash === "#about" || isAboutActiveByScroll)
        }

        return pathname.startsWith(menu.href)
    })

    const handleActionClickCapture = (event: MouseEvent<HTMLElement>) => {
        const target = event.target
        if (!(target instanceof HTMLElement)) {
            return
        }

        if (target.closest("a, button")) {
            onClose()
        }
    }

    const handleMenuClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
        if (href !== "/#about") {
            return
        }

        if (pathname !== "/") {
            return
        }

        const aboutSection = document.getElementById("about")
        if (!aboutSection) {
            return
        }

        event.preventDefault()
        const start = window.scrollY
        const target = aboutSection.getBoundingClientRect().top + window.scrollY
        const duration = 520
        let startTime: number | null = null
        const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

        const step = (now: number) => {
            if (startTime === null) {
                startTime = now
            }
            const elapsed = now - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = easeOutCubic(progress)
            window.scrollTo(0, start + (target - start) * eased)
            if (progress < 1) {
                window.requestAnimationFrame(step)
            }
        }

        window.requestAnimationFrame(step)
        window.history.replaceState(null, "", "/#about")
        setCurrentHash("#about")
    }

    return (
        <>
            <button
                type="button"
                aria-label="Close menu"
                onClick={onClose}
                className={`fixed left-0 top-0 z-40 h-dvh w-screen cursor-default bg-black/20 transition-opacity duration-500 ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"
                    }`}
            />
            <aside
                className={`fixed right-0 top-0 z-50 h-dvh w-[min(412px,100vw)] bg-[#303136] shadow-xl transition-transform duration-500 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
                role="dialog"
                aria-modal="true"
                aria-hidden={!isOpen}
            >
                <div className="flex h-16 items-center justify-end px-4">
                    <button
                        type="button"
                        aria-label="Close menu"
                        onClick={onClose}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-none cursor-pointer"
                    >
                        <Image
                            src="/images/closeButton.webp"
                            alt=""
                            width={44}
                            height={44}
                            priority
                        />
                    </button>
                </div>
                <div className="p-4" onClickCapture={handleActionClickCapture}>
                    <div>{authSection}</div>
                    <ul className="mt-8">
                        {menus.map((menu, index) => {
                            const isActive = index === activeIndex
                            const marginTop =
                                index === 0 ? "mt-0" : index - 1 === activeIndex || isActive ? "mt-[38px]" : "mt-[28px]"

                            return (
                                <li key={menu.href} className={marginTop}>
                                    <Link
                                        href={menu.href}
                                        onClick={(event) => handleMenuClick(event, menu.href)}
                                        className={`leading-none ${isActive ? "text-[32px] font-bold text-foreground" : "text-[24px] font-medium text-gray-3"}`}
                                    >
                                        {menu.label}
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            </aside>
        </>
    )
}
