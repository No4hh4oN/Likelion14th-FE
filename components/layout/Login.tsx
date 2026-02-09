"use client"

import Link from "next/link"

export default function Login() {
    return (
        <Link
            href="/login"
            className="px-5 py-3.5 inline-flex items-center rounded-full bg-white text-2xl font-bold text-main-1"
        >
            로그인 / 회원가입
        </Link>
    )
}
