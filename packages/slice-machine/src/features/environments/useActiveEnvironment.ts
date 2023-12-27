import { useRequest } from "@prismicio/editor-support/Suspense";

import { getActiveEnvironment } from "./actions/getActiveEnvironment";

export function useActiveEnvironment() {
  return useRequest(getActiveEnvironment, []);
}
