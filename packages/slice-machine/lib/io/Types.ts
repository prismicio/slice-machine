import path from "path";
import { generateTypes } from "prismic-ts-codegen";

import {
  CustomTypes,
  CustomTypeSM,
} from "@slicemachine/core/build/models/CustomType/index";
import { Slices, SliceSM } from "@slicemachine/core/build/models/Slice";
import Files from "../utils/files";

export const upsert = (
  cwd: string,
  customTypeModels: CustomTypeSM[],
  sharedSliceModels: SliceSM[]
) => {
  const content = generateTypes({
    customTypeModels: customTypeModels.map((model) =>
      CustomTypes.fromSM(model)
    ),
    sharedSliceModels: sharedSliceModels.map((model) => Slices.fromSM(model)),
    clientIntegration: {
      includeCreateClientInterface: true,
      includeContentNamespace: true,
    },
  });

  Files.write(path.join(cwd, "prismicTypes.generated.ts"), content);
};
