import { Box } from "@prismicio/editor-ui";
import Head from "next/head";
import { useRouter } from "next/router";
import { type FC, useEffect } from "react";
import { useSelector } from "react-redux";

import {
  AppLayout,
  AppLayoutActions,
  AppLayoutBackButton,
  AppLayoutBreadcrumb,
  AppLayoutContent,
  AppLayoutHeader,
} from "@components/AppLayout";
import { CustomTypeBuilder } from "@lib/builders/CustomTypeBuilder";
import { CustomTypeSM, CustomTypes } from "@lib/models/common/CustomType";
import { hasLocal } from "@lib/models/common/ModelData";
import { readBuilderPageDynamicSegment } from "@src/features/customTypes/customTypesConfig";
import { selectCustomTypeById } from "@src/modules/availableCustomTypes";
import type { SliceMachineStoreType } from "@src/redux/type";
import { getFormat } from "@src/domain/customType";
import { AutoSaveStatusIndicator } from "@src/features/autoSave/AutoSaveStatusIndicator";

import { CUSTOM_TYPES_CONFIG } from "../customTypesConfig";
import { CUSTOM_TYPES_MESSAGES } from "../customTypesMessages";
import { EditDropdown } from "../EditDropdown";
import { PageSnippetDialog } from "./PageSnippetDialog";
import { CustomTypeProvider } from "./CustomTypeProvider";

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
                <AppLayoutBreadcrumb
                  folder={messages.name({ start: true, plural: true })}
                  page={customType.label ?? customType.id}
                />
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
