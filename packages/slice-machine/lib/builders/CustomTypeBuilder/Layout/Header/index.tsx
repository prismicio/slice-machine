import { Text } from "theme-ui";

import Header from "@components/Header";

import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { createElement } from "react";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { selectCurrentCustomType } from "@src/modules/selectedCustomType";

import { isSelectedCustomTypeTouched } from "@src/modules/selectedCustomType";

import { isLoading } from "@src/modules/loading";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import { AiFillSave } from "react-icons/ai";
import { Button } from "@components/Button";
import { CUSTOM_TYPES_CONFIG } from "@src/features/customTypes/customTypesConfig";
import { CUSTOM_TYPES_MESSAGES } from "@src/features/customTypes/customTypesMessages";

const CustomTypeHeader = () => {
  const { currentCustomType } = useSelector((store: SliceMachineStoreType) => ({
    currentCustomType: selectCurrentCustomType(store),
  }));
  const { hasPendingModifications, isSavingCustomType, isCreatingSlice } =
    useSelector((store: SliceMachineStoreType) => ({
      hasPendingModifications: isSelectedCustomTypeTouched(store),
      isSavingCustomType: isLoading(store, LoadingKeysEnum.SAVE_CUSTOM_TYPE),
      isCreatingSlice: isLoading(store, LoadingKeysEnum.CREATE_SLICE),
    }));
  const { saveCustomType } = useSliceMachineActions();

  if (!currentCustomType) return null;

  const customTypesConfig = CUSTOM_TYPES_CONFIG[currentCustomType.format];
  const customTypesMessages = CUSTOM_TYPES_MESSAGES[currentCustomType.format];

  return (
    <>
      <Header
        link={{
          Element: (
            <>
              {createElement(customTypesConfig["Icon"])}
              <Text>
                {customTypesMessages.name({ start: true, plural: true })}
              </Text>
            </>
          ),
          href: customTypesConfig.tablePagePathname,
        }}
        subtitle={{
          Element: (
            <Text data-cy="custom-type-secondary-breadcrumb">
              / {currentCustomType.label}
            </Text>
          ),
          title: currentCustomType.label || "",
        }}
        Actions={[
          <Button
            key="builder-save-button"
            label="Save to File System"
            isLoading={isSavingCustomType}
            disabled={
              !hasPendingModifications || isSavingCustomType || isCreatingSlice
            }
            onClick={saveCustomType}
            Icon={AiFillSave}
            iconFill="#FFFFFF"
            data-cy="builder-save-button"
          />,
        ]}
      />
    </>
  );
};

export default CustomTypeHeader;
