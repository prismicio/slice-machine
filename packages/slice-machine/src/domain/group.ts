import {
  Group,
  NestableWidget,
} from "@prismicio/types-internal/lib/customtypes";

/**
 * Adds a field to a group field.
 *
 * @returns A copy of `args.group` with the appended field.
 */
export function addFieldToGroup(args: {
  group: Group;
  fieldId: string;
  field: NestableWidget;
}): Group {
  const group = structuredClone(args.group);
  group.config ??= {};
  group.config.fields ??= {};
  group.config.fields[args.fieldId] = args.field;

  return group;
}

/**
 * Updates a field in a group field.
 *
 * @returns A copy of `args.group` with the updated field.
 */
export function updateFieldInGroup(args: {
  group: Group;
  previousFieldId: string;
  newFieldId: string;
  field: NestableWidget;
}): Group {
  const group = structuredClone(args.group);
  if (!group.config || !group.config.fields) {
    return group;
  }

  group.config.fields = {};
  for (const fieldId in args.group.config?.fields) {
    if (fieldId === args.previousFieldId) {
      group.config.fields[args.newFieldId] = args.field;
    } else {
      group.config.fields[fieldId] = args.group.config.fields[fieldId];
    }
  }

  return group;
}

/**
 * Moves a field in a group field to a new position.
 *
 * @returns A copy of `args.group` with reordered fields.
 */
export function reorderFieldInGroup(args: {
  group: Group;
  sourceIndex: number;
  destinationIndex: number;
}): Group {
  const group = structuredClone(args.group);
  if (!group.config || !group.config.fields) {
    return group;
  }

  const entries = Object.entries(group.config.fields);
  const [removedEntry] = entries.splice(args.sourceIndex, 1);
  entries.splice(args.destinationIndex, 0, removedEntry);

  group.config.fields = Object.fromEntries(entries);

  return group;
}

/**
 * Deletes a field from a group field.
 *
 * @returns A copy of `args.group` without the field.
 */
export function deleteFieldFromGroup(args: {
  group: Group;
  fieldId: string;
}): Group {
  const group = structuredClone(args.group);
  delete group.config?.fields?.[args.fieldId];

  return group;
}
