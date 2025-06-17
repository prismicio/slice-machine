import { pluralize } from "@prismicio/editor-support/String";
import {
  Box,
  Text,
  TreeView,
  TreeViewCheckbox,
  TreeViewSection,
} from "@prismicio/editor-ui";
import {
  CustomType,
  Group,
  Link,
  LinkConfig,
  NestableWidget,
} from "@prismicio/types-internal/lib/customtypes";
import { useSelector } from "react-redux";

import { CustomTypes } from "@/legacy/lib/models/common/CustomType";
import { selectAllCustomTypes } from "@/modules/availableCustomTypes";
import { isValidObject } from "@/utils/isValidObject";

/**
 * Picker fields check map types. Used internally to keep track of the checked
 * fields in the TreeView, as it's easier to handle objects than arrays and
 * also ensures field uniqueness.
 *
 * @example
 * {
 *   author: {
 *     fullName: {
 *       type: "checkbox",
 *       value: true,
 *     },
 *     awards: {
 *       type: "group",
 *       value: {
 *         date: {
 *           type: "checkbox",
 *           value: true,
 *         },
 *         awardsCr: {
 *           type: "contentRelationship",
 *           value: {
 *             award: {
 *               title: {
 *                 type: "checkbox",
 *                 value: true,
 *               },
 *               issuer: {
 *                 type: "group",
 *                 value: {
 *                   name: {
 *                     type: "checkbox",
 *                     value: true,
 *                   },
 *                 },
 *               },
 *             },
 *           },
 *         },
 *       },
 *     },
 *     professionCr: {
 *       type: "contentRelationship",
 *       value: {
 *         profession: {
 *           name: {
 *             type: "checkbox",
 *             value: true,
 *           },
 *           areas: {
 *             type: "group",
 *             value: {
 *               name: {
 *                 type: "checkbox",
 *                 value: true,
 *               },
 *             },
 *           },
 *         },
 *       },
 *     },
 *   },
 * }
 **/
interface PickerCustomTypes {
  [customTypeId: string]: PickerCustomType;
}

interface PickerCustomType {
  [fieldId: string]: PickerCustomTypeValue;
}

type PickerCustomTypeValue =
  | PickerCheckboxField
  | PickerFirstLevelGroupField
  | PickerContentRelationshipField;

interface PickerCheckboxField {
  type: "checkbox";
  value: boolean;
}

interface PickerFirstLevelGroupField {
  type: "group";
  value: PickerFirstLevelGroupFieldValue;
}

interface PickerLeafGroupField {
  type: "group";
  value: PickerLeafGroupFieldValue;
}

interface PickerLeafGroupFieldValue {
  [fieldId: string]: PickerCheckboxField;
}

interface PickerFirstLevelGroupFieldValue {
  [fieldId: string]: PickerCheckboxField | PickerContentRelationshipField;
}

interface PickerContentRelationshipField {
  type: "contentRelationship";
  value: PickerContentRelationshipFieldValue;
}

interface PickerContentRelationshipFieldValue {
  [customTypeId: string]: PickerNestedCustomTypeValue;
}
interface PickerNestedCustomTypeValue {
  [fieldId: string]: PickerCheckboxField | PickerLeafGroupField;
}

/**
 * Content relationship Link customtypes property structure.
 *
 * @example
 * [
 *   {
 *     id: "author",
 *     fields: [
 *       "fullName",
 *       {
 *         id: "awards",
 *         fields: [
 *           "date",
 *           {
 *             id: "awardsCr",
 *             customtypes: [
 *               {
 *                 id: "award",
 *                 fields: [
 *                   "title",
 *                   {
 *                     id: "issuer",
 *                     fields: ["name"],
 *                   },
 *                 ],
 *               },
 *             ],
 *           },
 *         ],
 *       },
 *       {
 *         id: "professionCr",
 *         customtypes: [
 *           {
 *             id: "profession",
 *             fields: [
 *               "name",
 *               {
 *                 id: "areas",
 *                 fields: ["name"],
 *               },
 *             ],
 *           },
 *         ],
 *       },
 *     ],
 *   },
 * ]
 */
