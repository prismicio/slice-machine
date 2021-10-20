import { Fragment, useContext, useState } from "react";

import {
  CustomTypeState,
  CustomTypeStatus,
} from "../../../models/ui/CustomTypeState";
import { useToasts } from "react-toast-notifications";
import { handleRemoteResponse } from "../../../../src/ToastProvider/utils";

import { Box, Button, Text, Spinner } from "theme-ui";

import CustomTypeStore from "../../../../src/models/customType/store";
import { ToastPayload } from "../../../../src/ToastProvider/utils";

import { FiLayout } from "react-icons/fi";

import Header from "../../../../components/Header";
import { LoginModalContext } from "@src/LoginModalProvider";

const CustomTypeHeader = ({
  Model,
  store,
}: {
  Model: CustomTypeState;
  store: CustomTypeStore;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { openLogin } = useContext(LoginModalContext);
  const { addToast } = useToasts();

  const buttonProps = (() => {
    if (Model.isTouched) {
      return {
        onClick: () => {
          store.save(Model);
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
            store.push(Model, (data: ToastPayload): void => {
              if (!data.done) {
                return;
              }
              setIsLoading(false);
              handleRemoteResponse(addToast)(data);
              if (data.error && data.status === 403) {
                openLogin();
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
          <FiLayout /> <Text ml={2}>Custom Types</Text>
        </Fragment>
      }
      SecondaryBreadcrumb={
        <Box sx={{ fontWeight: "thin" }} as="span">
          <Text ml={2}>/ {Model.current.label} </Text>
        </Box>
      }
      breadrumbHref="/"
      ActionButton={<Button {...buttonProps} />}
    />
  );
};

export default CustomTypeHeader;
