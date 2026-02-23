import clsx from "clsx";
import type { MouseEventHandler } from "react";

type ActionButtonProps = {
  text: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
  hoverClassName?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
};

/** 버튼 컴포넌트
 * @param {string} text: 버튼에 표시될 텍스트
 * @param {MouseEventHandler<HTMLButtonElement>} onClick: 버튼 클릭 시 실행될 함수
 * @param {string} className: 버튼의 추가적인 클래스
 * @param {string} hoverClassName: hover시 추가적인 클래스 (hover:class 형식으로 입력해주어야 함) (기본값: hover:bg-gray-5)
 * @param {"button" | "submit" | "reset"} type: 버튼의 타입 (기본값: "button")
 * @param {boolean} disabled: 버튼 비활성화 여부 (기본값: false)
 */
export default function ActionButton({
  text,
  onClick,
  className,
  hoverClassName = "hover:bg-gray-5",
  type = "button",
  disabled = false,
}: ActionButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "rounded-[5px] cursor-pointer bg-gray-6 px-7 py-1.75 text-[16px] font-normal text-white-1 transition-colors",
        hoverClassName,
        className,
      )}
    >
      {text}
    </button>
  );
}
