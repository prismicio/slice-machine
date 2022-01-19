import React, { useState } from "react";

import { CustomType, ObjectTabs } from "@lib/models/common/CustomType";
import { CustomTypeState } from "@lib/models/ui/CustomTypeState";

export const CustomTypesContext = React.createContext<
  Partial<{
    customTypes: Partial<ReadonlyArray<CustomType<ObjectTabs>>>;
    remoteCustomTypes: Partial<ReadonlyArray<CustomType<ObjectTabs>>>;
    // eslint-disable-next-line @typescript-eslint/ban-types
    onCreate: Function;
    // eslint-disable-next-line @typescript-eslint/ban-types
    onSave: Function;
  }>
>({ customTypes: [], remoteCustomTypes: [] });

export default function Provider({
  children,
  customTypes = [],
  remoteCustomTypes = [],
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children: any;
  customTypes: ReadonlyArray<CustomType<ObjectTabs>> | undefined;
  remoteCustomTypes: ReadonlyArray<CustomType<ObjectTabs>> | undefined;
}) {
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
}
