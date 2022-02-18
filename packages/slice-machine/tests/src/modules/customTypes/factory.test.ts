import "@testing-library/jest-dom";

import { createCustomType } from "@src/modules/customTypes/factory";
import { CustomType, ObjectTabs } from "@models/common/CustomType";

describe("[Custom types factory]", () => {
  describe("[createCustomType]", () => {
    it("should create a custom type with repeatable true", () => {
      const expectedCustomType: CustomType<ObjectTabs> = {
        id: "id",
        label: "lama",
        repeatable: true,
        status: true,
        tabs: {
          Main: {
            key: "Main",
            value: {},
          },
        },
      };
      expect(createCustomType("id", "lama", true)).toEqual(expectedCustomType);
    });
    it("should create a custom type with repeatable false", () => {
      const expectedCustomType: CustomType<ObjectTabs> = {
        id: "id",
        label: "lama",
        repeatable: false,
        status: true,
        tabs: {
          Main: {
            key: "Main",
            value: {},
          },
        },
      };
      expect(createCustomType("id", "lama", false)).toEqual(expectedCustomType);
    });
  });
});
