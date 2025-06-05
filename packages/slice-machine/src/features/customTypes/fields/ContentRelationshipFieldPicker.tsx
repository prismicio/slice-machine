import { pluralize } from "@prismicio/editor-support/String";
import {
  Box,
  Text,
  TreeView,
  TreeViewCheckbox,
  TreeViewSection,
} from "@prismicio/editor-ui";
import { UID } from "@prismicio/types-internal/lib/customtypes";
import { useMemo } from "react";
import { useSelector } from "react-redux";

import { CustomTypeSM, TabFields } from "@/legacy/lib/models/common/CustomType";
import { selectAllCustomTypes } from "@/modules/availableCustomTypes";
import { isValidObject } from "@/utils/isValidObject";

/**
 * Picker fields check map types. Used internally to keep track of the checked
 * fields in the TreeView, as it's easier to handle objects than arrays and
 * also ensure field uniqueness.
 *
 * @example
 * {
 *   category: {
 *     name: {
 *       type: "checkbox",
 *       value: true
 *     }
 *   },
 *   author: {
 *     firstName: {
 *       type: "checkbox",
 *       value: true
 *     }
 *     lastName: {
 *       type: "checkbox",
 *       value: false
 *     }
 *     languages: {
 *       type: "group",
 *       value: {
 *         name: {
 *           type: "checkbox",
 *           value: true
 *         }
 *       }
 *     }
 *     professionCr: {
 *       type: "contentRelationship",
 *       value: {
 *         profession: {
 *           name: {
 *             type: "checkbox",
 *             value: true
 *           }
 *         }
 *       }
 *     }
 *   }
 * }
 *
 **/
interface PickerCustomTypes {
  [customTypeId: string]: PickerCustomType;
}

interface PickerCustomType {
  [fieldId: string]: PickerCustomTypeValue;
}

type PickerCustomTypeValue =
  | PickerCheckboxField
  | PickerGroupField
  | PickerContentRelationshipField;

interface PickerCheckboxField {
  type: "checkbox";
  value: boolean;
}

interface PickerGroupField {
  type: "group";
  value: PickerGroupFieldValue;
}

interface PickerGroupFieldValue {
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
  [fieldId: string]: PickerCheckboxField;
}

/**
 * Copy of types-internal Link customtypes.
 *
 * @example
 * [
 *   {
 *     id: "category",
 *     fields: ["name"]
 *   },
 *   {
 *     id: "author",
 *     fields: [
 *       "firstName",
 *       "lastName",
 *       {
 *         id: "languages",
 *         fields: ["name"]
 *       },
 *       {
 *         id: "professionCr",
 *         customtypes: [
 *           {
 *             id: "profession",
 *             fields: ["name"]
 *           }
 *         ]
 *       }
 *     ]
 *   }
 * ]
 */
type TICustomTypes = readonly (string | TICustomType)[];

interface TICustomType {
  id: string;
  fields?:
    | readonly (string | TIContentRelationshipFieldValue | TIGroupFieldValues)[]
    | undefined;
}

interface TICustomTypeRegularFieldValues {
  id: string;
  fields?: readonly string[] | undefined;
}

interface TIGroupFieldValues {
  id: string;
  fields?: readonly (string | TIContentRelationshipFieldValue)[] | undefined;
}

interface TIContentRelationshipFieldValue {
  id: string;
  customtypes: readonly (string | TICustomTypeFieldValues)[];
}

interface TICustomTypeFieldValues {
  id: string;
  fields?: readonly (string | TICustomTypeRegularFieldValues)[] | undefined;
}

interface ContentRelationshipFieldPickerProps {
  value: TICustomTypes | undefined;
  onChange: (fields: TICustomTypes) => void;
}

