import { type FC, Suspense } from "react";
import {
  Button,
  ErrorBoundary,
  Box,
  ProgressCircle,
  DefaultErrorMessage,
} from "@prismicio/editor-ui";
import Head from "next/head";
import { useSelector } from "react-redux";

import {
  AppLayout,
  AppLayoutActions,
  AppLayoutBreadcrumb,
  AppLayoutContent,
  AppLayoutHeader,
} from "@components/AppLayout";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { isLoading } from "@src/modules/loading";
import { type SliceMachineStoreType } from "@src/redux/type";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import { CreateCustomTypeModal } from "@components/Forms/CreateCustomTypeModal";
import { CUSTOM_TYPES_MESSAGES } from "@src/features/customTypes/customTypesMessages";
import type { CustomTypeFormat } from "@slicemachine/manager";
import { CustomTypesTable } from "./CustomTypesTable";

type CustomTypesTablePageProps = {
  format: CustomTypeFormat;
};

export const CustomTypesTablePage: FC<CustomTypesTablePageProps> = ({
  format,
}) => {
  const customTypesMessages = CUSTOM_TYPES_MESSAGES[format];
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
        <title>
          {customTypesMessages.name({ start: true, plural: true })} - Slice
          Machine
        </title>
      </Head>
      <ErrorBoundary
        renderError={() => (
          <AppLayout>
            <AppLayoutContent>
              <Box alignItems="center" justifyContent="center">
                <DefaultErrorMessage
                  title="Request failed"
                  description={`An error occurred while fetching your ${customTypesMessages.name(
                    { start: false, plural: true }
                  )}.`}
                />
              </Box>
            </AppLayoutContent>
          </AppLayout>
        )}
      >
        <Suspense
          fallback={
            <AppLayout>
              <AppLayoutHeader>
                <AppLayoutBreadcrumb
                  folder={customTypesMessages.name({
                    start: true,
                    plural: true,
                  })}
                />
                <AppLayoutActions>
                  <Button disabled startIcon="add">
                    Create
                  </Button>
                </AppLayoutActions>
              </AppLayoutHeader>
              <AppLayoutContent>
                <ProgressCircle />
              </AppLayoutContent>
            </AppLayout>
          }
        >
          <AppLayout>
            <AppLayoutHeader>
              <AppLayoutBreadcrumb
                folder={customTypesMessages.name({
                  start: true,
                  plural: true,
                })}
              />
              <AppLayoutActions>
                <Button
                  data-cy="create-ct"
                  loading={isCreatingCustomType}
                  onClick={openCreateCustomTypeModal}
                  startIcon="add"
                >
                  Create
                </Button>
              </AppLayoutActions>
            </AppLayoutHeader>
            <AppLayoutContent>
              <Box flexDirection="column">
                <CustomTypesTable
                  format={format}
                  isCreatingCustomType={isCreatingCustomType}
                />
                <CreateCustomTypeModal format={format} />
              </Box>
            </AppLayoutContent>
          </AppLayout>
        </Suspense>
      </ErrorBoundary>
    </>
  );
};
