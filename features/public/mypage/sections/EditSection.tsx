import type { MyPageUser } from "../types";
import ActionButton from "../components/ActionButton";

type EditSectionProps = {
  user: MyPageUser;
  onBack: () => void;
};

export default function EditSection({ user, onBack }: EditSectionProps) {
  return (
    <section className="min-h-screen bg-[linear-gradient(180deg,#24252E_0%,#1E1F27_100%)] px-4 py-9 text-white-1 lg:px-6 lg:py-14">
      <div className="mx-auto w-full max-w-[760px] rounded-[8px] border border-white/10 bg-[#2E313A]/95 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.28)] lg:p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-[24px] font-bold lg:text-[30px]">정보 수정</h1>
          <ActionButton text="돌아가기" onClick={onBack} className="text-[12px]" />
        </div>
        <p className="mt-4 text-[14px] text-white/75 lg:text-[16px]">
          {user.name} 님의 정보 수정 화면은 현재 구현 중입니다.
        </p>
      </div>
    </section>
  );
}
