import type { UserPost } from "@/lib/auth-api";

export type PostFilters = {
  from: Date | null;
  to: Date | null;
  authorId: number | null;
  mediaOnly: boolean;
};

export const emptyFilters: PostFilters = {
  from: null,
  to: null,
  authorId: null,
  mediaOnly: false,
};

export function filterPosts(posts: UserPost[], filters: PostFilters) {
  return posts.filter((post) => {
    const created = new Date(post.createdAt);
    if (filters.from && created < startOfDay(filters.from)) return false;
    if (filters.to && created > endOfDay(filters.to)) return false;
    if (filters.authorId !== null && post.author.id !== filters.authorId)
      return false;
    if (filters.mediaOnly && post.media.length === 0) return false;
    return true;
  });
}

export function hasActiveFilters(filters: PostFilters) {
  return (
    filters.from !== null ||
    filters.to !== null ||
    filters.authorId !== null ||
    filters.mediaOnly
  );
}

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}
