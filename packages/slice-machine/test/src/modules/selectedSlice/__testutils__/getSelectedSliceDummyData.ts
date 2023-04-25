import jsonModel from "../__fixtures__/model.json";
import jsonMocks from "../__fixtures__/mocks.json";

import { ComponentUI } from "@lib/models/common/ComponentUI";
import { Slices } from "@lib/models/common/Slice";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";
import { ComponentInfo } from "@lib/models/common/Library";

export const getSelectedSliceDummyData = () => {
  const dummyModel = Slices.toSM(jsonModel as unknown as SharedSlice);

  const dummyModelVariationID = "default-slice";

  const dummySliceState: ComponentUI = {
    from: "slices/libName",
    href: "slices--libName",
    pathToSlice: "./slices/libName",
    fileName: "index",
    extension: "js",
    model: dummyModel,
    screenshots: {},
    mocks: jsonMocks as ComponentInfo["mocks"],
  };

  return {
    dummyModel,
    dummyModelVariationID,
    dummySliceState,
  };
};
