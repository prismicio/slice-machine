import Head from "next/head";
import { useRouter } from "next/router";

import CustomTypeBuilder from "../../lib/builders/CustomTypeBuilder";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { CustomTypeSM } from "@lib/models/common/CustomType";
import { selectCustomTypeById } from "../../src/modules/availableCustomTypes";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { useEffect } from "react";
import { hasLocal, hasRemote } from "@lib/models/common/ModelData";

type CustomTypeBuilderWithProviderProps = {
  customType: CustomTypeSM;
  remoteCustomType: CustomTypeSM | undefined;
};

const CustomTypeBuilderWithProvider: React.FC<
  CustomTypeBuilderWithProviderProps
> = ({ customType, remoteCustomType }) => {
  const { initCustomTypeStore } = useSliceMachineActions();

  useEffect(() => {
    initCustomTypeStore(customType, remoteCustomType);
  }, []);

  return <CustomTypeBuilder />;
};

const CustomTypeBuilderWithRouter = () => {
  const router = useRouter();
  const { selectedCustomType } = useSelector(
    (store: SliceMachineStoreType) => ({
      selectedCustomType: selectCustomTypeById(
        store,
        router.query.ct as string
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
      <CustomTypeBuilderWithProvider
        customType={selectedCustomType.local}
        remoteCustomType={
          hasRemote(selectedCustomType) ? selectedCustomType.remote : undefined
        }
      />
    </>
  );
};

export default CustomTypeBuilderWithRouter;
