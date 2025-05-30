import { useStableCallback } from "@prismicio/editor-support/React";
import {
  Box,
  Text,
  TreeView,
  TreeViewCheckbox,
  TreeViewCheckboxProps,
  TreeViewSection,
} from "@prismicio/editor-ui";
import { FormikContext, useField, useFormik } from "formik";
import { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";

import { CustomTypeSM } from "@/legacy/lib/models/common/CustomType";
import { selectAllCustomTypes } from "@/modules/availableCustomTypes";

// form state types

type FormFieldMap = {
  [fieldId: string]: boolean;
};

type FormNestedCustomType = {
  [nestedCustomTypeId: string]: FormFieldMap;
};

type FormCustomTypeFieldValues = {
  [fieldId: string]: boolean;
};

type FormContentRelationshipFieldValue = {
  [contentRelationshipFieldId: string]: FormNestedCustomType;
};

type FormCustomTypeFields = {
  [customTypeId: string]:
    | FormCustomTypeFieldValues
    | FormContentRelationshipFieldValue;
};

// copy of types-internal types

type TICustomTypeFieldValues = {
  id: string;
  fields?: readonly string[] | undefined;
};

type TIContentRelationshipFieldValue = {
  id: string;
  customtypes: readonly (string | TICustomTypeFieldValues)[];
};

type TICustomTypeOrContentRelationship = {
  id: string;
  fields?: readonly (string | TIContentRelationshipFieldValue)[] | undefined;
};

type TICustomTypeFields = readonly (
  | string
  | TICustomTypeOrContentRelationship
)[];

interface ContentRelationshipFieldPickerProps {
  initialValues: TICustomTypeFields | undefined;
  onChange: (fields: TICustomTypeFields) => void;
}

export function ContentRelationshipFieldPicker(
  props: ContentRelationshipFieldPickerProps,
) {
  const { initialValues, onChange } = props;
  const { customTypes, labels } = useCustomTypes();

  const stableOnChange = useStableCallback(onChange);
  const form = useFormik<FormCustomTypeFields>({
    initialValues: convertCustomTypesToFormState(initialValues),
    onSubmit: () => undefined, // values will be updated on change
  });

  useEffect(() => {
    stableOnChange(convertFormStateToCustomTypes(form.values));
  }, [form.values, stableOnChange]);

  return (
    <FormikContext.Provider value={form}>
      <Box overflow="hidden" flexDirection="column" border borderRadius={6}>
        <Box
          border={{ bottom: true }}
          padding={{ block: 16, inline: 16, top: 12 }}
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
            subtitle={`(${countPickedFields(form.values)})`}
          >
            {customTypes.map((customType) => (
              <TreeViewCustomType
                key={customType.id}
                customType={customType}
                labels={labels}
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
    </FormikContext.Provider>
  );
}

interface TreeViewCustomTypeProps {
  id?: string;
  customType: TICustomTypeOrContentRelationship;
  labels: Record<string, string>;
}

function TreeViewCustomType(props: TreeViewCustomTypeProps) {
  const { customType, id = customType.id, labels } = props;
  const [field] = useField<
    FormCustomTypeFieldValues | FormContentRelationshipFieldValue | FormFieldMap
  >(id);

  const count = countPickedFields(field.value);

  if (!customType.fields) return null;

  return (
    <TreeViewSection
      key={customType.id}
      title={labels[customType.id] ?? customType.id}
      subtitle={count > 0 ? `(${count} fields exposed)` : undefined}
      badge="Custom Type"
    >
      {customType.fields.map((field) => {
        if (typeof field === "string") {
          return (
            <TreeViewCheckboxField
              key={field}
              id={`${id}.${field}`}
              title={labels[`${customType.id}.${field}`] ?? field}
            />
          );
        }

        return field.customtypes.map((nestedCustomType) => {
          if (typeof nestedCustomType === "string") return null;

          return (
            <TreeViewCustomType
              key={nestedCustomType.id}
              id={`${id}.cr#${field.id}.${nestedCustomType.id}`}
              customType={nestedCustomType}
              labels={labels}
            />
          );
        });
      })}
    </TreeViewSection>
  );
}

function TreeViewCheckboxField(
  props: { id: string } & Omit<
    TreeViewCheckboxProps,
    "checked" | "onCheckedChange"
  >,
) {
  const { id, ...checkboxProps } = props;
  const [field, _, helpers] = useField<boolean>(id);

  return (
    <TreeViewCheckbox
      {...checkboxProps}
      checked={field.value}
      onCheckedChange={(checked) => helpers.setValue(checked)}
    />
  );
}

function useCustomTypes() {
  const allCustomTypes = useSelector(selectAllCustomTypes);

  return useMemo(() => {
    const localCustomTypes = allCustomTypes.flatMap((ct) => {
      return "local" in ct ? ct.local : [];
    });
    let labels: Record<string, string> = {};
    const customTypes = localCustomTypes.map<TICustomTypeOrContentRelationship>(
      (customType) => {
        if (customType.label != null) {
          labels[customType.id] = customType.label;
        }

        return {
          id: customType.id,
          fields: customType.tabs.flatMap((tab) => {
            return tab.value.flatMap((field) => {
              // Check if it's a content relationship link/field
              if (
                field.value.type === "Link" &&
                field.value.config?.select === "document" &&
                field.value.config.customtypes
              ) {
                const resolvedCr = resolveContentRelationshipFields(
                  field.value.config.customtypes,
                  localCustomTypes,
                );

                labels = { ...labels, ...resolvedCr.labels };

                return {
                  id: field.key,
                  customtypes: resolvedCr.fields,
                };
              }

              if (field.key === "uid") return [];

              const { label } = field.value.config ?? {};
              if (label != null) {
                labels[`${customType.id}.${field.key}`] = label;
              }

              return field.key;
            });
          }),
        };
      },
    );

    customTypes.sort((a, b) => a.id.localeCompare(b.id));

    return { customTypes, labels };
  }, [allCustomTypes]);
}

function resolveContentRelationshipFields(
  customTypesArray: TICustomTypeFields,
  localCustomTypes: CustomTypeSM[],
): { labels: Record<string, string>; fields: TICustomTypeFieldValues[] } {
  const labels: Record<string, string> = {};
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
            if (field.key === "uid") return [];

            const { label } = field.value.config ?? {};
            if (label != null) {
              labels[`${customType.id}.${field.key}`] = label;
            }

            return field.key;
          });
        }),
      };
    },
  );

  return { fields, labels };
}

