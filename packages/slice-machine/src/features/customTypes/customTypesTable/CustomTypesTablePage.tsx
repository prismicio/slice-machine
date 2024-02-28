import { type FC, Suspense, useState } from "react";
import {
  Button,
  Box,
  ProgressCircle,
  DefaultErrorMessage,
} from "@prismicio/editor-ui";
import Head from "next/head";

import {
  AppLayout,
  AppLayoutActions,
  AppLayoutBreadcrumb,
  AppLayoutContent,
  AppLayoutHeader,
} from "@components/AppLayout";
import { CreateCustomTypeModal } from "@components/Forms/CreateCustomTypeModal";
import { CUSTOM_TYPES_MESSAGES } from "@src/features/customTypes/customTypesMessages";
import { ErrorBoundary } from "@src/ErrorBoundary";
import type { CustomTypeFormat } from "@slicemachine/manager";

import { CustomTypesTable } from "./CustomTypesTable";

type CustomTypesTablePageProps = {
  format: CustomTypeFormat;
};

export const CustomTypesTablePage: FC<CustomTypesTablePageProps> = ({
  format,
}) => {
  const customTypesMessages = CUSTOM_TYPES_MESSAGES[format];
  const [isCreatingCustomType, setIsCreatingCustomType] = useState(false);
  const [isCreateCustomTypeModalOpen, setIsCreateCustomTypeModalOpen] =
    useState(false);

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
                    { start: false, plural: true },
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
                  data-testid="create-ct"
                  loading={isCreatingCustomType}
                  onClick={() => {
                    setIsCreateCustomTypeModalOpen(true);
                  }}
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
                  openCreateCustomTypeModal={() => {
                    setIsCreateCustomTypeModalOpen(true);
                  }}
                />
                <CreateCustomTypeModal
                  format={format}
                  isCreating={isCreatingCustomType}
                  isOpen={isCreateCustomTypeModalOpen}
                  onCreateChange={setIsCreatingCustomType}
                  onOpenChange={setIsCreateCustomTypeModalOpen}
                />
              </Box>
            </AppLayoutContent>
          </AppLayout>
        </Suspense>
      </ErrorBoundary>
    </>
  );
};
