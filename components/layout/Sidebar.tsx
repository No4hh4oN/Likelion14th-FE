"use client"

import Image from "next/image"

type SidebarProps = {
    isOpen: boolean
    onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
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
                className={`fixed right-0 top-0 z-50 h-full w-[450px] bg-[#303136] shadow-xl transition-transform duration-500 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"
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
                <div className="p-4">
                    
                </div>
            </aside>
        </>
    )
}
