export function parseGrowthBookUrl(url: string | null | undefined) {
  if (url === "https://cdn.growthbook.io" || !url) {
    return "https://app.growthbook.io";
  }
  return url;
}
