import { describe, expect, it } from "vitest";

import {
  convertLinkCustomtypesToFieldCheckMap,
  countPickedFields,
} from "../ContentRelationshipFieldPicker";
import { CustomType } from "@prismicio/types-internal/lib/customtypes";

describe("ContentRelationshipFieldPicker", () => {
  describe("countPickedFields", () => {
    const allCustomTypes: CustomType[] = [
      {
        id: "ct1",
        label: "CT 1",
        repeatable: false,
        status: true,
        json: {
          Main: {
            f1: {
              type: "Link",
              config: {
                select: "document",
                customtypes: ["ct2"],
              },
            },
            f2: {
              type: "Link",
              config: {
                select: "document",
                customtypes: ["ct2"],
              },
            },
            g1: {
              type: "Group",
              config: {
                fields: {
                  f1: {
                    type: "Boolean",
                  },
                  f2: {
                    type: "Link",
                    config: {
                      select: "document",
                      customtypes: ["ct2"],
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        id: "ct2",
        label: "CT 2",
        repeatable: false,
        status: true,
        json: {
          Main: {
            f1: {
              type: "Boolean",
            },
            g2: {
              type: "Group",
              config: {
                fields: {
                  f1: {
                    type: "Boolean",
                  },
                  f2: {
                    type: "Boolean",
                  },
                },
              },
            },
          },
        },
      },
    ];

    it("should count picked fields with a custom type as string", () => {
      const customtypes = ["ct1"];

      const result = countPickedFields(
        convertLinkCustomtypesToFieldCheckMap({
          linkCustomtypes: customtypes,
          allCustomTypes,
        }),
      );

      expect(result).toEqual({
        pickedFields: 0,
        nestedPickedFields: 0,
      });
    });

    it("should count picked fields with multiple custom types as string", () => {
      const customtypes = ["ct1", "ct2"];

      const result = countPickedFields(
        convertLinkCustomtypesToFieldCheckMap({
          linkCustomtypes: customtypes,
          allCustomTypes,
        }),
      );

      expect(result).toEqual({
        pickedFields: 0,
        nestedPickedFields: 0,
      });
    });

    it("should count picked fields with custom type as object and one field", () => {
      const customtypes = [
        {
          id: "ct1",
          fields: ["f1"],
        },
      ];

      const result = countPickedFields(
        convertLinkCustomtypesToFieldCheckMap({
          linkCustomtypes: customtypes,
          allCustomTypes,
        }),
      );

      expect(result).toEqual({
        pickedFields: 1,
        nestedPickedFields: 0,
      });
    });

    it("should count picked fields with custom type as object and one nested field", () => {
      const customtypes = [
        {
          id: "ct1",
          fields: [
            {
              id: "f1",
              customtypes: [
                {
                  id: "ct2",
                  fields: ["f1"],
                },
              ],
            },
          ],
        },
      ];

      const result = countPickedFields(
        convertLinkCustomtypesToFieldCheckMap({
          linkCustomtypes: customtypes,
          allCustomTypes,
        }),
      );

      expect(result).toEqual({
        pickedFields: 1,
        nestedPickedFields: 1,
      });
    });

    it("should count picked fields with custom type as object with group field", () => {
      const customtypes = [
        {
          id: "ct1",
          fields: [
            {
              id: "g1",
              fields: ["f1", "f2"],
            },
          ],
        },
      ];

      const test = convertLinkCustomtypesToFieldCheckMap({
        linkCustomtypes: customtypes,
        allCustomTypes,
      });
      const result = countPickedFields(test);

      expect(result).toEqual({
        pickedFields: 2,
        nestedPickedFields: 0,
      });
    });

    it("should count picked fields with custom type as object with group field and nested custom type", () => {
      const customtypes = [
        {
          id: "ct1",
          fields: [
            {
              id: "g1",
              fields: [
                "f1",
                {
                  id: "f2",
                  customtypes: [
                    {
                      id: "ct2",
                      fields: ["f1"],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];

      const result = countPickedFields(
        convertLinkCustomtypesToFieldCheckMap({
          linkCustomtypes: customtypes,
          allCustomTypes,
        }),
      );

      expect(result).toEqual({
        pickedFields: 2,
        nestedPickedFields: 1,
      });
    });

    it("should count picked fields with custom type as object with group field, nested custom type and nested group field", () => {
      const customtypes = [
        {
          id: "ct1",
          fields: [
            {
              id: "g1",
              fields: [
                "f1",
                {
                  id: "f2",
                  customtypes: [
                    {
                      id: "ct2",
                      fields: [
                        "f1",
                        {
                          id: "g2",
                          fields: ["f1", "f2"],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];

      const result = countPickedFields(
        convertLinkCustomtypesToFieldCheckMap({
          linkCustomtypes: customtypes,
          allCustomTypes,
        }),
      );

      expect(result).toEqual({
        pickedFields: 4,
        nestedPickedFields: 3,
      });
    });

    it("should count picked fields with custom type as object with nested custom type and nested group field", () => {
      const customtypes = [
        {
          id: "ct1",
          fields: [
            "f1",
            {
              id: "f2",
              customtypes: [
                {
                  id: "ct2",
                  fields: [
                    "f1",
                    {
                      id: "g2",
                      fields: ["f1", "f2"],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];

      const result = countPickedFields(
        convertLinkCustomtypesToFieldCheckMap({
          linkCustomtypes: customtypes,
          allCustomTypes,
        }),
      );

      expect(result).toEqual({
        pickedFields: 4,
        nestedPickedFields: 3,
      });
    });

    it("should count picked fields with custom type as object with nested custom type without fields", () => {
      const customtypes = [
        {
          id: "ct1",
          fields: [
            "f1",
            {
              id: "f2",
              customtypes: [
                {
                  id: "ct2",
                  fields: [],
                },
              ],
            },
          ],
        },
      ];

      const result = countPickedFields(
        convertLinkCustomtypesToFieldCheckMap({
          linkCustomtypes: customtypes,
          allCustomTypes,
        }),
      );

      expect(result).toEqual({
        pickedFields: 1,
        nestedPickedFields: 0,
      });
    });

    it("should count picked fields with custom type as object with group field without fields", () => {
      const customtypes = [
        {
          id: "ct1",
          fields: [
            "f1",
            {
              id: "g1",
              fields: [],
            },
          ],
        },
      ];

      const result = countPickedFields(
        convertLinkCustomtypesToFieldCheckMap({
          linkCustomtypes: customtypes,
          allCustomTypes,
        }),
      );

      expect(result).toEqual({
        pickedFields: 1,
        nestedPickedFields: 0,
      });
    });
  });

  describe("createContentRelationshipFieldCheckMap", () => {
    it("should include the field if it is a static zone field", () => {
      const customType: CustomType = {
        id: "customType",
        label: "Custom Type",
        repeatable: false,
        status: true,
        json: {
          Main: {
            booleanField: {
              type: "Boolean",
              config: {
                label: "Boolean Field",
              },
            },
          },
        },
      };

      const result = convertLinkCustomtypesToFieldCheckMap({
        linkCustomtypes: [{ id: "customType", fields: ["booleanField"] }],
        allCustomTypes: [customType],
      });

      expect(result).toEqual({
        customType: {
          booleanField: {
            type: "checkbox",
            value: true,
          },
        },
      });
    });

    it("should not include the field if the field is not a static zone field", () => {
      const customType: CustomType = {
        id: "customType",
        label: "Custom Type",
        repeatable: false,
        status: true,
        json: {
          Main: {
            rtField: {
              type: "StructuredText",
              config: {
                label: "Structured Text Field",
              },
            },
          },
        },
      };

      const result = convertLinkCustomtypesToFieldCheckMap({
        linkCustomtypes: [{ id: "customType", fields: ["booleanField"] }],
        allCustomTypes: [customType],
      });

      expect(result).toEqual({});
    });

    it("should not include the field if it is invalid (uid, slices & choice)", () => {
      const customType: CustomType = {
        id: "customType",
        label: "Custom Type",
        repeatable: false,
        status: true,
        json: {
          Main: {
            bool: {
              type: "Boolean",
            },
            typeUid: {
              type: "UID",
            },
            uid: {
              type: "Boolean",
            },
            choice: {
              type: "Choice",
              config: {
                choices: {
                  choice1: {
                    type: "Boolean",
                  },
                },
              },
            },
            slices: {
              type: "Slices",
              config: {
                choices: {
                  slice1: {
                    type: "SharedSlice",
                  },
                },
              },
            },
          },
        },
      };

      const result = convertLinkCustomtypesToFieldCheckMap({
        linkCustomtypes: [
          {
            id: "customType",
            fields: ["bool", "typeUid", "uid", "choice", "slices"],
          },
        ],
        allCustomTypes: [customType],
      });

      expect(result).toEqual({
        customType: {
          bool: {
            type: "checkbox",
            value: true,
          },
        },
      });
    });

    it("should include the field if it correctly references a group field", () => {
      const customType: CustomType = {
        id: "customType",
        label: "Custom Type",
        repeatable: false,
        status: true,
        json: {
          Main: {
            groupField: {
              type: "Group",
              config: {
                label: "Group Field",
                fields: {
                  booleanField: {
                    type: "Boolean",
                    config: {
                      label: "Boolean Field",
                    },
                  },
                },
              },
            },
          },
        },
      };

      const result = convertLinkCustomtypesToFieldCheckMap({
        linkCustomtypes: [
          {
            id: "customType",
            fields: [
              {
                id: "groupField",
                fields: ["booleanField"],
              },
            ],
          },
        ],
        allCustomTypes: [customType],
      });

      expect(result).toEqual({
        customType: {
          groupField: {
            type: "group",
            value: {
              booleanField: {
                type: "checkbox",
                value: true,
              },
            },
          },
        },
      });
    });

    it("should include the field if it correctly references a group field inside a nested custom type", () => {
      const customType: CustomType = {
        id: "customType",
        label: "Custom Type",
        repeatable: false,
        status: true,
        json: {
          Main: {
            groupField: {
              type: "Group",
              config: {
                label: "Group Field",
                fields: {
                  booleanField: {
                    type: "Boolean",
                    config: {
                      label: "Boolean Field",
                    },
                  },
                },
              },
            },
          },
        },
      };

      const customTypeWithContentRelationship: CustomType = {
        id: "customTypeWithContentRelationship",
        label: "Custom Type With Content Relationship",
        repeatable: false,
        status: true,
        json: {
          Main: {
            contentRelationshipField: {
              type: "Link",
              config: {
                select: "document",
                customtypes: ["customType"],
              },
            },
          },
        },
      };

      const result = convertLinkCustomtypesToFieldCheckMap({
        linkCustomtypes: [
          {
            id: "customTypeWithContentRelationship",
            fields: [
              {
                id: "contentRelationshipField",
                customtypes: [
                  {
                    id: "customType",
                    fields: [
                      {
                        id: "groupField",
                        fields: ["booleanField"],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        allCustomTypes: [customType, customTypeWithContentRelationship],
      });

      expect(result).toEqual({
        customTypeWithContentRelationship: {
          contentRelationshipField: {
            type: "contentRelationship",
            value: {
              customType: {
                groupField: {
                  type: "group",
                  value: {
                    booleanField: {
                      type: "checkbox",
                      value: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    });

    it("should not include the field if it incorrectly references a regular field as a group field", () => {
      const customType: CustomType = {
        id: "customType",
        label: "Custom Type",
        repeatable: false,
        status: true,
        json: {
          Main: {
            booleanField: {
              type: "Boolean",
            },
          },
        },
      };

      const result = convertLinkCustomtypesToFieldCheckMap({
        linkCustomtypes: [
          {
            id: "customType",
            fields: [
              {
                id: "groupField",
                fields: ["booleanField"],
              },
            ],
          },
        ],
        allCustomTypes: [customType],
      });

      expect(result).toEqual({});
    });

    it("should not include the field if it incorrectly references a group field as a regular field (no picked fields)", () => {
      const customType: CustomType = {
        id: "customType",
        label: "Custom Type",
        repeatable: false,
        status: true,
        json: {
          Main: {
            groupField: {
              type: "Group",
              config: {
                label: "Group Field",
                fields: {
                  booleanField: {
                    type: "Boolean",
                    config: {
                      label: "Boolean Field",
                    },
                  },
                },
              },
            },
          },
        },
      };

      const result = convertLinkCustomtypesToFieldCheckMap({
        linkCustomtypes: [
          {
            id: "customType",
            fields: ["groupField"],
          },
        ],
        allCustomTypes: [customType],
      });

      expect(result).toEqual({});
    });

    it("should not include the a content relationship field if it references a non existing custom type", () => {
      const customTypeWithField: CustomType = {
        id: "customTypeWithField",
        label: "Custom Type With Field",
        repeatable: false,
        status: true,
        json: {
          Main: {
            colorField: {
              type: "Color",
              config: {
                label: "Color Field",
              },
            },
          },
        },
      };
      const customType: CustomType = {
        id: "customType",
        label: "Custom Type",
        repeatable: false,
        status: true,
        json: {
          Main: {
            contentRelationshipField: {
              type: "Link",
              config: {
                select: "document",
                customtypes: ["customTypeWithField"],
              },
            },
          },
        },
      };

      const result = convertLinkCustomtypesToFieldCheckMap({
        linkCustomtypes: [
          {
            id: "customType",
            fields: [
              {
                id: "contentRelationshipField",
                customtypes: [
                  {
                    id: "nonExistingCustomType",
                    fields: ["colorField"],
                  },
                ],
              },
            ],
          },
        ],
        allCustomTypes: [customType, customTypeWithField],
      });

      console.log(JSON.stringify(result, null, 2));

      expect(result).toEqual({});
    });
  });
});
