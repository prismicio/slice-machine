import jsonModel from "../__fixtures__/model.json";
import mocks from "../__fixtures__/mocks.json";
import { Slices } from "@lib/models/common/Slice";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import { SharedSliceContent } from "@prismicio/types-internal/lib/content";

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
    mocks: mocks as unknown as SharedSliceContent[],
  };

  return {
    dummyModel,
    dummyModelVariationID,
    dummySliceState,
  };
};