type LinkCustomtypes = NonNullable<LinkConfig["customtypes"]>;

type LinkCustomtypesFields = Exclude<
  LinkCustomtypes[number],
  string
>["fields"][number];

type LinkCustomtypesContentRelationshipFieldValue = Exclude<
  LinkCustomtypesFields,
  string | { fields: unknown }
>;

type LinkCustomtypesGroupFieldValue = Exclude<
  LinkCustomtypesFields,
  string | { customtypes: unknown }
>;

interface ContentRelationshipFieldPickerProps {
  value: LinkCustomtypes | undefined;
  onChange: (fields: LinkCustomtypes) => void;
}

export function ContentRelationshipFieldPicker(
  props: ContentRelationshipFieldPickerProps,
) {
  const { value, onChange } = props;
  const customTypes = useCustomTypes();

  const fieldCheckMap = value
    ? convertLinkCustomtypesToFieldCheckMap(value)
    : {};

  function onCustomTypesChange(customTypeId: string, value: PickerCustomType) {
    onChange(
      convertFieldCheckMapToLinkCustomtypes({
        ...fieldCheckMap,
        [customTypeId]: value,
      }),
    );
  }

  return (
    <Box overflow="hidden" flexDirection="column" border borderRadius={6}>
      <Box
        border={{ bottom: true }}
        padding={{ inline: 16, bottom: 16, top: 12 }}
        flexDirection="column"
        gap={8}
      >
        <Box flexDirection="column">
          <Text variant="h4" color="grey12">
            Types
          </Text>
          <Text color="grey12">
            Choose which fields you want to expose from the linked document.
          </Text>
        </Box>
        <TreeView
          title="Exposed fields"
          subtitle={`(${countPickedFields(fieldCheckMap)})`}
        >
          {customTypes.map((customType) => (
            <TreeViewCustomType
              key={customType.id}
              customType={customType}
              onChange={(value) => onCustomTypesChange(customType.id, value)}
              fieldCheckMap={fieldCheckMap[customType.id] ?? {}}
              customTypes={customTypes}
            />
          ))}
        </TreeView>
      </Box>
      <Box backgroundColor="white" flexDirection="column" padding={12}>
        <Text variant="normal" color="grey11">
          Have ideas for improving this field?{" "}
          <a
            // TODO: Add real URL: https://linear.app/prismic/issue/DT-2693
            href="https://community.prismic.io/t/TODO"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "inherit", textDecoration: "underline" }}
          >
            Please provide your feedback here.
          </a>
        </Text>
      </Box>
    </Box>
  );
}

interface TreeViewCustomTypeProps {
  customType: CustomType;
  fieldCheckMap: PickerCustomType;
  onChange: (newValue: PickerCustomType) => void;
  customTypes: CustomType[];
}

function TreeViewCustomType(props: TreeViewCustomTypeProps) {
  const {
    customType,
    fieldCheckMap: customTypeFieldsCheckMap,
    onChange: onCustomTypeChange,
    customTypes,
  } = props;

  const renderedFields = getCustomTypeStaticFields(customType).map(
    ({ fieldId, field }) => {
      // Group field

      if (isGroupField(field)) {
        const onGroupFieldChange = (
          newGroupFields: PickerFirstLevelGroupFieldValue,
        ) => {
          onCustomTypeChange({
            ...customTypeFieldsCheckMap,
            [fieldId]: { type: "group", value: newGroupFields },
          });
        };

        const groupFieldCheckMap = customTypeFieldsCheckMap[fieldId] ?? {};

        return (
          <TreeViewFirstLevelGroupField
            key={fieldId}
            group={field}
            groupId={fieldId}
            onChange={onGroupFieldChange}
            fieldCheckMap={
              groupFieldCheckMap.type === "group"
                ? groupFieldCheckMap.value
                : {}
            }
            customTypes={customTypes}
          />
        );
      }

      // Content relationship field

      if (isContentRelationshipField(field)) {
        const onContentRelationshipFieldChange = (
          newCrFields: PickerContentRelationshipFieldValue,
        ) => {
          onCustomTypeChange({
            ...customTypeFieldsCheckMap,
            [fieldId]: {
              type: "contentRelationship",
              value: newCrFields,
            },
          });
        };

        const crFieldCheckMap = customTypeFieldsCheckMap[fieldId] ?? {};

        return (
          <TreeViewContentRelationshipField
            key={fieldId}
            field={field}
            fieldId={fieldId}
            onChange={onContentRelationshipFieldChange}
            fieldCheckMap={
              crFieldCheckMap.type === "contentRelationship"
                ? crFieldCheckMap.value
                : {}
            }
            customTypes={customTypes}
          />
        );
      }

      // Regular field

      const onCheckedChange = (newValue: boolean) => {
        onCustomTypeChange({
          ...customTypeFieldsCheckMap,
          [fieldId]: { type: "checkbox", value: newValue },
        });
      };

      return (
        <TreeViewCheckbox
          key={fieldId}
          title={fieldId}
          checked={customTypeFieldsCheckMap[fieldId]?.value === true}
          onCheckedChange={onCheckedChange}
        />
      );
    },
  );

  if (renderedFields.length === 0) return null;

  return (
    <TreeViewSection
      key={customType.id}
      title={customType.id}
      subtitle={getExposedFieldsLabel(
        countPickedFields(customTypeFieldsCheckMap),
      )}
      badge={customType.format === "page" ? "Page type" : "Custom type"}
    >
      {renderedFields}
    </TreeViewSection>
  );
}

