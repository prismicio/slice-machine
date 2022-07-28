import jsonModel from "./__mockData__/model.json";
import { Slices } from "@slicemachine/core/build/models";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes/widgets/slices";
import { ComponentUI, LibStatus } from "@lib/models/common/ComponentUI";

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
    __status: LibStatus.NewSlice,
    screenshotUrls: {},
    from: "slices/libName",
    href: "slices--libName",
    pathToSlice: "./slices/libName",
    fileName: "index",
    extension: "js",
    model: dummyModel,
    screenshotPaths: {},
    mock: [], //TODO: fix mocks here.
    mockConfig: dummyMockConfig,
  };

  return {
    dummyModel,
    dummyModelVariationID,
    dummyMockConfig,
    dummySliceState,
  };
};
