import { ChangesSectionHeader } from "@components/ChangesSectionHeader";
import { CustomTypeTable } from "@components/CustomTypeTable/changesPage";
import React from "react";
import { Box } from "theme-ui";
import Grid from "components/Grid";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import { WrapperType } from "@lib/models/ui/Slice/wrappers";
import { SharedSlice } from "@lib/models/ui/Slice";
import { CustomTypeSM } from "@slicemachine/core/build/models/CustomType";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "../../src/redux/type";
import { selectIsSimulatorAvailableForFramework } from "../../src/modules/environment";

interface ChangesItemsProps {
  unSyncedCustomTypes: ReadonlyArray<CustomTypeSM>;
  unSyncedSlices: ReadonlyArray<ComponentUI>;
}

export interface initialStateProps {
  imageLoading: boolean;
}

export const initialState = {
  imageLoading: false,
};

export const ChangesItems: React.FC<ChangesItemsProps> = ({
  unSyncedCustomTypes,
  unSyncedSlices,
}) => {
  const [data, setData] = React.useState<initialStateProps>(initialState);
  const { isSimulatorAvailableForFramework } = useSelector(
    (state: SliceMachineStoreType) => ({
      isSimulatorAvailableForFramework:
        selectIsSimulatorAvailableForFramework(state),
    })
  );

  return (
    <>
      {unSyncedCustomTypes.length > 0 && (
        <>
          <ChangesSectionHeader
            text={"Custom Types"}
            amount={unSyncedCustomTypes.length}
          />
          <CustomTypeTable customTypes={unSyncedCustomTypes} />
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
                displayStatus: true,
                slice: slice,
                wrapperType: WrapperType.changesPage,
                data: data,
                setData: setData,
                preventScreenshot: !isSimulatorAvailableForFramework,
              });
            }}
            gridGap="32px 16px"
          />
        </>
      )}
    </>
  );
};
