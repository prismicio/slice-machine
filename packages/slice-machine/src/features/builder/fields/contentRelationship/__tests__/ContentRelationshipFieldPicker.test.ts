import { CustomType } from "@prismicio/types-internal/lib/customtypes";
import { describe, expect, it } from "vitest";

import {
  convertLinkCustomtypesToFieldCheckMap,
  countPickedFields,
} from "../ContentRelationshipFieldPicker";

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
    it("should include existing/valid referenced fields", () => {
      const customType: CustomType = {
        id: "customType",
        label: "Custom Type",
        repeatable: false,
        status: true,
        json: {
          Main: {
            textField: {
              type: "Text",
            },
            booleanField: {
              type: "Boolean",
            },
            structuredTextField: {
              type: "StructuredText",
            },
            imageField: {
              type: "Image",
            },
            linkField: {
              type: "Link",
            },
            colorField: {
              type: "Color",
            },
            dateField: {
              type: "Date",
            },
            geoPointField: {
              type: "GeoPoint",
            },
            numberField: {
              type: "Number",
            },
            rangeField: {
              type: "Range",
            },
            selectField: {
              type: "Select",
            },
            timestampField: {
              type: "Timestamp",
            },
            separatorField: {
              type: "Separator",
            },
            tableField: {
              type: "Table",
            },
            integrationFieldsField: {
              type: "IntegrationFields",
            },
          },
        },
      };

      const result = convertLinkCustomtypesToFieldCheckMap({
        linkCustomtypes: [
          {
            id: "customType",
            fields: [
              "textField",
              "booleanField",
              "structuredTextField",
              "imageField",
              "linkField",
              "colorField",
              "dateField",
              "geoPointField",
              "numberField",
              "rangeField",
              "selectField",
              "timestampField",
              "separatorField",
              "tableField",
              "integrationFieldsField",
            ],
          },
        ],
        allCustomTypes: [customType],
      });

      expect(result).toEqual({
        customType: {
          textField: {
            type: "checkbox",
            value: true,
          },
          booleanField: {
            type: "checkbox",
            value: true,
          },
          structuredTextField: {
            type: "checkbox",
            value: true,
          },
          imageField: {
            type: "checkbox",
            value: true,
          },
          linkField: {
            type: "checkbox",
            value: true,
          },
          colorField: {
            type: "checkbox",
            value: true,
          },
          dateField: {
            type: "checkbox",
            value: true,
          },
          geoPointField: {
            type: "checkbox",
            value: true,
          },
          numberField: {
            type: "checkbox",
            value: true,
          },
          rangeField: {
            type: "checkbox",
            value: true,
          },
          selectField: {
            type: "checkbox",
            value: true,
          },
          timestampField: {
            type: "checkbox",
            value: true,
          },
          separatorField: {
            type: "checkbox",
            value: true,
          },
          tableField: {
            type: "checkbox",
            value: true,
          },
          integrationFieldsField: {
            type: "checkbox",
            value: true,
          },
        },
      });
    });

    it("should not include non-existing/invalid referenced fields", () => {
      const customType2: CustomType = {
        id: "customType2",
        label: "Custom Type 2",
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

      const customType: CustomType = {
        id: "customType",
        label: "Custom Type",
        repeatable: false,
        status: true,
        json: {
          Main: {
            mdField: {
              type: "StructuredText",
            },
            crField: {
              type: "Link",
              config: {
                select: "document",
                customtypes: ["customType2"],
              },
            },
            groupField: {
              type: "Group",
              config: {
                fields: {
                  groupFieldA: {
                    type: "Boolean",
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
              "mdField",
              "nonExistingField",
              {
                id: "nonExistingGroup",
                fields: ["groupFieldA"],
              },
              {
                id: "crField",
                customtypes: [
                  {
                    id: "customType2",
                    fields: ["nonExistingNestedField"],
                  },
                ],
              },
              {
                id: "groupField",
                fields: ["nonExistingGroupField"],
              },
            ],
          },
        ],
        allCustomTypes: [customType, customType2],
      });

      expect(result).toEqual({
        customType: {
          mdField: {
            type: "checkbox",
            value: true,
          },
        },
      });
    });

    it("should not include an invalid field (uid, slices & choice)", () => {
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
            fields: ["booleanField", "typeUid", "uid", "choice", "slices"],
          },
        ],
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

    it("should include a correctly referenced group field", () => {
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

    it("should include a field correctly referenced as a group inside a nested custom type", () => {
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

    it("should not include a regular field incorrectly referenced as a group", () => {
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

    it("should not include a field referenced as a group field when it's not one", () => {
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
                id: "booleanField",
                fields: ["fieldA"],
              },
            ],
          },
        ],
        allCustomTypes: [customType],
      });

      expect(result).toEqual({});
    });

    it("should not include a group field referenced as a regular field (string/no picked fields)", () => {
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

    it("should not include a field referenced as a content relationship field when it's not one", () => {
      const customTypeA: CustomType = {
        id: "customTypeA",
        label: "Custom Type A",
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
      const customTypeB: CustomType = {
        id: "customTypeB",
        label: "Custom Type B",
        repeatable: false,
        status: true,
        json: {
          Main: {
            colorField: {
              type: "Color",
            },
          },
        },
      };

      const result = convertLinkCustomtypesToFieldCheckMap({
        linkCustomtypes: [
          {
            id: "customTypeA",
            fields: [
              {
                id: "booleanField",
                customtypes: [
                  {
                    id: "customTypeB",
                    fields: ["colorField"],
                  },
                ],
              },
            ],
          },
        ],
        allCustomTypes: [customTypeB, customTypeA],
      });

      expect(result).toEqual({});
    });

    it("should not include a content relationship field if it references a non existing custom type", () => {
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
            groupField: {
              type: "Group",
              config: {
                fields: {
                  contentRelationshipFieldInsideGroup: {
                    type: "Link",
                    config: {
                      select: "document",
                      customtypes: ["customTypeWithField"],
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
                id: "contentRelationshipField",
                customtypes: [
                  {
                    id: "nonExistingCustomType",
                    fields: ["colorField"],
                  },
                ],
              },
              {
                id: "groupField",
                fields: [
                  {
                    id: "contentRelationshipFieldInsideGroup",
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
          },
        ],
        allCustomTypes: [customType, customTypeWithField],
      });

      expect(result).toEqual({});
    });

    it("should not include a regular field referenced as a content relationship field", () => {
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
                id: "booleanField",
                customtypes: [],
              },
            ],
          },
        ],
        allCustomTypes: [customType],
      });

      expect(result).toEqual({});
    });

    it("should not include a regular field referenced as a group field", () => {
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
                id: "booleanField",
                fields: [],
              },
            ],
          },
        ],
        allCustomTypes: [customType],
      });

      expect(result).toEqual({});
    });

    it("should not check for valid fields if allCustomTypes prop is not provided", () => {
      const result = convertLinkCustomtypesToFieldCheckMap({
        linkCustomtypes: [
          {
            id: "customTypeA",
            fields: [
              "fieldA",
              {
                id: "groupA",
                fields: ["groupFieldA"],
              },
              {
                id: "contentRelationshipA",
                customtypes: [
                  {
                    id: "customTypeB",
                    fields: ["fieldB"],
                  },
                ],
              },
            ],
          },
        ],
      });

      expect(result).toEqual({
        customTypeA: {
          fieldA: {
            type: "checkbox",
            value: true,
          },
          groupA: {
            type: "group",
            value: {
              groupFieldA: {
                type: "checkbox",
                value: true,
              },
            },
          },
          contentRelationshipA: {
            type: "contentRelationship",
            value: {
              customTypeB: {
                fieldB: {
                  type: "checkbox",
                  value: true,
                },
              },
            },
          },
        },
      });
    });
  });
});
