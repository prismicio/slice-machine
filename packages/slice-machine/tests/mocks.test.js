import * as Widgets from "../lib/models/common/widgets";
import { handleFields } from "../lib/mock/misc/handlers";
import { ColorWidget } from "@models/common/widgets/Color";
import { BooleanWidget } from "@models/common/widgets/Boolean";
import { ImageWidget } from "@models/common/widgets/Image";
import { StructuredTextWidget } from "@models/common/widgets/StructuredText";
import { LinkWidget } from "@models/common/widgets/Link";
import { LinkToMediaWidget } from "@models/common/widgets/LinkToMedia";
import { SelectWidget } from "@models/common/widgets/Select";
import { DateWidget } from "@models/common/widgets/Date";
import { TimestampWidget } from "@models/common/widgets/Timestamp";
import { EmbedWidget } from "@models/common/widgets/Embed";
import { NumberWidget } from "@models/common/widgets/Number";
import { GeoPointWidget } from "@models/common/widgets/GeoPoint";

describe("handleFields", () => {
  const mockFields = handleFields(Widgets);
  test("can create a text mock", () => {
    const textField = [["textFieldName", StructuredTextWidget.create("text")]];

    const textFieldMocked = mockFields(textField);
    expect(textFieldMocked).toMatchObject({
      textFieldName: [
        { type: "paragraph", text: expect.stringMatching(/.{1}/) },
      ],
    });
  });

  test("can create a color mock", () => {
    const colorField = [
      ["colorFieldName", ColorWidget.create("colorFieldName")],
    ];

    const colorFieldMocked = mockFields(colorField);
    expect(colorFieldMocked).toMatchObject({
      colorFieldName: expect.stringMatching(/#.{6}/),
    });
  });

  test("can create a bool mock", () => {
    const boolField = [
      ["boolFieldName", BooleanWidget.create("boolFieldName")],
    ];

    const boolFieldMocked = mockFields(boolField);
    expect(boolFieldMocked).toMatchObject({
      boolFieldName: expect.any(Boolean),
    });
  });

  test("can create a image mock", () => {
    const imageField = [
      ["imageFieldName", ImageWidget.create("imageFieldName")],
    ];

    const imageFieldMocked = mockFields(imageField);
    expect(imageFieldMocked).toMatchObject({
      imageFieldName: {
        url: expect.stringMatching(/https:\/\/.{1}/),
        copyright: null,
        alt: expect.stringMatching(/.{1}/),
        dimensions: {
          height: expect.any(Number),
          width: expect.any(Number),
        },
      },
    });
  });

  test("can create a title mock", () => {
    const titleField = [
      [
        "titleFieldName",
        {
          config: {
            label: "My cool title",
            placeholder: "",
            allowTargetBlank: true,
            single: "heading1,heading2,heading3,heading4,heading5,heading6",
          },
          type: "StructuredText",
        },
      ],
    ];

    const titleFieldMocked = mockFields(titleField);
    expect(titleFieldMocked).toMatchObject({
      titleFieldName: [
        { type: "heading1", spans: [], text: expect.stringMatching(/.{1}/) },
      ],
    });
  });

  test("can create a link mock", () => {
    const linkField = [["linkFieldName", LinkWidget.create("linkFieldName")]];

    const linkFieldMocked = mockFields(linkField);
    expect(linkFieldMocked).toMatchObject({
      linkFieldName: { link_type: "Web", url: expect.stringMatching(/.{1}/) },
    });
  });

  test("can create a linkToMedia mock", () => {
    const linkToMediaField = [
      [
        "linkToMediaFieldName",
        LinkToMediaWidget.create("linkToMediaFieldName"),
      ],
    ];

    const linkToMediaFieldMocked = mockFields(linkToMediaField);
    expect(linkToMediaFieldMocked).toMatchObject({
      linkToMediaFieldName: {
        link_type: "media",
        url: expect.stringMatching(/.{1}/),
      },
    });
  });

  test("can create a select mock", () => {
    const selectField = [
      ["selectFieldName", SelectWidget.create("selectFieldName")],
    ];

    const selectFieldMocked = mockFields(selectField);
    expect(selectFieldMocked).toMatchObject({
      selectFieldName: expect.stringMatching(/.{1}/),
    });
  });

  test("can create a date mock", () => {
    const dateField = [["dateFieldName", DateWidget.create("dateFieldName")]];

    const dateFieldMocked = mockFields(dateField);
    expect(dateFieldMocked).toMatchObject({
      dateFieldName: expect.stringMatching(/.{4}-.{2}-.{2}/),
    });
  });

  test("can create a timestamp mock", () => {
    const timestampField = [
      ["timestampFieldName", TimestampWidget.create("timestampFieldName")],
    ];

    const timestampFieldMocked = mockFields(timestampField);
    expect(timestampFieldMocked).toMatchObject({
      timestampFieldName: expect.stringMatching(/.{4}:.{2}:.{2}/),
    });
  });

  test("can create a embed mock", () => {
    const embedField = [
      ["embedFieldName", EmbedWidget.create("embedFieldName")],
    ];

    const embedFieldMocked = mockFields(embedField);
    expect(embedFieldMocked).toMatchObject({
      embedFieldName: expect.any(Object),
    });
  });

  test("can create a number mock", () => {
    const numberField = [
      ["numberFieldName", NumberWidget.create("numberFieldName")],
    ];

    const numberFieldMocked = mockFields(numberField);
    expect(numberFieldMocked).toMatchObject({
      numberFieldName: expect.any(Number),
    });
  });

  test("can create a geoPoint mock", () => {
    const geoPointField = [
      ["geoPointFieldName", GeoPointWidget.create("geoPointFieldName")],
    ];

    const geoPointFieldMocked = mockFields(geoPointField);
    expect(geoPointFieldMocked).toMatchObject({
      geoPointFieldName: {
        latitude: expect.any(Number),
        longitude: expect.any(Number),
      },
    });
  });
});
