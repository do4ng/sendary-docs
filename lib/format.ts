export function slugifyHeading(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]/g, "");
}

export function formatDate(value: string): string {
  return value.replace(/-/g, ".");
}