interface TreeViewContentRelationshipFieldProps {
  fieldId: string;
  field: Link;
  fieldCheckMap: PickerContentRelationshipFieldValue;
  onChange: (newValue: PickerContentRelationshipFieldValue) => void;
  customTypes: CustomType[];
}

function TreeViewContentRelationshipField(
  props: TreeViewContentRelationshipFieldProps,
) {
  const {
    field,
    fieldId,
    fieldCheckMap: crFieldsCheckMap,
    onChange: onCrFieldChange,
    customTypes,
  } = props;

  if (!field.config?.customtypes) return null;

  const resolvedCustomTypes = resolveContentRelationshipCustomTypes(
    field.config.customtypes,
    customTypes,
  );

  if (resolvedCustomTypes.length === 0) return null;

  return (
    <TreeViewSection
      title={fieldId}
      subtitle={getExposedFieldsLabel(countPickedFields(crFieldsCheckMap))}
    >
      {resolvedCustomTypes.map((customType) => {
        if (typeof customType === "string") return null;

        const onNestedCustomTypeChange = (
          newNestedCustomTypeFields: PickerNestedCustomTypeValue,
        ) => {
          onCrFieldChange({
            ...crFieldsCheckMap,
            [customType.id]: newNestedCustomTypeFields,
          });
        };

        const nestedCtFieldsCheckMap = crFieldsCheckMap[customType.id] ?? {};

        const renderedFields = getCustomTypeStaticFields(customType).map(
          ({ fieldId, field }) => {
            // Group field

            if (isGroupField(field)) {
              const onGroupFieldsChange = (
                newGroupFields: PickerLeafGroupFieldValue,
              ) => {
                onNestedCustomTypeChange({
                  ...nestedCtFieldsCheckMap,
                  [fieldId]: { type: "group", value: newGroupFields },
                });
              };

              const groupFieldCheckMap = nestedCtFieldsCheckMap[fieldId] ?? {};

              return (
                <TreeViewLeafGroupField
                  key={fieldId}
                  group={field}
                  groupId={fieldId}
                  onChange={onGroupFieldsChange}
                  fieldCheckMap={
                    groupFieldCheckMap.type === "group"
                      ? groupFieldCheckMap.value
                      : {}
                  }
                />
              );
            }

            // Regular field

            const onCheckedChange = (newChecked: boolean) => {
              onNestedCustomTypeChange({
                ...nestedCtFieldsCheckMap,
                [fieldId]: { type: "checkbox", value: newChecked },
              });
            };

            return (
              <TreeViewCheckbox
                key={fieldId}
                title={fieldId}
                checked={nestedCtFieldsCheckMap[fieldId]?.value === true}
                onCheckedChange={onCheckedChange}
              />
            );
          },
        );

        if (renderedFields.length === 0) return null;

        return (
          <TreeViewSection
            key={customType.id}
            title={customType.id}
            subtitle={getExposedFieldsLabel(
              countPickedFields(nestedCtFieldsCheckMap),
            )}
            badge={customType.format === "page" ? "Page type" : "Custom type"}
          >
            {renderedFields}
          </TreeViewSection>
        );
      })}
    </TreeViewSection>
  );
}

