import { describe, expect, it } from "vitest";

import { createFriendlyFieldNameWithId } from "@src/utils/fieldNameCreator";

const dataProvider = [
  {
    fieldId: "",
    expectedResult: "",
  },
  {
    fieldId: "myField",
    expectedResult: "My Field",
  },
  {
    fieldId: "MyField ",
    expectedResult: "My Field",
  },
  {
    fieldId: "my-field ",
    expectedResult: "My Field",
  },
  {
    fieldId: "my    field  ",
    expectedResult: "My Field",
  },
  {
    fieldId: "  description",
    expectedResult: "Description",
  },
  {
    fieldId: "myFIELd",
    expectedResult: "My FIELd",
  },
  {
    fieldId: "myComplexFIELd",
    expectedResult: "My Complex FIELd",
  },
  {
    fieldId: "MYField",
    expectedResult: "MYField",
  },
];

describe.each(dataProvider)(
  "createFriendlyFieldNameWithId",
  ({ fieldId, expectedResult }) => {
    it(`should return \'${expectedResult}\' for a field id equal to \'${fieldId}\'`, () => {
      const fieldName = createFriendlyFieldNameWithId(fieldId);
      expect(fieldName).toBe(expectedResult);
      expect(createFriendlyFieldNameWithId(fieldName)).toBe(fieldName);
    });
  }
);
