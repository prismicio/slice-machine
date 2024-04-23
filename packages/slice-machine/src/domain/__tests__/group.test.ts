import { describe, expect, it } from "vitest";

import {
  addFieldToGroup,
  deleteFieldFromGroup,
  reorderFieldInGroup,
  updateFieldInGroup,
} from "../group";

describe("addFieldToGroup", () => {
  it("adds a field to a group field", (ctx) => {
    const field = ctx.createMock.model.boolean();
    const group = ctx.createMock.model.group();
    const res = addFieldToGroup({ group, field, fieldId: "field" });

    expect(res.config?.fields?.field).toStrictEqual(field);
  });

  it("does not mutate the provided group field", (ctx) => {
    const field = ctx.createMock.model.boolean();
    const group = ctx.createMock.model.group();
    const res = addFieldToGroup({ group, field, fieldId: "field" });

    expect(res).not.toBe(group);
  });
});

describe("updateFieldInGroup", () => {
  it("updates an existing field in a group", (ctx) => {
    const field = ctx.createMock.model.boolean();
    const group = ctx.createMock.model.group({ fields: { field } });

    expect(group.config?.fields?.field).toStrictEqual(field);

    const newField = structuredClone(field);
    newField.config ??= {};
    newField.config.placeholder_true = "Placeholder";

    const res = updateFieldInGroup({
      group,
      field: newField,
      previousFieldId: "field",
      newFieldId: "field",
    });

    expect(res.config?.fields?.field).toStrictEqual(newField);
  });

  it("can rename an existing field in a group", (ctx) => {
    const field = ctx.createMock.model.boolean();
    const group = ctx.createMock.model.group({ fields: { field } });

    expect(group.config?.fields).toStrictEqual({ field });

    const res = updateFieldInGroup({
      group,
      field,
      previousFieldId: "field",
      newFieldId: "newField",
    });

    expect(res.config?.fields).toStrictEqual({ newField: field });
  });

  it("does not make any changes if the field does not exist", (ctx) => {
    const field = ctx.createMock.model.boolean();
    const group = ctx.createMock.model.group({ fields: { field } });

    expect(group.config?.fields).toStrictEqual({ field });

    const res = updateFieldInGroup({
      group,
      field: ctx.createMock.model.boolean(),
      previousFieldId: "non-existent",
      newFieldId: "non-existent",
    });

    expect(res).toStrictEqual(group);
  });

  it("does not mutate the provided group field", (ctx) => {
    const field = ctx.createMock.model.boolean();
    const group = ctx.createMock.model.group({ fields: { field } });
    const res = updateFieldInGroup({
      group,
      field,
      previousFieldId: "field",
      newFieldId: "field",
    });

    expect(res).not.toBe(group);
  });
});

describe("reorderFieldInGroup", () => {
  it("reorders a field in a group", (ctx) => {
    const field1 = ctx.createMock.model.boolean();
    const field2 = ctx.createMock.model.boolean();
    const group = ctx.createMock.model.group({ fields: { field1, field2 } });

    expect(Object.keys(group.config?.fields ?? {})).toStrictEqual([
      "field1",
      "field2",
    ]);

    const res = reorderFieldInGroup({
      group,
      sourceIndex: 1,
      destinationIndex: 0,
    });

    expect(Object.keys(res.config?.fields ?? {})).toStrictEqual([
      "field2",
      "field1",
    ]);
  });

  it("does not mutate the provided group field", (ctx) => {
    const field1 = ctx.createMock.model.boolean();
    const field2 = ctx.createMock.model.boolean();
    const group = ctx.createMock.model.group({ fields: { field1, field2 } });
    const res = reorderFieldInGroup({
      group,
      sourceIndex: 1,
      destinationIndex: 0,
    });

    expect(res).not.toBe(group);
  });
});

describe("deleteFieldFromGroup", () => {
  it("deletes a field from a group", (ctx) => {
    const field1 = ctx.createMock.model.boolean();
    const field2 = ctx.createMock.model.boolean();
    const group = ctx.createMock.model.group({ fields: { field1, field2 } });

    const res = deleteFieldFromGroup({ group, fieldId: "field2" });

    expect(res.config?.fields).toStrictEqual({ field1 });
  });

  it("does not make any changes if the field does not exist", (ctx) => {
    const field = ctx.createMock.model.boolean();
    const group = ctx.createMock.model.group({ fields: { field } });

    const res = deleteFieldFromGroup({ group, fieldId: "non-existent" });

    expect(res).toStrictEqual(group);
  });

  it("does not mutate the provided group field", (ctx) => {
    const field1 = ctx.createMock.model.boolean();
    const field2 = ctx.createMock.model.boolean();
    const group = ctx.createMock.model.group({ fields: { field1, field2 } });

    const res = deleteFieldFromGroup({ group, fieldId: "field2" });

    expect(res).not.toBe(group);
  });
});
