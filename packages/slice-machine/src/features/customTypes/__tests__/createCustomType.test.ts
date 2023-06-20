import { describe, expect } from "vitest";
import { createCustomType } from "@src/features/customTypes/customTypesTable/createCustomType";

describe("createCustomType test suite", () => {
  it("should create a custom type with repeatable true", () => {
    expect(createCustomType("id", "lama", true, "custom"))
      .toMatchInlineSnapshot(`
          {
            "format": "custom",
            "id": "id",
            "json": {
              "Main": {
                "uid": {
                  "config": {
                    "label": "UID",
                  },
                  "type": "UID",
                },
              },
            },
            "label": "lama",
            "repeatable": true,
            "status": true,
          }
        `);
  });

  it("should create a custom type with repeatable false", () => {
    const result = createCustomType("id", "lama", false, "custom");
    expect(result.id).toBe("id");
    expect(result.label).toBe("lama");
    expect(result.format).toBe("custom");
    expect(result.json).toHaveProperty("Main");
    expect(result).toMatchInlineSnapshot(`
        {
          "format": "custom",
          "id": "id",
          "json": {
            "Main": {},
          },
          "label": "lama",
          "repeatable": false,
          "status": true,
        }
      `);
  });

  it("should create a page type with a slice zone", () => {
    const result = createCustomType("🥪", "label", true, "page");
    expect(result.format).toBe("page");
    expect(result.json).toHaveProperty("Main");
    expect(result.json.Main).toHaveProperty("slices");
    expect(result.json).toHaveProperty("SEO & Metadata");
    expect(result).toMatchInlineSnapshot(`
        {
          "format": "page",
          "id": "🥪",
          "json": {
            "Main": {
              "slices": {
                "config": {
                  "choices": {},
                },
                "fieldset": "Slice Zone",
                "type": "Slices",
              },
              "uid": {
                "config": {
                  "label": "UID",
                },
                "type": "UID",
              },
            },
            "SEO & Metadata": {
              "meta_description": {
                "config": {
                  "label": "Meta Description",
                  "placeholder": "A brief summary of the page",
                },
                "type": "Text",
              },
              "meta_image": {
                "config": {
                  "constraint": {
                    "height": 1260,
                    "width": 2400,
                  },
                  "label": "Meta Image",
                  "thumbnails": [],
                },
                "type": "Image",
              },
              "meta_title": {
                "config": {
                  "label": "Meta Title",
                  "placeholder": "A title of the page used for social media and search engines",
                },
                "type": "Text",
              },
            },
          },
          "label": "label",
          "repeatable": true,
          "status": true,
        }
      `);
  });
});

it("when non repeatable page type is should contain Main with a slice-zone, no uid, and a SEO tab", () => {
  const result = createCustomType("foo", "bar", false, "page");
  expect(result).toMatchInlineSnapshot(`
      {
        "format": "page",
        "id": "foo",
        "json": {
          "Main": {
            "slices": {
              "config": {
                "choices": {},
              },
              "fieldset": "Slice Zone",
              "type": "Slices",
            },
          },
          "SEO & Metadata": {
            "meta_description": {
              "config": {
                "label": "Meta Description",
                "placeholder": "A brief summary of the page",
              },
              "type": "Text",
            },
            "meta_image": {
              "config": {
                "constraint": {
                  "height": 1260,
                  "width": 2400,
                },
                "label": "Meta Image",
                "thumbnails": [],
              },
              "type": "Image",
            },
            "meta_title": {
              "config": {
                "label": "Meta Title",
                "placeholder": "A title of the page used for social media and search engines",
              },
              "type": "Text",
            },
          },
        },
        "label": "bar",
        "repeatable": false,
        "status": true,
      }
    `);
});
