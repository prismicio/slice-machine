import {
  invalidateFetcherData,
  useRequest,
} from "@prismicio/editor-support/Suspense";

import { getActiveEnvironment } from "./actions/getActiveEnvironment";

const fetcher = () => getActiveEnvironment();

export function invalidateActiveEnvironmentData() {
  invalidateFetcherData(fetcher);
}

export function useActiveEnvironment() {
  return useRequest(fetcher, []);
}
