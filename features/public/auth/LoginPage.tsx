"use client"

import Image from "next/image"
import Link from "next/link"
import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { login } from "@/features/public/api"

const REMEMBER_LOGIN_ID_KEY = "rememberLoginId"

export default function LoginPageFeature() {
    const router = useRouter()
    const [loginId, setLoginId] = useState("")
    const [password, setPassword] = useState("")
    const [rememberLoginInfo, setRememberLoginInfo] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const authInputClass =
        "h-12.5 w-80.75 rounded-[14px] border border-[#484d5a] bg-gray-6 px-6 text-base text-gray-4 outline-none md:h-20 md:w-122 md:rounded-2xl md:text-xl"

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setErrorMessage("")
        setIsSubmitting(true)

        try {
            await login({ loginId, password })
            router.push("/")
            router.refresh()
        } catch {
            setErrorMessage("아이디 또는 비밀번호를 확인해 주세요.")
        } finally {
            setIsSubmitting(false)
        }
    }

    useEffect(() => {
        const savedLoginId = window.localStorage.getItem(REMEMBER_LOGIN_ID_KEY)
        if (!savedLoginId) {
            return
        }

        setLoginId(savedLoginId)
        setRememberLoginInfo(true)
    }, [])

    useEffect(() => {
        if (rememberLoginInfo) {
            window.localStorage.setItem(REMEMBER_LOGIN_ID_KEY, loginId)
            return
        }

        window.localStorage.removeItem(REMEMBER_LOGIN_ID_KEY)
    }, [loginId, rememberLoginInfo])

    return (
        <div className="relative mx-auto mt-27 w-full max-w-4xl pt-28">
            <Image
                className="pointer-events-none absolute left-1/2 top-20 z-0 h-[108px] w-[82px] -translate-x-1/2 -translate-y-1/2 md:h-[216px] md:w-[164px]"
                src="/images/authLion.webp"
                alt="authLion"
                width={164}
                height={216}
                priority
            />

            <section className="relative z-10 min-h-[calc(100dvh-220px)] w-full rounded-t-[56px] bg-[linear-gradient(180deg,#484D5A_-23.29%,#303136_46.27%)] px-4 pb-9 pt-16 md:rounded-t-[225px]">
                <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center space-y-4">
                    <div className="flex h-[73px] w-[73px] items-center justify-center justify-self-center rounded-full bg-foreground p-[6px] md:h-[243px] md:w-[243px] md:p-[23px]">
                        <Image
                            src="/images/syuLikelion.webp"
                            alt="LIKELION 14TH"
                            width={197}
                            height={197}
                            className="h-[61px] w-[61px] md:h-[197px] md:w-[197px]"
                            priority
                        />
                    </div>

                    <label className="block w-80.75 md:w-122">
                        <div className="mb-2 flex items-center justify-between">
                            <span className="text-lg font-bold text-foreground md:text-xl">ID</span>
                            <span className="inline-flex items-center gap-2 text-base font-normal text-gray-2">
                                <input
                                    type="checkbox"
                                    checked={rememberLoginInfo}
                                    onChange={(event) => setRememberLoginInfo(event.target.checked)}
                                    className="h-6 w-6 accent-main-1"
                                />
                                로그인 정보 기억하기
                            </span>
                        </div>
                        <input
                            type="text"
                            value={loginId}
                            onChange={(event) => setLoginId(event.target.value)}
                            required
                            placeholder="아이디를 입력해 주세요."
                            className={authInputClass}
                        />
                    </label>

                    <label className="block">
                        <span className="mb-2 block text-lg font-bold text-foreground md:text-xl">PASSWORD</span>
                        <input
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                            placeholder="비밀번호를 입력해 주세요."
                            className={authInputClass}
                        />
                    </label>

                    {errorMessage ? <p className="text-sm text-[#ff9b43]">{errorMessage}</p> : null}

                    <div className="flex items-center justify-center gap-2 text-sm font-normal text-gray-2 md:text-base">
                        <Link href="/findid">아이디 찾기</Link>|<Link href="/findpw">비밀번호 재설정</Link>|<Link href="/signup">회원가입</Link>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="mt-8 inline-flex h-[50px] w-auto items-center justify-center rounded-[14px] bg-[#0b7de2] px-10 py-3 text-lg font-bold text-white disabled:opacity-50 md:h-11 md:rounded-full md:text-2xl"
                    >
                        {isSubmitting ? "WAIT..." : "LOGIN"}
                    </button>
                </form>
            </section>
        </div>
    )
}
