import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { CustomType } from "@prismicio/types-internal/lib/customtypes";
import { useStableCallback } from "@prismicio/editor-support/React";

import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { useAutoSync } from "@src/features/sync/AutoSyncProvider";
import { getFormat } from "@src/domain/customType";
import { updateCustomType } from "@src/apiClient";
import { ActionQueueStatus, useActionQueue } from "@src/hooks/useActionQueue";

import { CUSTOM_TYPES_MESSAGES } from "../customTypesMessages";

type CustomTypeContext = {
  customType: CustomType;
  actionQueueStatus: ActionQueueStatus;
  setCustomType: (customType: CustomType) => void;
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
  const { saveCustomTypeSuccess } = useSliceMachineActions();
  const stableSaveCustomTypeSuccess = useStableCallback(saveCustomTypeSuccess);
  const { syncChanges } = useAutoSync();

  const setCustomType = useCallback(
    (customType: CustomType) => {
      setCustomTypeState(customType);
      setNextAction(async () => {
        const { errors } = await updateCustomType(customType);

        if (errors.length > 0) {
          throw errors;
        }

        // Update available custom types store with new custom type
        stableSaveCustomTypeSuccess(customType);

        syncChanges();
      });
    },
    [setNextAction, stableSaveCustomTypeSuccess, syncChanges],
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
