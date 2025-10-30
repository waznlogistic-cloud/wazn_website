// Resolve an asset by basename from src/assets (any extension).
// Example: getAssetUrl("dhl") returns a URL even if the file is dhl.png/svg/jpg
const allAssets = import.meta.glob("@/assets/*", {
  eager: true,
  query: "?url", // ⟵ replaces as: "url"
  import: "default",
}) as Record<string, string>;

const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, "");

export function getAssetUrl(name: string): string | undefined {
  const target = normalize(name);
  for (const [path, url] of Object.entries(allAssets)) {
    const file = path.split("/").pop() || "";
    const base = normalize(file.replace(/\.[^.]+$/, "")); // strip extension
    if (base === target) return url;
  }
  return undefined;
}
