import {
  invalidateFetcherData,
  useRequest,
} from "@prismicio/editor-support/Suspense";

import { getEnvironments } from "./actions/getEnvironments";

export function invalidateEnvironmentsData() {
  invalidateFetcherData(getEnvironments);
}

export function useEnvironments() {
  return useRequest(getEnvironments, []);
}
