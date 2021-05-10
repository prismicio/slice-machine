import {
  CustomTypeState,
  CustomTypeStatus,
} from "../../../models/ui/CustomTypeState";
import { useToasts } from "react-toast-notifications";
import { handleRemoteResponse } from "../../../../src/ToastProvider/utils";

import { Box, Button, Flex, Link as ThemeLinK, Text } from "theme-ui";

import CustomTypeStore from "../../../../src/models/customType/store";

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
  const { addToast } = useToasts();

  console.log(Model);

  const buttonProps = (() => {
    if (Model.isTouched) {
      return {
        onClick: () => store.save(Model),
        children: "Save to File System",
      };
    }
    if (
      [CustomTypeStatus.New, CustomTypeStatus.Modified].includes(Model.__status)
    ) {
      return {
        onClick: () =>
          store.push(Model, (data) => {
            if (data.done) {
              handleRemoteResponse(addToast)(data);
            }
          }),
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
          <Link href="/slices" passHref>
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
