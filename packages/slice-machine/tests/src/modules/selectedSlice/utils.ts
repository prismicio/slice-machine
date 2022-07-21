import jsonModel from "./__mockData__/model.json";
import mocks from "./__mockData__/mocks.json";
import { SelectedSliceStoreType } from "@src/modules/selectedSlice/types";
import { SliceMock, Slices } from "@slicemachine/core/build/models";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes/widgets/slices";
import { LibStatus } from "@lib/models/common/ComponentUI";

export const getSelectedSliceDummyData = () => {
  const dummyModel = Slices.toSM(jsonModel as unknown as SharedSlice);

  const dummyModelVariationID = "default-slice";

  const dummyMockConfig = {
    [dummyModelVariationID]: {
      primary: {
        section_title: {
          content: "Content",
        },
      },
    },
  };

  const dummyComponentUI = {
    __status: LibStatus.NewSlice,
    screenshotUrls: {},
    from: "slices/libName",
    href: "slices--libName",
    pathToSlice: "./slices/libName",
    fileName: "index",
    extension: "js",
    model: dummyModel,
    screenshotPaths: {},
    mock: mocks as SliceMock,
    mockConfig: dummyMockConfig,
  };

  const dummySliceState: NonNullable<SelectedSliceStoreType> = {
    component: dummyComponentUI,
  };

  return {
    dummyModel,
    dummyModelVariationID,
    dummyComponentUI,
    dummyMockConfig,
    dummySliceState,
  };
};
