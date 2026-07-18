import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const ITEMS_PER_PAGE = 10;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type SearchPayload = {
  name?: string | null;
  date?: Date | number | string | null;
  tagId?: number | null;
};

export function buildSearchParams({
  name,
  date,
  tagId,
}: {
  name?: string | null;
  date?: Date | number | string | null;
  tagId?: number | null;
}): SearchPayload {
  return {
    name: name || undefined,
    date: date || undefined,
    tagId: tagId || undefined,
  };
}

export function updateSearchTagParam(
  searchParams: SearchPayload | undefined,
  tagId: number,
): SearchPayload | undefined {
  if (searchParams?.tagId === tagId) {
    return { ...searchParams, tagId: undefined };
  }
  return searchParams;
}
