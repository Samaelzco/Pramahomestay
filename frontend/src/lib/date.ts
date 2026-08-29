export function nextDate(date: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return "";

  const value = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(value.getTime())) return "";
  value.setUTCDate(value.getUTCDate() + 1);

  return value.toISOString().slice(0, 10);
}
