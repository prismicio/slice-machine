import Head from "next/head";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { FC, useEffect } from "react";

import CustomTypeBuilder from "@lib/builders/CustomTypeBuilder";
import { SliceMachineStoreType } from "@src/redux/type";
import { CustomTypeSM } from "@lib/models/common/CustomType";
import { selectCustomTypeById } from "@src/modules/availableCustomTypes";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { hasLocal, hasRemote } from "@lib/models/common/ModelData";
import type { CustomTypeFormat } from "@slicemachine/manager";
import { CUSTOM_TYPES_CONFIG } from "../customTypesConfig";
import {
  MainContainer,
  MainContainerHader,
} from "@src/components/MainContainer";
import {
  isSelectedCustomTypeTouched,
  selectCurrentCustomType,
} from "@src/modules/selectedCustomType";
import { Button } from "@prismicio/editor-ui";

import { CUSTOM_TYPES_MESSAGES } from "../customTypesMessages";
import { isLoading } from "@src/modules/loading";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import { PageTypeSnippet } from "./PageTypeSnippet";

type CustomTypesBuilderPageProps = {
  format: CustomTypeFormat;
};

export const CustomTypesBuilderPage: FC<CustomTypesBuilderPageProps> = ({
  format,
}) => {
  const router = useRouter();
  const customTypesConfig = CUSTOM_TYPES_CONFIG[format];
  const { selectedCustomType } = useSelector(
    (store: SliceMachineStoreType) => ({
      selectedCustomType: selectCustomTypeById(
        store,
        router.query[`${customTypesConfig.builderPageDynamicSegment}`] as string
      ),
    })
  );

  const { cleanupCustomTypeStore } = useSliceMachineActions();

  useEffect(() => {
    if (!selectedCustomType || !hasLocal(selectedCustomType))
      void router.replace("/");
  }, [selectedCustomType, router]);

  useEffect(() => {
    return () => {
      cleanupCustomTypeStore();
    };
    // we don't want to re-run this effect when the cleanupCustomTypeStore is redefined
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!selectedCustomType || !hasLocal(selectedCustomType)) {
    return null;
  }

  return (
    <>
      <Head>
        <title>{selectedCustomType.local.label} - Slice Machine</title>
      </Head>
      <CustomTypesBuilderPageWithProvider
        customType={selectedCustomType.local}
        remoteCustomType={
          hasRemote(selectedCustomType) ? selectedCustomType.remote : undefined
        }
      />
    </>
  );
};

type CustomTypesBuilderPageWithProviderProps = {
  customType: CustomTypeSM;
  remoteCustomType: CustomTypeSM | undefined;
};

const CustomTypesBuilderPageWithProvider: React.FC<
  CustomTypesBuilderPageWithProviderProps
> = ({ customType, remoteCustomType }) => {
  const { initCustomTypeStore, saveCustomType } = useSliceMachineActions();

  useEffect(() => {
    initCustomTypeStore(customType, remoteCustomType);
  }, []);

  const { currentCustomType, hasPendingModifications, isSavingCustomType } =
    useSelector((store: SliceMachineStoreType) => ({
      currentCustomType: selectCurrentCustomType(store),
      hasPendingModifications: isSelectedCustomTypeTouched(store),
      isSavingCustomType: isLoading(store, LoadingKeysEnum.SAVE_CUSTOM_TYPE),
    }));

  if (currentCustomType === null) {
    // TODO handle currentCustomType not found
    return null;
  }

  const config = CUSTOM_TYPES_CONFIG[currentCustomType.format];
  const messages = CUSTOM_TYPES_MESSAGES[currentCustomType.format];

  const Actions = [
    ...(currentCustomType.format === "page"
      ? [<PageTypeSnippet key="trigger-snippet-view" />]
      : []),
    <Button
      key="save-to-fs"
      data-cy="builder-save-button"
      onClick={saveCustomType}
      loading={isSavingCustomType}
      disabled={!hasPendingModifications || isSavingCustomType}
    >
      save
    </Button>,
  ];

  return (
    <MainContainer>
      <MainContainerHader
        backTo={config.tablePagePathname}
        breadcrumb={`${messages.name({ start: true, plural: true })} / ${
          currentCustomType.label ?? currentCustomType.id
        }`}
        Actions={Actions}
      />
      <div style={{ gridArea: "content" }}>
        <CustomTypeBuilder />
      </div>
    </MainContainer>
  );
};
