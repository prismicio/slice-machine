import { describe, test, expect } from "vitest";

import * as Widgets from "@lib/models/common/widgets/withGroup";
import { findWidgetByConfigOrType } from "@builders/utils";

const config = {
  label: "",
  placeholder: "",
  allowTargetBlank: true,
  single:
    "paragraph,preformatted,heading1,heading2,heading3,heading4,heading5,heading6,strong,em,hyperlink,image,embed,list-item,o-list-item,rtl",
};

describe("utils/findWidgetByConfigOrType", () => {
  test("We can find the image widget with image type", () => {
    const widgetFound = findWidgetByConfigOrType(Widgets, {
      type: "Image",
      config,
    });
    expect(widgetFound).toEqual(Widgets.Image);
  });
  test("We can find the color widget with color type", () => {
    const widgetFound = findWidgetByConfigOrType(Widgets, {
      type: "Color",
      config,
    });
    expect(widgetFound).toEqual(Widgets.Color);
  });
  test("We can find the UID widget with UID type", () => {
    const widgetFound = findWidgetByConfigOrType(Widgets, {
      type: "UID",
      config,
    });
    expect(widgetFound).toEqual(Widgets.UID);
  });
  test("We can find the repeatable group widget with the default group config", () => {
    const widgetFound = findWidgetByConfigOrType(Widgets, {
      type: "Group",
      config,
    });
    expect(widgetFound).toEqual(Widgets.RepeatableGroup);
  });
  test("We can find the group widget with the right config", () => {
    const widgetFound = findWidgetByConfigOrType(Widgets, {
      type: "Group",
      config: { ...config, repeat: false },
    });
    expect(widgetFound).toEqual(Widgets.Group);
  });
  test("We can find the repeatable group widget with the right config", () => {
    const widgetFound = findWidgetByConfigOrType(Widgets, {
      type: "Group",
      config: { ...config, repeat: true },
    });
    expect(widgetFound).toEqual(Widgets.RepeatableGroup);
  });
  test("We can find the GeoPoint widget with GeoPoint type", () => {
    const widgetFound = findWidgetByConfigOrType(Widgets, {
      type: "GeoPoint",
      config,
    });
    expect(widgetFound).toEqual(Widgets.GeoPoint);
  });
  test("We can find the select widget with Select type", () => {
    const widgetFound = findWidgetByConfigOrType(Widgets, {
      type: "Select",
      config,
    });
    expect(widgetFound).toEqual(Widgets.Select);
  });
  test("We can find the boolean widget with Select boolean", () => {
    const widgetFound = findWidgetByConfigOrType(Widgets, {
      type: "Boolean",
      config,
    });
    expect(widgetFound).toEqual(Widgets.Boolean);
  });
  test("We can find the date widget with Select date", () => {
    const widgetFound = findWidgetByConfigOrType(Widgets, {
      type: "Date",
      config,
    });
    expect(widgetFound).toEqual(Widgets.Date);
  });
  test("We can find the timestamp widget with Select timestamp", () => {
    const widgetFound = findWidgetByConfigOrType(Widgets, {
      type: "Timestamp",
      config,
    });
    expect(widgetFound).toEqual(Widgets.Timestamp);
  });
  test("We can find the number widget with Select number", () => {
    const widgetFound = findWidgetByConfigOrType(Widgets, {
      type: "Number",
      config,
    });
    expect(widgetFound).toEqual(Widgets.Number);
  });
  test("We can find the link widget with link type", () => {
    const widgetFound = findWidgetByConfigOrType(Widgets, {
      type: "Link",
      config,
    });
    expect(widgetFound).toEqual(Widgets.Link);
  });
  test("We can find the ContentRelationship widget with the right config", () => {
    const contentRelationship = {
      type: "Link",
      config: {
        label: "",
        placeholder: "",
        select: "document",
      },
    } as const;
    const widgetFound = findWidgetByConfigOrType(Widgets, contentRelationship);
    expect(widgetFound).toEqual(Widgets.ContentRelationship);
  });
  test("We can find the LinkToMedia widget with the right config", () => {
    const contentRelationship = {
      type: "Link",
      config: {
        label: "",
        placeholder: "",
        select: "media",
      },
    } as const;
    const widgetFound = findWidgetByConfigOrType(Widgets, contentRelationship);
    expect(widgetFound).toEqual(Widgets.LinkToMedia);
  });
});
