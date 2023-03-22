import jsonModel from "../__fixtures__/model.json";
import mocks from "../__fixtures__/mocks.json";
import { Slices } from "@lib/models/common/Slice";
import { ComponentMocks } from "@lib/models/common/Library";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes/widgets/slices";
import { ComponentUI } from "@lib/models/common/ComponentUI";

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
    mock: mocks as unknown as ComponentMocks,
  };

  return {
    dummyModel,
    dummyModelVariationID,
    dummySliceState,
  };
};
