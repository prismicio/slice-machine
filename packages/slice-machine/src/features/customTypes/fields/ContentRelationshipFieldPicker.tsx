import { useStableCallback } from "@prismicio/editor-support/React";
import {
  Box,
  Text,
  TreeView,
  TreeViewCheckbox,
  TreeViewSection,
} from "@prismicio/editor-ui";
import { SetStateAction, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import { selectAllCustomTypes } from "@/modules/availableCustomTypes";

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
  const { initialValues, onChange } = props;
  const customTypes = useCustomTypes();

  const stableOnChange = useStableCallback(onChange);
  const [state, setState] = useState<PickerCustomTypeFields>({});

  useEffect(() => {
    console.log("state", state);
  }, [state]);

  useEffect(() => {
    stableOnChange(convertStateToCustomTypes(state));
  }, [state, stableOnChange]);

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
        <TreeView title="Exposed fields" subtitle={`(TODO: Count)`}>
          {customTypes.customTypes.map((customType, index) => {
            if (typeof customType === "string") return null;

            return (
              <TreeViewCustomType
                key={customType.id}
                customType={customType}
                state={state[index]}
                onChange={setState}
                labels={customTypes.labels}
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
  state: PickerCustomTypeField | undefined;
  onChange: (state: SetStateAction<PickerCustomTypeFields>) => void;
  labels: Record<string, string>;
}

function TreeViewCustomType(props: TreeViewCustomTypeProps) {
  const { customType, state, onChange, labels } = props;
  const count: number = 0; // TODO
  const countLabel = count === 1 ? "1 field" : `${count} fields`;

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

  return (
    <TreeViewSection
      key={customType.id}
      title={labels[customType.id]}
      subtitle={count > 0 ? `(${countLabel} exposed)` : undefined}
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
            checked={checkboxState?.value}
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

function countPickedFields(
  fields: PickerCustomTypeFields | PickerCustomTypeField | undefined,
) {
  if (!fields) return 0;

  return Object.values(fields).reduce<number>(
    (count, value: boolean | PickerCustomTypeField) => {
      if (typeof value === "boolean" && value) return count + 1;
      return count + Object.values(value).filter(Boolean).length;
    },
    0,
  );
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
  return Object.entries(fields).flatMap<TICustomType>(([ctId, fields]) => {
    const fieldEntries = Object.entries(fields);
    if (!fieldEntries.some(([_, checked]) => checked)) return [];
    return [
      {
        id: ctId,
        fields: fieldEntries.flatMap(([id, checkbox]) =>
          checkbox.value ? [id] : [],
        ),
      },
    ];
  });
}
