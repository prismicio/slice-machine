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
import { useEffect } from "react";
import { useSelector } from "react-redux";

import { selectAllCustomTypes } from "@/modules/availableCustomTypes";

type FieldMap = Record<string, boolean>;
export type CustomTypeFieldMap = Record<string, FieldMap>;

type CustomTypeField = string | { id: string; fields: string[] };

interface ContentRelationshipFieldPickerProps {
  initialValues: CustomTypeField[] | undefined;
  onChange: (fields: CustomTypeField[]) => void;
}

export function ContentRelationshipFieldPicker(
  props: ContentRelationshipFieldPickerProps,
) {
  const { initialValues, onChange } = props;
  const customTypes = useCustomTypes();

  const stableOnChange = useStableCallback(onChange);
  const form = useFormik<CustomTypeFieldMap>({
    initialValues: initialValues ? convertCustomTypesToForm(initialValues) : {},
    onSubmit: () => undefined, // values will be updated on change
  });

  useEffect(() => {
    stableOnChange(convertFormToCustomTypes(form.values));
  }, [form.values, stableOnChange]);

  return (
    <FormikContext.Provider value={form}>
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
            subtitle={`(${countPickedFields(form.values)})`}
          >
            {customTypes.map((ct) => {
              const count = countPickedFields(form.values[ct.id]);
              const countLabel = count === 1 ? "1 field" : `${count} fields`;

              return (
                <TreeViewSection
                  key={ct.id}
                  title={ct.label}
                  subtitle={count > 0 ? `(${countLabel} exposed)` : undefined}
                  badge="Custom type"
                >
                  {ct.fields.map((field) => (
                    <TreeViewCheckboxField
                      key={field.id}
                      id={field.id}
                      title={field.label}
                      customTypeId={ct.id}
                    />
                  ))}
                </TreeViewSection>
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
    </FormikContext.Provider>
  );
}

function TreeViewCheckboxField(
  props: {
    id: string;
    customTypeId: string;
  } & Omit<TreeViewCheckboxProps, "checked" | "onCheckedChange">,
) {
  const { id, customTypeId, ...checkboxProps } = props;
  const [field, _, helpers] = useField<boolean>(`${customTypeId}.${id}`);

  return (
    <TreeViewCheckbox
      {...checkboxProps}
      checked={field.value}
      onCheckedChange={(checked) => helpers.setValue(checked)}
    />
  );
}

type SimplifiedCustomTypeField = {
  id: string;
  label: string;
};

interface SimplifiedCustomType {
  id: string;
  label: string;
  fields: SimplifiedCustomTypeField[];
}

function useCustomTypes() {
  const customTypes = useSelector(selectAllCustomTypes);
  const simplifiedCustomTypes = customTypes.flatMap<SimplifiedCustomType>(
    (customType) => {
      // In the store we have remote and local custom types, we want to show
      // the local ones, so that the user is able to create a content
      // relationship with custom types present on the user's computer (pushed
      // or not).
      if (!("local" in customType)) return [];

      const { id, label, tabs } = customType.local;

      const fields = tabs.flatMap<SimplifiedCustomTypeField>((tab) => {
        return tab.value.flatMap((field) => {
          // filter out uid fields because it's a special field returned by the
          // API and is not part of the data object in the document.
          if (field.value.type === "UID" || field.key === "uid") {
            return [];
          }

          return {
            id: field.key,
            label: field.value.config?.label ?? field.key,
          };
        });
      });

      if (fields.length === 0) return [];

      return { id, label: label ?? id, fields };
    },
  );

  simplifiedCustomTypes.sort((a, b) => a.id.localeCompare(b.id));
  return simplifiedCustomTypes;
}

function countPickedFields(fields: CustomTypeFieldMap | FieldMap | undefined) {
  if (!fields) return 0;

  return Object.values(fields).reduce<number>(
    (count, value: boolean | FieldMap) => {
      if (typeof value === "boolean" && value) return count + 1;
      return count + Object.values(value).filter(Boolean).length;
    },
    0,
  );
}

function convertCustomTypesToForm(value: CustomTypeField[]) {
  return value.reduce<CustomTypeFieldMap>((customTypes, customType) => {
    if (typeof customType === "string") {
      customTypes[customType] = {};
      return customTypes;
    }

    const { id, fields } = customType;
    customTypes[id] = fields.reduce<FieldMap>((customTypeFields, field) => {
      customTypeFields[field] = true;
      return customTypeFields;
    }, {});

    return customTypes;
  }, {});
}

/** Convert the picked fields map to the customtypes config and filter out empty customtypes */
function convertFormToCustomTypes(fields: CustomTypeFieldMap) {
  return Object.entries(fields).flatMap<CustomTypeField>(([ctId, fields]) => {
    const fieldEntries = Object.entries(fields);
    if (!fieldEntries.some(([_, checked]) => checked)) return [];
    return [
      {
        id: ctId,
        fields: fieldEntries.flatMap(([id, checked]) => (checked ? [id] : [])),
      },
    ];
  });
}
