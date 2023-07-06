import Head from "next/head";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { FC, useEffect } from "react";

import CustomTypeBuilder from "@lib/builders/CustomTypeBuilder";
import { readBuilderPageDynamicSegment } from "@src/features/customTypes/customTypesConfig";
import { SliceMachineStoreType } from "@src/redux/type";
import { CustomTypeSM } from "@lib/models/common/CustomType";
import { selectCustomTypeById } from "@src/modules/availableCustomTypes";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { hasLocal, hasRemote } from "@lib/models/common/ModelData";

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
  const { initCustomTypeStore } = useSliceMachineActions();

  useEffect(() => {
    initCustomTypeStore(customType, remoteCustomType);
  }, []);

  return <CustomTypeBuilder />;
};
