import { Box } from "@prismicio/editor-ui";
import Head from "next/head";
import { useRouter } from "next/router";
import { type FC, useEffect } from "react";
import { useSelector } from "react-redux";

import { BreadcrumbItem } from "@/components/Breadcrumb";
import { getFormat } from "@/domain/customType";
import { AutoSaveStatusIndicator } from "@/features/autoSave/AutoSaveStatusIndicator";
import {
  CUSTOM_TYPES_CONFIG,
  readBuilderPageDynamicSegment,
} from "@/features/customTypes/customTypesConfig";
import {
  AppLayout,
  AppLayoutActions,
  AppLayoutBackButton,
  AppLayoutBreadcrumb,
  AppLayoutContent,
  AppLayoutHeader,
} from "@/legacy/components/AppLayout";
import { CustomTypeBuilder } from "@/legacy/lib/builders/CustomTypeBuilder";
import {
  CustomTypes,
  CustomTypeSM,
} from "@/legacy/lib/models/common/CustomType";
import { hasLocal } from "@/legacy/lib/models/common/ModelData";
import { selectCustomTypeById } from "@/modules/availableCustomTypes";
import type { SliceMachineStoreType } from "@/redux/type";

import { CUSTOM_TYPES_MESSAGES } from "../customTypesMessages";
import { EditDropdown } from "../EditDropdown";
import { CustomTypeProvider } from "./CustomTypeProvider";
import { PageSnippetDialog } from "./PageSnippetDialog";

export const CustomTypesBuilderPage: FC = () => {
  const router = useRouter();
  const { selectedCustomType } = useSelector(
    (store: SliceMachineStoreType) => ({
      selectedCustomType: selectCustomTypeById(
        store,
        readBuilderPageDynamicSegment(router.query) as string,
      ),
    }),
  );

  useEffect(() => {
    // This is a fallback in case the user try to directly access a custom type
    // that don't exist
    // TODO(DT-1801): implement a 404 page.
    if (!selectedCustomType || !hasLocal(selectedCustomType)) {
      void router.replace("/");
    }
  }, [selectedCustomType, router]);

  if (!selectedCustomType || !hasLocal(selectedCustomType)) {
    return <AppLayout />;
  }

  return (
    <>
      <Head>
        <title>{selectedCustomType.local.label} - Slice Machine</title>
      </Head>
      <CustomTypesBuilderPageWithProvider
        customType={selectedCustomType.local}
      />
    </>
  );
};

type CustomTypesBuilderPageWithProviderProps = {
  customType: CustomTypeSM;
};

const CustomTypesBuilderPageWithProvider: React.FC<
  CustomTypesBuilderPageWithProviderProps
> = ({ customType: customTypeFromStore }) => {
  if (customTypeFromStore === null) {
    return <AppLayout />;
  }
  return (
    <AppLayout>
      <CustomTypeProvider
        initialCustomType={CustomTypes.fromSM(customTypeFromStore)}
      >
        {({ actionQueueStatus, customType, setCustomType }) => {
          const format = getFormat(customType);
          const config = CUSTOM_TYPES_CONFIG[customTypeFromStore.format];
          const messages = CUSTOM_TYPES_MESSAGES[customTypeFromStore.format];

          return (
            <>
              <AppLayoutHeader>
                <AppLayoutBackButton url={config.tablePagePathname} />
                <AppLayoutBreadcrumb>
                  <BreadcrumbItem>
                    {messages.name({ start: true, plural: true })}
                  </BreadcrumbItem>
                  <BreadcrumbItem active>
                    {customType.label ?? customType.id}
                  </BreadcrumbItem>
                </AppLayoutBreadcrumb>
                <AppLayoutActions>
                  <AutoSaveStatusIndicator status={actionQueueStatus} />
                  {customType.format === "page" ? (
                    <PageSnippetDialog model={customType} />
                  ) : undefined}
                  <EditDropdown
                    isChangesLocal
                    format={format}
                    customType={customType}
                    setLocalCustomType={setCustomType}
                  />
                </AppLayoutActions>
              </AppLayoutHeader>
              <AppLayoutContent>
                <Box flexDirection="column" minWidth={0}>
                  <CustomTypeBuilder />
                </Box>
              </AppLayoutContent>
            </>
          );
        }}
      </CustomTypeProvider>
    </AppLayout>
  );
};
