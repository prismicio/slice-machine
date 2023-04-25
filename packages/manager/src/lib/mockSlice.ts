import { SharedSliceMock } from "@prismicio/mocks";

import { SharedSliceContent } from "@prismicio/types-internal/lib/content";
import {
	SharedSlice,
	SliceDiff,
} from "@prismicio/types-internal/lib/customtypes";

type mockSliceArgs = {
	model: SharedSlice;
	mocks?: SharedSliceContent[];
	diff?: SliceDiff;
};

export const mockSlice = (args: mockSliceArgs): SharedSliceContent[] => {
	const { model, mocks, diff } = args;

	return model.variations.map((variation) => {
		const variationMock = mocks?.find((m) => m.variation === variation.id);

		const mockConfig = {
			type: "SharedSlice",
			variation: variation.id,
		} as const;

		if (!variationMock) {
			return SharedSliceMock.generate(model, mockConfig);
		}
		if (!diff) {
			return variationMock;
		}

		// Enforce at least one item to be created if none are present and variation has item fields
		if (
			Object.keys(variation.items || {}).length &&
			variationMock.items.length === 0
		) {
			variationMock.items.push({ __TYPE__: "GroupItemContent", value: [] });
		}
		const patched = SharedSliceMock.patch(diff, variationMock, mockConfig);
		if (!patched.ok) {
			return variationMock;
		}
		if (!patched.result) {
			return SharedSliceMock.generate(model, mockConfig);
		}

		return patched.result;
	});
};
