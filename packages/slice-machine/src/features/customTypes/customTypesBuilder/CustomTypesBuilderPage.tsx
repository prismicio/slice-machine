import { Button } from "@prismicio/editor-ui";
import Head from "next/head";
import { useRouter } from "next/router";
import { type FC, useEffect } from "react";
import { useSelector } from "react-redux";

import CustomTypeBuilder from "@lib/builders/CustomTypeBuilder";
import { CustomTypeSM, CustomTypes } from "@lib/models/common/CustomType";
import { hasLocal, hasRemote } from "@lib/models/common/ModelData";
import {
  MainContainer,
  MainContainerHeader,
  MainContainerContent,
} from "@src/components/MainContainer";
import { readBuilderPageDynamicSegment } from "@src/features/customTypes/customTypesConfig";
import { selectCustomTypeById } from "@src/modules/availableCustomTypes";
import { isLoading } from "@src/modules/loading";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import {
  isSelectedCustomTypeTouched,
  selectCurrentCustomType,
} from "@src/modules/selectedCustomType";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { SliceMachineStoreType } from "@src/redux/type";

import { CUSTOM_TYPES_CONFIG } from "../customTypesConfig";
import { CUSTOM_TYPES_MESSAGES } from "../customTypesMessages";
import { PageSnippetDialog } from "./PageSnippetDialog";

export const CustomTypesBuilderPage: FC = () => {
  const router = useRouter();
  const { selectedCustomType } = useSelector(
    (store: SliceMachineStoreType) => ({
      selectedCustomType: selectCustomTypeById(
        store,
        readBuilderPageDynamicSegment(router.query) as string
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
  const router = useRouter();

  const { initCustomTypeStore, saveCustomType } = useSliceMachineActions();

  useEffect(() => {
    initCustomTypeStore(customType, remoteCustomType);
  }, []);

  const {
    currentCustomType,
    hasPendingModifications,
    isSavingCustomType,
    isCreatingSlice,
  } = useSelector((store: SliceMachineStoreType) => ({
    currentCustomType: selectCurrentCustomType(store),
    hasPendingModifications: isSelectedCustomTypeTouched(store),
    isSavingCustomType: isLoading(store, LoadingKeysEnum.SAVE_CUSTOM_TYPE),
    isCreatingSlice: isLoading(store, LoadingKeysEnum.CREATE_SLICE),
  }));

  if (currentCustomType === null) {
    return null;
  }

  const config = CUSTOM_TYPES_CONFIG[currentCustomType.format];
  const messages = CUSTOM_TYPES_MESSAGES[currentCustomType.format];

  const actions = [
    ...(currentCustomType.format === "page"
      ? [
          <PageSnippetDialog
            key="trigger-snippet-view"
            model={CustomTypes.fromSM(currentCustomType)}
          />,
        ]
      : []),
    <Button
      key="save-to-fs"
      onClick={saveCustomType}
      loading={isSavingCustomType}
      data-testid="builder-save-button"
      disabled={
        !hasPendingModifications || isSavingCustomType || isCreatingSlice
      }
    >
      Save
    </Button>,
  ];

  return (
    <MainContainer>
      <MainContainerHeader
        backTo={() => void router.push(config.tablePagePathname)}
        breadcrumb={`${messages.name({ start: true, plural: true })} / ${
          currentCustomType.label ?? currentCustomType.id
        }`}
        actions={actions}
      />
      <MainContainerContent>
        <CustomTypeBuilder />
      </MainContainerContent>
    </MainContainer>
  );
};
