import { ChangesSectionHeader } from "@components/ChangesSectionHeader";
import { CustomTypeTable } from "@components/CustomTypeTable/changesPage";
import React from "react";
import { Box } from "theme-ui";
import Grid from "components/Grid";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import { WrapperType } from "@lib/models/ui/Slice/wrappers";
import { SharedSlice } from "@lib/models/ui/Slice";
import { FrontEndCustomType } from "@src/modules/availableCustomTypes/types";
import { ModelStatusInformation } from "@src/hooks/useModelStatus";

interface ChangesItemsProps extends ModelStatusInformation {
  unSyncedCustomTypes: FrontEndCustomType[];
  unSyncedSlices: ComponentUI[];
  changesPushed: string[];
}

export const ChangesItems: React.FC<ChangesItemsProps> = ({
  unSyncedCustomTypes,
  unSyncedSlices,
  changesPushed,
  modelsStatuses,
  authStatus,
  isOnline,
}) => {
  return (
    <>
      {unSyncedCustomTypes.length > 0 && (
        <>
          <ChangesSectionHeader
            text={"Custom Types"}
            amount={unSyncedCustomTypes.length}
          />
          <CustomTypeTable
            customTypes={unSyncedCustomTypes}
            modelsStatuses={modelsStatuses}
            authStatus={authStatus}
            isOnline={isOnline}
          />
        </>
      )}
      {unSyncedSlices.length > 0 && (
        <>
          <Box sx={{ mb: "16px" }}>
            <ChangesSectionHeader
              text={"Slices"}
              amount={unSyncedSlices.length}
            />
          </Box>
          <Grid
            elems={unSyncedSlices}
            defineElementKey={(slice: ComponentUI) => slice.model.name}
            gridTemplateMinPx="290px"
            renderElem={(slice: ComponentUI) => {
              return SharedSlice.render({
                slice: slice,
                wrapperType: WrapperType.clickable,
                StatusOrCustom: {
                  status: modelsStatuses.slices[slice.model.id],
                  authStatus,
                  isOnline,
                },
                sx: changesPushed.includes(slice.model.id)
                  ? { animation: "fadeout .4s linear forwards" }
                  : {},
              });
            }}
            gridGap="32px 16px"
          />
        </>
      )}
    </>
  );
};