export function ContentRelationshipFieldPicker(
  props: ContentRelationshipFieldPickerProps,
) {
  const { value, onChange } = props;
  const customTypes = useCustomTypes();
  const fieldCheckMap = value ? convertCustomTypesToFieldCheckMap(value) : {};

  function onCustomTypesChange(
    updater: (prev: PickerCustomTypes) => PickerCustomTypes,
  ) {
    onChange(convertFieldCheckMapToCustomTypes(updater(fieldCheckMap)));
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
          {customTypes.map((customType) => {
            const onCustomTypeChange = (
              updater: (prev: PickerCustomType) => PickerCustomType,
            ) => {
              onCustomTypesChange((currentCustomTypes) => ({
                ...currentCustomTypes,
                [customType.id]: updater(
                  currentCustomTypes[customType.id] ?? {},
                ),
              }));
            };

            return (
              <TreeViewCustomType
                key={customType.id}
                customType={customType}
                onChange={onCustomTypeChange}
                fieldCheckMap={fieldCheckMap[customType.id] ?? {}}
              />
            );
          })}
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
  customType: TICustomType;
  fieldCheckMap: PickerCustomType;
  onChange: (fn: (prev: PickerCustomType) => PickerCustomType) => void;
}

function TreeViewCustomType(props: TreeViewCustomTypeProps) {
  const {
    customType,
    fieldCheckMap: customTypeFieldCheckMap,
    onChange: onCustomTypeChange,
  } = props;

  if (!customType.fields) return null;

  return (
    <TreeViewSection
      key={customType.id}
      title={customType.id}
      subtitle={getExposedFieldsLabel(
        countPickedFields(customTypeFieldCheckMap),
      )}
      badge="Custom type"
    >
      {customType.fields.map((field) => {
        // Checkbox field
        if (typeof field === "string") {
          const checked = customTypeFieldCheckMap[field]?.value ?? false;

          const onCheckedChange = (value: boolean) => {
            onCustomTypeChange((currentFields) => ({
              ...currentFields,
              [field]: { type: "checkbox", value },
            }));
          };

          return (
            <TreeViewCheckbox
              key={field}
              title={field}
              checked={checked === true}
              onCheckedChange={onCheckedChange}
            />
          );
        }

        const fieldState = customTypeFieldCheckMap[field.id] ?? {};

        // Group field
        if ("fields" in field) {
          return (
            <TreeViewGroupField
              key={field.id}
              group={field}
              onChange={onCustomTypeChange}
              fieldCheckMap={
                fieldState.type === "group" ? fieldState.value : {}
              }
            />
          );
        }

        // Content relationship field
        return (
          <TreeViewContentRelationshipField
            key={field.id}
            field={field}
            onChange={onCustomTypeChange}
            fieldCheckMap={
              fieldState.type === "contentRelationship" ? fieldState.value : {}
            }
          />
        );
      })}
    </TreeViewSection>
  );
}

interface TreeViewContentRelationshipFieldProps {
  field: TIContentRelationshipFieldValue | TIGroupFieldValues;
  fieldCheckMap: PickerContentRelationshipFieldValue;
  onChange: (updater: (prev: PickerCustomType) => PickerCustomType) => void;
}

function TreeViewContentRelationshipField(
  props: TreeViewContentRelationshipFieldProps,
) {
  const {
    field: crField,
    fieldCheckMap: customTypeFieldCheckMap,
    onChange: onCustomTypeChange,
  } = props;

  const onContentRelationshipFieldChange = (
    updater: (
      prev: PickerContentRelationshipFieldValue,
    ) => PickerContentRelationshipFieldValue,
  ) => {
    onCustomTypeChange((currentCustomTypeFields) => {
      const prevCtValue = currentCustomTypeFields[crField.id] ?? {};
      const prevCtValueNarrowed =
        prevCtValue?.type === "contentRelationship" ? prevCtValue.value : {};

      return {
        ...currentCustomTypeFields,
        [crField.id]: {
          type: "contentRelationship",
          value: updater(prevCtValueNarrowed ?? {}),
        },
      };
    });
  };

  if ("customtypes" in crField) {
    return crField.customtypes.map((customType) => {
      // Invalid nested custom type, we need to have fields.
      if (typeof customType === "string" || !customType.fields) return null;

      const ctFieldCheckMap = customTypeFieldCheckMap[customType.id] ?? {};

      const onNestedCustomTypeChange = (
        updater: (
          prev: PickerNestedCustomTypeValue,
        ) => PickerNestedCustomTypeValue,
      ) => {
        onContentRelationshipFieldChange((currentCustomTypes) => ({
          ...currentCustomTypes,
          [customType.id]: updater(currentCustomTypes[customType.id] ?? {}),
        }));
      };

      return (
        <TreeViewSection
          key={customType.id}
          title={customType.id}
          subtitle={getExposedFieldsLabel(countPickedFields(ctFieldCheckMap))}
          badge="Custom type"
        >
          {customType.fields.map((field) => {
            if (typeof field === "string") {
              const checked = ctFieldCheckMap[field]?.value ?? false;

              const onCheckedChange = (newValue: boolean) => {
                onNestedCustomTypeChange((currentFields) => ({
                  ...currentFields,
                  [field]: { type: "checkbox", value: newValue },
                }));
              };

              return (
                <TreeViewCheckbox
                  key={field}
                  title={field}
                  checked={checked}
                  onCheckedChange={onCheckedChange}
                />
              );
            }

            return null;
          })}
        </TreeViewSection>
      );
    });
  }

  return null;
}

interface TreeViewGroupFieldProps {
  group: TIGroupFieldValues;
  fieldCheckMap: PickerGroupFieldValue;
  onChange: (updater: (prev: PickerCustomType) => PickerCustomType) => void;
}

function TreeViewGroupField(props: TreeViewGroupFieldProps) {
  const { group, fieldCheckMap, onChange: onCustomTypeChange } = props;
  if (!group.fields) return null;

  const onGroupFieldChange = (
    updater: (prev: PickerGroupFieldValue) => PickerGroupFieldValue,
  ) => {
    onCustomTypeChange((currentCustomTypeFields) => {
      const prevField = currentCustomTypeFields[group.id] ?? {};
      const prevFieldNarrowed =
        prevField.type === "group" ? prevField.value : {};

      return {
        ...currentCustomTypeFields,
        [group.id]: {
          type: "group",
          value: updater(prevFieldNarrowed),
        },
      };
    });
  };

  return (
    <TreeViewSection key={group.id} title={group.id} badge="Group">
      {group.fields.map((field) => {
        if (typeof field === "string") {
          const checked = fieldCheckMap[field]?.value ?? false;

          const onCheckedChange = (newValue: boolean) => {
            onGroupFieldChange((currentFields) => ({
              ...currentFields,
              [field]: { type: "checkbox", value: newValue },
            }));
          };

          return (
            <TreeViewCheckbox
              key={field}
              title={field}
              checked={checked === true}
              onCheckedChange={onCheckedChange}
            />
          );
        }

        const crFieldCheckMap = fieldCheckMap[field.id] ?? {};
        return (
          <TreeViewContentRelationshipField
            key={field.id}
            field={field}
            fieldCheckMap={
              crFieldCheckMap.type === "contentRelationship"
                ? crFieldCheckMap.value
                : {}
            }
            onChange={onCustomTypeChange}
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
 * Get all the existing local custom types from the store and process them into
 * a single array to be rendered by the picker. For this we use the same as the
 * Link config `customtypes` structure {@link TICustomTypes}.
 */
function useCustomTypes() {
  const allCustomTypes = useSelector(selectAllCustomTypes);
  const localCustomTypes = allCustomTypes.flatMap((ct) => {
    // In the store we have remote and local custom types, we want to show
    // the local ones, so that the user is able to create a content
    // relationship with custom types present on the user's computer (pushed
    // or not).
    return "local" in ct ? ct.local : [];
  });

  return useMemo(() => {
    const customTypes = localCustomTypes.flatMap<TICustomType>((customType) => {
      const fields = customType.tabs.flatMap((tab) => {
        return tab.value.flatMap((field) => {
          if (isUidField(field)) return [];

          // Check if it's a content relationship link/field
          if (
            field.value.type === "Link" &&
            field.value.config?.select === "document" &&
            field.value.config.customtypes
          ) {
            const resolvedFields = resolveContentRelationshipFields(
              field.value.config.customtypes,
              localCustomTypes,
            );

            return resolvedFields.length > 0
              ? { id: field.key, customtypes: resolvedFields }
              : [];
          }

          if (field.value.type === "Group" && field.value.config?.fields) {
            return {
              id: field.key,
              fields: field.value.config.fields.map((field) => field.key),
            };
          }

          return field.key;
        });
      });

      return fields.length > 0 ? { id: customType.id, fields } : [];
    });

    customTypes.sort((a, b) => a.id.localeCompare(b.id));

    return customTypes;
  }, [localCustomTypes]);
}

function resolveContentRelationshipFields(
  customTypesArray: TICustomTypes,
  localCustomTypes: CustomTypeSM[],
): TICustomTypeFieldValues[] {
  const fields = customTypesArray.flatMap<TICustomTypeFieldValues>(
    (customType) => {
      if (typeof customType === "string" || !customType.fields) return [];

      const matchingCustomType = localCustomTypes.find(
        (ct) => ct.id === customType.id,
      );
      if (!matchingCustomType) return [];

      return {
        id: customType.id,
        fields: matchingCustomType.tabs.flatMap((tab) => {
          return tab.value.flatMap((field) => {
            return !isUidField(field) ? field.key : [];
          });
        }),
      };
    },
  );

  return fields;
}

function isUidField(
  field: TabFields[number],
): field is { key: string; value: UID } {
  // Filter out uid fields because it's a special field returned by the
  // API and is not part of the data object in the document.
  // We also filter by key "uid", because (as of the time of writing
  // this), creating any field with that API id will result in it being
  // used for metadata.
  return field.key === "uid" && field.value.type === "UID";
}

/**
 * Converts a Link config `customtypes` ({@link TICustomTypes}) structure into
 * picker fields check map ({@link PickerCustomTypes}).
 */
function convertCustomTypesToFieldCheckMap(
  customTypes: TICustomTypes,
): PickerCustomTypes {
  return customTypes.reduce<PickerCustomTypes>((customTypes, customType) => {
    if (typeof customType === "string" || !customType.fields) {
      return customTypes;
    }

    customTypes[customType.id] = customType.fields.reduce<PickerCustomType>(
      (customTypeFields, field) => {
        if (typeof field === "string") {
          customTypeFields[field] = { type: "checkbox", value: true };
        } else if ("fields" in field && field.fields !== undefined) {
          customTypeFields[field.id] = createGroupField(field);
        } else if ("customtypes" in field && field.customtypes !== undefined) {
          customTypeFields[field.id] = createNestedCustomTypeField(field);
        }

        return customTypeFields;
      },
      {},
    );
    return customTypes;
  }, {});
}

function createGroupField(group: TIGroupFieldValues): PickerGroupField {
  if (!group.fields) return { type: "group", value: {} };
  return {
    type: "group",
    value: group.fields.reduce<PickerGroupFieldValue>((fields, field) => {
      if (typeof field === "string") {
        fields[field] = { type: "checkbox", value: true };
      } else if ("customtypes" in field && field.customtypes !== undefined) {
        fields[field.id] = createNestedCustomTypeField(field);
      }

      return fields;
    }, {}),
  };
}

function createNestedCustomTypeField(
  field: TIContentRelationshipFieldValue,
): PickerContentRelationshipField {
  const crField: PickerContentRelationshipField = {
    type: "contentRelationship",
    value: {},
  };
  const crFieldCustomTypes = crField.value;

  for (const customType of field.customtypes) {
    if (typeof customType === "string" || !customType.fields) continue;

    crFieldCustomTypes[customType.id] ??= {};
    const customTypeFields = crFieldCustomTypes[customType.id];

    for (const nestedField of customType.fields) {
      if (typeof nestedField === "string") {
        customTypeFields[nestedField] = { type: "checkbox", value: true };
      }
    }
  }

  return crField;
}

/**
 * Converts a picker fields check map structure ({@link PickerCustomTypes}) into
 * Link config `customtypes` ({@link TICustomTypes}) and filter out empty Custom
 * types.
 */
function convertFieldCheckMapToCustomTypes(map: PickerCustomTypes) {
  return Object.entries(map).flatMap<TICustomType>(([ctId, ctFields]) => {
    const fields = Object.entries(ctFields).flatMap<
      string | TIContentRelationshipFieldValue | TIGroupFieldValues
    >(([fieldId, fieldValue]) => {
      if (fieldValue.type === "checkbox") {
        return fieldValue.value ? fieldId : [];
      }

      if (fieldValue.type === "group") {
        const fields = Object.entries(fieldValue.value).flatMap<
          string | TIContentRelationshipFieldValue
        >(([fieldId, fieldValue]) => {
          if (fieldValue.type === "checkbox") {
            return fieldValue.value ? fieldId : [];
          }

          const customTypes = convertContentRelationshipStateToCustomTypes(
            fieldValue.value,
          );

          return customTypes.length > 0
            ? { id: fieldId, customtypes: customTypes }
            : [];
        });

        return fields.length > 0 ? { id: fieldId, fields } : [];
      }

      const customTypes = convertContentRelationshipStateToCustomTypes(
        fieldValue.value,
      );

      return customTypes.length > 0
        ? { id: fieldId, customtypes: customTypes }
        : [];
    });

    return fields.length > 0 ? { id: ctId, fields } : [];
  });
}

function convertContentRelationshipStateToCustomTypes(
  value: PickerContentRelationshipFieldValue,
): TICustomTypeFieldValues[] {
  return Object.entries(value).flatMap<TICustomTypeFieldValues>(
    ([nestedCustomTypeId, nestedCustomTypeFields]) => {
      const fields = Object.entries(nestedCustomTypeFields).flatMap(
        ([nestedFieldId, nestedFieldValue]) => {
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
    if (isCheckboxField(value)) return count + (value.value ? 1 : 0);
    return count + countPickedFields(value);
  }, 0);
}

function isCheckboxField(value: unknown): value is PickerCheckboxField {
  if (!isValidObject(value)) return false;
  return "type" in value && value.type === "checkbox";
}
