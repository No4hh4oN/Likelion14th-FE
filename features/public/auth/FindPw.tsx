import Link from "next/link"

export default function FindPwFeature() {
    return (
        <section className="mx-auto mt-27 w-full max-w-4xl rounded-t-[50px] bg-[linear-gradient(180deg,#484D5A_-23.29%,#303136_46.27%)] px-11 pb-12 pt-11">
            <h1 className="mb-6 text-3xl font-bold text-foreground">비밀번호 찾기</h1>
            <p className="text-sm text-gray-200">비밀번호 찾기 화면입니다. 필요한 입력 폼을 여기에 추가하면 됩니다.</p>
            <div className="mt-8">
                <Link href="/auth" className="inline-flex h-10 items-center rounded bg-[#4b9cff] px-4 text-sm font-semibold text-white">
                    로그인으로 돌아가기
                </Link>
            </div>
        </section>
    )
}
