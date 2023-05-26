/* eslint-disable @typescript-eslint/no-throw-literal */
import { useCallback, useEffect, useState } from "react";

/*
 * Higher level, Suspense abstraction over request.
 * Supports:
 *   - LRU cache eviction, per fetcher.
 *   - Different revalidation strategies, per fetcher.
 *   - request pooling
 */
export function useRequest<INPUT extends string, RequestResult>(
  fetcher: Fetcher<INPUT, RequestResult>,
  args: INPUT[]
): RequestResult {
  // useRevalidateDataOnFocus(fetcher, args)
  useSubscribeToUpdates(fetcher, args);

  const cacheValue = _cache.get(fetcher, args);

  // This data is unknown to the cache, time to fetch it.
  if (!cacheValue) {
    const promise = fetcher(...args);
    _cache.set(fetcher, args, { state: "fetching", promise });

    // No need to force update: Suspense will retry to render when the promise is resolved.
    updateCacheOnPromiseResult(fetcher, args, promise).catch((err) =>
      console.error(err)
    );

    // Suspend with this brand new promise.
    throw promise;
  }

  // The request is already in flight: suspend.
  if (cacheValue.state === "fetching") throw cacheValue.promise;

  // We have an OK result, synchronously return it.
  if (cacheValue.ok) return cacheValue.body;

  // We have an error, let an Error Boundary catch it.
  throw cacheValue.error;
}

/**
 * Manually update the Suspense Cache's data, often after getting fresh data
 * from the server.
 */
export function updateData<INPUT extends string, RequestResult>(
  fetcher: Fetcher<INPUT, RequestResult>,
  args: INPUT[],
  value: RequestResult
): void {
  _cache.set(fetcher, args, {
    state: "fetched",
    ok: true,
    body: value,
  });

  cacheSubscribers.forEach((sub) => sub(fetcher, args));
}

function useSubscribeToUpdates<INPUT extends string, RequestResult>(
  fetcher: Fetcher<INPUT, RequestResult>,
  args: INPUT[]
): void {
  const forceUpdate = useForceUpdate();

  const ownArgsKey = argsKey(args);
  useEffect(() => {
    function onUpdate(forFetcher: Fetcher, forArgs: unknown[]) {
      if (fetcher !== forFetcher) return;

      const forArgsKey = argsKey(forArgs);
      if (ownArgsKey !== forArgsKey) return;

      forceUpdate();
    }

    cacheSubscribers.push(onUpdate);
    return () => {
      const index = cacheSubscribers.indexOf(onUpdate);
      cacheSubscribers.splice(index, 1);
    };
  }, [fetcher, forceUpdate, ownArgsKey]);
}

export function useRevalidateDataOnFocus<INPUT extends string, RequestResult>(
  fetcher: Fetcher<INPUT, RequestResult>,
  args: INPUT[]
) {
  const forceUpdate = useForceUpdate();

  useEffect(() => {
    const strategy = _cache.getFetcherConfig(fetcher).revalidationStrategy;
    if (strategy?.type === "never" || !strategy?.onFocus) return;

    function doRevalidateOnFocus() {
      if (document.visibilityState === "hidden") return;

      const freshCacheValue = _cache.get(fetcher, args);

      // No need to do anything if the value has been evicted or it's already being revalidated.
      if (!freshCacheValue || freshCacheValue.state !== "fetched") return;

      const promise = fetcher(...args);

      if (freshCacheValue.ok) {
        _cache.set(fetcher, args, {
          state: "revalidating",
          promise,
          ok: true,
          body: freshCacheValue.body,
        });
      } else {
        _cache.set(fetcher, args, {
          state: "revalidating",
          promise,
          ok: false,
          error: freshCacheValue.error,
        });
      }

      updateCacheOnPromiseResult(fetcher, args, promise)
        .then(forceUpdate)
        .catch((err) => console.error(err));
    }

    document.addEventListener("visibilitychange", doRevalidateOnFocus);
    return () =>
      document.removeEventListener("visibilitychange", doRevalidateOnFocus);
  });
}

