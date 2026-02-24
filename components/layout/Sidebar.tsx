"use client";

import Image from "next/image";
import type { MouseEvent, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  authSection?: ReactNode;
};

export default function Sidebar({
  isOpen,
  onClose,
  authSection,
}: SidebarProps) {
  const pathname = usePathname();
  const [currentHash, setCurrentHash] = useState("");
  const [isAboutActiveByScroll, setIsAboutActiveByScroll] = useState(false);
  const menus = [
    { label: "Main", href: "/" },
    { label: "About", href: "/#about" },
    { label: "FAQ", href: "/14/faq" },
    { label: "Staff", href: "/14/staff" },
  ] as const;

  useEffect(() => {
    const syncHash = () => {
      setCurrentHash(window.location.hash);
    };

    syncHash();
    window.addEventListener("hashchange", syncHash);
    window.addEventListener("popstate", syncHash);

    return () => {
      window.removeEventListener("hashchange", syncHash);
      window.removeEventListener("popstate", syncHash);
    };
  }, [pathname, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (pathname !== "/") {
      return;
    }

    const onScroll = () => {
      const aboutSection = document.getElementById("about");
      if (!aboutSection) {
        return;
      }

      const aboutTop =
        aboutSection.getBoundingClientRect().top + window.scrollY;
      const threshold = 120;
      setIsAboutActiveByScroll(window.scrollY >= aboutTop - threshold);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);

  const activeIndex = menus.findIndex((menu) => {
    if (menu.href === "/") {
      return (
        pathname === "/" && currentHash !== "#about" && !isAboutActiveByScroll
      );
    }

    if (menu.href === "/#about") {
      return (
        pathname === "/" && (currentHash === "#about" || isAboutActiveByScroll)
      );
    }

    return pathname.startsWith(menu.href);
  });

  const handleActionClickCapture = (event: MouseEvent<HTMLElement>) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    if (target.closest("a, button")) {
      onClose();
    }
  };

  const handleMenuClick = (
    event: MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (href !== "/#about") {
      return;
    }

    if (pathname !== "/") {
      return;
    }

    const aboutSection = document.getElementById("about");
    if (!aboutSection) {
      return;
    }

    event.preventDefault();
    const start = window.scrollY;
    const target = aboutSection.getBoundingClientRect().top + window.scrollY;
    const duration = 520;
    let startTime: number | null = null;
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const step = (now: number) => {
      if (startTime === null) {
        startTime = now;
      }
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      window.scrollTo(0, start + (target - start) * eased);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
    window.history.replaceState(null, "", "/#about");
    setCurrentHash("#about");
  };

  return (
    <>
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className={`fixed left-0 top-0 z-40 h-dvh w-screen cursor-default bg-black/35 backdrop-blur-[3px] transition-opacity duration-500 md:bg-black/20 md:backdrop-blur-0 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        className={`fixed right-0 top-0 z-50 h-dvh w-[min(320px,78vw)] bg-[#30333c] shadow-xl transition-transform duration-500 ease-out md:w-[min(412px,100vw)] md:bg-[#303136] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!isOpen}
      >
        <button
          type="button"
          aria-label="Close menu"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 inline-flex h-11 w-11 items-center justify-center rounded-md border border-none cursor-pointer md:hidden"
        >
          <Image
            src="/images/closeButton.webp"
            alt=""
            width={36}
            height={36}
            priority
          />
        </button>
        <div className="hidden h-16 items-center justify-end px-4 md:flex">
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-none cursor-pointer"
          >
            <Image
              src="/images/closeButton.webp"
              alt=""
              width={44}
              height={44}
              priority
            />
          </button>
        </div>
        <div
          className="px-4 pb-6 pt-18 md:p-4"
          onClickCapture={handleActionClickCapture}
        >
          <div>{authSection}</div>
          <ul className="mt-7 md:mt-8">
            {menus.map((menu, index) => {
              const isActive = index === activeIndex;
              const marginTop =
                index === 0
                  ? "mt-0"
                  : index - 1 === activeIndex || isActive
                    ? "mt-7 md:mt-[38px]"
                    : "mt-5 md:mt-[28px]";

              return (
                <li key={menu.href} className={marginTop}>
                  <Link
                    href={menu.href}
                    onClick={(event) => handleMenuClick(event, menu.href)}
                    className={`leading-none ${isActive ? "text-[38px] font-bold text-foreground md:text-[32px]" : "text-[30px] font-medium text-gray-3 md:text-[24px]"}`}
                  >
                    {menu.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>
    </>
  );
}
