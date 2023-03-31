import { SharedSliceMock } from "@prismicio/mocks";

import { SharedSliceContent } from "@prismicio/types-internal/lib/content";
import { SliceDiff } from "@prismicio/types-internal/lib/customtypes/diff";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes/widgets/slices";

export const mockSlice = (
	model: SharedSlice,
	previousMocks?: SharedSliceContent[],
	sliceDiff?: SliceDiff,
): SharedSliceContent[] => {
	return model.variations.map((variation) => {
		const variationMock = previousMocks?.find(
			(m) => m.variation === variation.id,
		);

		if (!variationMock) {
			return SharedSliceMock.generate(model);
		}
		if (!sliceDiff) {
			return variationMock;
		}

		const patched = SharedSliceMock.patch(sliceDiff, model, variationMock);
		if (!patched.ok) {
			return variationMock;
		}
		if (!patched.result) {
			return SharedSliceMock.generate(model);
		}

		return patched.result;
	});
};
