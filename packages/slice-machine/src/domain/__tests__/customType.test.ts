import {
  CustomType,
  DynamicSection,
} from "@prismicio/types-internal/lib/customtypes";
import { describe, expect } from "vitest";

import * as CustomTypeModel from "../customType";

describe("CustomTypeModel test suite", () => {
  const mainSection: DynamicSection = {
    uid: {
      config: {
        label: "MainSectionField",
      },
      type: "UID",
    },
    booleanField: {
      config: {
        label: "BooleanField",
      },
      type: "Boolean",
    },
    groupField: {
      type: "Group",
      config: {
        label: "MyGroupField",
        fields: {
          groupFieldBooleanField: {
            config: {
              label: "GroupFieldBooleanField",
            },
            type: "Boolean",
          },
          groupFieldTextField: {
            config: {
              label: "GroupFieldTextField",
            },
            type: "Text",
          },
        },
      },
    },
    slices: {
      type: "Slices",
      fieldset: "Slice Zone",
      config: {
        choices: {
          hero_banner: {
            type: "SharedSlice",
          },
          promo_section_image_tiles: {
            type: "SharedSlice",
          },
        },
      },
    },
  };
  const anotherSection: DynamicSection = {
    uid: {
      config: {
        label: "AnotherSectionField",
      },
      type: "UID",
    },
  };
  const mockCustomType: CustomType = {
    format: "custom",
    id: "id",
    json: {
      mainSection,
      anotherSection,
    },
    label: "lama",
    repeatable: true,
    status: true,
  };

  it("getFormat should return the format 'custom' of the given custom type", () => {
    expect(CustomTypeModel.getFormat(mockCustomType)).toEqual("custom");
  });

  it("getFormat should return the format 'page' of the given custom type", () => {
    expect(
      CustomTypeModel.getFormat({
        ...mockCustomType,
        format: "page",
      }),
    ).toEqual("page");
  });

  it("getSectionEntries should return the sections entries", () => {
    expect(CustomTypeModel.getSectionEntries(mockCustomType)).toEqual([
      ["mainSection", mainSection],
      ["anotherSection", anotherSection],
    ]);
  });

  it("getSectionEntries should return an empty array if there are no sections", () => {
    expect(
      CustomTypeModel.getSectionEntries({
        ...mockCustomType,
        json: {},
      }),
    ).toEqual([]);
  });

  it("getMainSectionEntry should return the first section even if not named Main", () => {
    expect(CustomTypeModel.getMainSectionEntry(mockCustomType)).toEqual([
      "mainSection",
      mainSection,
    ]);
  });

  it("getMainSectionEntry should return undefined if there is are sections", () => {
    expect(
      CustomTypeModel.getMainSectionEntry({
        ...mockCustomType,
        json: {},
      }),
    ).toEqual(undefined);
  });

  it("getSection should return the section matching the key", () => {
    expect(
      CustomTypeModel.getSection(mockCustomType, "anotherSection"),
    ).toEqual(anotherSection);
  });

  it("getSection should return undefined if there are no sections", () => {
    expect(
      CustomTypeModel.getSection(
        {
          ...mockCustomType,
          json: {},
        },
        "mainSection",
      ),
    ).toEqual(undefined);
  });

  it("getSectionWithUIDFieldEntry should return the first section containing the UID type field", () => {
    expect(CustomTypeModel.getSectionWithUIDFieldEntry(mockCustomType)).toEqual(
      ["mainSection", mainSection],
    );
  });

  it("getSectionWithUIDFieldEntry should return undefined if there are no sections", () => {
    expect(
      CustomTypeModel.getSectionWithUIDFieldEntry({
        ...mockCustomType,
        json: {},
      }),
    ).toEqual(undefined);
  });

  it("getSectionWithUIDFieldEntry should return undefined if there are no UID type fields", () => {
    expect(
      CustomTypeModel.getSectionWithUIDFieldEntry({
        ...mockCustomType,
        json: {
          mainSection: {
            booleanField: {
              config: {
                label: "BooleanField",
              },
              type: "Boolean",
            },
          },
        },
      }),
    ).toEqual(undefined);
  });

  it("getUIDFieldEntry should return the UID field", () => {
    expect(CustomTypeModel.getUIDFieldEntry(mockCustomType)).toEqual([
      "uid",
      mainSection.uid,
    ]);
  });

  it("getUIDFieldEntry should return undefined if there are no sections", () => {
    expect(
      CustomTypeModel.getUIDFieldEntry({
        ...mockCustomType,
        json: {},
      }),
    ).toEqual(undefined);
  });

  it("getUIDFieldEntry should return undefined if there are no UID type fields", () => {
    expect(
      CustomTypeModel.getUIDFieldEntry({
        ...mockCustomType,
        json: {
          mainSection: {
            booleanField: mainSection.booleanField,
          },
        },
      }),
    ).toEqual(undefined);
  });

  it("getFieldLabel should return the label of the field", () => {
    expect(
      CustomTypeModel.getFieldLabel({
        config: {
          label: "MainSectionField",
        },
        type: "UID",
      }),
    ).toEqual("MainSectionField");
  });

  it("getFieldLabel should return undefined if there is no label", () => {
    expect(CustomTypeModel.getFieldLabel({ type: "UID" })).toEqual(undefined);
  });

  it("getSectionSliceZoneEntry should return the slice zone of the given section", () => {
    expect(
      CustomTypeModel.getSectionSliceZoneEntry(mockCustomType, "mainSection"),
    ).toEqual([
      "slices",
      {
        type: "Slices",
        fieldset: "Slice Zone",
        config: {
          choices: {
            hero_banner: {
              type: "SharedSlice",
            },
            promo_section_image_tiles: {
              type: "SharedSlice",
            },
          },
        },
      },
    ]);
  });

  it("getSectionSliceZoneConfig should return the config of the given section", () => {
    expect(
      CustomTypeModel.getSectionSliceZoneConfig(mockCustomType, "mainSection"),
    ).toEqual({
      choices: {
        hero_banner: {
          type: "SharedSlice",
        },
        promo_section_image_tiles: {
          type: "SharedSlice",
        },
      },
    });
  });

  it("getSectionSliceZoneConfig should return undefined if there are no sections", () => {
    expect(
      CustomTypeModel.getSectionSliceZoneConfig(
        {
          ...mockCustomType,
          json: {},
        },
        "mainSection",
      ),
    ).toEqual(undefined);
  });

  it("findNextSectionSliceZoneKey should return 'slices'", () => {
    expect(
      CustomTypeModel.findNextSectionSliceZoneKey(
        {
          ...mockCustomType,
          json: {
            anotherSection: {},
          },
        },
        "anotherSection",
      ),
    ).toEqual("slices");
  });

  it("findNextSectionSliceZoneKey should return 'slices1'", () => {
    expect(
      CustomTypeModel.findNextSectionSliceZoneKey(
        mockCustomType,
        "anotherSection",
      ),
    ).toEqual("slices1");
  });

  it("findNextSectionSliceZoneKey should return 'slices2'", () => {
    expect(
      CustomTypeModel.findNextSectionSliceZoneKey(
        {
          ...mockCustomType,
          json: {
            mainSection,
            SecondSection: {
              slices1: {
                type: "Slices",
              },
            },
            anotherSection,
          },
        },
        "anotherSection",
      ),
    ).toEqual("slices2");
  });

  it("findNextSectionSliceZoneKey should return 'slices3'", () => {
    expect(
      CustomTypeModel.findNextSectionSliceZoneKey(
        {
          ...mockCustomType,
          json: {
            mainSection,
            SecondSection: {
              slices2: {
                type: "Slices",
              },
            },
            anotherSection,
          },
        },
        "anotherSection",
      ),
    ).toEqual("slices3");
  });

  it("createSectionSliceZone should return the given custom type with a slice zone for given section", () => {
    expect(
      CustomTypeModel.createSectionSliceZone(mockCustomType, "anotherSection"),
    ).toEqual({
      ...mockCustomType,
      json: {
        ...mockCustomType.json,
        anotherSection: {
          ...anotherSection,
          slices1: {
            type: "Slices",
            fieldset: "Slice Zone",
          },
        },
      },
    });
  });

  it("createSectionSliceZone should return the same custom type if slice zone already exist for given section", () => {
    expect(
      CustomTypeModel.createSectionSliceZone(mockCustomType, "mainSection"),
    ).toEqual(mockCustomType);
  });

  it("deleteSectionSliceZone should return the custom type without the slice zone deleted", () => {
    expect(
      CustomTypeModel.deleteSectionSliceZone(mockCustomType, "mainSection"),
    ).toEqual({
      ...mockCustomType,
      json: {
        mainSection: {
          uid: mainSection.uid,
          booleanField: mainSection.booleanField,
          groupField: mainSection.groupField,
        },
        anotherSection,
      },
    });
  });

  it("deleteSliceZoneSlice should return the custom type without the slice deleted", () => {
    expect(
      CustomTypeModel.deleteSliceZoneSlice({
        customType: mockCustomType,
        sectionId: "mainSection",
        sliceId: "hero_banner",
      }),
    ).toEqual({
      ...mockCustomType,
      json: {
        mainSection: {
          ...mainSection,
          slices: {
            ...mainSection.slices,
            config: {
              ...mainSection.slices.config,
              choices: {
                promo_section_image_tiles: {
                  type: "SharedSlice",
                },
              },
            },
          },
        },
        anotherSection,
      },
    });
  });

  it("convertToPageType should convert the given custom type", () => {
    expect(CustomTypeModel.convertToPageType(mockCustomType)).toEqual({
      ...mockCustomType,
      format: "page",
    });
  });

  it("convertToPageType should convert the given custom type with a slice zone for Main section when it doesn't exist", () => {
    expect(
      CustomTypeModel.convertToPageType({
        ...mockCustomType,
        json: {
          mainSection: {},
          anotherSection,
        },
      }),
    ).toEqual({
      ...mockCustomType,
      json: {
        mainSection: {
          slices: {
            type: "Slices",
            fieldset: "Slice Zone",
          },
        },
        anotherSection,
      },
      format: "page",
    });
  });

  it("createSection should return the given custom type with the new section", () => {
    expect(CustomTypeModel.createSection(mockCustomType, "newSection")).toEqual(
      {
        ...mockCustomType,
        json: {
          ...mockCustomType.json,
          newSection: {},
        },
      },
    );
  });

  it("deleteSection should return the given custom type without the section", () => {
    expect(
      CustomTypeModel.deleteSection(mockCustomType, "anotherSection"),
    ).toEqual({
      ...mockCustomType,
      json: {
        mainSection,
      },
    });
  });

  it("renameSection should return the given custom type with the section renamed", () => {
    expect(
      CustomTypeModel.renameSection(
        mockCustomType,
        "anotherSection",
        "newSection",
      ),
    ).toEqual({
      ...mockCustomType,
      json: {
        mainSection,
        newSection: anotherSection,
      },
    });
  });

  it("addField should return the given custom type with the field added to the section", () => {
    expect(
      JSON.stringify(
        CustomTypeModel.addField({
          customType: mockCustomType,
          sectionId: "mainSection",
          newFieldId: "newField",
          newField: {
            config: {
              label: "NewField",
            },
            type: "UID",
          },
        }),
      ),
    ).toEqual(
      JSON.stringify({
        ...mockCustomType,
        json: {
          ...mockCustomType.json,
          mainSection: {
            uid: mainSection.uid,
            booleanField: mainSection.booleanField,
            groupField: mainSection.groupField,
            newField: {
              config: {
                label: "NewField",
              },
              type: "UID",
            },
            slices: mainSection.slices,
          },
        },
      }),
    );
  });

  it("deleteField should return the given custom type without the field", () => {
    expect(
      CustomTypeModel.deleteField({
        customType: mockCustomType,
        sectionId: "mainSection",
        fieldId: "booleanField",
      }),
    ).toEqual({
      ...mockCustomType,
      json: {
        ...mockCustomType.json,
        mainSection: {
          uid: mainSection.uid,
          groupField: mainSection.groupField,
          slices: mainSection.slices,
        },
      },
    });
  });

  it("updateField should return the given custom type with the field updated", () => {
    expect(
      CustomTypeModel.updateField({
        customType: mockCustomType,
        sectionId: "mainSection",
        previousFieldId: "booleanField",
        newFieldId: "newId",
        newField: {
          config: {
            label: "newLabel",
          },
          type: "Boolean",
        },
      }),
    ).toEqual({
      ...mockCustomType,
      json: {
        ...mockCustomType.json,
        mainSection: {
          uid: mainSection.uid,
          newId: {
            config: {
              label: "newLabel",
            },
            type: "Boolean",
          },
          groupField: mainSection.groupField,
          slices: mainSection.slices,
        },
      },
    });
  });

  it("reorderField should return the given custom type with the field reordered", () => {
    expect(
      JSON.stringify(
        CustomTypeModel.reorderField({
          customType: mockCustomType,
          sectionId: "mainSection",
          sourceIndex: 0,
          destinationIndex: 1,
        }),
      ),
    ).toEqual(
      JSON.stringify({
        ...mockCustomType,
        json: {
          ...mockCustomType.json,
          mainSection: {
            booleanField: mainSection.booleanField,
            uid: mainSection.uid,
            groupField: mainSection.groupField,
            slices: mainSection.slices,
          },
        },
      }),
    );
  });

  it("reorderField should exclude UID field from reordering on repeatable page type", () => {
    expect(
      JSON.stringify(
        CustomTypeModel.reorderField({
          customType: {
            ...mockCustomType,
            format: "page",
            json: {
              mainSection: {
                uid: {
                  config: {
                    label: "MainSectionField",
                  },
                  type: "UID",
                },
                booleanField: {
                  config: {
                    label: "BooleanField",
                  },
                  type: "Boolean",
                },
                textField: {
                  config: {
                    label: "TextField",
                  },
                  type: "Text",
                },
              },
              anotherSection,
            },
          },
          sectionId: "mainSection",
          sourceIndex: 0,
          destinationIndex: 1,
        }),
      ),
    ).toEqual(
      JSON.stringify({
        ...mockCustomType,
        format: "page",
        json: {
          mainSection: {
            uid: {
              config: {
                label: "MainSectionField",
              },
              type: "UID",
            },
            textField: {
              config: {
                label: "TextField",
              },
              type: "Text",
            },
            booleanField: {
              config: {
                label: "BooleanField",
              },
              type: "Boolean",
            },
          },
          anotherSection,
        },
      }),
    );
  });

  it("addUIDField should return the given custom type with the uid field (with default placeholder) added to the first section", () => {
    expect(
      CustomTypeModel.addUIDField("UID label", {
        ...mockCustomType,
        json: {
          mainSection: {},
        },
      }),
    ).toEqual({
      ...mockCustomType,
      json: {
        mainSection: {
          uid: {
            config: {
              label: "UID label",
            },
            type: "UID",
          },
        },
      },
    });
  });

  it("addUIDField should return the given custom not altered if there are no sections", () => {
    expect(
      CustomTypeModel.addUIDField("UID label", {
        ...mockCustomType,
        json: {},
      }),
    ).toEqual({
      ...mockCustomType,
      json: {},
    });
  });

  it("updateUIDField should return the given custom type with the uid field updated", () => {
    expect(
      CustomTypeModel.updateUIDField("UIDFieldUpdated", mockCustomType),
    ).toEqual({
      ...mockCustomType,
      json: {
        mainSection: {
          uid: {
            config: {
              label: "UIDFieldUpdated",
            },
            type: "UID",
          },
          booleanField: mainSection.booleanField,
          groupField: mainSection.groupField,
          slices: mainSection.slices,
        },
        anotherSection,
      },
    });
  });

  it("updateUIDField should return the given custom not altered if it does not contain uid field", () => {
    expect(
      CustomTypeModel.updateUIDField("UIDFieldUpdated", {
        ...mockCustomType,
        json: {
          mainSection: {
            booleanField: mainSection.booleanField,
          },
        },
      }),
    ).toEqual({
      ...mockCustomType,
      json: {
        mainSection: {
          booleanField: mainSection.booleanField,
        },
      },
    });
  });

  it("updateUIDFieldLabel should return the given custom type not altered if there is no sections", () => {
    expect(
      CustomTypeModel.updateUIDField("UIDFieldUpdated", {
        ...mockCustomType,
        json: {},
      }),
    ).toEqual({
      ...mockCustomType,
      json: {},
    });
  });

  it("updateSection should return the given custom type with the section updated", () => {
    expect(
      CustomTypeModel.updateSection({
        customType: mockCustomType,
        sectionId: "anotherSection",
        updatedSection: {
          uid: {
            config: {
              label: "AnotherSectionFieldUpdated",
            },
            type: "UID",
          },
        },
      }),
    ).toEqual({
      ...mockCustomType,
      json: {
        mainSection,
        anotherSection: {
          uid: {
            config: {
              label: "AnotherSectionFieldUpdated",
            },
            type: "UID",
          },
        },
      },
    });
  });

  it("updateFields should return the updated fields", () => {
    expect(
      CustomTypeModel.updateFields({
        fields: {
          booleanField: {
            config: {
              label: "BooleanFieldUpdated",
            },
            type: "Boolean",
          },
        },
        previousFieldId: "booleanField",
        newFieldId: "newField",
        newField: {
          config: {
            label: "NewField",
          },
          type: "UID",
        },
      }),
    ).toEqual({
      newField: {
        config: {
          label: "NewField",
        },
        type: "UID",
      },
    });
  });

  it("reorderFields should return the reordered fields", () => {
    expect(
      JSON.stringify(
        CustomTypeModel.reorderFields({
          fields: {
            booleanField: {
              config: {
                label: "BooleanField",
              },
              type: "Boolean",
            },
            textField: {
              config: {
                label: "TextField",
              },
              type: "Text",
            },
          },
          sourceIndex: 0,
          destinationIndex: 1,
        }),
      ),
    ).toEqual(
      JSON.stringify({
        textField: {
          config: {
            label: "TextField",
          },
          type: "Text",
        },
        booleanField: {
          config: {
            label: "BooleanField",
          },
          type: "Boolean",
        },
      }),
    );
  });

  it("should create a custom type with repeatable true", () => {
    expect(
      CustomTypeModel.create({
        id: "id",
        label: "lama",
        repeatable: true,
        format: "custom",
      }),
    ).toMatchInlineSnapshot(`
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
    const result = CustomTypeModel.create({
      id: "id",
      label: "lama",
      repeatable: false,
      format: "custom",
    });

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
    const result = CustomTypeModel.create({
      id: "🥪",
      label: "label",
      repeatable: true,
      format: "page",
    });

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
  const result = CustomTypeModel.create({
    id: "foo",
    label: "bar",
    repeatable: false,
    format: "page",
  });

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
