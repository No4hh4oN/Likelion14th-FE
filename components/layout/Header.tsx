"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <>
            <header className="w-full bg-[#262529]">
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

            <>
                <button
                    type="button"
                    aria-label="Close menu"
                    onClick={() => setIsMenuOpen(false)}
                    className={`fixed inset-0 z-40 cursor-default bg-black/20 transition-opacity duration-500 ${isMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
                        }`}
                />
                <aside
                    className={`fixed right-0 top-0 z-50 h-full w-[450px] bg-[#303136] shadow-xl transition-transform duration-500 ease-out ${isMenuOpen ? "translate-x-0" : "translate-x-full"
                        }`}
                    role="dialog"
                    aria-modal="true"
                    aria-hidden={!isMenuOpen}
                >
                    <div className="flex h-16 items-center justify-end px-4">
                        <button
                            type="button"
                            aria-label="Close menu"
                            onClick={() => setIsMenuOpen(false)}
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
                    <div className="p-4">
                        {/* menu content */}
                    </div>
                </aside>
            </>
        </>
    )
}
