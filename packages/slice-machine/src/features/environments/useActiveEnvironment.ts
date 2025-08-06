import {
  Fetcher,
  invalidateFetcherData,
  useRequest,
} from "@prismicio/editor-support/Suspense";

import { getActiveEnvironment } from "./actions/getActiveEnvironment";

export function invalidateActiveEnvironmentData() {
  invalidateFetcherData(getActiveEnvironment as Fetcher<undefined[], unknown>);
}

export function useActiveEnvironment() {
  return useRequest(getActiveEnvironment, []);
}
