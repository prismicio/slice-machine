import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CustomType } from "@prismicio/types-internal/lib/customtypes";

import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import {
  AutoSaveStatusType,
  useAutoSave,
} from "@src/features/autoSave/useAutoSave";
import { getFormat } from "@src/domain/customType";
import { updateCustomType } from "@src/apiClient";

import { CUSTOM_TYPES_MESSAGES } from "../customTypesMessages";

type CustomTypeContext = {
  customType: CustomType;
  autoSaveStatus: AutoSaveStatusType;
  setCustomType: Dispatch<SetStateAction<CustomType>>;
};

type CustomTypeStateProviderProps = {
  children: ReactNode | ((value: CustomTypeContext) => ReactNode);
  defaultCustomType: CustomType;
};

const CustomTypeContextValue = createContext<CustomTypeContext>({
  autoSaveStatus: "saved",
  customType: {} as CustomType,
  setCustomType: () => void 0,
});

export function CustomTypeStateProvider(props: CustomTypeStateProviderProps) {
  const { children, defaultCustomType } = props;
  const isMounted = useRef(false);
  const [customType, setCustomType] = useState(defaultCustomType);
  const format = getFormat(customType);
  const customTypeMessages = CUSTOM_TYPES_MESSAGES[format];
  const { autoSaveStatus, setNextSave } = useAutoSave({
    errorMessage: customTypeMessages.autoSaveFailed,
  });
  const { saveCustomTypeSuccess } = useSliceMachineActions();

  useEffect(
    () => {
      // Prevent a save to be triggered on first render
      if (isMounted.current) {
        setNextSave(async () => {
          const { errors } = await updateCustomType(customType);

          if (errors.length > 0) {
            throw errors;
          }

          // Update available custom types store with new custom type
          saveCustomTypeSuccess(customType);
        });
      } else {
        isMounted.current = true;
      }
    },
    // Prevent saveCustomTypeSuccess to trigger infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [customType, setNextSave],
  );

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
  return useContext(CustomTypeContextValue);
}
