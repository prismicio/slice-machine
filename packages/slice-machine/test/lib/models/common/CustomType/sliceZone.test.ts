import { SliceZone } from "@lib/models/common/CustomType/sliceZone";
// @ts-expect-error TS(2307) FIXME: Cannot find module '@slicemachine/core/build/model... Remove this comment to see the full error message
import { SlicesSM } from "@slicemachine/core/build/models/Slices";

const mockSliceZone: SlicesSM = {
  key: "slices",
  value: [
    { key: "slice_in_zone_0", value: { type: "SharedSlice" } },
    { key: "slice_in_zone_1", value: { type: "SharedSlice" } },
    { key: "slice_in_zone_2", value: { type: "SharedSlice" } },
  ],
};

describe("Slice Zone", () => {
  describe("Remove shared slices", () => {
    it("removes the correct slice", () => {
      const keyToRemove = "slice_in_zone_1";

      const result = SliceZone.removeSharedSlice(mockSliceZone, keyToRemove);

      expect(result.value.map((slice) => slice.key).includes(keyToRemove)).toBe(
        false
      );
      expect(result.value.length).toEqual(2);
    });

    it("removes nothing if the key does not exist", () => {
      const keyToRemove = "invalid_key";

      const result = SliceZone.removeSharedSlice(mockSliceZone, keyToRemove);

      expect(result).toEqual(mockSliceZone);
    });
  });

  describe("Replace shared slices", () => {
    it("removes the correct slice", () => {
      const keyToPreserve = "slice_in_zone_1";
      const newKeys = "new_slice_in_zone";

      const result = SliceZone.replaceSharedSlice(
        mockSliceZone,
        [newKeys],
        [keyToPreserve]
      );

      expect(result.value.map((slice) => slice.key)).toEqual([
        keyToPreserve,
        newKeys,
      ]);
      expect(result.value.length).toEqual(2);
    });
  });

  describe("Add shared slices", () => {
    it("adds a new slice to the slice zone", () => {
      const newKey = "new_slice_in_zone";

      const result = SliceZone.addSharedSlice(mockSliceZone, newKey);

      expect(result.value.map((slice) => slice.key)).toEqual(
        // @ts-expect-error TS(7006) FIXME: Parameter 'slice' implicitly has an 'any' type.
        mockSliceZone.value.map((slice) => slice.key).concat([newKey])
      );
      expect(result.value.length).toEqual(4);
    });
  });
});
