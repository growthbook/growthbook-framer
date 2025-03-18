export function parseGrowthBookUrl(url: string | null | undefined) {
  if (url === "https://cdn.growthbook.io") {
    return "https://app.growthbook.io";
  }
  return url; // Need to add field for self-hosted
}
