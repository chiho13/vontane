export function formatDate(input: Date): string {
  const date = new Date(input);
  return date.toLocaleDateString("en-GB", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
