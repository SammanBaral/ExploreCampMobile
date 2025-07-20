import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isAdmin(): boolean {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData).isAdmin : false;
}

export function getCurrentUser() {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
}

// Bookmark utility
export const BOOKMARKS_KEY = 'bookmarkedProductIds';

export function getBookmarkedProductIds(): number[] {
  try {
    const data = localStorage.getItem(BOOKMARKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function setBookmarkedProductIds(ids: number[]) {
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(ids));
}

export function isProductBookmarked(productId: number): boolean {
  return getBookmarkedProductIds().includes(productId);
}

export function toggleBookmark(productId: number): boolean {
  const ids = getBookmarkedProductIds();
  const idx = ids.indexOf(productId);
  let bookmarked;
  if (idx === -1) {
    ids.push(productId);
    bookmarked = true;
  } else {
    ids.splice(idx, 1);
    bookmarked = false;
  }
  setBookmarkedProductIds(ids);
  return bookmarked;
}
