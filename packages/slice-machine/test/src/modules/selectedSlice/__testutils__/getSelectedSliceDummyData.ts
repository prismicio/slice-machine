import jsonModel from "../__fixtures__/model.json";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import MockSlice from "@lib/mock/Slice";
import { Slices } from "@slicemachine/core/build/models";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes/widgets/slices";

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
    from: "slices/libName",
    href: "slices--libName",
    pathToSlice: "./slices/libName",
    fileName: "index",
    extension: "js",
    model: dummyModel,
    screenshots: {},
    mock: MockSlice(Slices.fromSM(dummyModel), dummyMockConfig),
    mockConfig: dummyMockConfig,
  };

  return {
    dummyModel,
    dummyModelVariationID,
    dummyMockConfig,
    dummySliceState,
  };
};
