import "@testing-library/jest-dom";

import { createCustomType } from "@src/modules/availableCustomTypes/factory";
import { CustomTypeSM } from "@slicemachine/core/build/src/models/CustomType";

describe("[Custom types factory]", () => {
  describe("[createCustomType]", () => {
    it("should create a custom type with repeatable true", () => {
      const expectedCustomType: CustomTypeSM = {
        id: "id",
        label: "lama",
        repeatable: true,
        status: true,
        tabs: [
          {
            key: "Main",
            value: [],
          },
        ],
      };
      expect(createCustomType("id", "lama", true)).toEqual(expectedCustomType);
    });
    it("should create a custom type with repeatable false", () => {
      const expectedCustomType: CustomTypeSM = {
        id: "id",
        label: "lama",
        repeatable: false,
        status: true,
        tabs: [
          {
            key: "Main",
            value: [],
          },
        ],
      };
      expect(createCustomType("id", "lama", false)).toEqual(expectedCustomType);
    });
  });
});
