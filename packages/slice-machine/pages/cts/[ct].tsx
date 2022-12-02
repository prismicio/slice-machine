import { useRouter } from "next/router";

import CustomTypeBuilder from "../../lib/builders/CustomTypeBuilder";
import { CustomTypeMockConfig } from "@lib/models/common/MockConfig";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { getEnvironment } from "@src/modules/environment";
import { CustomTypeSM } from "@slicemachine/core/build/models/CustomType";
import { selectCustomTypeById } from "../../src/modules/availableCustomTypes";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { useEffect } from "react";

type CustomTypeBuilderWithProviderProps = {
  customType: CustomTypeSM;
  remoteCustomType: CustomTypeSM | undefined;
};

const CustomTypeBuilderWithProvider: React.FC<
  CustomTypeBuilderWithProviderProps
> = ({ customType, remoteCustomType }) => {
  const { initCustomTypeStore } = useSliceMachineActions();
  const { env } = useSelector((store: SliceMachineStoreType) => ({
    env: getEnvironment(store),
  }));

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const initialMockConfig = CustomTypeMockConfig.getCustomTypeMockConfig(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    env.mockConfig,
    customType.id
  );

  useEffect(() => {
    initCustomTypeStore(customType, remoteCustomType, initialMockConfig);
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

  if (!selectedCustomType) {
    void router.replace("/");
    return null;
  }

  // TODO what do we want to do here? Is a redirection like above ok?
  if (!selectedCustomType.local) {
    return <>Oops, seems like the custom type is deleted</>;
  }

  return (
    <CustomTypeBuilderWithProvider
      customType={selectedCustomType.local}
      remoteCustomType={selectedCustomType.remote}
    />
  );
};

export default CustomTypeBuilderWithRouter;
