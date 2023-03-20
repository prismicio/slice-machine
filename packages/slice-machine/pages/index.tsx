import React from "react";
import { Flex, Link as ThemeLink, Text } from "theme-ui";

import Container from "@components/Container";
import CreateCustomTypeModal from "@components/Forms/CreateCustomTypeModal";
import Header from "@components/Header";
import EmptyState from "@components/EmptyState";
import { Button } from "@components/Button";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { selectAllCustomTypes } from "@src/modules/availableCustomTypes";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { isLoading } from "@src/modules/loading";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import { MdSpaceDashboard } from "react-icons/md";
import { CustomTypeTable } from "@components/CustomTypeTable/ctPage";
import { GoPlus } from "react-icons/go";
import { VIDEO_WHAT_ARE_CUSTOM_TYPES } from "../lib/consts";
import { hasLocal } from "@lib/models/common/ModelData";

const CustomTypes: React.FunctionComponent = () => {
  const { openCreateCustomTypeModal } = useSliceMachineActions();
  const { customTypes, isCreatingCustomType } = useSelector(
    (store: SliceMachineStoreType) => ({
      customTypes: selectAllCustomTypes(store).filter(hasLocal),
      isCreatingCustomType: isLoading(
        store,
        LoadingKeysEnum.CREATE_CUSTOM_TYPE
      ),
    })
  );

  const sortedCustomTypes = customTypes.sort((customType1, customType2) => {
    if (customType1.local.id > customType2.local.id) {
      return 1;
    } else if (customType1.local.id < customType2.local.id) {
      return -1;
    }

    return 0;
  });

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
          sortedCustomTypes.length > 0
            ? [
                <Button
                  key="create-custom-type"
                  label="Create a Custom Type"
                  onClick={openCreateCustomTypeModal}
                  isLoading={isCreatingCustomType}
                  disabled={isCreatingCustomType}
                  Icon={GoPlus}
                  iconFill="#FFFFFF"
                  data-cy="create-ct"
                />,
              ]
            : []
        }
      />
      {sortedCustomTypes.length === 0 ? (
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
        <CustomTypeTable customTypes={sortedCustomTypes} />
      )}
      <CreateCustomTypeModal />
    </Container>
  );
};

export default CustomTypes;
