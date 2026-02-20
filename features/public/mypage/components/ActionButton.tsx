import clsx from "clsx";
import type { MouseEventHandler } from "react";

type ActionButtonProps = {
  text: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
};

/** 버튼 컴포넌트
 * @param {string} text: 버튼에 표시될 텍스트
 * @param {MouseEventHandler<HTMLButtonElement>} onClick: 버튼 클릭 시 실행될 함수
 * @param {string} className: 버튼의 추가적인 클래스
 * @param {"button" | "submit" | "reset"} type: 버튼의 타입 (기본값: "button")
 * @param {boolean} disabled: 버튼 비활성화 여부 (기본값: false)
 */
export default function ActionButton({
  text,
  onClick,
  className,
  type = "button",
  disabled = false,
}: ActionButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "rounded-[5px] bg-gray-6 text-[16px] px-6 py-1.75 font-medium text-white-1 transition-colors hover:bg-gray-5",
        className,
      )}
    >
      {text}
    </button>
  );
}
