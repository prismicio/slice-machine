import { SharedSlice } from "@prismicio/types-internal/lib/customtypes/widgets/slices";
import { SliceDiff } from "@prismicio/types-internal/lib/customtypes/diff/SharedSlice";
import { SharedSliceMock } from "@prismicio/mocks";

import { ComponentMocks } from "@lib/models/common/Library";

export default function MockSlice(
  sliceModel: SharedSlice,
  previousMocks?: ComponentMocks | null | undefined,
  sliceDiff?: SliceDiff | undefined
): ComponentMocks {
  return sliceModel.variations.map((variation) => {
    const variationMock = previousMocks?.find(
      (m) => m.variation === variation.id
    );

    if (!variationMock) {
      return SharedSliceMock.generate(sliceModel);
    }
    if (!sliceDiff) return variationMock;
    const patched = SharedSliceMock.patch(sliceDiff, sliceModel, variationMock);
    if (!patched.ok) {
      return variationMock;
    }
    if (!patched.result) {
      return SharedSliceMock.generate(sliceModel);
    }
    return patched.result;
  });
}
