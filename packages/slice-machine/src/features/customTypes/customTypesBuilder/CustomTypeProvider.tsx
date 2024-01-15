import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useIsFirstRender,
  useStableCallback,
} from "@prismicio/editor-support/React";
import { CustomType } from "@prismicio/types-internal/lib/customtypes";

import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import {
  AutoSaveStatus,
  useAutoSave,
} from "@src/features/autoSave/useAutoSave";
import { getFormat } from "@src/domain/customType";
import { updateCustomType } from "@src/apiClient";

import { CUSTOM_TYPES_MESSAGES } from "../customTypesMessages";

type CustomTypeContext = {
  customType: CustomType;
  autoSaveStatus: AutoSaveStatus;
  setCustomType: Dispatch<SetStateAction<CustomType>>;
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

  const isFirstRender = useIsFirstRender();
  const [customType, setCustomType] = useState(initialCustomType);
  const format = getFormat(customType);
  const customTypeMessages = CUSTOM_TYPES_MESSAGES[format];
  const { autoSaveStatus, setNextSave } = useAutoSave({
    errorMessage: customTypeMessages.autoSaveFailed,
  });
  const { saveCustomTypeSuccess } = useSliceMachineActions();
  const stableSaveCustomTypeSuccess = useStableCallback(saveCustomTypeSuccess);

  useEffect(() => {
    // Prevent a save to be triggered on first render
    if (!isFirstRender) {
      setNextSave(async () => {
        const { errors } = await updateCustomType(customType);

        if (errors.length > 0) {
          throw errors;
        }

        // Update available custom types store with new custom type
        stableSaveCustomTypeSuccess(customType);
      });
    }
  }, [customType, setNextSave, isFirstRender, stableSaveCustomTypeSuccess]);

  const contextValue: CustomTypeContext = useMemo(
    () => ({
      autoSaveStatus,
      customType,
      setCustomType,
    }),
    [autoSaveStatus, customType, setCustomType],
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
