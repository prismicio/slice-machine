import jsonModel from "./__mockData__/model.json";
import mocks from "./__mockData__/mocks.json";
import { SliceMock, Slices } from "@slicemachine/core/build/models";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes/widgets/slices";
import { ComponentUI } from "@lib/models/common/ComponentUI";

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

  const dummySliceState: ComponentUI = {
    screenshotUrls: {},
    from: "slices/libName",
    href: "slices--libName",
    pathToSlice: "./slices/libName",
    fileName: "index",
    extension: "js",
    model: dummyModel,
    screenshots: {},
    mock: mocks as SliceMock,
    mockConfig: dummyMockConfig,
  };

  return {
    dummyModel,
    dummyModelVariationID,
    dummyMockConfig,
    dummySliceState,
  };
};
