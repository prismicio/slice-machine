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

export type PickedFieldsMap = Record<string, Record<string, boolean>>;

interface ContentRelationshipFieldPickerProps {
  onChange: (fields: PickedFieldsMap) => void;
}

export function ContentRelationshipFieldPicker(
  props: ContentRelationshipFieldPickerProps,
) {
  const { onChange } = props;
  const customTypes = useCustomTypes();

  const stableOnChange = useStableCallback(onChange);
  const form = useFormik<PickedFieldsMap>({
    initialValues: {}, // TODO: Initialize with API data
    onSubmit: () => undefined, // values will be updated on change
  });

  useEffect(() => {
    stableOnChange(form.values);
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
            subtitle={`(${getTotalExposedFields(customTypes)})`}
          >
            {customTypes.map((ct) => (
              <TreeViewSection
                key={ct.id}
                title={ct.label}
                subtitle={`(${ct.fields.length} fields exposed)`}
                badge="Custom Type"
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

function TreeViewCheckboxField(
  props: {
    id: string;
    customTypeId: string;
  } & Omit<TreeViewCheckboxProps, "checked" | "onCheckedChange">,
) {
  const { id, customTypeId, ...rest } = props;
  const [field, _, helpers] = useField<boolean>(`${customTypeId}.${id}`);

  return (
    <TreeViewCheckbox
      {...rest}
      checked={field.value}
      onCheckedChange={(checked) => helpers.setValue(checked)}
    />
  );
}

interface SimplifiedCustomType {
  id: string;
  label: string;
  fields: { id: string; label: string }[];
}

function useCustomTypes() {
  const customTypes = useSelector(selectAllCustomTypes);
  const simplifiedCustomTypes = customTypes.flatMap<SimplifiedCustomType>(
    (customType) => {
      if (!("local" in customType)) return [];

      const { id, label, tabs } = customType.local;
      return {
        id,
        label: label ?? id,
        fields: tabs.flatMap((tab) => {
          return tab.value.map((field) => ({
            id: field.key,
            label: field.value.config?.label ?? field.key,
          }));
        }),
      };
    },
  );

  simplifiedCustomTypes.sort((a, b) => a.id.localeCompare(b.id));
  return simplifiedCustomTypes;
}

function getTotalExposedFields(customTypes: SimplifiedCustomType[]) {
  return customTypes.reduce((acc, ct) => acc + ct.fields.length, 0);
}
