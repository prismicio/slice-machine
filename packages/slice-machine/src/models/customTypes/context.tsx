import React, { useState } from "react";

import { CustomType, ObjectTabs } from "@lib/models/common/CustomType";
import { CustomTypeState } from "@lib/models/ui/CustomTypeState";

export const CustomTypesContext = React.createContext<{
  customTypes: Partial<ReadonlyArray<CustomType<ObjectTabs>>>;
  remoteCustomTypes: Partial<ReadonlyArray<CustomType<ObjectTabs>>>;
  onCreate: (
    id: string,
    { label, repeatable }: { label: string; repeatable: boolean }
  ) => void;
  onSave: (modelPayload: CustomTypeState) => void;
}>({
  customTypes: [],
  remoteCustomTypes: [],
  onCreate: () => null,
  onSave: () => null,
});

type ProviderProps = {
  customTypes: ReadonlyArray<CustomType<ObjectTabs>>;
  remoteCustomTypes: ReadonlyArray<CustomType<ObjectTabs>>;
};

const Provider: React.FunctionComponent<ProviderProps> = ({
  children,
  customTypes = [],
  remoteCustomTypes = [],
}) => {
  const [cts, setCts] = useState(customTypes);
  const onCreate = (
    id: string,
    { label, repeatable }: { label: string; repeatable: boolean }
  ) => {
    setCts([
      {
        id,
        label,
        repeatable,
        tabs: {
          Main: {
            key: "Main",
            value: {},
          },
        },
        status: true,
      },
      ...cts,
    ]);
  };

  const onSave = (modelPayload: CustomTypeState) => {
    setCts(
      cts.map((ct) => {
        if (ct.id === modelPayload.current.id) {
          return CustomType.toObject(modelPayload.current);
        }
        return ct;
      })
    );
  };

  return (
    <CustomTypesContext.Provider
      value={{ customTypes: cts, remoteCustomTypes, onCreate, onSave }}
    >
      {children}
    </CustomTypesContext.Provider>
  );
};

export default Provider;
