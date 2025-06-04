import {
  Box,
  Text,
  TreeView,
  TreeViewCheckbox,
  TreeViewSection,
} from "@prismicio/editor-ui";
import { useMemo } from "react";
import { useSelector } from "react-redux";

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
 *   }
 * }
 *
 **/
interface PickerCustomTypes {
  [customTypeId: string]: PickerCustomType;
}

interface PickerCustomType {
  [fieldId: string]: PickerCheckboxField;
}

interface PickerCheckboxField {
  type: "checkbox";
  value: boolean;
}

/**
 * Copy of types-internal Link customtypes.
 *
 * @example
 * [
 *   {
 *     id: "category",
 *     fields: ["name"],
 *   },
 *   {
 *     id: "author",
 *     fields: ["firstName", "lastName"],
 *   },
 * ],
 */
type TICustomTypes = readonly (string | TICustomType)[];

interface TICustomType {
  id: string;
  fields: readonly string[];
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
                fieldCheckMap={fieldCheckMap[customType.id]}
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
  fieldCheckMap: PickerCustomType | undefined;
  onChange: (fn: (prev: PickerCustomType) => PickerCustomType) => void;
}

function TreeViewCustomType(props: TreeViewCustomTypeProps) {
  const { customType, fieldCheckMap, onChange } = props;

  const fieldCount = countPickedFields(fieldCheckMap);
  const fieldCountLabel = fieldCount === 1 ? "1 field" : `${fieldCount} fields`;

  return (
    <TreeViewSection
      key={customType.id}
      title={customType.id}
      subtitle={fieldCount > 0 ? `(${fieldCountLabel} exposed)` : undefined}
      badge="Custom type"
    >
      {customType.fields.map((fieldId) => {
        const checked = fieldCheckMap?.[fieldId].value ?? false;

        function onCheckedChange(value: boolean) {
          onChange((currentFields) => ({
            ...currentFields,
            [fieldId]: { type: "checkbox", value },
          }));
        }

        return (
          <TreeViewCheckbox
            key={fieldId}
            title={fieldId}
            checked={checked}
            onCheckedChange={onCheckedChange}
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

  return useMemo(() => {
    const customTypes = allCustomTypes.flatMap<TICustomType>(
      (storeCustomType) => {
        // In the store we have remote and local custom types, we want to show
        // the local ones, so that the user is able to create a content
        // relationship with custom types present on the user's computer (pushed
        // or not).
        if (!("local" in storeCustomType)) return [];
        const customType = storeCustomType.local;

        const fields = customType.tabs.flatMap((tab) => {
          return tab.value.flatMap((field) => {
            // Filter out uid fields because it's a special field returned by the
            // API and is not part of the data object in the document.
            // We also filter by key "uid", because (as of the time of writing
            // this), creating any field with that API id will result in it being
            // used for metadata.
            if (field.value.type === "UID" || field.key === "uid") {
              return [];
            }

            return field.key;
          });
        });

        if (fields.length === 0) return [];

        return { id: customType.id, fields };
      },
    );

    customTypes.sort((a, b) => a.id.localeCompare(b.id));

    return customTypes;
  }, [allCustomTypes]);
}

/**
 * Converts a Link config `customtypes` ({@link TICustomTypes}) structure into
 * picker fields check map ({@link PickerCustomTypes}).
 */
function convertCustomTypesToFieldCheckMap(customtypes: TICustomTypes) {
  return customtypes.reduce<PickerCustomTypes>((customTypes, customType) => {
    if (typeof customType === "string") return customTypes;

    customTypes[customType.id] = customType.fields.reduce<PickerCustomType>(
      (customTypeFields, field) => {
        customTypeFields[field] = { type: "checkbox", value: true };
        return customTypeFields;
      },
      {},
    );

    return customTypes;
  }, {});
}

/**
 * Converts a picker fields check map structure ({@link PickerCustomTypes}) into
 * Link config `customtypes` ({@link TICustomTypes}) and filter out empty Custom
 * types.
 */
function convertFieldCheckMapToCustomTypes(map: PickerCustomTypes) {
  return Object.entries(map).flatMap<TICustomType>(([ctId, ctFields]) => {
    const fields = Object.entries(ctFields).flatMap(([fieldId, checkbox]) =>
      checkbox.value ? [fieldId] : [],
    );
    return fields.length > 0 ? { id: ctId, fields } : [];
  });
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
