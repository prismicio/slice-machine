import React from "react";
import { Text, useThemeUI } from "theme-ui";

import Header from "@components/Header";

import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { MdModeEdit, MdSpaceDashboard } from "react-icons/md";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { selectCurrentCustomType } from "@src/modules/selectedCustomType";
import SliceMachineIconButton from "@components/SliceMachineIconButton";

import { RenameCustomTypeModal } from "@components/Forms/RenameCustomTypeModal";
import { isSelectedCustomTypeTouched } from "@src/modules/selectedCustomType";

import { isLoading } from "@src/modules/loading";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import { AiFillSave } from "react-icons/ai";
import { Button } from "@components/Button";

const CustomTypeHeader = () => {
  const { currentCustomType } = useSelector((store: SliceMachineStoreType) => ({
    currentCustomType: selectCurrentCustomType(store),
  }));
  const { openRenameCustomTypeModal } = useSliceMachineActions();
  const { theme } = useThemeUI();

  const { hasPendingModifications, isSavingCustomType } = useSelector(
    (store: SliceMachineStoreType) => ({
      hasPendingModifications: isSelectedCustomTypeTouched(store),
      isSavingCustomType: isLoading(store, LoadingKeysEnum.SAVE_CUSTOM_TYPE),
    })
  );
  const { saveCustomType } = useSliceMachineActions();

  if (!currentCustomType) return null;

  return (
    <>
      <Header
        link={{
          Element: (
            <>
              <MdSpaceDashboard />
              <Text>Custom Types</Text>
            </>
          ),
          href: "/",
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
          <SliceMachineIconButton
            Icon={MdModeEdit}
            label="Edit custom type name"
            data-cy="edit-custom-type"
            sx={{
              cursor: "pointer",
              color: theme.colors?.icons,
              height: 40,
              width: 40,
            }}
            onClick={openRenameCustomTypeModal}
            style={{
              color: "#4E4E55",
              backgroundColor: "#F3F5F7",
              border: "1px solid #3E3E4826",
              marginRight: "8px",
            }}
          />,
          <Button
            label="Save to File System"
            isLoading={isSavingCustomType}
            disabled={!hasPendingModifications || isSavingCustomType}
            onClick={saveCustomType}
            Icon={AiFillSave}
            iconFill="#FFFFFF"
            data-cy="builder-save-button"
          />,
        ]}
      />
      <RenameCustomTypeModal
        customTypeName={currentCustomType.label || ""}
        customTypeId={currentCustomType.id}
      />
    </>
  );
};

export default CustomTypeHeader;
