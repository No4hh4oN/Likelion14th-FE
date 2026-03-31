"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getNoticeList, getQnaList } from "../api";
import type { MyPageUser } from "../types";
import MyCalendarSection from "./MyCalendarSection";

/** 게시글 목록 페이지네이션 크기입니다. */
const POSTS_PAGE_SIZE = 6;

/** 최근 활동을 넉넉히 가져오기 위한 최대 조회 크기입니다. */
const MAX_FETCH_SIZE = 100;

type ActivityPostCategory = "질의응답" | "커뮤니티";

type ActivityPostItem = {
  id: string;
  category: ActivityPostCategory;
  title: string;
  createdAt: string;
  href: string;
};

type MyActivityTabProps = {
  user: MyPageUser;
};

/**
 * 최근 게시글 목록에 사용할 페이지 버튼 토큰을 계산합니다.
 */
function buildPostPageTokens(
  currentPage: number,
  totalPages: number,
): string[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => String(index + 1));
  }

  const tokens: string[] = ["1"];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) {
    tokens.push("...");
  }

  for (let page = start; page <= end; page += 1) {
    tokens.push(String(page));
  }

  if (end < totalPages - 1) {
    tokens.push("...");
  }

  tokens.push(String(totalPages));
  return tokens;
}

export default function MyActivityTab({ user }: MyActivityTabProps) {
  const router = useRouter();
  const [postItems, setPostItems] = useState<ActivityPostItem[]>([]);
  const [isPostsLoading, setIsPostsLoading] = useState(true);
  const [postsErrorMessage, setPostsErrorMessage] = useState("");
  const [postPage, setPostPage] = useState(1);

  useEffect(() => {
    let isMounted = true;

    const fetchActivityPosts = async () => {
      setIsPostsLoading(true);
      setPostsErrorMessage("");

      try {
        const [qnaResult, noticeResult] = await Promise.allSettled([
          getQnaList({
            page: 0,
            size: MAX_FETCH_SIZE,
            part: user.track && user.track !== "ETC" ? user.track : undefined,
          }),
          getNoticeList({
            page: 0,
            size: MAX_FETCH_SIZE,
            part: user.track && user.track !== "ETC" ? user.track : undefined,
          }),
        ]);

        if (!isMounted) {
          return;
        }

        const nextItems: ActivityPostItem[] = [];

        if (qnaResult.status === "fulfilled") {
          qnaResult.value.qnaList.forEach((qnaItem) => {
            nextItems.push({
              id: `qna-${qnaItem.qnaId}`,
              category: "질의응답",
              title: qnaItem.title,
              createdAt: qnaItem.updatedAt || qnaItem.createdAt,
              href: `/community/qna/${qnaItem.qnaId}`,
            });
          });
        }

        if (noticeResult.status === "fulfilled") {
          noticeResult.value.noticeList.forEach((noticeItem) => {
            nextItems.push({
              id: `notice-${noticeItem.noticeId}`,
              category: "커뮤니티",
              title: noticeItem.title,
              createdAt: noticeItem.createdAt,
              href: `/notice/${noticeItem.noticeId}`,
            });
          });
        }

        nextItems.sort(
          (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
        );

        setPostItems(nextItems);
        setPostPage(1);

        if (
          qnaResult.status === "rejected" &&
          noticeResult.status === "rejected"
        ) {
          setPostsErrorMessage(
            "게시글을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.",
          );
        }
      } catch {
        if (!isMounted) {
          return;
        }

        setPostItems([]);
        setPostsErrorMessage(
          "게시글을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.",
        );
      } finally {
        if (isMounted) {
          setIsPostsLoading(false);
        }
      }
    };

    void fetchActivityPosts();

    return () => {
      isMounted = false;
    };
  }, [user.track]);

  const totalPostPages = useMemo(
    () => Math.max(1, Math.ceil(postItems.length / POSTS_PAGE_SIZE)),
    [postItems.length],
  );

  useEffect(() => {
    if (postPage > totalPostPages) {
      setPostPage(totalPostPages);
    }
  }, [postPage, totalPostPages]);

  const pagedPostItems = useMemo(() => {
    const startIndex = (postPage - 1) * POSTS_PAGE_SIZE;
    return postItems.slice(startIndex, startIndex + POSTS_PAGE_SIZE);
  }, [postItems, postPage]);

  const postPageTokens = useMemo(
    () => buildPostPageTokens(postPage, totalPostPages),
    [postPage, totalPostPages],
  );

  /**
   * 목록에서 선택한 게시글 상세 화면으로 이동합니다.
   * @param href 이동할 경로
   */
  const handlePostRowClick = (href: string) => {
    router.push(href);
  };

  return (
    <div className="mt-6 space-y-8">
      <section>
        <h3 className="text-[24px] font-bold text-white">내가 쓴 글</h3>
        <div className="mt-3 rounded-[8px] border border-white/10 bg-[#363944]">
          <div className="grid grid-cols-[120px_minmax(0,1fr)] border-b border-white/10 px-4 py-3 text-[12px] text-white/55 lg:text-[13px]">
            <span className="font-medium">카테고리</span>
            <span className="font-medium">제목</span>
          </div>

          {isPostsLoading ? (
            <p className="px-4 py-8 text-center text-[13px] text-white/70">
              게시글을 불러오는 중입니다.
            </p>
          ) : null}

          {!isPostsLoading && postsErrorMessage ? (
            <p className="px-4 py-8 text-center text-[13px] text-[#ff9ea8]">
              {postsErrorMessage}
            </p>
          ) : null}

          {!isPostsLoading &&
          !postsErrorMessage &&
          pagedPostItems.length === 0 ? (
            <p className="px-4 py-8 text-center text-[13px] text-white/70">
              표시할 게시글이 없습니다.
            </p>
          ) : null}

          {!isPostsLoading && !postsErrorMessage ? (
            <ul>
              {pagedPostItems.map((postItem) => (
                <li
                  key={postItem.id}
                  className="border-b border-white/5 last:border-b-0"
                >
                  <button
                    type="button"
                    onClick={() => handlePostRowClick(postItem.href)}
                    className="grid w-full grid-cols-[120px_minmax(0,1fr)] items-center px-4 py-3 text-left text-[12px] transition-colors hover:bg-white/5 lg:text-[13px]"
                  >
                    <span className="text-white/75">{postItem.category}</span>
                    <span className="truncate text-white/90">
                      {postItem.title}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {!isPostsLoading && !postsErrorMessage && postItems.length > 0 ? (
          <div className="mt-4 flex items-center justify-center gap-2 text-[12px] text-white/65">
            <button
              type="button"
              onClick={() => setPostPage((prev) => Math.max(prev - 1, 1))}
              disabled={postPage === 1}
              className="rounded px-2 py-1 disabled:opacity-35"
            >
              이전
            </button>

            {postPageTokens.map((token, index) => {
              if (token === "...") {
                return (
                  <span key={`${token}-${index}`} className="px-1">
                    ...
                  </span>
                );
              }

              const pageNumber = Number(token);
              const isActivePage = pageNumber === postPage;

              return (
                <button
                  key={token}
                  type="button"
                  onClick={() => setPostPage(pageNumber)}
                  className={`h-7 min-w-7 rounded px-2 ${
                    isActivePage
                      ? "bg-main-1 font-semibold text-white"
                      : "text-white/65 hover:bg-white/10"
                  }`}
                >
                  {token}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() =>
                setPostPage((prev) => Math.min(prev + 1, totalPostPages))
              }
              disabled={postPage >= totalPostPages}
              className="rounded px-2 py-1 disabled:opacity-35"
            >
              다음
            </button>
          </div>
        ) : null}
      </section>

      <MyCalendarSection user={user} />
    </div>
  );
}
