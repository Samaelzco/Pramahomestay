export const PAGE_SIZE_OPTIONS = [15, 30, 50] as const;

export function pageSize(value: string | undefined, fallback = 15): string {
  const parsed = Number(value);
  return PAGE_SIZE_OPTIONS.includes(parsed as (typeof PAGE_SIZE_OPTIONS)[number])
    ? String(parsed)
    : String(fallback);
}
