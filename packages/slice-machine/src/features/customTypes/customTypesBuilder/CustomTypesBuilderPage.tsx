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
import { PageLayout } from "@src/components/PageLayout";
import { Header } from "@src/components/PageLayout/Header";
import { selectCurrentCustomType } from "@src/modules/selectedCustomType";
import { Button } from "@prismicio/editor-ui";

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
  const { initCustomTypeStore } = useSliceMachineActions();

  useEffect(() => {
    initCustomTypeStore(customType, remoteCustomType);
  }, []);

  const { currentCustomType } = useSelector((store: SliceMachineStoreType) => ({
    currentCustomType: selectCurrentCustomType(store),
  }));

  if (currentCustomType === null) {
    // TODO handle currentCustomType not found
    return null;
  }

  return (
    <PageLayout>
      <Header
        backTo="/"
        breadcrumb={`Page types / ${
          currentCustomType.label ?? currentCustomType.id
        }`}
        Actions={[
          <Button variant="secondary" key="action-1">
            snippet
          </Button>,
          <Button key="save-to-fs">save</Button>,
        ]}
      />
      <CustomTypeBuilder />
    </PageLayout>
  );
};
