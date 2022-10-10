import React from "react";
import { Box, Flex, Text, useThemeUI } from "theme-ui";

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
        MainBreadcrumb={
          <>
            <MdSpaceDashboard /> <Text ml={2}>Custom Types</Text>
          </>
        }
        SecondaryBreadcrumb={
          <Box sx={{ fontWeight: "thin" }} as="span">
            <Text ml={2} data-cy="custom-type-secondary-breadcrumb">
              / {currentCustomType.label}
            </Text>
          </Box>
        }
        breadrumbHref="/"
        ActionButton={
          <Flex sx={{ alignItems: "center" }}>
            <SliceMachineIconButton
              Icon={MdModeEdit}
              label="Edit custom type name"
              data-cy="edit-custom-type"
              sx={{
                cursor: "pointer",
                color: theme.colors?.icons,
                height: 32,
                width: 32,
              }}
              onClick={openRenameCustomTypeModal}
              style={{
                color: "#4E4E55",
                backgroundColor: "#F3F5F7",
                border: "1px solid #3E3E4826",
                marginRight: "8px",
              }}
            />
            <Button
              label="Save to File System"
              isLoading={isSavingCustomType}
              disabled={!hasPendingModifications || isSavingCustomType}
              onClick={saveCustomType}
              Icon={AiFillSave}
              data-cy="builder-save-button"
            />
          </Flex>
        }
      />
      <RenameCustomTypeModal
        customTypeName={currentCustomType.label || ""}
        customTypeId={currentCustomType.id}
      />
    </>
  );
};

export default CustomTypeHeader;
