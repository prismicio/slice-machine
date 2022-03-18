import { useReducer } from "react";
import equal from "fast-deep-equal";
import { CustomTypeState, CustomTypeStatus } from "@models/ui/CustomTypeState";

import reducer from "./reducer";
import CustomTypeStore from "./store";
import { CustomTypeSM } from "@slicemachine/core/build/src/models/CustomType";

export function useModelReducer({
  customType,
  remoteCustomType,
  initialMockConfig = {},
}: {
  customType: CustomTypeSM;
  remoteCustomType: CustomTypeSM | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialMockConfig: any;
}): [CustomTypeState, CustomTypeStore] {
  const current = customType;

  const __status = (() => {
    if (!remoteCustomType) {
      return CustomTypeStatus.New;
    }
    if (equal(current, remoteCustomType)) {
      return CustomTypeStatus.Synced;
    }
    return CustomTypeStatus.Modified;
  })();

  const initialState: CustomTypeState = {
    current,
    initialCustomType: current,
    remoteCustomType,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    mockConfig: initialMockConfig,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    initialMockConfig,
    poolOfFieldsToCheck: CustomTypeState.getPool(current.tabs),
    __status,
  };

  const [state, dispatch] = useReducer(reducer, initialState);
  const store = new CustomTypeStore(dispatch);

  return [state, store];
}
