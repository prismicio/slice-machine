import "@testing-library/jest-dom";
import { WidgetTypes } from "@prismicio/types-internal/lib/customtypes/widgets";
import {
  buildNestableMockConfig,
  buildWidgetMockConfig,
} from "../../../lib/mock/LegacyMockConfig";
import { DynamicWidget } from "@prismicio/types-internal/lib/customtypes/widgets/Widget";

describe("CustomTypeMockConfig", () => {
  test("returns undefined if the fieldMockConfig is undefined or not provided", () => {
    expect(buildNestableMockConfig(WidgetTypes.Date)).toBe(undefined);
    expect(buildNestableMockConfig(WidgetTypes.Date, undefined)).toBe(
      undefined
    );
  });
  describe("WidgetTypes.Color", () => {
    test("valid content", () => {
      const config = { content: "red" };
      const widgetMockConfig = buildNestableMockConfig(
        WidgetTypes.Color,
        config
      );
      expect(widgetMockConfig).toStrictEqual({ value: "red" });
    });
    test("invalid content", () => {
      const config = { content: 100 };
      const widgetMockConfig = buildNestableMockConfig(
        WidgetTypes.Color,
        config
      );
      expect(widgetMockConfig).toStrictEqual(undefined);
    });
  });
  describe("WidgetTypes.Text", () => {
    test("valid content", () => {
      const config = { content: "text sample" };
      const widgetMockConfig = buildNestableMockConfig(
        WidgetTypes.Text,
        config
      );
      expect(widgetMockConfig).toStrictEqual({ value: "text sample" });
    });
    test("invalid content", () => {
      const config = { content: 100 };
      const widgetMockConfig = buildNestableMockConfig(
        WidgetTypes.Text,
        config
      );
      expect(widgetMockConfig).toStrictEqual(undefined);
    });
  });
  describe("WidgetTypes.Timestamp", () => {
    test("valid content", () => {
      const config = { content: "2022-06-30T10:03:49.000Z" };
      const widgetMockConfig = buildNestableMockConfig(
        WidgetTypes.Timestamp,
        config
      );
      expect(widgetMockConfig).toStrictEqual({
        value: new Date("2022-06-30T10:03:49.000Z"),
      });
    });
    test("no content", () => {
      const config = {};
      const widgetMockConfig = buildNestableMockConfig(
        WidgetTypes.Timestamp,
        config
      );
      expect(widgetMockConfig).toStrictEqual({ value: undefined });
    });
    test("invalid content", () => {
      const config = { content: 100 };
      const widgetMockConfig = buildNestableMockConfig(
        WidgetTypes.Timestamp,
        config
      );
      expect(widgetMockConfig).toStrictEqual(undefined);
    });
  });
  describe("WidgetTypes.Number", () => {
    test("valid content", () => {
      const config = { content: 123 };
      const widgetMockConfig = buildNestableMockConfig(
        WidgetTypes.Number,
        config
      );
      expect(widgetMockConfig).toStrictEqual({ value: 123 });
    });
    test("invalid content", () => {
      const config = { content: "123" };
      const widgetMockConfig = buildNestableMockConfig(
        WidgetTypes.Number,
        config
      );
      expect(widgetMockConfig).toStrictEqual(undefined);
    });
  });
  describe("WidgetTypes.Date", () => {
    test("valid content", () => {
      const config = { content: "2022-07-15" };
      const widgetMockConfig = buildNestableMockConfig(
        WidgetTypes.Date,
        config
      );
      expect(widgetMockConfig).toStrictEqual({ value: new Date("2022-07-15") });
    });
    test("no content", () => {
      const config = {};
      const widgetMockConfig = buildNestableMockConfig(
        WidgetTypes.Date,
        config
      );
      expect(widgetMockConfig).toStrictEqual({ value: undefined });
    });
    test("invalid content", () => {
      const config = { content: 123 };
      const widgetMockConfig = buildNestableMockConfig(
        WidgetTypes.Date,
        config
      );
      expect(widgetMockConfig).toStrictEqual(undefined);
    });
  });
  describe("WidgetTypes.GeoPoint", () => {
    test("valid content", () => {
      const config = { content: { latitude: 1, longitude: 2 } };
      const widgetMockConfig = buildNestableMockConfig(
        WidgetTypes.GeoPoint,
        config
      );
      expect(widgetMockConfig).toStrictEqual({ value: config.content });
    });
    test("invalid content", () => {
      const config = { content: { latitude: 1 } };
      const widgetMockConfig = buildNestableMockConfig(
        WidgetTypes.GeoPoint,
        config
      );
      expect(widgetMockConfig).toStrictEqual(undefined);
    });
  });
  describe("WidgetTypes.Embed", () => {
    test("no config provided", () => {
      const widgetMockConfig = buildNestableMockConfig(
        WidgetTypes.Embed,
        undefined
      );
      expect(widgetMockConfig).toStrictEqual(undefined);
    });
    test("no config content provided", () => {
      const config = { content: undefined };
      const widgetMockConfig = buildNestableMockConfig(
        WidgetTypes.Embed,
        config
      );
      expect(widgetMockConfig).toStrictEqual({ value: undefined });
    });
    test("valid config content provided", () => {
      const config = { content: { url: "url-test", oembed: "oembed-test" } };
      const widgetMockConfig = buildNestableMockConfig(
        WidgetTypes.Embed,
        config
      );
      expect(widgetMockConfig).toStrictEqual({ value: "oembed-test" });
    });
    test("config content without url", () => {
      const config = { content: { oembed: "oembed-test" } };
      const widgetMockConfig = buildNestableMockConfig(
        WidgetTypes.Embed,
        config
      );
      expect(widgetMockConfig).toStrictEqual({ value: undefined });
    });
    test("config content without oembed", () => {
      const config = { content: { url: "url-test" } };
      const widgetMockConfig = buildNestableMockConfig(
        WidgetTypes.Embed,
        config
      );
      expect(widgetMockConfig).toStrictEqual({ value: undefined });
    });
  });
  describe("WidgetTypes.BooleanField", () => {
    test("valid content", () => {
      const config = { content: true };
      const widgetMockConfig = buildNestableMockConfig(
        WidgetTypes.BooleanField,
        config
      );
      expect(widgetMockConfig).toStrictEqual({ value: true });
    });
    test("invalid content", () => {
      const config = { content: "true" };
      const widgetMockConfig = buildNestableMockConfig(
        WidgetTypes.BooleanField,
        config
      );
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
      const widgetMockConfig = buildNestableMockConfig(
        WidgetTypes.Select,
        config
      );
      expect(widgetMockConfig).toStrictEqual({ value: "opt2" });
    });
  });
  describe("WidgetTypes.Link", () => {
    test("object content", () => {
      const config = {
        content: { id: "id", url: "url", name: "name", kind: "kind" },
      };
      const widgetMockConfig = buildNestableMockConfig(
        WidgetTypes.Link,
        config
      );
      expect(widgetMockConfig).toStrictEqual({
        value: { value: config.content },
      });
    });
    test("non object content", () => {
      const config = { content: 100 };
      const widgetMockConfig = buildNestableMockConfig(
        WidgetTypes.Link,
        config
      );
      expect(widgetMockConfig).toStrictEqual({
        value: { value: 100 },
      });
    });
  });
  describe("WidgetTypes.Image", () => {
    test("valid content", () => {
      const config = { content: "content-image-test" };
      const widgetMockConfig = buildNestableMockConfig(
        WidgetTypes.Image,
        config
      );
      expect(widgetMockConfig).toStrictEqual({ value: "content-image-test" });
    });
    test("invalid content", () => {
      const config = { content: 100 };
      const widgetMockConfig = buildNestableMockConfig(
        WidgetTypes.Image,
        config
      );
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
        WidgetTypes.RichText,
        config
      );
      expect(widgetMockConfig).toStrictEqual({
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
        WidgetTypes.RichText,
        config
      );
      expect(widgetMockConfig).toStrictEqual(undefined);
    });
  });
});