/**
 * Convert a value with form state format to a customtypes config format.
 *
 * Omits custom types that have no selected fields.
 *
 * Example:
 * ```
 * // Input:
 * {
 *   category: { name: true },
 *   country: { name: false }, // custom type omitted
 *   author: {
 *     firstName: true,
 *     lastName: false, // field omitted
 *     "cr#professionCr": {
 *       profession: {
 *         name: true,
 *         industry: true,
 *       },
 *     },
 *   }
 * }
 *
 * // Output:
 * [
 *   {
 *     id: "category",
 *     fields: ["name"],
 *   },
 *   {
 *     id: "author",
 *     fields: [
 *       "firstName",
 *       {
 *         id: "professionCr",
 *         customtypes: [
 *           {
 *             id: "profession",
 *             fields: ["name", "industry"],
 *           },
 *         ],
 *       },
 *     ],
 *   },
 * ]
 **/
function convertFormStateToCustomTypes(
  formState: FormCustomTypeFields,
): TICustomTypeFields {
  return Object.entries(formState).flatMap<TICustomTypeOrContentRelationship>(
    ([customTypeId, customTypeFields]) => {
      const fields = Object.entries(customTypeFields).flatMap<
        string | TIContentRelationshipFieldValue
      >((customTypeFieldsEntry: [string, boolean | FormNestedCustomType]) => {
        if (isContentRelationshipField(customTypeFieldsEntry)) {
          const [nestedCtId, nestedCtFieldMap] = customTypeFieldsEntry;

          const customTypes = Object.entries(
            nestedCtFieldMap,
          ).flatMap<TICustomTypeFieldValues>(
            ([nestedCustomTypeId, nestedCustomTypeFields]) => {
              const fields = Object.entries(nestedCustomTypeFields).flatMap(
                ([nestedFieldId, nestedFieldValue]) => {
                  return nestedFieldValue ? nestedFieldId : [];
                },
              );

              return fields.length > 0
                ? { id: nestedCustomTypeId, fields: fields }
                : [];
            },
          );

          return customTypes.length > 0
            ? { id: nestedCtId.replace("cr#", ""), customtypes: customTypes }
            : [];
        }

        const [fieldId, fieldValue] = customTypeFieldsEntry as [
          string,
          boolean,
        ];
        return fieldValue ? fieldId : [];
      });

      return fields.length > 0 ? { id: customTypeId, fields } : [];
    },
  );
}

