import React from "react";
import { Box, Flex, Text, useThemeUI } from "theme-ui";

import Header from "@components/Header";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { MdModeEdit, MdSpaceDashboard } from "react-icons/md";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { selectCurrentCustomType } from "@src/modules/selectedCustomType";
import { isLoading } from "@src/modules/loading";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import SliceMachineIconButton from "@components/SliceMachineIconButton";
import { PrimaryButton } from "./primaryButton";
import { RenameCustomTypeModal } from "@components/Forms/RenameCustomTypeModal";

const CustomTypeHeader = () => {
  const { currentCustomType, isPushingCustomType, isSavingCustomType } =
    useSelector((store: SliceMachineStoreType) => ({
      currentCustomType: selectCurrentCustomType(store),
      isPushingCustomType: isLoading(store, LoadingKeysEnum.PUSH_CUSTOM_TYPE),
      isSavingCustomType: isLoading(store, LoadingKeysEnum.SAVE_CUSTOM_TYPE),
    }));
  const { openRenameCustomTypeModal } = useSliceMachineActions();
  const { theme } = useThemeUI();

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
            <Text ml={2}>/ {currentCustomType.label} </Text>
          </Box>
        }
        breadrumbHref="/"
        ActionButton={
          <Flex sx={{ alignItems: "center" }}>
            <SliceMachineIconButton
              Icon={MdModeEdit}
              label="Edit custom type name"
              disabled={isSavingCustomType || isPushingCustomType}
              sx={{
                cursor: "pointer",
                color: theme.colors?.icons,
                height: 36,
                width: 36,
              }}
              onClick={openRenameCustomTypeModal}
              style={{
                color: "#4E4E55",
                backgroundColor: "#F3F5F7",
                border: "1px solid #3E3E4826",
                marginRight: "8px",
              }}
            />
            <PrimaryButton
              isSavingCustomType={isSavingCustomType}
              isPushingCustomType={isPushingCustomType}
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
