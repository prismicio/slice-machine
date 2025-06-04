import { useStableCallback } from "@prismicio/editor-support/React";
import { CustomType } from "@prismicio/types-internal/lib/customtypes";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { CustomTypeUpdateMeta, getState, updateCustomType } from "@/apiClient";
import { getFormat } from "@/domain/customType";
import { useAutoSync } from "@/features/sync/AutoSyncProvider";
import { ActionQueueStatus, useActionQueue } from "@/hooks/useActionQueue";
import useSliceMachineActions from "@/modules/useSliceMachineActions";

import { CUSTOM_TYPES_MESSAGES } from "../customTypesMessages";

type SetCustomTypeArgs = {
  customType: CustomType;
  onSaveCallback?: () => void;
  updateMeta?: CustomTypeUpdateMeta;
};

type CustomTypeContext = {
  customType: CustomType;
  actionQueueStatus: ActionQueueStatus;
  setCustomType: (args: SetCustomTypeArgs) => void;
};

type CustomTypeProviderProps = {
  children: ReactNode | ((value: CustomTypeContext) => ReactNode);
  initialCustomType: CustomType;
};

const CustomTypeContextValue = createContext<CustomTypeContext | undefined>(
  undefined,
);

export function CustomTypeProvider(props: CustomTypeProviderProps) {
  const { children, initialCustomType } = props;

  const [customType, setCustomTypeState] = useState(initialCustomType);
  const format = getFormat(customType);
  const customTypeMessages = CUSTOM_TYPES_MESSAGES[format];
  const { actionQueueStatus, setNextAction } = useActionQueue({
    errorMessage: customTypeMessages.autoSaveFailed,
  });
  const { refreshState } = useSliceMachineActions();
  const stableRefreshState = useStableCallback(refreshState);
  const { syncChanges } = useAutoSync();

  const setCustomType = useCallback(
    (args: SetCustomTypeArgs) => {
      const { customType, onSaveCallback, updateMeta } = args;

      setCustomTypeState(customType);
      setNextAction(async () => {
        const { errors } = await updateCustomType({ customType, updateMeta });

        if (errors.length > 0) {
          throw errors;
        }

        // Refresh the store with the latest server state to get the updated
        // custom types
        stableRefreshState(await getState());

        syncChanges();
        onSaveCallback?.();
      });
    },
    [setNextAction, stableRefreshState, syncChanges],
  );

  const contextValue: CustomTypeContext = useMemo(
    () => ({
      actionQueueStatus,
      customType,
      setCustomType,
    }),
    [actionQueueStatus, customType, setCustomType],
  );

  return (
    <CustomTypeContextValue.Provider value={contextValue}>
      {typeof children === "function" ? children(contextValue) : children}
    </CustomTypeContextValue.Provider>
  );
}

export function useCustomTypeState() {
  const customTypeState = useContext(CustomTypeContextValue);

  if (!customTypeState) {
    throw new Error("CustomTypeProvider not found");
  }

  return customTypeState;
}
