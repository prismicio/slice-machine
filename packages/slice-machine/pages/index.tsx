import React from "react";
import { Flex, Link as ThemeLink, Text } from "theme-ui";

import Container from "@components/Container";
import CreateCustomTypeModal from "@components/Forms/CreateCustomTypeModal";
import Header from "@components/Header";
import EmptyState from "@components/EmptyState";
import { Button } from "@components/Button";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import {
  selectCustomTypeCount,
  selectAllCustomTypes,
} from "@src/modules/availableCustomTypes";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { isLoading } from "@src/modules/loading";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import { MdSpaceDashboard } from "react-icons/md";
import { CustomTypeTable } from "@components/CustomTypeTable/ctPage";
import { GoPlus } from "react-icons/go";
import { VIDEO_WHAT_ARE_CUSTOM_TYPES } from "../lib/consts";

const CustomTypes: React.FunctionComponent = () => {
  const { openCreateCustomTypeModal } = useSliceMachineActions();
  const { customTypes, isCreatingCustomType, customTypeCount } = useSelector(
    (store: SliceMachineStoreType) => ({
      customTypes: selectAllCustomTypes(store),
      customTypeCount: selectCustomTypeCount(store),
      isCreatingCustomType: isLoading(
        store,
        LoadingKeysEnum.CREATE_CUSTOM_TYPE
      ),
    })
  );

  return (
    <Container sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <Header
        link={{
          Element: (
            <>
              <MdSpaceDashboard /> <Text ml={2}>Custom Types</Text>
            </>
          ),
          href: "/",
        }}
        Actions={
          customTypeCount > 0
            ? [
                <Button
                  label="Create a Custom Type"
                  onClick={openCreateCustomTypeModal}
                  isLoading={isCreatingCustomType}
                  disabled={isCreatingCustomType}
                  Icon={GoPlus}
                  data-cy="create-ct"
                />,
              ]
            : []
        }
      />
      {customTypeCount === 0 ? (
        <Flex
          sx={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <EmptyState
            title={"What are Custom Types?"}
            onCreateNew={openCreateCustomTypeModal}
            isLoading={isCreatingCustomType}
            buttonText={"Create one"}
            videoPublicIdUrl={VIDEO_WHAT_ARE_CUSTOM_TYPES}
            documentationComponent={
              <>
                Custom Types are models for your documents. They are the place
                where you define and configure Fields and Slices for your
                content. They will be stored locally, and you will be able to
                push them to your repository.{" "}
                <ThemeLink
                  target={"_blank"}
                  href={"https://prismic.io/docs/core-concepts/custom-types "}
                  sx={(theme) => ({ color: theme?.colors?.primary })}
                >
                  Learn more
                </ThemeLink>
                .
              </>
            }
          />
        </Flex>
      ) : (
        <CustomTypeTable customTypes={customTypes} />
      )}
      <CreateCustomTypeModal />
    </Container>
  );
};

export default CustomTypes;