function updateCacheOnPromiseResult<INPUT extends string, RequestResult>(
  fetcher: Fetcher<INPUT, RequestResult>,
  args: INPUT[],
  promise: Promise<RequestResult>
) {
  return promise
    .then((result) =>
      _cache.set(fetcher, args, {
        state: "fetched",
        ok: true,
        body: result,
      })
    )
    .catch((error: unknown) =>
      _cache.set(fetcher, args, {
        state: "fetched",
        ok: false,
        error,
      })
    );
}

export type Fetcher<INPUT = never, RequestResult = unknown> = (
  ...args: INPUT[]
) => Promise<RequestResult>;

interface FetcherConfig {
  /* How many items to keep in the LRU cache. */
  cacheCapacity?: number;
  /*
   * A value of "never" indicates that once cached, the value will always be returned as it was, without any revalidation.
   * A value of swr (stale-while-revalidate) means data is reused immediately if available but revalidated at various point in time or on certain actions.
   */
  revalidationStrategy?: { type: "never" } | { type: "swr"; onFocus: boolean };
}

type CacheValue<RequestResult = unknown> =
  | { state: "fetching"; promise: Promise<RequestResult> }
  | { state: "fetched"; ok: true; body: RequestResult }
  | { state: "fetched"; ok: false; error: unknown }
  | {
      state: "revalidating";
      ok: true;
      body: RequestResult;
      promise: Promise<RequestResult>;
    }
  | {
      state: "revalidating";
      ok: false;
      error: unknown;
      promise: Promise<RequestResult>;
    };

const _cache = createSuspenseCache();

type PublicCache = Pick<typeof _cache, "registerFetcherConfig" | "clear">;
export const cache: PublicCache = _cache;

export function createSuspenseCache() {
  const fetcherConfig = new Map<Fetcher, FetcherConfig>();
  const map = new Map<Fetcher, Map<string, CacheValue>>();

  const defaultConfig: FetcherConfig = {
    cacheCapacity: 100,
    revalidationStrategy: { type: "swr", onFocus: true },
  };

  function getFetcherConfig(fetcher: Fetcher): FetcherConfig {
    return fetcherConfig.get(fetcher) ?? defaultConfig;
  }

  return {
    get<INPUT, RequestResult>(
      fetcher: Fetcher<INPUT, RequestResult>,
      args: INPUT[]
    ): CacheValue<RequestResult> | undefined {
      const key = argsKey(args);
      const fetcherMap = map.get(fetcher) as
        | Map<string, CacheValue<RequestResult>>
        | undefined;

      if (!fetcherMap || !fetcherMap.has(key)) return undefined;

      // LRU: since we just accessed this key, move it to the last position.
      const value = fetcherMap.get(key);
      fetcherMap.delete(key);
      if (value !== undefined) fetcherMap.set(key, value);

      return value;
    },

    set<INPUT>(
      fetcher: Fetcher<INPUT>,
      args: INPUT[],
      value: CacheValue
    ): void {
      let fetcherMap = map.get(fetcher);

      if (!fetcherMap) {
        fetcherMap = new Map();
        map.set(fetcher, fetcherMap);
      }

      const config = getFetcherConfig(fetcher);
      const key = argsKey(args);

      // Delete the least recently used key to make room for this new key.
      if (fetcherMap.size === config.cacheCapacity && !fetcherMap.has(key))
        fetcherMap.delete(fetcherMap.keys().next().value as string);

      fetcherMap.set(key, value);
    },

    getFetcherConfig,

    registerFetcherConfig(fetcher: Fetcher, config: FetcherConfig): void {
      fetcherConfig.set(fetcher, config);
    },

    clear(...keys: Fetcher[]): void {
      if (keys.length > 0) {
        for (const key of keys) {
          map.delete(key);
        }
      } else map.clear();
    },
  };
}

function argsKey(args: unknown[]) {
  return args.join("\n");
}

const cacheSubscribers: ((fetcher: Fetcher, args: unknown[]) => void)[] = [];

export function useForceUpdate() {
  const [_, setState] = useState({});
  return useCallback(() => setState({}), []);
}
