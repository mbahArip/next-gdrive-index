/**
 * Get search params from url string, and return it as object
 * @param url - Request url
 * @param key - Key to get from the url
 * @returns Object containing the key and value
 */
function getSearchParams(
  url: string,
  key: string | string[],
): Record<string, string | null> {
  const { searchParams } = new URL(url);
  if (typeof key === "string") {
    return { [key]: searchParams.get(key) };
  } else {
    const result: Record<string, string | null> = {};
    key.forEach((k) => {
      result[k] = searchParams.get(k);
    });
    return result;
  }
}

export default getSearchParams;
