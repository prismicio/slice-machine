import { describe, test, expect } from "vitest";
import {
  CustomTypeMockConfig,
  GlobalMockConfig,
} from "@lib/models/common/MockConfig";
import { omit, set } from "lodash";

const globalMockConfig: GlobalMockConfig = {
  slices: {
    MySlice: {},
  },
  _cts: {
    home_page: {},
    page: {},
    menu: {},
    custom_type_test: {
      description: {
        config: {
          patternType: "PARAGRAPH",
          blocks: 1,
        },
      },
      group_field_test: {
        title: {
          config: {
            patternType: "HEADING",
            blocks: 1,
          },
        },
        category: {
          config: {
            patternType: "HEADING",
            blocks: 1,
          },
        },
      },
    },
  },
  library_test: {
    PromoSectionWithBackgroundImage: {},
    PromoSectionImageTiles: {
      "default-slice": {
        primary: {},
      },
    },
  },
};

describe("CustomTypeMockConfig", () => {
  describe("getCustomTypeMockConfig", () => {
    test("returns the custom type mock config if present", () => {
      const customTypeMockConfig = CustomTypeMockConfig.getCustomTypeMockConfig(
        globalMockConfig,
        "custom_type_test"
      );
      expect(customTypeMockConfig).toStrictEqual(
        globalMockConfig._cts.custom_type_test
      );
    });
    test("returns empty object if globalMockConfig is not present", () => {
      const customTypeMockConfig = CustomTypeMockConfig.getCustomTypeMockConfig(
        omit(globalMockConfig, "_cts"),
        "custom_type_test"
      );
      expect(customTypeMockConfig).toStrictEqual({});
    });
    test("returns empty object if the custom type key is not found", () => {
      const customTypeMockConfig = CustomTypeMockConfig.getCustomTypeMockConfig(
        omit(globalMockConfig, "_cts.custom_type_test"),
        "custom_type_key_not_present"
      );
      expect(customTypeMockConfig).toStrictEqual({});
    });
  });
  describe("getFieldMockConfig", () => {
    test("returns field mock config if present", () => {
      const fieldMockConfig = CustomTypeMockConfig.getFieldMockConfig(
        globalMockConfig._cts.custom_type_test,
        "description"
      );
      expect(fieldMockConfig).toStrictEqual(
        globalMockConfig._cts.custom_type_test.description
      );
    });
    test("returns empty object if the field is not found ", () => {
      const fieldMockConfig = CustomTypeMockConfig.getFieldMockConfig(
        globalMockConfig._cts.custom_type_test,
        "field_not_present"
      );
      expect(fieldMockConfig).toStrictEqual({});
    });
  });
  describe("getGroupFieldMockConfig", () => {
    test("returns group field mock config if present", () => {
      const groupFieldMockConfig = CustomTypeMockConfig.getGroupFieldMockConfig(
        globalMockConfig._cts.custom_type_test,
        "group_field_test",
        "title"
      );
      expect(groupFieldMockConfig).toStrictEqual(
        globalMockConfig._cts.custom_type_test.group_field_test.title
      );
    });

    test("returns empty object if group is not found", () => {
      const groupFieldMockConfig = CustomTypeMockConfig.getGroupFieldMockConfig(
        globalMockConfig._cts.custom_type_test,
        "group_field_test_not_present",
        "title"
      );
      expect(groupFieldMockConfig).toStrictEqual({});
    });
    test("returns empty object if field within group is not found", () => {
      const groupFieldMockConfig = CustomTypeMockConfig.getGroupFieldMockConfig(
        globalMockConfig._cts.custom_type_test,
        "group_field_test",
        "field_not_present"
      );
      expect(groupFieldMockConfig).toStrictEqual({});
    });
  });
  describe("deleteFieldMockConfig", () => {
    test("returns a new custom type mock config with the selected field back to undefined", () => {
      const newCustomMockField = CustomTypeMockConfig.deleteFieldMockConfig(
        globalMockConfig._cts.custom_type_test,
        "description"
      );
      expect(newCustomMockField).toStrictEqual(
        set(globalMockConfig._cts.custom_type_test, "description", undefined)
      );
    });
    test("returns the same object if the selected field is not found ", () => {
      const fieldMockConfig = CustomTypeMockConfig.deleteFieldMockConfig(
        globalMockConfig._cts.custom_type_test,
        "field_not_present"
      );
      expect(fieldMockConfig).toStrictEqual(
        globalMockConfig._cts.custom_type_test
      );
    });
  });
  describe("updateFieldMockConfig", () => {
    const newMockValue = {
      config: {
        patternType: "PARAGRAPH",
        blocks: 100,
      },
    };
    test("returns a new custom type mock config with the new field config given - same field key", () => {
      const newCustomMockField = CustomTypeMockConfig.updateFieldMockConfig(
        globalMockConfig._cts.custom_type_test,
        "description",
        "description",
        newMockValue
      );
      expect(newCustomMockField).toStrictEqual(
        set(globalMockConfig._cts.custom_type_test, "description", newMockValue)
      );
    });
    test("returns a new custom type mock config with the new field config given - different field key", () => {
      const newCustomMockField = CustomTypeMockConfig.updateFieldMockConfig(
        globalMockConfig._cts.custom_type_test,
        "description",
        "description_new",
        newMockValue
      );
      expect(newCustomMockField).toStrictEqual({
        ...omit(globalMockConfig._cts.custom_type_test, "description"),
        description_new: newMockValue,
      });
    });
    test("returns a new custom type mock config with the new field config given - previous field key not present", () => {
      const newCustomMockField = CustomTypeMockConfig.updateFieldMockConfig(
        globalMockConfig._cts.custom_type_test,
        "field_key_not_present",
        "new_field_key",
        newMockValue
      );
      expect(newCustomMockField).toStrictEqual({
        ...globalMockConfig._cts.custom_type_test,
        new_field_key: newMockValue,
      });
    });
  });
  describe("updateGroupFieldMockConfig", () => {
    const newMockValue = {
      config: {
        patternType: "PARAGRAPH",
        blocks: 100,
      },
    };
    test("returns a new custom type mock config with the new group field config given - same field key", () => {
      const newCustomMockField =
        CustomTypeMockConfig.updateGroupFieldMockConfig(
          globalMockConfig._cts.custom_type_test,
          "group_field_test",
          "title",
          "title",
          newMockValue
        );
      expect(newCustomMockField).toStrictEqual(
        set(
          globalMockConfig._cts.custom_type_test,
          "group_field_test.title",
          newMockValue
        )
      );
    });
    test("returns a new custom type mock config with the new group field config given - different field key ", () => {
      const newCustomMockField =
        CustomTypeMockConfig.updateGroupFieldMockConfig(
          globalMockConfig._cts.custom_type_test,
          "group_field_test",
          "title",
          "title_new",
          newMockValue
        );
      expect(newCustomMockField).toStrictEqual({
        ...globalMockConfig._cts.custom_type_test,
        group_field_test: {
          ...omit(
            globalMockConfig._cts.custom_type_test.group_field_test,
            "title"
          ),
          title_new: newMockValue,
        },
      });
    });

    test("returns a new custom type mock config with the new group field config given - field key not present", () => {
      const newCustomMockField =
        CustomTypeMockConfig.updateGroupFieldMockConfig(
          globalMockConfig._cts.custom_type_test,
          "group_field_test",
          "field_key_not_present",
          "new_field_name",
          newMockValue
        );
      expect(newCustomMockField).toStrictEqual({
        ...globalMockConfig._cts.custom_type_test,
        group_field_test: {
          ...globalMockConfig._cts.custom_type_test.group_field_test,
          new_field_name: newMockValue,
        },
      });
    });
  });
  describe("deleteGroupFieldMockConfig", () => {
    test("sets the given new group field to undefined if present", () => {
      const newCustomMockField =
        CustomTypeMockConfig.deleteGroupFieldMockConfig(
          globalMockConfig._cts.custom_type_test,
          "group_field_test",
          "title"
        );
      expect(newCustomMockField).toStrictEqual({
        ...globalMockConfig._cts.custom_type_test,
        group_field_test: set(
          globalMockConfig._cts.custom_type_test.group_field_test,
          "title",
          undefined
        ),
      });
    });
    test("returns the same object if the selected group field is not found ", () => {
      const newCustomMockField =
        CustomTypeMockConfig.deleteGroupFieldMockConfig(
          globalMockConfig._cts.custom_type_test,
          "group_field_test",
          "field_not_prsent"
        );
      expect(newCustomMockField).toStrictEqual(
        globalMockConfig._cts.custom_type_test
      );
    });
  });
});
