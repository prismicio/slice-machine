import { SharedSliceMock } from "@prismicio/mocks";

import { SharedSliceContent } from "@prismicio/types-internal/lib/content";
import { SliceDiff } from "@prismicio/types-internal/lib/customtypes/diff";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes/widgets/slices";

type mockSliceArgs = {
	model: SharedSlice;
	mocks?: SharedSliceContent[];
	sliceDiff?: SliceDiff;
};

export const mockSlice = (args: mockSliceArgs): SharedSliceContent[] => {
	const { model, mocks, sliceDiff } = args;

	return model.variations.map((variation) => {
		const variationMock = mocks?.find((m) => m.variation === variation.id);

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
