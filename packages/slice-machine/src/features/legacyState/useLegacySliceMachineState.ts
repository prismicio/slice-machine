import { useRequest } from "@prismicio/editor-support/Suspense";

import { getLegacySliceMachineState } from "./actions/getLegacySliceMachineState";

export function useLegacySliceMachineState() {
  return useRequest(getLegacySliceMachineState, []);
}
