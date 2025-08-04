import {
  invalidateFetcherData,
  useRequest,
} from "@prismicio/editor-support/Suspense";

import { getEnvironments } from "./actions/getEnvironments";

const fetcher = () => getEnvironments();

export function invalidateEnvironmentsData() {
  invalidateFetcherData(fetcher);
}

export function useEnvironments() {
  return useRequest(fetcher, []);
}
