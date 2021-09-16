import { useReducer } from "react";
import equal from "fast-deep-equal";
import { CustomType, ObjectTabs } from "@models/common/CustomType";
import { CustomTypeState, CustomTypeStatus } from "@models/ui/CustomTypeState";

import reducer from "./reducer";
import CustomTypeStore from "./store";

export function useModelReducer({
  customType,
  remoteCustomType: remoteCustomTypeObject,
  initialMockConfig = {},
}: {
  customType: CustomType<ObjectTabs>;
  remoteCustomType: CustomType<ObjectTabs> | undefined;
  initialMockConfig: any;
}): [CustomTypeState, CustomTypeStore] {
  const current = CustomType.toArray(customType);

  const remoteCustomType = remoteCustomTypeObject
    ? CustomType.toArray(remoteCustomTypeObject)
    : undefined;

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
    mockConfig: initialMockConfig,
    initialMockConfig,
    poolOfFieldsToCheck: CustomTypeState.getPool(current.tabs),
    __status,
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  const store = new CustomTypeStore(dispatch);

  return [state, store];
}
