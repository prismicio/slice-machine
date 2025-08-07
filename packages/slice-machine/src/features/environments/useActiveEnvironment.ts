import {
  invalidateFetcherData,
  useRequest,
} from "@prismicio/editor-support/Suspense";

import { getActiveEnvironment } from "./actions/getActiveEnvironment";

export function invalidateActiveEnvironmentData() {
  invalidateFetcherData(getActiveEnvironment);
}

export function useActiveEnvironment() {
  return useRequest(getActiveEnvironment, []);
}
