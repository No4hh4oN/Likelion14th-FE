"use client"

import Image from "next/image"
import Link from "next/link"
import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { login } from "@/features/public/api"

export default function LoginPageFeature() {
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
        <div className="relative mx-auto mt-27 w-full max-w-4xl pt-28">
            <Image
                className="pointer-events-none absolute left-1/2 top-20 z-0 -translate-x-1/2 -translate-y-1/2"
                src="/images/authLion.webp"
                alt="authLion"
                width={164}
                height={216}
                priority
            />

            <section className="relative h-[calc(100vh-220px)] z-10 rounded-t-[225px] bg-[linear-gradient(180deg,#484D5A_-23.29%,#303136_46.27%)] px-4 pt-16 pb-9">
                <form onSubmit={handleSubmit} className="space-y-4 flex flex-col justify-center items-center">
                    <div className="w-52 h-52 flex justify-center items-center justify-self-center bg-foreground rounded-full p-6">
                        <Image
                            src="/images/syuLikelion.webp"
                            alt="LIKELION 14TH"
                            width={197}
                            height={197}
                            priority
                        />
                    </div>

                    <label className="block">
                        <span className="mb-2 block text-xl font-bold text-foreground">ID</span>
                        <input
                            type="text"
                            value={loginId}
                            onChange={(event) => setLoginId(event.target.value)}
                            required
                            placeholder="아이디를 입력해 주세요."
                            className="h-20 w-[488px] rounded-2xl border border-[#484d5a] bg-gray-6 text-gray-4 px-6 text-xl outline-none"
                        />
                    </label>

                    <label className="block">
                        <span className="mb-2 block text-xl font-bold text-foreground">PASSWORD</span>
                        <input
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                            placeholder="비밀번호를 입력해 주세요."
                            className="h-20 w-[488px] rounded-2xl border border-[#484d5a] bg-gray-6 text-gray-4 px-6 text-xl outline-none"
                        />
                    </label>

                    {errorMessage ? <p className="text-sm text-[#ff9b43]">{errorMessage}</p> : null}

                    <div className="flex items-center justify-center gap-2 text-base font-normal text-gray-2">
                        <Link
                            href="/findid">
                            아이디 찾기
                        </Link>
                        |
                        <Link
                            href="/findpw">
                            비밀번호 재설정
                        </Link>
                        |
                        <Link
                            href="/signup"
                        >
                            회원가입
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex h-11 w-auto mt-8 rounded-full items-center justify-center bg-[#0b7de2] text-2xl font-bold text-white px-10 py-3 disabled:opacity-50"
                    >
                        {isSubmitting ? "WAIT..." : "LOGIN"}
                    </button>
                </form>
            </section>
        </div>
    )
}
