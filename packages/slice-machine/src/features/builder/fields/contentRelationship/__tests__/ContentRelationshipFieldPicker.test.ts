import { describe, expect, it } from "vitest";

import {
  convertLinkCustomtypesToFieldCheckMap,
  countPickedFields,
} from "../ContentRelationshipFieldPicker";

describe("ContentRelationshipFieldPicker", () => {
  it("should count picked fields with a custom type as string", () => {
    const customtypes = ["ct1"];

    const result = countPickedFields(
      convertLinkCustomtypesToFieldCheckMap(customtypes),
    );

    expect(result).toEqual({
      pickedFields: 0,
      nestedPickedFields: 0,
    });
  });

  it("should count picked fields with multiple custom types as string", () => {
    const customtypes = ["ct1", "ct2"];

    const result = countPickedFields(
      convertLinkCustomtypesToFieldCheckMap(customtypes),
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
      convertLinkCustomtypesToFieldCheckMap(customtypes),
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
      convertLinkCustomtypesToFieldCheckMap(customtypes),
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

    const result = countPickedFields(
      convertLinkCustomtypesToFieldCheckMap(customtypes),
    );

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
      convertLinkCustomtypesToFieldCheckMap(customtypes),
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
      convertLinkCustomtypesToFieldCheckMap(customtypes),
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
      convertLinkCustomtypesToFieldCheckMap(customtypes),
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
      convertLinkCustomtypesToFieldCheckMap(customtypes),
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
      convertLinkCustomtypesToFieldCheckMap(customtypes),
    );

    expect(result).toEqual({
      pickedFields: 1,
      nestedPickedFields: 0,
    });
  });
});
