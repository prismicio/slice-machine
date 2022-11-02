import { getSelectedSliceDummyData } from "tests/src/modules/screenshots/utils";
import { countMissingScreenshots } from "./missing";

describe("[utils - screenshot - missing]", () => {
  it("should return the number of missing screenshots", () => {
    const { dummySliceState } = getSelectedSliceDummyData();

    expect(countMissingScreenshots(dummySliceState)).toEqual(1);

    expect(
      countMissingScreenshots({
        ...dummySliceState,
        model: {
          ...dummySliceState.model,
          variations: [
            ...dummySliceState.model.variations,
            ...dummySliceState.model.variations,
          ],
        },
      })
    ).toEqual(2);

    expect(
      countMissingScreenshots({
        ...dummySliceState,
        model: {
          ...dummySliceState.model,
          variations: [
            ...dummySliceState.model.variations,
            ...dummySliceState.model.variations,
          ],
        },
        screenshots: { "default-variation": {} },
      })
    ).toEqual(1);

    expect(
      countMissingScreenshots({
        ...dummySliceState,
        model: {
          ...dummySliceState.model,
          variations: [
            ...dummySliceState.model.variations,
            ...dummySliceState.model.variations,
          ],
        },
        screenshots: { "default-variation": {}, "variation-1": {} },
      })
    ).toEqual(0);
  });
});
