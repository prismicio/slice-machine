import { SliceZone } from "@lib/models/common/CustomType/sliceZone";
import { SlicesSM } from "@slicemachine/core/build/models/Slices";
import { SlicesTypes } from "@prismicio/types-internal/lib/customtypes/widgets/slices";

const mockSliceZone: SlicesSM = {
  key: "slices",
  value: [
    { key: "slice_in_zone_0", value: { type: SlicesTypes.SharedSlice } },
    { key: "slice_in_zone_1", value: { type: SlicesTypes.SharedSlice } },
    { key: "slice_in_zone_2", value: { type: SlicesTypes.SharedSlice } },
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
        mockSliceZone.value.map((slice) => slice.key).concat([newKey])
      );
      expect(result.value.length).toEqual(4);
    });
  });
});
