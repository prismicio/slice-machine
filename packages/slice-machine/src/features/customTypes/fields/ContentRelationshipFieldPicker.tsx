import {
  Box,
  Text,
  TreeView,
  TreeViewCheckbox,
  TreeViewSection,
} from "@prismicio/editor-ui";
import { UID } from "@prismicio/types-internal/lib/customtypes";
import { SetStateAction, useMemo } from "react";
import { useSelector } from "react-redux";

import { CustomTypeSM, TabFields } from "@/legacy/lib/models/common/CustomType";
import { selectAllCustomTypes } from "@/modules/availableCustomTypes";

/**
 * Picker state types. Used internally to store the state of the TreeView.
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

interface TIGroupFieldValues {
  id: string;
  fields?: readonly (string | TIContentRelationshipFieldValue)[] | undefined;
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
  const state = useMemo(() => convertCustomTypesToState(value), [value]);

  function onCustomTypeChange(value: SetStateAction<PickerCustomTypes>) {
    onChange(
      convertStateToCustomTypes(
        typeof value === "function" ? value(state) : value,
      ),
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
          subtitle={`(${countPickedFields(state)})`}
        >
          {customTypes.map((customType) => (
            <TreeViewCustomType
              key={customType.id}
              customType={customType}
              state={state[customType.id] ?? {}}
              onChange={onCustomTypeChange}
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
  customType: TICustomType;
  state: PickerCustomType;
  onChange: (state: SetStateAction<PickerCustomTypes>) => void;
}

function TreeViewCustomType(props: TreeViewCustomTypeProps) {
  const { customType, state, onChange } = props;
  if (!customType.fields) return null;

  const onCustomTypeChange = (value: SetStateAction<PickerCustomType>) => {
    onChange((prev) => ({
      ...prev,
      [customType.id]:
        typeof value === "function" ? value(prev[customType.id] ?? {}) : value,
    }));
  };

  const fieldCount = countPickedFields(state);
  const fieldCountLabel = fieldCount === 1 ? "1 field" : `${fieldCount} fields`;

  return (
    <TreeViewSection
      key={customType.id}
      title={customType.id}
      subtitle={fieldCount > 0 ? `(${fieldCountLabel} exposed)` : undefined}
      badge="Custom type"
    >
      {customType.fields.map((field) => {
        // Regular field
        if (typeof field === "string") {
          const { type, value: checked } = state[field] ?? {};

          const onCheckedChange = (value: boolean) => {
            onCustomTypeChange((prev) => ({
              ...prev,
              [field]: { type: "checkbox", value },
            }));
          };

          return (
            <TreeViewCheckbox
              key={field}
              title={field}
              checked={type === "checkbox" ? checked : false}
              onCheckedChange={onCheckedChange}
            />
          );
        }

        const fieldStateValue = state[field.id] ?? {};

        // Group field
        if ("fields" in field) {
          const groupFieldState =
            fieldStateValue?.type === "group" ? fieldStateValue.value : {};

          return (
            <TreeViewGroupField
              key={field.id}
              group={field}
              state={groupFieldState}
              onChange={onCustomTypeChange}
            />
          );
        }

        // Content relationship field
        const crFieldState =
          fieldStateValue?.type === "contentRelationship"
            ? fieldStateValue.value
            : {};

        return (
          <TreeViewContentRelationshipField
            key={field.id}
            field={field}
            state={crFieldState}
            onChange={onCustomTypeChange}
          />
        );
      })}
    </TreeViewSection>
  );
}

interface TreeViewContentRelationshipFieldProps {
  field: TIContentRelationshipFieldValue | TIGroupFieldValues;
  state: PickerContentRelationshipFieldValue;
  onChange: (state: SetStateAction<PickerCustomType>) => void;
}

function TreeViewContentRelationshipField(
  props: TreeViewContentRelationshipFieldProps,
) {
  const { field, state, onChange: onCustomTypeChange } = props;

  const onContentRelationshipFieldChange = (
    value: SetStateAction<PickerContentRelationshipFieldValue>,
  ) => {
    onCustomTypeChange((prev) => {
      const prevCtValue = prev[field.id];
      const prevCtValueNarrowed =
        prevCtValue?.type === "contentRelationship" ? prevCtValue.value : {};

      return {
        ...prev,
        [field.id]: {
          type: "contentRelationship",
          value:
            typeof value === "function"
              ? value(prevCtValueNarrowed ?? {})
              : value,
        },
      };
    });
  };

  if ("customtypes" in field) {
    return field.customtypes.map((customType) => {
      // Invalid nested custom type, we need to have fields.
      if (typeof customType === "string" || !customType.fields) return null;

      const fieldsState: PickerNestedCustomTypeValue | undefined =
        state[customType.id];

      const onNestedCustomTypeChange = (
        value: SetStateAction<PickerNestedCustomTypeValue>,
      ) => {
        onContentRelationshipFieldChange((prev) => ({
          ...prev,
          [customType.id]:
            typeof value === "function"
              ? value(prev[customType.id] ?? {})
              : value,
        }));
      };

      return (
        <TreeViewSection key={customType.id} title={customType.id}>
          {customType.fields.map((field) => {
            if (typeof field === "string") {
              const { type, value: checked } = fieldsState?.[field] ?? {};

              const onCheckedChange = (value: boolean) => {
                onNestedCustomTypeChange((prev) => ({
                  ...prev,
                  [field]: { type: "checkbox", value },
                }));
              };

              return (
                <TreeViewCheckbox
                  key={field}
                  title={field}
                  checked={type === "checkbox" ? checked : false}
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
  state: PickerGroupFieldValue;
  onChange: (state: SetStateAction<PickerCustomType>) => void;
}

function TreeViewGroupField(props: TreeViewGroupFieldProps) {
  const { group, state, onChange: onCustomTypeChange } = props;
  if (!group.fields) return null;

  const onGroupFieldChange = (value: SetStateAction<PickerGroupFieldValue>) => {
    onCustomTypeChange((prevFields) => {
      const prevField = prevFields[group.id];
      const prevFieldNarrowed =
        prevField?.type === "group" ? prevField.value : {};

      return {
        ...prevFields,
        [group.id]: {
          type: "group",
          value: typeof value === "function" ? value(prevFieldNarrowed) : value,
        },
      };
    });
  };

  return (
    <TreeViewSection key={group.id} title={group.id} badge="Group">
      {group.fields.map((field) => {
        if (typeof field === "string") {
          const { type, value: checked } = state[field] ?? {};

          const onCheckedChange = (value: boolean) => {
            onGroupFieldChange((prevFields) => ({
              ...prevFields,
              [field]: { type: "checkbox", value },
            }));
          };

          return (
            <TreeViewCheckbox
              key={field}
              title={field}
              checked={type === "checkbox" ? checked : false}
              onCheckedChange={onCheckedChange}
            />
          );
        }

        const fieldState = state[field.id];
        const fieldStateNarrowed =
          fieldState.type === "contentRelationship" ? fieldState.value : {};

        return (
          <TreeViewContentRelationshipField
            key={field.id}
            field={field}
            state={fieldStateNarrowed}
            onChange={onCustomTypeChange}
          />
        );
      })}
    </TreeViewSection>
  );
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
          // filter out uid fields because it's a special field returned by the
          // API and is not part of the data object in the document.
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
            // filter out uid fields because it's a special field returned by the
            // API and is not part of the data object in the document.
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
  return field.key === "uid" && field.value.type === "UID";
}

/**
 * Converts a Link config `customtypes` ({@link TICustomTypes}) structure into
 * picker state ({@link PickerCustomTypes}).
 */
