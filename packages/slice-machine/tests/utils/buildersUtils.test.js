import * as Widgets from "@lib/models/common/widgets/withGroup";
import { findWidgetByConfigOrType } from "@builders/utils";
import { FieldType } from "@models/common/CustomType/fields";
import { Media } from "@lib/models/common/widgets/Link/type";

const dumbConfig = {
  label: "",
  placeholder: "",
  allowTargetBlank: true,
  single:
    "paragraph,preformatted,heading1,heading2,heading3,heading4,heading5,heading6,strong,em,hyperlink,image,embed,list-item,o-list-item,rtl",
};

describe("utils/findWidgetByConfigOrType", () => {
  test("We can find the image widget with image type", () => {
    const widgetFound = findWidgetByConfigOrType(
      Widgets,
      dumbConfig,
      FieldType.Image
    );
    expect(widgetFound).toEqual(Widgets.Image);
  });
  test("We can find the color widget with color type", () => {
    const widgetFound = findWidgetByConfigOrType(
      Widgets,
      dumbConfig,
      FieldType.Color
    );
    expect(widgetFound).toEqual(Widgets.Color);
  });
  test("We can find the UID widget with UID type", () => {
    const widgetFound = findWidgetByConfigOrType(
      Widgets,
      dumbConfig,
      FieldType.UID
    );
    expect(widgetFound).toEqual(Widgets.UID);
  });
  test("We can find the group widget with group type", () => {
    const widgetFound = findWidgetByConfigOrType(
      Widgets,
      dumbConfig,
      FieldType.Group
    );
    expect(widgetFound).toEqual(Widgets.Group);
  });
  test("We can find the GeoPoint widget with GeoPoint type", () => {
    const widgetFound = findWidgetByConfigOrType(
      Widgets,
      dumbConfig,
      FieldType.GeoPoint
    );
    expect(widgetFound).toEqual(Widgets.GeoPoint);
  });
  test("We can find the select widget with Select type", () => {
    const widgetFound = findWidgetByConfigOrType(
      Widgets,
      dumbConfig,
      FieldType.Select
    );
    expect(widgetFound).toEqual(Widgets.Select);
  });
  test("We can find the boolean widget with Select boolean", () => {
    const widgetFound = findWidgetByConfigOrType(
      Widgets,
      dumbConfig,
      FieldType.Boolean
    );
    expect(widgetFound).toEqual(Widgets.Boolean);
  });
  test("We can find the date widget with Select date", () => {
    const widgetFound = findWidgetByConfigOrType(
      Widgets,
      dumbConfig,
      FieldType.Date
    );
    expect(widgetFound).toEqual(Widgets.Date);
  });
  test("We can find the timestamp widget with Select timestamp", () => {
    const widgetFound = findWidgetByConfigOrType(
      Widgets,
      dumbConfig,
      FieldType.Timestamp
    );
    expect(widgetFound).toEqual(Widgets.Timestamp);
  });
  test("We can find the number widget with Select number", () => {
    const widgetFound = findWidgetByConfigOrType(
      Widgets,
      dumbConfig,
      FieldType.Number
    );
    expect(widgetFound).toEqual(Widgets.Number);
  });
  test("We can find the link widget with link type", () => {
    const widgetFound = findWidgetByConfigOrType(
      Widgets,
      dumbConfig,
      FieldType.Link
    );
    expect(widgetFound).toEqual(Widgets.Link);
  });
  test("We can find the ContentRelationship widget with the right config", () => {
    const contentRelationshipConfig = {
      label: "",
      placeholder: "",
      select: Media.document,
    };
    const widgetFound = findWidgetByConfigOrType(
      Widgets,
      contentRelationshipConfig,
      FieldType.Link
    );
    expect(widgetFound).toEqual(Widgets.ContentRelationship);
  });
  test("We can find the LinkToMedia widget with the right config", () => {
    const contentRelationshipConfig = {
      label: "",
      placeholder: "",
      select: Media.media,
    };
    const widgetFound = findWidgetByConfigOrType(
      Widgets,
      contentRelationshipConfig,
      FieldType.Link
    );
    expect(widgetFound).toEqual(Widgets.LinkToMedia);
  });
});
