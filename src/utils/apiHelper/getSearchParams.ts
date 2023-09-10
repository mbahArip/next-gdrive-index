export default function getSearchParams(
  url: string,
  key: string | string[],
): Record<string, string | null> {
  const { searchParams } = new URL(url);
  if (typeof key === "string") {
    return { [key]: searchParams.get(key) };
  } else {
    const result: Record<string, string | null> = {};
    for (const k of key) {
      result[k] = searchParams.get(k);
    }
    return result;
  }
}
