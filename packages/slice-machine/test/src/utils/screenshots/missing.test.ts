import { countMissingScreenshots } from "@src/utils/screenshots/missing";
import { getSelectedSliceDummyData } from "../../modules/screenshots/__testutils__/getSelectedSliceDummyData";

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
        // @ts-expect-error TS(2739) FIXME: Type '{}' is missing the following properties from... Remove this comment to see the full error message
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
        // @ts-expect-error TS(2739) FIXME: Type '{}' is missing the following properties from... Remove this comment to see the full error message
        screenshots: { "default-variation": {}, "variation-1": {} },
      })
    ).toEqual(0);
  });
});