describe("buildWidgetMockConfig", () => {
  test("return undefined if legacyWidgetMockConfig is not provided", () => {
    const widget = { type: WidgetTypes.Color };
    expect(buildWidgetMockConfig(widget, undefined)).toBe(undefined);
  });
  test("return undefined for WidgetTypes.LegacySlices and WidgetTypes.Slices", () => {
    const widgetLegacySlices = { type: WidgetTypes.LegacySlices };
    const widgetSlices = { type: WidgetTypes.Slices };
    expect(buildWidgetMockConfig(widgetLegacySlices, {})).toBe(undefined);
    expect(buildWidgetMockConfig(widgetSlices, {})).toBe(undefined);
  });
  test("return group mock config for valid group", () => {
    const legacyWidgetMockConfig = {
      field1: { content: "red" },
      field2: { content: false },
    };
    const widget: DynamicWidget = {
      type: WidgetTypes.Group,
      config: {
        fields: {
          field1: { type: WidgetTypes.Color },
          field2: { type: WidgetTypes.BooleanField },
        },
      },
    };
    const mockConfigOutput = buildWidgetMockConfig(
      widget,
      legacyWidgetMockConfig
    );
    const expectedResult = {
      fields: { field1: { value: "red" }, field2: { value: false } },
    };
    expect(mockConfigOutput).toStrictEqual(expectedResult);
  });
  test("invalid group", () => {
    const legacyWidgetMockConfig = { field1: true };
    const widget: DynamicWidget = {
      type: WidgetTypes.Group,
      config: {
        fields: {
          field1: { type: WidgetTypes.Color },
          field2: { type: WidgetTypes.BooleanField },
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
    const widget: DynamicWidget = { type: WidgetTypes.UID };
    const mockConfigOutput = buildWidgetMockConfig(
      widget,
      legacyWidgetMockConfig
    );
    expect(mockConfigOutput).toStrictEqual({ value: "uid" });
  });
  test("UID widget - invalid content", () => {
    const legacyWidgetMockConfig = { content: 100 };
    const widget: DynamicWidget = { type: WidgetTypes.UID };
    const mockConfigOutput = buildWidgetMockConfig(
      widget,
      legacyWidgetMockConfig
    );
    expect(mockConfigOutput).toStrictEqual(undefined);
  });
});
