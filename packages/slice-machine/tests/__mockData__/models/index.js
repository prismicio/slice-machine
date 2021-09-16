export const model = {
  id: "call_to_action",
  type: "SharedSlice",
  name: "CallToAction",
  description: "MySlice Template",
  variations: [
    {
      id: "default-slice",
      name: "Default slice",
      docURL: "...",
      version: "sktwi83ykfdt588n",
      description: "MySlice Template",
      primary: {
        text: {
          config: {
            label: "",
            placeholder: "",
            allowTargetBlank: true,
            single: "paragraph",
          },
          type: "StructuredText",
        },
        image: {
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
          type: "Image",
        },
        title: {
          config: {
            label: "My cool title",
            placeholder: "",
            allowTargetBlank: true,
            single: "heading1,heading2,heading3,heading4,heading5,heading6",
          },
          type: "StructuredText",
        },
        bool: {
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
        color: {
          type: "Color",
          config: {
            label: "",
            id: "color",
            placeholder: "",
          },
        },
        link: {
          type: "Link",
          config: {
            label: "",
            id: "link",
            placeholder: "",
            allowTargetBlank: true,
          },
        },
        select: {
          type: "Select",
          config: {
            label: "",
            id: "select",
            placeholder: "",
            default_value: "",
            options: ["", ""],
          },
        },
        date: {
          type: "Date",
          config: {
            label: "",
            id: "date",
            placeholder: "",
          },
        },
        timestamp: {
          type: "Timestamp",
          config: {
            label: "",
            id: "timestamp",
            placeholder: "",
          },
        },
        embed: {
          type: "Embed",
          config: {
            label: "",
            id: "embed",
            placeholder: "",
          },
        },
        number: {
          type: "Number",
          config: {
            label: "",
            id: "number",
            placeholder: "",
          },
        },
        geoPoint: {
          type: "GeoPoint",
          config: {
            label: "",
            id: "geoPoint",
            placeholder: "",
          },
        },
      },
      items: {},
    },
  ],
};

const toHaveProps = (obj, props) =>
  props.forEach((prop) => expect(obj).toHaveProperty(prop));

export const createExpector = (expect) => ({
  text(value) {
    expect(Array.isArray(value)).toBe(true);
    expect(typeof value[0]).toBe("object");
    expect(value[0].text.length).toBeGreaterThan(0);
  },
  image(value) {
    const properties = ["dimensions", "alt", "copyright", "url"];
    toHaveProps(value, properties);
    expect(typeof value.square).toBe("object");
    toHaveProps(value.square, properties);
  },
  title(value) {
    expect(Array.isArray(value)).toBe(true);
    expect(typeof value[0]).toBe("object");
    expect(value[0].text.length).toBeGreaterThan(0);
    expect(value[0].type).toBe("heading1");
  },
  bool(value) {
    expect(typeof value).toBe("boolean");
  },
  color(value) {
    expect(typeof value).toBe("string");
    expect(value.length).toBe(7);
    expect(value[0]).toBe("#");
  },
  link(value) {
    expect(typeof value).toBe("object");

    const properties = ["link_type", "url"];
    toHaveProps(value, properties);
    expect(value.link_type).toBe("Web");
    expect(value.url.length).toBeGreaterThan(0);
  },
  select(value) {
    expect(typeof value).toBe("string");
  },
  date(value) {
    expect(typeof value).toBe("string");
    expect(value.length).toBe(10);
    expect(value.split("-").length).toBe(3);
  },
  timestamp(value) {
    expect(typeof value).toBe("string");
    expect(value.split(":").length).toBe(3);
  },
  embed(value) {
    expect(typeof value).toBe("object");
    expect(value.provider_name).not.toEqual(null);
  },
  number(value) {
    expect(typeof value).toBe("number");
  },
  geoPoint(value) {
    expect(typeof value).toBe("object");
    expect(typeof value.latitude).toBe("number");
    expect(typeof value.longitude).toBe("number");
  },
});