// Type narrowing helper
function isContentRelationshipField(
  entry: [string, boolean] | [string, FormNestedCustomType],
): entry is [string, FormNestedCustomType] {
  const [fieldId] = entry;
  return typeof fieldId === "string" && fieldId.startsWith("cr#");
}

/**
 * Convert a value with customtypes config format to a form state format.
 *
 * @example
 * ```
 * // Input:
 * [
 *   {
 *     id: "category",
 *     fields: ["name"],
 *   },
 *   {
 *     id: "author",
 *     fields: [
 *       "firstName",
 *       "lastName",
 *       {
 *         id: "professionCr",
 *         customtypes: [
 *           {
 *             id: "profession",
 *             fields: ["name", "industry"],
 *           },
 *         ],
 *       },
 *     ],
 *   },
 * ]
 *
 * // Output:
 * {
 *   category: { name: true },
 *   author: {
 *     firstName: true,
 *     lastName: true,
 *     "cr#professionCr": {
 *       profession: {
 *         name: true,
 *         industry: true,
 *       },
 *     },
 *   }
 * }
 **/
function convertCustomTypesToFormState(
  customTypes: TICustomTypeFields | undefined,
): FormCustomTypeFields {
  if (!customTypes) return {};

  return customTypes.reduce<FormCustomTypeFields>((customTypes, customType) => {
    if (typeof customType === "string" || !customType.fields) {
      return customTypes;
    }

    customTypes[customType.id] = customType.fields.reduce<
      FormContentRelationshipFieldValue | FormCustomTypeFieldValues
    >((customTypeFields, field) => {
      if (typeof field === "string") {
        customTypeFields[field] = true;
      } else {
        assertNestedCustomTypeField(field);
        assertContentRelationshipField(customTypeFields);

        for (const nestedCustomType of field.customtypes) {
          if (
            typeof nestedCustomType === "string" ||
            !nestedCustomType.fields
          ) {
            continue;
          }

          customTypeFields[`cr#${field.id}`] ??= {};
          const crFields = customTypeFields[`cr#${field.id}`];

          crFields[nestedCustomType.id] ??= {};
          nestedCustomType.fields.forEach((nestedField) => {
            crFields[nestedCustomType.id][nestedField] = true;
          });
        }
      }

      return customTypeFields;
    }, {});
    return customTypes;
  }, {});
}

// Type narrowing helpers
function assertContentRelationshipField(
  value: unknown,
): asserts value is FormContentRelationshipFieldValue {
  if (typeof value !== "object" || value === null) {
    throw new Error("Value is not an object");
  }
}
function assertNestedCustomTypeField(
  field: string | TIContentRelationshipFieldValue,
): asserts field is TIContentRelationshipFieldValue {
  if (typeof field === "string") {
    throw new Error("Field is not a nested custom type");
  }
}

/**
 * Generic recursive function that goes down the form state and counts all
 * the properties that are set to true, which correspond to selected fields.
 *
 * It's not type safe, but checks the type of the values at runtime so that
 * it only recurses into valid objects.
 */
function countPickedFields(fields: object | undefined): number {
  if (!fields) return 0;
  return Object.values(fields).reduce<number>((count, value) => {
    if (typeof value === "boolean" && value) return count + 1;
    if (isValidObject(value)) return count + countPickedFields(value);
    return count;
  }, 0);
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
