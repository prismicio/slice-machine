import {
  Box,
  Text,
  TreeView,
  TreeViewCheckbox,
  TreeViewSection,
} from "@prismicio/editor-ui";
import { SetStateAction, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import { selectAllCustomTypes } from "@/modules/availableCustomTypes";

// picker state types

type PickerCheckboxField = {
  type: "checkbox";
  value: boolean;
};

type PickerCustomTypeField = {
  [fieldId: string]: PickerCheckboxField;
};

type PickerCustomTypeFields = {
  [customTypeId: string]: PickerCustomTypeField;
};

// copy of types-internal types

type TICustomType = {
  id: string;
  fields?: readonly string[] | undefined;
};

type TICustomTypeFields = readonly (string | TICustomType)[];

interface ContentRelationshipFieldPickerProps {
  initialValues: TICustomTypeFields | undefined;
  onChange: (fields: TICustomTypeFields) => void;
}

export function ContentRelationshipFieldPicker(
  props: ContentRelationshipFieldPickerProps,
) {
  const { initialValues } = props;
  const { customTypes, labels } = useCustomTypes();

  const [state, setState] = useState<PickerCustomTypeFields>(
    initialValues ? convertCustomTypesToState(initialValues) : {},
  );

  function onChange(updated: SetStateAction<PickerCustomTypeFields>) {
    const newState = typeof updated === "function" ? updated(state) : updated;
    setState(newState);
    props.onChange(convertStateToCustomTypes(newState));
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
              state={state[customType.id]}
              onChange={onChange}
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
  );
}

interface TreeViewCustomTypeProps {
  customType: TICustomType;
  state: PickerCustomTypeField | undefined;
  onChange: (state: SetStateAction<PickerCustomTypeFields>) => void;
  labels: Record<string, string>;
}

function TreeViewCustomType(props: TreeViewCustomTypeProps) {
  const { customType, state, onChange, labels } = props;

  if (!customType.fields) return null;

  function onLevelChange(values: SetStateAction<PickerCustomTypeField>) {
    onChange((prev) => {
      const newState = { ...prev };
      if (typeof values === "function") {
        newState[customType.id] = values(prev[customType.id]);
      } else {
        newState[customType.id] = values;
      }

      return newState;
    });
  }

  const fieldCount = countPickedFields(state);
  const fieldCountLabel = fieldCount === 1 ? "1 field" : `${fieldCount} fields`;

  return (
    <TreeViewSection
      key={customType.id}
      title={labels[customType.id]}
      subtitle={fieldCount > 0 ? `(${fieldCountLabel} exposed)` : undefined}
      badge="Custom type"
    >
      {customType.fields.map((field) => {
        const checkboxState = state?.[field];

        const onCheckedChange = (checked: boolean) => {
          onLevelChange((prev) => ({
            ...prev,
            [field]: { type: "checkbox", value: checked },
          }));
        };

        return (
          <TreeViewCheckbox
            key={field}
            title={labels[`${customType.id}.${field}`]}
            checked={checkboxState?.value ?? false}
            onCheckedChange={onCheckedChange}
          />
        );
      })}
    </TreeViewSection>
  );
}

function useCustomTypes() {
  const allCustomTypes = useSelector(selectAllCustomTypes);

  return useMemo(() => {
    const localCustomTypes = allCustomTypes.flatMap((ct) => {
      return "local" in ct ? ct.local : [];
    });
    const labels: Record<string, string> = {};
    const customTypes = localCustomTypes.flatMap<TICustomType>((customType) => {
      if (customType.label != null) {
        labels[customType.id] = customType.label;
      }

      const fields = customType.tabs.flatMap((tab) => {
        return tab.value.flatMap((field) => {
          // filter out uid fields because it's a special field returned by the
          // API and is not part of the data object in the document.
          if (field.value.type === "UID" || field.key === "uid") {
            return [];
          }

          const { label } = field.value.config ?? {};
          if (label != null) {
            labels[`${customType.id}.${field.key}`] = label;
          }

          return field.key;
        });
      });

      if (fields.length === 0) return [];

      return { id: customType.id, fields };
    });

    customTypes.sort((a, b) => a.id.localeCompare(b.id));

    return { customTypes, labels };
  }, [allCustomTypes]);
}

function convertCustomTypesToState(value: TICustomTypeFields) {
  return value.reduce<PickerCustomTypeFields>((customTypes, customType) => {
    if (typeof customType === "string") {
      customTypes[customType] = {};
      return customTypes;
    }

    const { id, fields } = customType;
    if (fields === undefined) return customTypes;

    customTypes[id] = fields.reduce<PickerCustomTypeField>(
      (customTypeFields, field) => {
        customTypeFields[field] = { type: "checkbox", value: true };
        return customTypeFields;
      },
      {},
    );

    return customTypes;
  }, {});
}

/** Convert the picked fields map to the customtypes config and filter out empty customtypes */
function convertStateToCustomTypes(fields: PickerCustomTypeFields) {
  return Object.entries(fields).flatMap<TICustomType>(([ctId, ctFields]) => {
    const fields = Object.entries(ctFields).flatMap(([fieldId, checkbox]) =>
      checkbox.value ? [fieldId] : [],
    );
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
