import { describe, expect } from "vitest";

import {
  CustomType,
  DynamicSection,
} from "@prismicio/types-internal/lib/customtypes";

import * as CustomTypeModel from "../customType";

describe("CustomTypeModel test suite", () => {
  const mainSection: DynamicSection = {
    uid: {
      config: {
        label: "MainSectionField",
      },
      type: "UID",
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
          ...mockCustomType.json.anotherSection,
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
});
