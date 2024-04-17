import { NestableWidget } from "@prismicio/types-internal/lib/customtypes";

import { GroupSM } from "@lib/models/common/Group";

/**
 * Adds a field to a group field.
 *
 * @returns A copy of `args.group` with the appended field.
 */
export function addFieldToGroup(args: {
  group: GroupSM;
  fieldId: string;
  field: NestableWidget;
}) {
  const group = structuredClone(args.group);
  group.config ??= {};
  group.config.fields ??= [];

  group.config.fields.push({
    key: args.fieldId,
    value: args.field,
  });

  return group;
}

/**
 * Updates a field in a group field.
 *
 * @returns A copy of `args.group` with the updated field.
 */
export function updateFieldInGroup(args: {
  group: GroupSM;
  previousFieldId: string;
  newFieldId: string;
  field: NestableWidget;
}) {
  const group = structuredClone(args.group);
  if (!group.config || !group.config.fields) {
    return group;
  }

  group.config.fields = group.config.fields.map((field) => {
    if (field.key === args.previousFieldId) {
      return { key: args.newFieldId, value: args.field };
    }

    return field;
  });

  return group;
}

export function reorderFieldInGroup(args: {
  group: GroupSM;
  sourceIndex: number;
  destinationIndex: number;
}) {
  const group = structuredClone(args.group);
  if (!group.config || !group.config.fields) {
    return group;
  }

  const [removedEntry] = group.config.fields.splice(args.sourceIndex, 1);
  group.config.fields.splice(args.destinationIndex, 0, removedEntry);

  return group;
}

/**
 * Deletes a field from a group field.
 *
 * @returns A copy of `args.group` without the field.
 */
export function deleteFieldFromGroup(args: {
  group: GroupSM;
  fieldId: string;
}) {
  const group = structuredClone(args.group);
  if (!group.config || !group.config.fields) {
    return group;
  }

  group.config.fields = group.config.fields.filter(
    (field) => field.key !== args.fieldId,
  );

  return group;
}
