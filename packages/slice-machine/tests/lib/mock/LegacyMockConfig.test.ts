import "@testing-library/jest-dom";
import {
  buildNestableMockConfig,
  buildWidgetMockConfig,
} from "../../../lib/mock/LegacyMockConfig";
import { DynamicWidget } from "@prismicio/types-internal/lib/customtypes";

jest.spyOn(console, "warn").mockImplementation(() => undefined); // less noise, might be a feature?

describe("CustomTypeMockConfig", () => {
  test("returns undefined if the fieldMockConfig is undefined or not provided", () => {
    expect(buildNestableMockConfig("Date")).toBe(undefined);
    expect(buildNestableMockConfig("Date", undefined)).toBe(undefined);
  });
  describe("WidgetTypes.Color", () => {
    test("valid content", () => {
      const config = { content: "red" };
      const widgetMockConfig = buildNestableMockConfig("Color", config);
      expect(widgetMockConfig).toStrictEqual({
        type: "Color",
        value: "red",
      });
    });
    test("invalid content", () => {
      const config = { content: 100 };
      const widgetMockConfig = buildNestableMockConfig("Color", config);
      expect(widgetMockConfig).toStrictEqual(undefined);
    });
  });
  describe("WidgetTypes.Text", () => {
    test("valid content", () => {
      const config = { content: "text sample" };
      const widgetMockConfig = buildNestableMockConfig("Text", config);
      expect(widgetMockConfig).toStrictEqual({
        type: "Text",
        value: "text sample",
      });
    });
    test("invalid content", () => {
      const config = { content: 100 };
      const widgetMockConfig = buildNestableMockConfig("Text", config);
      expect(widgetMockConfig).toStrictEqual(undefined);
    });
  });
  describe("WidgetTypes.Timestamp", () => {
    test("valid content", () => {
      const config = { content: "2022-06-30T10:03:49.000Z" };
      const widgetMockConfig = buildNestableMockConfig("Timestamp", config);
      expect(widgetMockConfig).toStrictEqual({
        type: "Timestamp",
        value: new Date("2022-06-30T10:03:49.000Z"),
      });
    });
    test("no content", () => {
      const config = {};
      const widgetMockConfig = buildNestableMockConfig("Timestamp", config);
      expect(widgetMockConfig).toStrictEqual({
        type: "Timestamp",
        value: undefined,
      });
    });
    test("invalid content", () => {
      const config = { content: 100 };
      const widgetMockConfig = buildNestableMockConfig("Timestamp", config);
      expect(widgetMockConfig).toStrictEqual(undefined);
    });
  });
  describe("WidgetTypes.Number", () => {
    test("valid content", () => {
      const config = { content: 123 };
      const widgetMockConfig = buildNestableMockConfig("Number", config);
      expect(widgetMockConfig).toStrictEqual({
        type: "Number",
        value: 123,
      });
    });
    test("invalid content", () => {
      const config = { content: "123" };
      const widgetMockConfig = buildNestableMockConfig("Number", config);
      expect(widgetMockConfig).toStrictEqual(undefined);
    });
  });
  describe("WidgetTypes.Date", () => {
    test("valid content", () => {
      const config = { content: "2022-07-15" };
      const widgetMockConfig = buildNestableMockConfig("Date", config);
      expect(widgetMockConfig).toStrictEqual({
        type: "Date",
        value: new Date("2022-07-15"),
      });
    });
    test("no content", () => {
      const config = {};
      const widgetMockConfig = buildNestableMockConfig("Date", config);
      expect(widgetMockConfig).toStrictEqual({
        type: "Date",
        value: undefined,
      });
    });
    test("invalid content", () => {
      const config = { content: 123 };
      const widgetMockConfig = buildNestableMockConfig("Date", config);
      expect(widgetMockConfig).toStrictEqual(undefined);
    });
  });
  describe("WidgetTypes.GeoPoint", () => {
    test("valid content", () => {
      const config = { content: { latitude: 1, longitude: 2 } };
      const widgetMockConfig = buildNestableMockConfig("GeoPoint", config);
      expect(widgetMockConfig).toStrictEqual({
        type: "GeoPoint",
        value: config.content,
      });
    });
    test("invalid content", () => {
      const config = { content: { latitude: 1 } };
      const widgetMockConfig = buildNestableMockConfig("GeoPoint", config);
      expect(widgetMockConfig).toStrictEqual(undefined);
    });
  });
  describe("WidgetTypes.Embed", () => {
    test("no config provided", () => {
      const widgetMockConfig = buildNestableMockConfig("Embed", undefined);
      expect(widgetMockConfig).toStrictEqual(undefined);
    });
    test("no config content provided", () => {
      const config = { content: undefined };
      const widgetMockConfig = buildNestableMockConfig("Embed", config);
      expect(widgetMockConfig).toStrictEqual({
        type: "Embed",
        value: undefined,
      });
    });
    test("valid config content provided", () => {
      const config = { content: { url: "url-test", oembed: "oembed-test" } };
      const widgetMockConfig = buildNestableMockConfig("Embed", config);
      expect(widgetMockConfig).toStrictEqual({
        type: "Embed",
        value: "oembed-test",
      });
    });
    test("config content without url", () => {
      const config = { content: { oembed: "oembed-test" } };
      const widgetMockConfig = buildNestableMockConfig("Embed", config);
      expect(widgetMockConfig).toStrictEqual({
        type: "Embed",
        value: undefined,
      });
    });
    test("config content without oembed", () => {
      const config = { content: { url: "url-test" } };
      const widgetMockConfig = buildNestableMockConfig("Embed", config);
      expect(widgetMockConfig).toStrictEqual({
        type: "Embed",
        value: undefined,
      });
    });
  });
  describe("WidgetTypes.BooleanField", () => {
    test("valid content", () => {
      const config = { content: true };
      const widgetMockConfig = buildNestableMockConfig("Boolean", config);
      expect(widgetMockConfig).toStrictEqual({
        type: "Boolean",
        value: true,
      });
    });
    test("invalid content", () => {
      const config = { content: "true" };
      const widgetMockConfig = buildNestableMockConfig("Boolean", config);
      expect(widgetMockConfig).toStrictEqual(undefined);
    });
  });
  describe("WidgetTypes.Select", () => {
    test("valid content", () => {
      const config = {
        content: "opt2",
        options: ["opt1", "opt2"],
        default_value: "opt1",
      };
      const widgetMockConfig = buildNestableMockConfig("Select", config);
      expect(widgetMockConfig).toStrictEqual({
        type: "Select",
        value: "opt2",
      });
    });
  });
  describe("WidgetTypes.Link", () => {
    test("object content", () => {
      const config = {
        content: { id: "id", url: "url", name: "name", kind: "kind" },
      };
      const widgetMockConfig = buildNestableMockConfig("Link", config);
      expect(widgetMockConfig).toStrictEqual({
        type: "Link",
        value: { value: config.content },
      });
    });
    test("non object content", () => {
      const config = { content: 100 };
      const widgetMockConfig = buildNestableMockConfig("Link", config);
      expect(widgetMockConfig).toStrictEqual({
        type: "Link",
        value: { value: 100 },
      });
    });
  });
  describe("WidgetTypes.Image", () => {
    test("valid content", () => {
      const config = { content: "content-image-test" };
      const widgetMockConfig = buildNestableMockConfig("Image", config);
      expect(widgetMockConfig).toStrictEqual(undefined);
    });
    test("invalid content", () => {
      const config = { content: 100 };
      const widgetMockConfig = buildNestableMockConfig("Image", config);
      expect(widgetMockConfig).toStrictEqual(undefined);
    });
  });
  describe("WidgetTypes.RichText", () => {
    test("valid content", () => {
      const config = {
        content: ["text"],
        config: {
          patternType: "PARAGRAPH",
          blocks: 1,
        },
      };
      const widgetMockConfig = buildNestableMockConfig(
        "StructuredText",
        config
      );
      expect(widgetMockConfig).toStrictEqual({
        type: "StructuredText",
        value: ["text"],
        nbBlocks: 1,
        pattern: "PARAGRAPH",
      });
    });
    test("invalid content", () => {
      const config = {
        content: ["text"],
        config: {
          patternType: "PARAGRAPH",
        },
      };
      const widgetMockConfig = buildNestableMockConfig(
        "StructuredText",
        config
      );
      expect(widgetMockConfig).toStrictEqual(undefined);
    });
  });
});