interface TreeViewLeafGroupFieldProps {
  group: Group;
  groupId: string;
  fieldCheckMap: PickerLeafGroupFieldValue;
  onChange: (newValue: PickerLeafGroupFieldValue) => void;
}

function TreeViewLeafGroupField(props: TreeViewLeafGroupFieldProps) {
  const {
    group,
    groupId,
    fieldCheckMap: groupFieldsCheckMap,
    onChange: onGroupFieldChange,
  } = props;

  if (!group.config?.fields) return null;

  const renderedFields = getGroupFields(group).map(({ fieldId }) => {
    const onCheckedChange = (newChecked: boolean) => {
      onGroupFieldChange({
        ...groupFieldsCheckMap,
        [fieldId]: { type: "checkbox", value: newChecked },
      });
    };

    return (
      <TreeViewCheckbox
        key={fieldId}
        title={fieldId}
        checked={groupFieldsCheckMap[fieldId]?.value === true}
        onCheckedChange={onCheckedChange}
      />
    );
  });

  if (renderedFields.length === 0) return null;

  return (
    <TreeViewSection
      key={groupId}
      title={groupId}
      subtitle={getExposedFieldsLabel(countPickedFields(groupFieldsCheckMap))}
      badge="Group"
    >
      {renderedFields}
    </TreeViewSection>
  );
}

interface TreeViewFirstLevelGroupFieldProps {
  group: Group;
  groupId: string;
  fieldCheckMap: PickerFirstLevelGroupFieldValue;
  onChange: (newValue: PickerFirstLevelGroupFieldValue) => void;
  customTypes: CustomType[];
}

function TreeViewFirstLevelGroupField(
  props: TreeViewFirstLevelGroupFieldProps,
) {
  const {
    group,
    groupId,
    fieldCheckMap: groupFieldsCheckMap,
    onChange: onGroupFieldChange,
    customTypes,
  } = props;

  if (!group.config?.fields) return null;

  return (
    <TreeViewSection key={groupId} title={groupId} badge="Group">
      {getGroupFields(group).map(({ fieldId, field }) => {
        if (isContentRelationshipField(field)) {
          const onContentRelationshipFieldChange = (
            newCrFields: PickerContentRelationshipFieldValue,
          ) => {
            onGroupFieldChange({
              ...groupFieldsCheckMap,
              [fieldId]: {
                type: "contentRelationship",
                value: newCrFields,
              },
            });
          };

          const crFieldCheckMap = groupFieldsCheckMap[fieldId] ?? {};

          return (
            <TreeViewContentRelationshipField
              key={fieldId}
              field={field}
              fieldId={fieldId}
              fieldCheckMap={
                crFieldCheckMap.type === "contentRelationship"
                  ? crFieldCheckMap.value
                  : {}
              }
              onChange={onContentRelationshipFieldChange}
              customTypes={customTypes}
            />
          );
        }

        const onCheckedChange = (newChecked: boolean) => {
          onGroupFieldChange({
            ...groupFieldsCheckMap,
            [fieldId]: { type: "checkbox", value: newChecked },
          });
        };

        return (
          <TreeViewCheckbox
            key={fieldId}
            title={fieldId}
            checked={groupFieldsCheckMap[fieldId]?.value === true}
            onCheckedChange={onCheckedChange}
          />
        );
      })}
    </TreeViewSection>
  );
}

function getExposedFieldsLabel(count: number) {
  if (count === 0) return undefined;
  return `(${count} ${pluralize(count, "field", "fields")} exposed)`;
}

/**
 * Gets all the existing local custom types from the store, filters and sorts
 * them.
 */
