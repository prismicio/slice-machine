import { SharedSliceMock } from "@prismicio/mocks";

import { SharedSliceContent } from "@prismicio/types-internal/lib/content";
import { SliceDiff } from "@prismicio/types-internal/lib/customtypes/diff";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes/widgets/slices";

type mockSliceArgs = {
	model: SharedSlice;
	mocks?: SharedSliceContent[];
	diff?: SliceDiff;
};

export const mockSlice = (args: mockSliceArgs): SharedSliceContent[] => {
	const { model, mocks, diff } = args;

	return model.variations.map((variation) => {
		const variationMock = mocks?.find((m) => m.variation === variation.id);

		if (!variationMock) {
			return SharedSliceMock.generate(model, {
				type: "SharedSlice",
				variation: variation.id,
			});
		}
		if (!diff) {
			return variationMock;
		}

		const patched = SharedSliceMock.patch(diff, model, variationMock);
		if (!patched.ok) {
			return variationMock;
		}
		if (!patched.result) {
			return SharedSliceMock.generate(model, {
				type: "SharedSlice",
				variation: variation.id,
			});
		}

		return patched.result;
	});
};
