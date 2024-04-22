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
  const newGroup = structuredClone(args.group);
  newGroup.config ??= {};
  newGroup.config.fields ??= {};
  newGroup.config.fields[args.fieldId] = args.field;

  return newGroup;
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
  const newGroup = structuredClone(args.group);
  if (!newGroup.config?.fields || !args.group.config?.fields) {
    return newGroup;
  }

  newGroup.config.fields = {};
  for (const fieldId in args.group.config.fields) {
    if (fieldId === args.previousFieldId) {
      newGroup.config.fields[args.newFieldId] = args.field;
    } else {
      newGroup.config.fields[fieldId] = args.group.config.fields[fieldId];
    }
  }

  return newGroup;
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
  const newGroup = structuredClone(args.group);
  if (!newGroup.config?.fields) {
    return newGroup;
  }

  const entries = Object.entries(newGroup.config.fields);
  const [removedEntry] = entries.splice(args.sourceIndex, 1);
  entries.splice(args.destinationIndex, 0, removedEntry);

  newGroup.config.fields = Object.fromEntries(entries);

  return newGroup;
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
  const newGroup = structuredClone(args.group);
  delete newGroup.config?.fields?.[args.fieldId];

  return newGroup;
}