function useCustomTypes(): CustomType[] {
  const allCustomTypes = useSelector(selectAllCustomTypes);
  const localCustomTypes = allCustomTypes.flatMap<CustomType>((ct) => {
    // In the store we have remote and local custom types, we want to show
    // the local ones, so that the user is able to create a content
    // relationship with custom types present on the user's computer (pushed
    // or not).
    return "local" in ct ? CustomTypes.fromSM(ct.local) : [];
  });

  localCustomTypes.sort((a, b) => a.id.localeCompare(b.id));

  return localCustomTypes;
}

function resolveContentRelationshipCustomTypes(
  customTypes: LinkCustomtypes,
  localCustomTypes: CustomType[],
): CustomType[] {
  const fields = customTypes.flatMap<CustomType>((customType) => {
    if (typeof customType === "string") return [];
    return localCustomTypes.find((ct) => ct.id === customType.id) ?? [];
  });

  return fields;
}

/**
 * Converts a Link config `customtypes` ({@link LinkCustomtypes}) structure into
 * picker fields check map ({@link PickerCustomTypes}).
 */
function convertLinkCustomtypesToFieldCheckMap(
  customTypes: LinkCustomtypes,
): PickerCustomTypes {
  return customTypes.reduce<PickerCustomTypes>((customTypes, customType) => {
    if (typeof customType === "string") return customTypes;

    customTypes[customType.id] = customType.fields.reduce<PickerCustomType>(
      (customTypeFields, field) => {
        if (typeof field === "string") {
          // Regular field
          customTypeFields[field] = { type: "checkbox", value: true };
        } else if ("fields" in field && field.fields !== undefined) {
          // Group field
          customTypeFields[field.id] = createGroupFieldCheckMap(field);
        } else if ("customtypes" in field && field.customtypes !== undefined) {
          // Content relationship field
          customTypeFields[field.id] =
            createContentRelationshipFieldCheckMap(field);
        }

        return customTypeFields;
      },
      {},
    );
    return customTypes;
  }, {});
}

function createGroupFieldCheckMap(
  group: LinkCustomtypesGroupFieldValue,
): PickerFirstLevelGroupField {
  return {
    type: "group",
    value: group.fields.reduce<PickerFirstLevelGroupFieldValue>(
      (fields, field) => {
        if (typeof field === "string") {
          // Regular field
          fields[field] = { type: "checkbox", value: true };
        } else if ("customtypes" in field && field.customtypes !== undefined) {
          // Content relationship field
          fields[field.id] = createContentRelationshipFieldCheckMap(field);
        }

        return fields;
      },
      {},
    ),
  };
}

function createContentRelationshipFieldCheckMap(
  field: LinkCustomtypesContentRelationshipFieldValue,
): PickerContentRelationshipField {
  const crField: PickerContentRelationshipField = {
    type: "contentRelationship",
    value: {},
  };
  const crFieldCustomTypes = crField.value;

  for (const customType of field.customtypes) {
    if (typeof customType === "string") continue;

    crFieldCustomTypes[customType.id] ??= {};
    const customTypeFields = crFieldCustomTypes[customType.id];

    for (const nestedField of customType.fields) {
      if (typeof nestedField === "string") {
        // Regular field
        customTypeFields[nestedField] = { type: "checkbox", value: true };
      } else {
        // Group field
        const groupFieldsEntries = nestedField.fields.map(
          (field) => [field, { type: "checkbox", value: true }] as const,
        );

        if (groupFieldsEntries.length > 0) {
          customTypeFields[nestedField.id] = {
            type: "group",
            value: Object.fromEntries(groupFieldsEntries),
          };
        }
      }
    }
  }

  return crField;
}

/**
 * Converts a picker fields check map structure ({@link PickerCustomTypes}) into
 * Link config `customtypes` ({@link LinkCustomtypes}) and filter out empty Custom
 * types.
 */