describe("buildWidgetMockConfig", () => {
  test("return undefined if legacyWidgetMockConfig is not provided", () => {
    const widget = { type: "Color" };
    expect(buildWidgetMockConfig(widget, undefined)).toBe(undefined);
  });
  test("return undefined for WidgetTypes.LegacySlices and WidgetTypes.Slices", () => {
    const widgetLegacySlices = { type: "Choice" };
    const widgetSlices = { type: "Slices" };
    expect(buildWidgetMockConfig(widgetLegacySlices, {})).toBe(undefined);
    expect(buildWidgetMockConfig(widgetSlices, {})).toBe(undefined);
  });
  test("return group mock config for valid group", () => {
    const legacyWidgetMockConfig = {
      field1: { content: "red" },
      field2: { content: false },
    };
    const widget: DynamicWidget = {
      type: "Group",
      config: {
        fields: {
          field1: { type: "Color" },
          field2: { type: "Boolean" },
        },
      },
    };
    const mockConfigOutput = buildWidgetMockConfig(
      widget,
      legacyWidgetMockConfig
    );
    const expectedResult = {
      type: "Group",
      fields: {
        field1: { type: "Color", value: "red" },
        field2: { type: "Boolean", value: false },
      },
    };
    expect(mockConfigOutput).toStrictEqual(expectedResult);
  });
  test("invalid group", () => {
    const legacyWidgetMockConfig = { field1: true };
    const widget: DynamicWidget = {
      type: "Group",
      config: {
        fields: {
          field1: { type: "Color" },
          field2: { type: "Boolean" },
        },
      },
    };
    const mockConfigOutput = buildWidgetMockConfig(
      widget,
      legacyWidgetMockConfig
    );
    expect(mockConfigOutput).toStrictEqual(undefined);
  });

  test("UID widget - valid content", () => {
    const legacyWidgetMockConfig = { content: "uid" };
    const widget: DynamicWidget = { type: "UID" };
    const mockConfigOutput = buildWidgetMockConfig(
      widget,
      legacyWidgetMockConfig
    );
    expect(mockConfigOutput).toStrictEqual({
      type: "UID",
      value: "uid",
    });
  });
  test("UID widget - invalid content", () => {
    const legacyWidgetMockConfig = { content: 100 };
    const widget: DynamicWidget = { type: "UID" };
    const mockConfigOutput = buildWidgetMockConfig(
      widget,
      legacyWidgetMockConfig
    );
    expect(mockConfigOutput).toStrictEqual(undefined);
  });
});
