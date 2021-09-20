import * as Widgets from "../lib/models/common/widgets";
import { handleFields } from "../lib/mock/misc/handlers";

const toHaveProps = (obj, props) =>
  props.forEach((prop) => expect(obj).toHaveProperty(prop));

describe("handleFields", () => {
  const mockFields = handleFields(Widgets);
  test("can create a text mock", () => {
    const textField = [
      [
        "text",
        {
          config: {
            label: "",
            placeholder: "",
            allowTargetBlank: true,
            single: "paragraph",
          },
          type: "StructuredText",
        },
      ],
    ];

    const textFieldMocked = Object.entries(mockFields(textField))[0];
    const [key, value] = textFieldMocked;
    expect(Array.isArray(value)).toBe(true);
    expect(typeof value[0]).toBe("object");
    expect(value[0].text.length).toBeGreaterThan(0);
  });

  test("can create a color mock", () => {
    const colorField = [
      [
        "colorFieldName",
        {
          type: "Color",
          config: {
            label: "",
            id: "color",
            placeholder: "",
          },
        },
      ],
    ];

    const colorFieldMocked = Object.entries(mockFields(colorField))[0];
    const [key, value] = colorFieldMocked;
    expect(typeof value).toBe("string");
    expect(value.length).toBe(7);
    expect(value[0]).toBe("#");
  });

  test("can create a bool mock", () => {
    const boolField = [
      [
        "boolFieldName",
        {
          type: "Boolean",
          config: {
            label: "",
            id: "bool",
            placeholder: "",
            placeholder_false: "false",
            placeholder_true: "true",
            default_value: true,
          },
        },
      ],
    ];

    const boolFieldMocked = Object.entries(mockFields(boolField))[0];
    const [key, value] = boolFieldMocked;
    expect(typeof value).toBe("boolean");
  });

  test("can create a image mock", () => {
    const imageField = [
      [
        "imageFieldName",
        {
          type: "Image",
          config: {
            label: "My cool label",
            constraint: {
              width: 600,
              height: 600,
            },
            thumbnails: [
              {
                name: "square",
                width: 800,
                height: 800,
              },
            ],
          },
        },
      ],
    ];

    const imageFieldMocked = Object.entries(mockFields(imageField))[0];
    const [key, value] = imageFieldMocked;
    const properties = ["dimensions", "alt", "copyright", "url"];
    toHaveProps(value, properties);
    expect(typeof value.square).toBe("object");
    toHaveProps(value.square, properties);
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

    const titleFieldMocked = Object.entries(mockFields(titleField))[0];
    const [key, value] = titleFieldMocked;
    expect(Array.isArray(value)).toBe(true);
    expect(typeof value[0]).toBe("object");
    expect(value[0].text.length).toBeGreaterThan(0);
    expect(value[0].type).toBe("heading1");
  });

  test("can create a link mock", () => {
    const linkField = [
      [
        "linkFieldName",
        {
          type: "Link",
          config: {
            label: "",
            id: "link",
            placeholder: "",
            allowTargetBlank: true,
          },
        },
      ],
    ];

    const linkFieldMocked = Object.entries(mockFields(linkField))[0];
    const [key, value] = linkFieldMocked;
    expect(typeof value).toBe("object");

    const properties = ["link_type", "url"];
    toHaveProps(value, properties);
    expect(value.link_type).toBe("Web");
    expect(value.url.length).toBeGreaterThan(0);
  });

  test("can create a linkToMedia mock", () => {
    const linkToMediaField = [
      [
        "linkToMediaFieldName",
        {
          type: "Link",
          config: {
            label: "",
            select: "media",
            id: "linkToMedia",
            placeholder: "",
            allowTargetBlank: true,
          },
        },
      ],
    ];

    const linkToMediaFieldMocked = Object.entries(
      mockFields(linkToMediaField)
    )[0];
    const [key, value] = linkToMediaFieldMocked;
    expect(typeof value).toBe("object");

    const properties = ["link_type", "url"];
    toHaveProps(value, properties);
    expect(value.link_type).toBe("media");
    expect(value.url.length).toBeGreaterThan(0);
  });

  test("can create a select mock", () => {
    const selectField = [
      [
        "selectFieldName",
        {
          type: "Select",
          config: {
            label: "",
            id: "select",
            placeholder: "",
            default_value: "",
            options: ["", ""],
          },
        },
      ],
    ];

    const selectFieldMocked = Object.entries(mockFields(selectField))[0];
    const [key, value] = selectFieldMocked;
    expect(typeof value).toBe("string");
  });

  test("can create a date mock", () => {
    const dateField = [
      [
        "dateFieldName",
        {
          type: "Date",
          config: {
            label: "",
            id: "date",
            placeholder: "",
          },
        },
      ],
    ];

    const dateFieldMocked = Object.entries(mockFields(dateField))[0];
    const [key, value] = dateFieldMocked;
    expect(typeof value).toBe("string");
    expect(value.length).toBe(10);
    expect(value.split("-").length).toBe(3);
  });

  test("can create a timestamp mock", () => {
    const timestampField = [
      [
        "timestampFieldName",
        {
          type: "Timestamp",
          config: {
            label: "",
            id: "timestamp",
            placeholder: "",
          },
        },
      ],
    ];

    const timestampFieldMocked = Object.entries(mockFields(timestampField))[0];
    const [key, value] = timestampFieldMocked;
    expect(typeof value).toBe("string");
    expect(value.split(":").length).toBe(3);
  });

  test("can create a embed mock", () => {
    const embedField = [
      [
        "embedFieldName",
        {
          type: "Embed",
          config: {
            label: "",
            id: "embed",
            placeholder: "",
          },
        },
      ],
    ];

    const embedFieldMocked = Object.entries(mockFields(embedField))[0];
    const [key, value] = embedFieldMocked;
    expect(typeof value).toBe("object");
    expect(value.provider_name).not.toEqual(null);
  });

  test("can create a number mock", () => {
    const numberField = [
      [
        "numberFieldName",
        {
          type: "Number",
          config: {
            label: "",
            id: "number",
            placeholder: "",
          },
        },
      ],
    ];

    const numberFieldMocked = Object.entries(mockFields(numberField))[0];
    const [key, value] = numberFieldMocked;
    expect(typeof value).toBe("number");
  });

  test("can create a geoPoint mock", () => {
    const geoPointField = [
      [
        "geoPointFieldName",
        {
          type: "GeoPoint",
          config: {
            label: "",
            id: "geoPoint",
            placeholder: "",
          },
        },
      ],
    ];

    const geoPointFieldMocked = Object.entries(mockFields(geoPointField))[0];
    const [key, value] = geoPointFieldMocked;
    expect(typeof value).toBe("object");
    expect(typeof value.latitude).toBe("number");
    expect(typeof value.longitude).toBe("number");
  });
});
