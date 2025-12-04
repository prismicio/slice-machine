/**
 * Concurrency helper to control parallel network/IO without external deps
 * @param items - The items to map over
 * @param limit - The maximum number of concurrent operations
 * @param mapper - The function to map over the items
 * @returns The results of the mapped items
 */
export async function mapWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  const workers = new Array(Math.min(limit, items.length))
    .fill(null)
    .map(async () => {
      while (true) {
        const currentIndex = nextIndex++;
        if (currentIndex >= items.length) break;
        results[currentIndex] = await mapper(items[currentIndex], currentIndex);
      }
    });

  await Promise.all(workers);
  return results;
}
