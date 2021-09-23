import { useRouter } from "next/router";
import { useContext } from "react";

import { CustomTypesContext } from "src/models/customTypes/context";
import { ConfigContext } from "src/config-context";

import { useModelReducer } from "src/models/customType/modelReducer";
import { CustomTypeState } from "@lib/models/ui/CustomTypeState";
import CustomTypeStore from "src/models/customType/store";
import { CustomType, ObjectTabs } from "@lib/models/common/CustomType";
import CustomTypeBuilder from "@lib/builders/CustomTypeBuilder";
import { CustomTypeMockConfig } from "@lib/models/common/MockConfig";

const Ct = ({
  Model,
  store,
  onLeave,
}: {
  Model: CustomTypeState;
  store: CustomTypeStore;
  onLeave: Function;
}) => {
  return <CustomTypeBuilder Model={Model} store={store} onLeave={onLeave} />;
};

const WithProvider = ({
  customType,
  remoteCustomType,
  onLeave,
}: {
  customType: CustomType<ObjectTabs>;
  remoteCustomType?: CustomType<ObjectTabs>;
  onLeave: Function;
}) => {
  const { env } = useContext(ConfigContext);
  const initialMockConfig = CustomTypeMockConfig.getCustomTypeMockConfig(
    env?.mockConfig || {},
    customType.id
  );
  const [Model, store] = useModelReducer({
    customType,
    remoteCustomType,
    initialMockConfig,
  });
  return <Ct Model={Model} store={store} onLeave={onLeave} />;
};

const WithRouter = () => {
  const router = useRouter();
  const { customTypes, remoteCustomTypes, onSave } =
    useContext(CustomTypesContext);

  const customType = customTypes?.find((e) => e && e.id === router.query.ct);
  const remoteCustomType = remoteCustomTypes?.find(
    (e) => e && e.id === router.query.ct
  );
  if (!customType) {
    router.replace("/");
    return null;
  }

  return (
    <WithProvider
      customType={customType}
      remoteCustomType={remoteCustomType}
      onLeave={onSave || function () {}}
    />
  );
};

export default WithRouter;