function convertFieldCheckMapToLinkCustomtypes(map: PickerCustomTypes) {
  return Object.entries(map).flatMap<LinkCustomtypes[number]>(
    ([ctId, ctFields]) => {
      const fields = Object.entries(ctFields).flatMap<
        | string
        | LinkCustomtypesContentRelationshipFieldValue
        | LinkCustomtypesGroupFieldValue
      >(([fieldId, fieldValue]) => {
        // First level group field
        if (fieldValue.type === "group") {
          const fields = Object.entries(fieldValue.value).flatMap<
            string | LinkCustomtypesContentRelationshipFieldValue
          >(([fieldId, fieldValue]) => {
            if (fieldValue.type === "checkbox") {
              return fieldValue.value ? fieldId : [];
            }

            const customTypes = createContentRelationshipLinkCustomtypes(
              fieldValue.value,
            );

            return customTypes.length > 0
              ? { id: fieldId, customtypes: customTypes }
              : [];
          });

          return fields.length > 0 ? { id: fieldId, fields } : [];
        }

        // Content relationship field
        if (fieldValue.type === "contentRelationship") {
          const customTypes = createContentRelationshipLinkCustomtypes(
            fieldValue.value,
          );

          return customTypes.length > 0
            ? { id: fieldId, customtypes: customTypes }
            : [];
        }

        // Regular field
        return fieldValue.value ? fieldId : [];
      });

      return fields.length > 0 ? { id: ctId, fields } : [];
    },
  );
}

function createContentRelationshipLinkCustomtypes(
  value: PickerContentRelationshipFieldValue,
): LinkCustomtypesContentRelationshipFieldValue["customtypes"] {
  return Object.entries(value).flatMap(
    ([nestedCustomTypeId, nestedCustomTypeFields]) => {
      const fields = Object.entries(nestedCustomTypeFields).flatMap(
        ([nestedFieldId, nestedFieldValue]) => {
          // Leaf group field
          if (nestedFieldValue.type === "group") {
            const nestedGroupFields = Object.entries(
              nestedFieldValue.value,
            ).flatMap<string>(([fieldId, fieldValue]) => {
              // Regular field
              return fieldValue.type === "checkbox" && fieldValue.value
                ? fieldId
                : [];
            });

            return nestedGroupFields.length > 0
              ? { id: nestedFieldId, fields: nestedGroupFields }
              : [];
          }

          return nestedFieldValue.value ? nestedFieldId : [];
        },
      );

      return fields.length > 0 ? { id: nestedCustomTypeId, fields } : [];
    },
  );
}

/**
 * Generic recursive function that goes down the fields check map and counts all
 * the properties that are set to true, which correspond to selected fields.
 *
 * It's not type safe, but checks the type of the values at runtime so that
 * it only recurses into valid objects, and only counts checkbox fields.
 */
function countPickedFields(
  fields: Record<string, unknown> | undefined,
): number {
  if (!fields) return 0;
  return Object.values(fields).reduce<number>((count, value) => {
    if (!isValidObject(value)) return count;
    if (isCheckboxValue(value)) return count + (value.value ? 1 : 0);
    return count + countPickedFields(value);
  }, 0);
}
function isCheckboxValue(value: unknown): value is PickerCheckboxField {
  if (!isValidObject(value)) return false;
  return "type" in value && value.type === "checkbox";
}

function isGroupField(field: NestableWidget | Group): field is Group {
  return field.type === "Group";
}

function isContentRelationshipField(
  field: NestableWidget | Group,
): field is Link {
  return (
    field.type === "Link" &&
    field.config?.select === "document" &&
    field.config?.customtypes !== undefined
  );
}

function getCustomTypeStaticFields(customType: CustomType) {
  return Object.values(customType.json).flatMap((tabFields) => {
    return Object.entries(tabFields).flatMap(([fieldId, field]) => {
      if (
        field.type !== "Slices" &&
        field.type !== "Choice" &&
        // Filter out uid fields because it's a special field returned by the
        // API and is not part of the data object in the document.
        // We also filter by key "uid", because (as of the time of writing
        // this), creating any field with that API id will result in it being
        // used for metadata.
        (field.type !== "UID" || fieldId !== "uid")
      ) {
        return { fieldId, field: field as NestableWidget | Group };
      }

      return [];
    });
  });
}

function getGroupFields(group: Group) {
  if (!group.config?.fields) return [];
  return Object.entries(group.config.fields).map(([fieldId, field]) => {
    return { fieldId, field: field as NestableWidget };
  });
}
