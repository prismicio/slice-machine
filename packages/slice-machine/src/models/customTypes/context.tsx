import React, { useEffect, useState } from "react";

import { CustomType, ObjectTabs } from "@lib/models/common/CustomType";
import { CustomTypeState } from "@lib/models/ui/CustomTypeState";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";

export const CustomTypesContext = React.createContext<
  Partial<{
    customTypes: Partial<ReadonlyArray<CustomType<ObjectTabs>>>;
    remoteCustomTypes: Partial<ReadonlyArray<CustomType<ObjectTabs>>>;
    onCreate: Function;
    onSave: Function;
  }>
>({ customTypes: [], remoteCustomTypes: [] });

export default function Provider({
  children,
  customTypes = [],
  remoteCustomTypes = [],
}: {
  children: any;
  customTypes: ReadonlyArray<CustomType<ObjectTabs>> | undefined;
  remoteCustomTypes: ReadonlyArray<CustomType<ObjectTabs>> | undefined;
}) {
  const [cts, setCts] = useState(customTypes);

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

  const { getCustomTypes } = useSliceMachineActions();

  useEffect(() => {
    if (cts && remoteCustomTypes) {
      getCustomTypes(cts, remoteCustomTypes);
    }
  }, []);

  return (
    <CustomTypesContext.Provider
      value={{ customTypes: cts, remoteCustomTypes, onSave }}
    >
      {children}
    </CustomTypesContext.Provider>
  );
}
