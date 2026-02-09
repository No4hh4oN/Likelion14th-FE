"use client"

import Image from "next/image"
import type { MouseEvent, ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

type SidebarProps = {
    isOpen: boolean
    onClose: () => void
    authSection?: ReactNode
}

export default function Sidebar({ isOpen, onClose, authSection }: SidebarProps) {
    const pathname = usePathname()
    const menus = [
        { label: "Main", href: "/" },
        { label: "About", href: "/about" },
        { label: "FAQ", href: "/faq" },
        { label: "Archive", href: "/archive" },
    ] as const

    const activeIndex = menus.findIndex((menu) =>
        menu.href === "/" ? pathname === "/" : pathname.startsWith(menu.href),
    )

    const handleActionClickCapture = (event: MouseEvent<HTMLElement>) => {
        const target = event.target
        if (!(target instanceof HTMLElement)) {
            return
        }

        if (target.closest("a, button")) {
            onClose()
        }
    }

    return (
        <>
            <button
                type="button"
                aria-label="Close menu"
                onClick={onClose}
                className={`fixed inset-0 z-40 cursor-default bg-black/20 transition-opacity duration-500 ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"
                    }`}
            />
            <aside
                className={`fixed right-0 top-0 z-50 h-full w-[412px] bg-[#303136] shadow-xl transition-transform duration-500 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"
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
