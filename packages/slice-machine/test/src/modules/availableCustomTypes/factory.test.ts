import { describe, expect } from "vitest";
import { createCustomType } from "@src/modules/availableCustomTypes/factory";
import { CustomTypeSM } from "@lib/models/common/CustomType";

describe("[Custom types factory]", () => {
  describe("[createCustomType]", () => {
    it("should create a custom type with repeatable true", () => {
      const expectedCustomType: CustomTypeSM = {
        id: "id",
        label: "lama",
        format: "custom",
        repeatable: true,
        status: true,
        tabs: [
          {
            key: "Main",
            value: [
              {
                key: "uid",
                value: {
                  type: "UID",
                  config: {
                    label: "UID",
                  },
                },
              },
            ],
          },
        ],
      };
      expect(createCustomType("id", "lama", true)).toEqual(expectedCustomType);
    });
    it("should create a custom type with repeatable false", () => {
      const expectedCustomType: CustomTypeSM = {
        id: "id",
        label: "lama",
        format: "custom",
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
