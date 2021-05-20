// import { useState } from "react"

import {
  CustomTypeState,
  CustomTypeStatus,
} from "../../../models/ui/CustomTypeState";
import { useToasts } from "react-toast-notifications";
import { handleRemoteResponse } from "../../../../src/ToastProvider/utils";

import { Box, Button, Flex, Link as ThemeLinK, Text } from "theme-ui";

import CustomTypeStore from "../../../../src/models/customType/store";
import { ToastPayload } from '../../../../src/ToastProvider/utils'

import FlexWrapper from "./FlexWrapper";

import { FiLayout } from "react-icons/fi";
import Link from "next/link";


const Header = ({
  Model,
  store,
}: {
  Model: CustomTypeState;
  store: CustomTypeStore;
}) => {
  // const [isLoading, setIsLoading] = useState(false)
  const { addToast } = useToasts()

  const buttonProps = (() => {
    if (Model.isTouched) {
      return {
        onClick: () => {
          // setIsLoading(true)
          store.save(Model)
        },
        children: (
          <span>
            {/* { isLoading ? <Spinner color="#F7F7F7" size={24} mr={2} /> : null } */}
            Save to File System
          </span>
        ),
      };
    }
    if (
      [CustomTypeStatus.New, CustomTypeStatus.Modified].includes(Model.__status as CustomTypeStatus)
    ) {
      return {
        onClick: () => {
          store.push(Model, (data: ToastPayload): void => {
            if (data.done) {
              // setIsLoading(false)
              handleRemoteResponse(addToast)(data);
            }
          })
        },
        children: "Push to Prismic",
      };
    }
    return { variant: "disabled", children: "Synced with Prismic" };
  })();

  return (
    <Box sx={{ bg: "backgroundClear" }}>
      <FlexWrapper
        sx={{
          py: 4,
          justifyContent: "space-between",
        }}
      >
        <Flex
          sx={{
            fontSize: 4,
            fontWeight: "heading",
            alignItems: "center",
          }}
        >
          <Link href="/" passHref>
            <ThemeLinK variant="invisible">
              <Flex sx={{ alignItems: "center" }}>
                <FiLayout /> <Text ml={2}>Templates</Text>
              </Flex>
            </ThemeLinK>
          </Link>
          <Box sx={{ fontWeight: "thin" }} as="span">
            <Text ml={2}>/ {Model.label} </Text>
          </Box>
        </Flex>
        <Button {...buttonProps} />
      </FlexWrapper>
    </Box>
  );
};

export default Header;
