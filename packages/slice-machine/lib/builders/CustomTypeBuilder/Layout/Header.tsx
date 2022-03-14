import React, { Fragment, useState } from "react";
import { Box, Button, Spinner, Text } from "theme-ui";

import {
  CustomTypeState,
  CustomTypeStatus,
} from "@lib/models/ui/CustomTypeState";
import { handleRemoteResponse, ToastPayload } from "@src/modules/toaster/utils";

import Header from "../../../../components/Header";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { UseCustomTypeActionsReturnType } from "@src/models/customType/useCustomTypeActions";
import { MdSpaceDashboard } from "react-icons/md";
import {useSelector} from "react-redux";
import {SliceMachineStoreType} from "@src/redux/type";
import {selectCurrentCustomType, selectIsCurrentCustomTypeHasPendingModifications} from "@src/modules/customType";

const CustomTypeHeader = ({
  Model,
  customTypeActions,
}: {
  Model: CustomTypeState;
  customTypeActions: UseCustomTypeActionsReturnType;
}) => {
  const { currentCustomType, hasPendingModifications } = useSelector((store: SliceMachineStoreType) => ({
    currentCustomType: selectCurrentCustomType(store),
    hasPendingModifications: selectIsCurrentCustomTypeHasPendingModifications(store)
  }))
  const [isLoading, setIsLoading] = useState(false);
  const { openLoginModal, openToaster, saveCustomType } = useSliceMachineActions();

  if (!currentCustomType) return null;

  const buttonProps = (() => {
    if (hasPendingModifications) {
      return {
        onClick: () => {
          saveCustomType();
        },
        children: <span>Save to File System</span>,
      };
    }
    if (
      [CustomTypeStatus.New, CustomTypeStatus.Modified].includes(
        Model.__status as CustomTypeStatus
      )
    ) {
      return {
        onClick: () => {
          if (!isLoading) {
            setIsLoading(true);
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            customTypeActions.push(Model, (data: ToastPayload): void => {
              if (!data.done) {
                return;
              }
              setIsLoading(false);
              handleRemoteResponse(openToaster)(data);
              if (data.error && data.status === 403) {
                openLoginModal();
              }
            });
          }
        },
        children: (
          <span>
            {isLoading ? (
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
        <Fragment>
          <MdSpaceDashboard /> <Text ml={2}>Custom Types</Text>
        </Fragment>
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