function convertCustomTypesToState(
  customTypes: TICustomTypes | undefined,
): PickerCustomTypes {
  if (!customTypes) return {};

  return customTypes.reduce<PickerCustomTypes>((customTypes, customType) => {
    if (typeof customType === "string" || !customType.fields) {
      return customTypes;
    }

    customTypes[customType.id] = customType.fields.reduce<PickerCustomType>(
      (customTypeFields, field) => {
        if (typeof field === "string") {
          customTypeFields[field] = { type: "checkbox", value: true };
        } else if ("fields" in field && field.fields !== undefined) {
          customTypeFields[field.id] = createGroupFieldState(field);
        } else if ("customtypes" in field && field.customtypes !== undefined) {
          customTypeFields[field.id] = createNestedCustomTypeState(field);
        }

        return customTypeFields;
      },
      {},
    );
    return customTypes;
  }, {});
}

function createGroupFieldState(group: TIGroupFieldValues): PickerGroupField {
  if (!group.fields) return { type: "group", value: {} };
  return {
    type: "group",
    value: group.fields.reduce<PickerGroupFieldValue>((fields, field) => {
      if (typeof field === "string") {
        fields[field] = { type: "checkbox", value: true };
      } else if ("customtypes" in field && field.customtypes !== undefined) {
        fields[field.id] = createNestedCustomTypeState(field);
      }

      return fields;
    }, {}),
  };
}
function createNestedCustomTypeState(
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
 * Converts a picker state structure ({@link PickerCustomTypes}) into Link
 * config `customtypes` ({@link TICustomTypes} and filter out empty Custom types.
 */
function convertStateToCustomTypes(fields: PickerCustomTypes) {
  return Object.entries(fields).flatMap<TICustomType>(([ctId, ctFields]) => {
    const fields = Object.entries(ctFields).flatMap(([fieldId, fieldValue]) => {
      if (fieldValue.type === "checkbox") {
        return fieldValue.value ? fieldId : [];
      }

      if (fieldValue.type === "group") {
        return {
          id: fieldId,
          fields: Object.entries(fieldValue.value).flatMap(
            ([fieldId, fieldValue]) => {
              return fieldValue.value ? fieldId : [];
            },
          ),
        };
      }

      const customTypes = Object.entries(
        fieldValue.value,
      ).flatMap<TICustomTypeFieldValues>(
        ([nestedCustomTypeId, nestedCustomTypeFields]) => {
          const fields = Object.entries(nestedCustomTypeFields).flatMap(
            ([nestedFieldId, nestedFieldValue]) => {
              return nestedFieldValue.value ? nestedFieldId : [];
            },
          );

          return fields.length > 0 ? { id: nestedCustomTypeId, fields } : [];
        },
      );

      return customTypes.length > 0
        ? { id: fieldId, customtypes: customTypes }
        : [];
    });

    return fields.length > 0 ? { id: ctId, fields } : [];
  });
}

/**
 * Generic recursive function that goes down the form state and counts all
 * the properties that are set to true, which correspond to selected fields.
 *
 * It's not type safe, but checks the type of the values at runtime so that
 * it only recurses into valid objects, and only counts checkbox fields.
 */
function countPickedFields(fields: object | undefined): number {
  if (!fields) return 0;
  return Object.values(fields).reduce<number>((count, value) => {
    if (!isValidObject(value)) return count;
    if (isCheckboxField(value)) return count + (value.value ? 1 : 0);
    return count + countPickedFields(value);
  }, 0);
}
function isCheckboxField(value: object): value is PickerCheckboxField {
  return "type" in value && value.type === "checkbox";
}
function isValidObject(value: unknown): value is object {
  if (typeof value !== "object" || value === null) return false;
  if (Array.isArray(value)) return false;
  return !(
    value instanceof Date ||
    value instanceof RegExp ||
    value instanceof Error
  );
}
