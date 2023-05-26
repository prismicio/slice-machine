import { type FC, Suspense } from "react";
import { Icon, Button, ErrorBoundary, Box, vars } from "@prismicio/editor-ui";
import Head from "next/head";
import { useSelector } from "react-redux";

import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { isLoading } from "@src/modules/loading";
import { type SliceMachineStoreType } from "@src/redux/type";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import { CreateCustomTypeModal } from "@components/Forms/CreateCustomTypeModal";
import { Breadcrumb } from "@src/components/Breadcrumb/Breadcrumb";
import { CustomTypesTable } from "@src/features/customTypes/CustomTypesTable";
import { CUSTOM_TYPES_CONFIG } from "@src/features/customTypes/customTypesConfig";

const CustomTypesPage: FC = () => {
  const format = "custom";
  const customTypesConfig = CUSTOM_TYPES_CONFIG[format];
  const { openCreateCustomTypeModal } = useSliceMachineActions();
  const { isCreatingCustomType } = useSelector(
    (store: SliceMachineStoreType) => ({
      isCreatingCustomType: isLoading(
        store,
        LoadingKeysEnum.CREATE_CUSTOM_TYPE
      ),
    })
  );

  return (
    <>
      <Head>
        <title>{customTypesConfig.title} - Slice Machine</title>
      </Head>
      <div
        style={{
          display: "flex",
          width: vars.size["100%"],
          flexDirection: "column",
          margin: `${vars.size[16]} 0`,
        }}
      >
        <ErrorBoundary
          title="Request failed"
          description={customTypesConfig.errorDescription}
          renderError={(error) => {
            return (
              <Box
                height={"100%"}
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
              >
                {error}
              </Box>
            );
          }}
        >
          <Suspense fallback="Loading...">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: vars.size[16],
                height: vars.size[32],
              }}
            >
              <Breadcrumb>{customTypesConfig.title}</Breadcrumb>
              <Button
                data-cy="create-ct"
                endIcon={<Icon name="add" />}
                loading={isCreatingCustomType}
                onClick={openCreateCustomTypeModal}
              >
                Create
              </Button>
            </div>

            <CustomTypesTable
              format={format}
              isCreatingCustomType={isCreatingCustomType}
            />
            <CreateCustomTypeModal format={format} />
          </Suspense>
        </ErrorBoundary>
      </div>
    </>
  );
};

export default CustomTypesPage;
