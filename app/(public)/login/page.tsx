"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { login } from "@/features/public/api"

export default function LoginPage() {
    const router = useRouter()
    const [loginId, setLoginId] = useState("")
    const [password, setPassword] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setErrorMessage("")
        setIsSubmitting(true)

        try {
            await login({ loginId, password })
            router.push("/")
            router.refresh()
        } catch {
            setErrorMessage("아이디 또는 비밀번호를 확인해주세요.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <section className="mx-auto w-full max-w-md px-4 py-16">
            <h1 className="mb-8 text-2xl font-semibold text-gray-1">로그인</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block">
                    <span className="mb-2 block text-sm text-gray-3">아이디</span>
                    <input
                        type="text"
                        value={loginId}
                        onChange={(event) => setLoginId(event.target.value)}
                        required
                        className="h-11 w-full rounded-md border border-[#484d5a] bg-[#303136] px-3 text-sm text-gray-1 outline-none"
                    />
                </label>

                <label className="block">
                    <span className="mb-2 block text-sm text-gray-3">비밀번호</span>
                    <input
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                        className="h-11 w-full rounded-md border border-[#484d5a] bg-[#303136] px-3 text-sm text-gray-1 outline-none"
                    />
                </label>

                {errorMessage ? (
                    <p className="text-sm text-[#ff9b43]">{errorMessage}</p>
                ) : null}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex h-11 w-full items-center justify-center rounded-md bg-[#0b7de2] text-sm font-semibold text-white disabled:opacity-50"
                >
                    {isSubmitting ? "로그인 중..." : "로그인"}
                </button>
            </form>
        </section>
    )
}
