import Link from "next/link";

export default function LoginPage() {
  return (
    <section className="min-h-screen bg-[linear-gradient(180deg,#24252E_0%,#1E1F27_100%)] px-4 py-16 text-white-1">
      <div className="mx-auto w-full max-w-[560px] rounded-[10px] border border-white/10 bg-[#2E313A]/95 p-6 text-center shadow-[0_16px_40px_rgba(0,0,0,0.28)] lg:p-8">
        <h1 className="text-[24px] font-bold lg:text-[32px]">Login</h1>
        <p className="mt-3 text-[14px] text-white/70 lg:text-[16px]">
          로그인 페이지는 현재 구현 중입니다.
        </p>
        <p className="mt-1 text-[12px] text-white/45 lg:text-[13px]">
          인증 기능 연결 전까지는 목업 상태로 동작합니다.
        </p>
        <Link
          href="/14/home"
          className="mx-auto mt-6 inline-flex rounded-full bg-main-3 px-6 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-main-3/85"
        >
          홈으로 이동
        </Link>
      </div>
    </section>
  );
}
