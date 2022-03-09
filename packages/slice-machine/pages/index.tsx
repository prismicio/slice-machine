import Link from "next/link";
import React, { Fragment } from "react";
import { Box, Button, Link as ThemeLink, Spinner, Text } from "theme-ui";

import Container from "components/Container";
import CreateCustomTypeModal from "components/Forms/CreateCustomTypeModal";
import Header from "components/Header";
import EmptyState from "components/EmptyState";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { selectLocalCustomTypes } from "@src/modules/customTypes";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { isLoading } from "@src/modules/loading";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import { MdSpaceDashboard } from "react-icons/md";
import { CustomType, ObjectTabs } from "@models/common/CustomType";

const CustomTypeTable: React.FC<{
  customTypes: ReadonlyArray<CustomType<ObjectTabs>>;
}> = ({ customTypes }) => {
  const firstColumnWidth = "35%";
  const secondColumnWidth = "50%";
  const thirdColumnWidth = "15%";

  return (
    <Box
      as={"table"}
      sx={{
        mt: "36px",
      }}
    >
      <thead>
        <tr>
          <Box as={"th"} sx={{ width: firstColumnWidth }}>
            Name
          </Box>
          <Box as={"th"} sx={{ width: secondColumnWidth }}>
            API ID
          </Box>
          <Box as={"th"} sx={{ width: thirdColumnWidth }}>
            Type
          </Box>
        </tr>
      </thead>
      <tbody>
        {customTypes.map((customType) => (
          <Link passHref href={`/cts/${customType.id}`} key={customType.id}>
            <tr key={customType.id}>
              <Box as={"td"} style={{ width: firstColumnWidth }}>
                <Text sx={{ fontWeight: 500 }}>{customType.label}</Text>
              </Box>
              <Box as={"td"} style={{ width: secondColumnWidth }}>
                {customType.id}
              </Box>
              <Box as={"td"} style={{ width: thirdColumnWidth }}>
                {customType.repeatable ? "Repeatable Type" : "Single Type"}
              </Box>
            </tr>
          </Link>
        ))}
      </tbody>
    </Box>
  );
};

const CustomTypes: React.FunctionComponent = () => {
  const { openCreateCustomTypeModal } = useSliceMachineActions();
  const { customTypes, isCreatingCustomType } = useSelector(
    (store: SliceMachineStoreType) => ({
      customTypes: selectLocalCustomTypes(store),
      isCreatingCustomType: isLoading(
        store,
        LoadingKeysEnum.CREATE_CUSTOM_TYPE
      ),
    })
  );

  return (
    <Container sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <Header
        ActionButton={
          customTypes.length ? (
            <Button
              data-cy="create-ct"
              onClick={openCreateCustomTypeModal}
              sx={{
                minWidth: "171px",
              }}
            >
              {isCreatingCustomType ? (
                <Spinner color="#FFF" size={14} />
              ) : (
                "Create a Custom Type"
              )}
            </Button>
          ) : undefined
        }
        MainBreadcrumb={
          <Fragment>
            <MdSpaceDashboard /> <Text ml={2}>Custom Types</Text>
          </Fragment>
        }
        breadrumbHref="/"
      />
      {customTypes.length === 0 ? (
        <EmptyState
          title={"Create your first Custom Type"}
          explanations={[
            "Click the + button on the top right to create your first custom type.",
            "It will be stored locally. You will then be able to push it to Prismic.",
          ]}
          onCreateNew={openCreateCustomTypeModal}
          buttonText={"Create your first Custom Type"}
          documentationComponent={
            <>
              Go to our{" "}
              <ThemeLink
                target={"_blank"}
                href={"https://prismic.io/docs/core-concepts/custom-types "}
                sx={(theme) => ({ color: theme?.colors?.primary })}
              >
                documentation
              </ThemeLink>{" "}
              to learn more about Custom Types.
            </>
          }
        />
      ) : (
        <CustomTypeTable customTypes={customTypes} />
      )}
      <CreateCustomTypeModal />
    </Container>
  );
};

export default CustomTypes;
