import { describe, expect } from "vitest";

import * as contentRelationship from "../contentRelationship";
import {
  CustomType,
  DynamicWidget,
} from "@prismicio/types-internal/lib/customtypes";
import { getAllStaticZoneFields } from "../customType";

describe("ContentRelationship test suite", () => {
  describe("isContentRelationshipField", () => {
    it("should return true if the field is a content relationship field", () => {
      const field: DynamicWidget = {
        type: "Link",
        config: {
          select: "document",
        },
      };
      const result = contentRelationship.isContentRelationshipField(field);
      expect(result).toBe(true);
    });

    it("should return false if the field is not a content relationship field", () => {
      const field: DynamicWidget = {
        type: "Text",
      };
      const result = contentRelationship.isContentRelationshipField(field);
      expect(result).toBe(false);
    });
  });

  describe("getAllStaticZoneFieldsForContentRelationship", () => {
    it("should return all static zone fields for a content relationship", () => {
      const customType: CustomType = {
        id: "customType",
        label: "Custom Type",
        repeatable: false,
        status: true,
        json: {
          Main: {
            uid: {
              type: "UID",
              config: {
                label: "UID",
              },
            },
            booleanField: {
              type: "Boolean",
              config: {
                label: "Boolean Field",
              },
            },
          },
        },
      };

      const result =
        contentRelationship.getAllStaticZoneFieldsForContentRelationship(
          customType,
        );

      expect(result).toEqual([
        {
          fieldId: "booleanField",
          field: {
            type: "Boolean",
            config: {
              label: "Boolean Field",
            },
          },
        },
      ]);
    });
  });

  describe("canBePickedInContentRelationshipField", () => {
    it("should return true if the field is a static zone field", () => {
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

      const result = contentRelationship.canBePickedInContentRelationshipField(
        "booleanField",
        customType.json.Main.booleanField,
      );

      expect(result).toBe(true);
    });

    it("should return false if the field is a UID field", () => {
      const customType: CustomType = {
        id: "customType",
        label: "Custom Type",
        repeatable: false,
        status: true,
        json: {
          Main: {
            uid: {
              type: "UID",
            },
          },
        },
      };

      const result = contentRelationship.canBePickedInContentRelationshipField(
        "uid",
        customType.json.Main.uid,
      );

      expect(result).toBe(false);
    });
  });

  describe("isValidContentRelationshipPickedField", () => {
    it("should return true if the field is a static zone field", () => {
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

      const field = "booleanField";

      const result = contentRelationship.isValidContentRelationshipPickedField(
        field,
        getAllStaticZoneFields(customType),
        [customType],
      );

      expect(result).toBe(true);
    });

    it("should return false if the field is not a static zone field", () => {
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

      const field = "nonExistingField";

      const result = contentRelationship.isValidContentRelationshipPickedField(
        field,
        getAllStaticZoneFields(customType),
        [customType],
      );

      expect(result).toBe(false);
    });

    it("should return false if the field is a uid field type", () => {
      const customType: CustomType = {
        id: "customType",
        label: "Custom Type",
        repeatable: false,
        status: true,
        json: {
          Main: {
            fakeid: {
              type: "UID",
            },
          },
        },
      };

      const field = "fakeid";

      const result = contentRelationship.isValidContentRelationshipPickedField(
        field,
        getAllStaticZoneFields(customType),
        [customType],
      );

      expect(result).toBe(false);
    });

    it("should return false if the field is name uid", () => {
      const customType: CustomType = {
        id: "customType",
        label: "Custom Type",
        repeatable: false,
        status: true,
        json: {
          Main: {
            uid: {
              type: "Boolean",
            },
          },
        },
      };

      const field = "uid";

      const result = contentRelationship.isValidContentRelationshipPickedField(
        field,
        getAllStaticZoneFields(customType),
        [customType],
      );

      expect(result).toBe(false);
    });

    it("should return true if the field correctly references a group field", () => {
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

      const field = {
        id: "groupField",
        fields: ["booleanField"],
      };

      const result = contentRelationship.isValidContentRelationshipPickedField(
        field,
        getAllStaticZoneFields(customType),
        [customType],
      );

      expect(result).toBe(true);
    });

    it("should return false if the field is a string but reference a group field", () => {
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

      const field = "groupField";

      const result = contentRelationship.isValidContentRelationshipPickedField(
        field,
        getAllStaticZoneFields(customType),
        [customType],
      );

      expect(result).toBe(false);
    });

    it("should return false if the field correctly references a group field but with no fields", () => {
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
                fields: {},
              },
            },
          },
        },
      };

      const field = "groupField";

      const result = contentRelationship.isValidContentRelationshipPickedField(
        field,
        getAllStaticZoneFields(customType),
        [customType],
      );

      expect(result).toBe(false);
    });

    it("should return false if the field correctly references a group field but with only non existing fields", () => {
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

      const field = {
        id: "groupField",
        fields: ["nonExistingField1", "nonExistingField2"],
      };

      const result = contentRelationship.isValidContentRelationshipPickedField(
        field,
        getAllStaticZoneFields(customType),
        [customType],
      );

      expect(result).toBe(false);
    });

    it("should return true if the field correctly references a group field with a content relationship field (no custom types)", () => {
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
                  contentRelationshipField: {
                    type: "Link",
                    config: {
                      select: "document",
                    },
                  },
                },
              },
            },
          },
        },
      };

      const field = {
        id: "groupField",
        fields: ["contentRelationshipField"],
      };

      const result = contentRelationship.isValidContentRelationshipPickedField(
        field,
        getAllStaticZoneFields(customType),
        [customType],
      );

      expect(result).toBe(true);
    });

    it("should return true if the field correctly references a group field with a content relationship field (empty custom types)", () => {
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
                  contentRelationshipField: {
                    type: "Link",
                    config: {
                      select: "document",
                      customtypes: [],
                    },
                  },
                },
              },
            },
          },
        },
      };

      const field = {
        id: "groupField",
        fields: ["contentRelationshipField"],
      };

      const result = contentRelationship.isValidContentRelationshipPickedField(
        field,
        getAllStaticZoneFields(customType),
        [customType],
      );

      expect(result).toBe(true);
    });

    it("should return true if the field correctly references a group field with a content relationship field (invalid custom type)", () => {
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
                  contentRelationshipField: {
                    type: "Link",
                    config: {
                      select: "document",
                      customtypes: ["invalidCustomType"],
                    },
                  },
                },
              },
            },
          },
        },
      };

      const field = {
        id: "groupField",
        fields: ["contentRelationshipField"],
      };

      const result = contentRelationship.isValidContentRelationshipPickedField(
        field,
        getAllStaticZoneFields(customType),
        [customType],
      );

      expect(result).toBe(true);
    });

    it("should return true if the field correctly references a group field with a content relationship field (custom type without field)", () => {
      const customTypeNoField: CustomType = {
        id: "customTypeNoField",
        label: "Custom Type No Field",
        repeatable: false,
        status: true,
        json: {},
      };
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
                  contentRelationshipField: {
                    type: "Link",
                    config: {
                      select: "document",
                      customtypes: ["customTypeNoField"],
                    },
                  },
                },
              },
            },
          },
        },
      };

      const field = {
        id: "groupField",
        fields: ["contentRelationshipField"],
      };

      const result = contentRelationship.isValidContentRelationshipPickedField(
        field,
        getAllStaticZoneFields(customType),
        [customType, customTypeNoField],
      );

      expect(result).toBe(true);
    });

    it("should return false if the field correctly references a group field but with a content relationship field (with valid custom type)", () => {
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
            groupField: {
              type: "Group",
              config: {
                label: "Group Field",
                fields: {
                  contentRelationshipField: {
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

      const field = {
        id: "groupField",
        fields: ["contentRelationshipField"],
      };

      const result = contentRelationship.isValidContentRelationshipPickedField(
        field,
        getAllStaticZoneFields(customType),
        [customType, customTypeWithField],
      );

      expect(result).toBe(false);
    });

    it("should return true if the field correctly references a group field with a content relationship field (nested field picking)", () => {
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
            groupField: {
              type: "Group",
              config: {
                label: "Group Field",
                fields: {
                  contentRelationshipField: {
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

      const field: contentRelationship.LinkCustomtypesFields = {
        id: "groupField",
        fields: [
          {
            id: "contentRelationshipField",
            customtypes: [
              {
                id: "customTypeWithField",
                fields: ["colorField"],
              },
            ],
          },
        ],
      };

      const result = contentRelationship.isValidContentRelationshipPickedField(
        field,
        getAllStaticZoneFields(customType),
        [customType, customTypeWithField],
      );

      expect(result).toBe(true);
    });

    it("should return false if the field references a group field with a content relationship field (invalid cr field)", () => {
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
            groupField: {
              type: "Group",
              config: {
                label: "Group Field",
                fields: {
                  contentRelationshipField: {
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

      const field: contentRelationship.LinkCustomtypesFields = {
        id: "groupField",
        fields: [
          {
            id: "nonExistingField",
            customtypes: [
              {
                id: "customTypeWithField",
                fields: ["colorField"],
              },
            ],
          },
        ],
      };

      const result = contentRelationship.isValidContentRelationshipPickedField(
        field,
        getAllStaticZoneFields(customType),
        [customType, customTypeWithField],
      );

      expect(result).toBe(false);
    });

    it("should return false if the field references a group field with a content relationship field (non existing custom type)", () => {
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
            groupField: {
              type: "Group",
              config: {
                label: "Group Field",
                fields: {
                  contentRelationshipField: {
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

      const field: contentRelationship.LinkCustomtypesFields = {
        id: "groupField",
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
      };

      const result = contentRelationship.isValidContentRelationshipPickedField(
        field,
        getAllStaticZoneFields(customType),
        [customType, customTypeWithField],
      );

      expect(result).toBe(false);
    });

    it("should return false if the field references a group field with a content relationship field (invalid custom type)", () => {
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
            groupField: {
              type: "Group",
              config: {
                label: "Group Field",
                fields: {
                  contentRelationshipField: {
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

      const field: contentRelationship.LinkCustomtypesFields = {
        id: "groupField",
        fields: [
          {
            id: "contentRelationshipField",
            customtypes: [
              {
                id: "customTypeWithField",
                fields: ["nonExistingField"],
              },
            ],
          },
        ],
      };

      const result = contentRelationship.isValidContentRelationshipPickedField(
        field,
        getAllStaticZoneFields(customType),
        [customType, customTypeWithField],
      );

      expect(result).toBe(false);
    });

    it("should return true if the field correctly references a content relationship field (no custom types)", () => {
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
              },
            },
          },
        },
      };

      const field = "contentRelationshipField";

      const result = contentRelationship.isValidContentRelationshipPickedField(
        field,
        getAllStaticZoneFields(customType),
        [customType],
      );

      expect(result).toBe(true);
    });

    it("should return true if the field correctly references a content relationship field (empty custom types)", () => {
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
                customtypes: [],
              },
            },
          },
        },
      };

      const field = "contentRelationshipField";

      const result = contentRelationship.isValidContentRelationshipPickedField(
        field,
        getAllStaticZoneFields(customType),
        [customType],
      );

      expect(result).toBe(true);
    });

    it("should return true if the field correctly references a content relationship field (invalid custom type)", () => {
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
                customtypes: ["invalidCustomType"],
              },
            },
          },
        },
      };

      const field = "contentRelationshipField";

      const result = contentRelationship.isValidContentRelationshipPickedField(
        field,
        getAllStaticZoneFields(customType),
        [customType],
      );

      expect(result).toBe(true);
    });

    it("should return true if the field correctly references a content relationship field (custom type without field)", () => {
      const customTypeNoField: CustomType = {
        id: "customTypeNoField",
        label: "Custom Type No Field",
        repeatable: false,
        status: true,
        json: {},
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
                customtypes: ["customTypeNoField"],
              },
            },
          },
        },
      };

      const field = "contentRelationshipField";

      const result = contentRelationship.isValidContentRelationshipPickedField(
        field,
        getAllStaticZoneFields(customType),
        [customType, customTypeNoField],
      );

      expect(result).toBe(true);
    });

    it("should return false if the field correctly references a content relationship field (with valid custom type)", () => {
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

      const field = "contentRelationshipField";

      const result = contentRelationship.isValidContentRelationshipPickedField(
        field,
        getAllStaticZoneFields(customType),
        [customType, customTypeWithField],
      );

      expect(result).toBe(false);
    });

    it("should return true if the field correctly references a content relationship field (nested field picking)", () => {
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

      const field: contentRelationship.LinkCustomtypesFields = {
        id: "contentRelationshipField",
        customtypes: [
          {
            id: "customTypeWithField",
            fields: ["colorField"],
          },
        ],
      };

      const result = contentRelationship.isValidContentRelationshipPickedField(
        field,
        getAllStaticZoneFields(customType),
        [customType, customTypeWithField],
      );

      expect(result).toBe(true);
    });

    it("should return false if the field references a content relationship field (invalid cr field)", () => {
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

      const field: contentRelationship.LinkCustomtypesFields = {
        id: "nonExistingField",
        customtypes: [
          {
            id: "customTypeWithField",
            fields: ["colorField"],
          },
        ],
      };

      const result = contentRelationship.isValidContentRelationshipPickedField(
        field,
        getAllStaticZoneFields(customType),
        [customType, customTypeWithField],
      );

      expect(result).toBe(false);
    });

    it("should return false if the field references a content relationship field (non existing custom type)", () => {
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

      const field: contentRelationship.LinkCustomtypesFields = {
        id: "contentRelationshipField",
        customtypes: [
          {
            id: "nonExistingCustomType",
            fields: ["colorField"],
          },
        ],
      };

      const result = contentRelationship.isValidContentRelationshipPickedField(
        field,
        getAllStaticZoneFields(customType),
        [customType, customTypeWithField],
      );

      expect(result).toBe(false);
    });

    it("should return false if the field references a content relationship field (invalid custom type)", () => {
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

      const field: contentRelationship.LinkCustomtypesFields = {
        id: "contentRelationshipField",
        customtypes: [
          {
            id: "customTypeWithField",
            fields: ["nonExistingField"],
          },
        ],
      };

      const result = contentRelationship.isValidContentRelationshipPickedField(
        field,
        getAllStaticZoneFields(customType),
        [customType, customTypeWithField],
      );

      expect(result).toBe(false);
    });
  });

  describe("countContentRelationshipPickedFields", () => {
    it("should return the correct count for a valid simple field", () => {
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

      const field = "booleanField";

      const result = contentRelationship.countContentRelationshipPickedFields(
        field,
        getAllStaticZoneFields(customType),
        [customType],
      );

      expect(result).toBe(1);
    });

    it("should return the correct count for a valid group field (simple field)", () => {
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

      const field = {
        id: "groupField",
        fields: ["booleanField"],
      };

      const result = contentRelationship.countContentRelationshipPickedFields(
        field,
        getAllStaticZoneFields(customType),
        [customType],
      );

      expect(result).toBe(1);
    });

    it("should return the correct count for a valid group field (content relationship field)", () => {
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
                  contentRelationshipField: {
                    type: "Link",
                    config: {
                      select: "document",
                    },
                  },
                },
              },
            },
          },
        },
      };

      const field = {
        id: "groupField",
        fields: ["contentRelationshipField"],
      };

      const result = contentRelationship.countContentRelationshipPickedFields(
        field,
        getAllStaticZoneFields(customType),
        [customType],
      );

      expect(result).toBe(1);
    });

    it("should return the correct count for a valid group field (content relationship field without fields picked)", () => {
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
                  contentRelationshipField: {
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

      const field = {
        id: "groupField",
        fields: [
          "booleanField",
          {
            id: "contentRelationshipField",
            customtypes: ["customTypeWithField"],
          },
        ],
      };

      const result = contentRelationship.countContentRelationshipPickedFields(
        field,
        getAllStaticZoneFields(customType),
        [customType, customTypeWithField],
      );

      expect(result).toBe(1);
    });

    it("should return the correct count for a valid group field (content relationship field with fields picked)", () => {
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
                  contentRelationshipField: {
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

      const field = {
        id: "groupField",
        fields: [
          "booleanField",
          {
            id: "contentRelationshipField",
            customtypes: [
              {
                id: "customTypeWithField",
                fields: ["colorField"],
              },
            ],
          },
        ],
      };

      const result = contentRelationship.countContentRelationshipPickedFields(
        field,
        getAllStaticZoneFields(customType),
        [customType, customTypeWithField],
      );

      expect(result).toBe(2);
    });

    it("should return the correct count for a valid group field (content relationship field with complex fields picked)", () => {
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
                  contentRelationshipField: {
                    type: "Link",
                    config: {
                      select: "document",
                      customtypes: ["customType"],
                    },
                  },
                },
              },
            },
          },
        },
      };

      const field: contentRelationship.LinkCustomtypesFields = {
        id: "groupField",
        fields: [
          "booleanField",
          {
            id: "contentRelationshipField",
            customtypes: [
              {
                id: "customType",
                fields: [
                  "booleanField",
                  {
                    id: "groupField",
                    fields: ["booleanField", "contentRelationshipField"],
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = contentRelationship.countContentRelationshipPickedFields(
        field,
        getAllStaticZoneFields(customType),
        [customType],
      );

      expect(result).toBe(4);
    });

    it("should return the correct count for a valid group field (content relationship field with invalid fields picked)", () => {
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
                  contentRelationshipField: {
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

      const field: contentRelationship.LinkCustomtypesFields = {
        id: "groupField",
        fields: [
          "booleanField",
          {
            id: "contentRelationshipField",
            customtypes: [
              {
                id: "customTypeWithField",
                fields: [
                  "colorField",
                  {
                    id: "nonExistingGroup",
                    fields: ["nonExistingField"],
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = contentRelationship.countContentRelationshipPickedFields(
        field,
        getAllStaticZoneFields(customType),
        [customType, customTypeWithField],
      );

      expect(result).toBe(2);
    });

    it("should return the correct count for a valid group field (content relationship field with non existing custom type)", () => {
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
                  contentRelationshipField: {
                    type: "Link",
                    config: {
                      select: "document",
                      customtypes: ["nonExistingCustomType"],
                    },
                  },
                },
              },
            },
          },
        },
      };

      const field: contentRelationship.LinkCustomtypesFields = {
        id: "groupField",
        fields: [
          "booleanField",
          {
            id: "contentRelationshipField",
            customtypes: [
              {
                id: "nonExistingCustomType",
                fields: ["nonExistingField"],
              },
            ],
          },
        ],
      };

      const result = contentRelationship.countContentRelationshipPickedFields(
        field,
        getAllStaticZoneFields(customType),
        [customType],
      );

      expect(result).toBe(1);
    });

    it("should return the correct count for a valid content relationship field", () => {
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
              },
            },
          },
        },
      };

      const field = "contentRelationshipField";

      const result = contentRelationship.countContentRelationshipPickedFields(
        field,
        getAllStaticZoneFields(customType),
        [customType],
      );

      expect(result).toBe(1);
    });

    it("should return the correct count for a valid content relationship field without fields picked", () => {
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

      const field = {
        id: "contentRelationshipField",
        customtypes: ["customTypeWithField"],
      };

      const result = contentRelationship.countContentRelationshipPickedFields(
        field,
        getAllStaticZoneFields(customType),
        [customType, customTypeWithField],
      );

      expect(result).toBe(0);
    });

    it("should return the correct count for a valid content relationship field with fields picked", () => {
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

      const field = {
        id: "contentRelationshipField",
        customtypes: [
          {
            id: "customTypeWithField",
            fields: ["colorField"],
          },
        ],
      };

      const result = contentRelationship.countContentRelationshipPickedFields(
        field,
        getAllStaticZoneFields(customType),
        [customType, customTypeWithField],
      );

      expect(result).toBe(1);
    });

    it("should return the correct count for a valid content relationship field with complex fields picked", () => {
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

      const field: contentRelationship.LinkCustomtypesFields = {
        id: "contentRelationshipField",
        customtypes: [
          {
            id: "customType",
            fields: ["booleanField", "contentRelationshipField"],
          },
        ],
      };

      const result = contentRelationship.countContentRelationshipPickedFields(
        field,
        getAllStaticZoneFields(customType),
        [customType],
      );

      expect(result).toBe(2);
    });

    it("should return the correct count for a valid content relationship field with invalid fields picked", () => {
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

      const field: contentRelationship.LinkCustomtypesFields = {
        id: "contentRelationshipField",
        customtypes: [
          {
            id: "customTypeWithField",
            fields: [
              "colorField",
              {
                id: "nonExistingGroup",
                fields: ["nonExistingField"],
              },
            ],
          },
        ],
      };

      const result = contentRelationship.countContentRelationshipPickedFields(
        field,
        getAllStaticZoneFields(customType),
        [customType, customTypeWithField],
      );

      expect(result).toBe(1);
    });

    it("should return the correct count for a valid content relationship field with non existing custom type", () => {
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
                customtypes: ["nonExistingCustomType"],
              },
            },
          },
        },
      };

      const field: contentRelationship.LinkCustomtypesFields = {
        id: "contentRelationshipField",
        customtypes: [
          {
            id: "nonExistingCustomType",
            fields: ["nonExistingField"],
          },
        ],
      };

      const result = contentRelationship.countContentRelationshipPickedFields(
        field,
        getAllStaticZoneFields(customType),
        [customType],
      );

      expect(result).toBe(0);
    });
  });
});
