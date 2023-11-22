import { useRequest } from "@prismicio/editor-support/Suspense";

import { getEnvironments } from "./actions/getEnvironments";

export function useEnvironments() {
  return useRequest(getEnvironments, []);
}
