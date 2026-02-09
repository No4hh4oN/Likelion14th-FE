"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import Sidebar from "@/components/layout/Sidebar"

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

            <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        </>
    )
}
