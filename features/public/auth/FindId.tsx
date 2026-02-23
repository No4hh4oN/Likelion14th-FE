"use client"

import Image from "next/image"
import Link from "next/link"
import { FormEvent, useState } from "react"
import { findIdByEmailVerify, sendEmailCode } from "@/features/public/api"

export default function FindIdFeature() {
    const [email, setEmail] = useState("")
    const [code, setCode] = useState("")
    const [foundLoginId, setFoundLoginId] = useState("")
    const [isSendingCode, setIsSendingCode] = useState(false)
    const [isVerifying, setIsVerifying] = useState(false)
    const [message, setMessage] = useState("")
    const [errorMessage, setErrorMessage] = useState("")

    const handleSendCode = async () => {
        if (!email) {
            setErrorMessage("이메일을 먼저 입력해주세요.")
            return
        }

        setErrorMessage("")
        setMessage("")
        setIsSendingCode(true)
        try {
            const result = await sendEmailCode({
                email,
                purpose: "FIND_ID",
            })
            setMessage(result.message || "인증번호를 전송했습니다.")
        } catch {
            setErrorMessage("인증번호 전송에 실패했습니다.")
        } finally {
            setIsSendingCode(false)
        }
    }

    const handleVerify = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setErrorMessage("")
        setMessage("")
        setFoundLoginId("")
        setIsVerifying(true)

        try {
            const result = await findIdByEmailVerify({ email, code })
            setFoundLoginId(result.loginId)
        } catch {
            setErrorMessage("인증번호 확인에 실패했습니다.")
        } finally {
            setIsVerifying(false)
        }
    }

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

            <section className="relative z-10 min-h-[calc(100vh-220px)] w-full rounded-t-[56px] bg-[linear-gradient(180deg,#484D5A_-23.29%,#303136_46.27%)] px-4 pb-9 pt-16 md:rounded-t-[225px]">
                <div className="mx-auto max-w-[520px]">
                    <div className="mb-6 flex flex-col items-center">
                        <div className="mb-3 h-[72px] w-[72px] overflow-hidden rounded-full bg-white p-2">
                            <Image src="/images/syuLikelion.webp" alt="logo" width={56} height={56} />
                        </div>
                        <h1 className="text-lg font-bold text-main-3 md:text-xl">아이디 찾기</h1>
                    </div>

                    {foundLoginId ? (
                        <div className="rounded-2xl bg-[#3d4456] px-6 py-8 text-center">
                            <p className="mb-3 text-sm text-gray-3">회원님의 아이디입니다.</p>
                            <p className="mb-4 break-all text-lg font-bold text-foreground">{foundLoginId}</p>
                            <Link
                                href="/auth"
                                className="inline-flex h-12.5 items-center rounded-[14px] bg-main-1 px-8 text-lg font-bold text-white md:h-20 md:rounded-2xl md:text-xl"
                            >
                                LOGIN
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleVerify} className="space-y-4">
                            <label className="block">
                                <span className="mb-2 block text-lg font-bold text-foreground md:text-xl">E-MAIL</span>
                                <div className="flex gap-2">
                                    <input
                                        value={email}
                                        onChange={(event) => setEmail(event.target.value)}
                                        type="email"
                                        required
                                        placeholder="이메일을 입력해주세요."
                                        className="h-12.5 w-full rounded-[14px] border border-[#484d5a] bg-gray-6 px-6 text-base text-gray-4 outline-none md:h-20 md:rounded-2xl md:text-xl"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleSendCode}
                                        disabled={isSendingCode}
                                        className="h-12.5 w-[87px] shrink-0 rounded-[14px] bg-main-1 px-2 text-sm font-bold text-white disabled:opacity-60 md:h-20 md:w-[146px] md:rounded-2xl md:px-3 md:text-base"
                                    >
                                        {isSendingCode ? "전송 중" : "인증번호 전송"}
                                    </button>
                                </div>
                            </label>

                            <label className="block">
                                <span className="mb-2 block text-lg font-bold text-foreground md:text-xl">인증번호</span>
                                <input
                                    value={code}
                                    onChange={(event) => setCode(event.target.value)}
                                    required
                                    placeholder="인증번호를 입력해주세요."
                                    className="h-12.5 w-full rounded-[14px] border border-[#484d5a] bg-gray-6 px-6 text-base text-gray-4 outline-none md:h-20 md:rounded-2xl md:text-xl"
                                />
                            </label>

                            {message ? <p className="text-xs text-[#7ee787]">{message}</p> : null}
                            {errorMessage ? <p className="text-xs text-[#ff7b7b]">{errorMessage}</p> : null}

                            <div className="pt-2 text-center">
                                <button
                                    type="submit"
                                    disabled={isVerifying}
                                    className="inline-flex h-12.5 items-center rounded-[14px] bg-main-1 px-8 text-lg font-bold text-white disabled:opacity-60 md:h-20 md:rounded-2xl md:text-xl"
                                >
                                    {isVerifying ? "확인 중" : "아이디 찾기"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </section>
        </div>
    )
}
