import { describe, expect, it } from "vitest";

import {
  convertLinkCustomtypesToFieldCheckMap,
  countPickedFields,
} from "../ContentRelationshipFieldPicker";
import { CustomType } from "@prismicio/types-internal/lib/customtypes";

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

describe("ContentRelationshipFieldPicker", () => {
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
