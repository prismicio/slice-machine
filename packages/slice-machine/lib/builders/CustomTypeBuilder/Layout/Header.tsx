import React from "react";
import { Box, Button, Spinner, Text } from "theme-ui";

import Header from "@components/Header";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { MdSpaceDashboard } from "react-icons/md";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import {
  selectCurrentCustomType,
  selectCustomTypeStatus,
  selectIsCurrentCustomTypeHasPendingModifications,
} from "@src/modules/selectedCustomType";
import { isLoading } from "@src/modules/loading";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import { CustomTypeStatus } from "@src/modules/selectedCustomType/types";
import { findModelErrors } from "@src/modules/modelErrors";
import { ModelErrorsEntry } from "@src/modules/modelErrors/types";

const CustomTypeHeader = () => {
  const {
    currentCustomType,
    hasPendingModifications,
    customTypeStatus,
    isPushingCustomType,
    isSavingCustomType,
    modelErrors,
  } = useSelector((store: SliceMachineStoreType) => ({
    currentCustomType: selectCurrentCustomType(store),
    hasPendingModifications:
      selectIsCurrentCustomTypeHasPendingModifications(store),
    customTypeStatus: selectCustomTypeStatus(store),
    isPushingCustomType: isLoading(store, LoadingKeysEnum.PUSH_CUSTOM_TYPE),
    isSavingCustomType: isLoading(store, LoadingKeysEnum.SAVE_CUSTOM_TYPE),
    modelErrors: findModelErrors(store),
  }));
  const { saveCustomType, pushCustomType } = useSliceMachineActions();

  if (!currentCustomType) return null;

  const currentCtModelErrors: ModelErrorsEntry | undefined =
    modelErrors.customTypes[currentCustomType.id];
  const hasModelErrors = Boolean(
    currentCtModelErrors && Object.keys(currentCtModelErrors).length > 0
  );

  const buttonProps = (() => {
    if (hasPendingModifications) {
      return {
        onClick: () => {
          saveCustomType();
        },
        children: (
          <span>
            {isSavingCustomType ? (
              <Spinner
                color="#F7F7F7"
                size={20}
                mr={2}
                sx={{ position: "relative", top: "5px", left: "3px" }}
              />
            ) : null}
            Save to File System
          </span>
        ),
      };
    }
    if (
      [CustomTypeStatus.New, CustomTypeStatus.Modified].includes(
        customTypeStatus
      ) &&
      hasModelErrors
    ) {
      return { variant: "disabled", children: "Push to Prismic" };
    }

    if (
      [CustomTypeStatus.New, CustomTypeStatus.Modified].includes(
        customTypeStatus
      )
    ) {
      return {
        onClick: () => {
          if (!isPushingCustomType) {
            pushCustomType();
          }
        },
        children: (
          <span>
            {isPushingCustomType ? (
              <Spinner
                color="#F7F7F7"
                size={20}
                mr={2}
                sx={{ position: "relative", top: "5px", left: "3px" }}
              />
            ) : null}
            Push to Prismic
          </span>
        ),
      };
    }
    return { variant: "disabled", children: "Synced with Prismic" };
  })();

  return (
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
      ActionButton={<Button {...buttonProps} />}
    />
  );
};

export default CustomTypeHeader;
