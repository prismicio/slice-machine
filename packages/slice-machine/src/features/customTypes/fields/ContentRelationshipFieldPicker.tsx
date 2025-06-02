import {
  Box,
  Text,
  TreeView,
  TreeViewCheckbox,
  TreeViewSection,
} from "@prismicio/editor-ui";
import { SetStateAction, useMemo } from "react";
import { useSelector } from "react-redux";

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
  fields?: readonly string[] | undefined;
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
              state={state[customType.id]}
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
  state: PickerCustomType | undefined;
  onChange: (state: SetStateAction<PickerCustomTypes>) => void;
}

function TreeViewCustomType(props: TreeViewCustomTypeProps) {
  const { customType, state, onChange } = props;

  if (!customType.fields) return null;

  function onCustomTypeChange(value: SetStateAction<PickerCustomType>) {
    onChange((prev) => ({
      ...prev,
      [customType.id]:
        typeof value === "function" ? value(prev[customType.id]) : value,
    }));
  }

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
        const checkboxState = state?.[field];

        function onCheckedChange(value: boolean) {
          onCustomTypeChange((prev) => ({
            ...prev,
            [field]: { type: "checkbox", value },
          }));
        }

        return (
          <TreeViewCheckbox
            key={field}
            title={field}
            checked={checkboxState?.value ?? false}
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
            // filter out uid fields because it's a special field returned by the
            // API and is not part of the data object in the document.
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
 * picker state ({@link PickerCustomTypes}).
 */
function convertCustomTypesToState(value: TICustomTypes | undefined) {
  if (value === undefined) return {};

  return value.reduce<PickerCustomTypes>((customTypes, customType) => {
    if (typeof customType === "string") {
      customTypes[customType] = {};
      return customTypes;
    }

    const { id, fields } = customType;
    if (fields === undefined) return customTypes;

    customTypes[id] = fields.reduce<PickerCustomType>(
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
 * Converts a picker state structure ({@link PickerCustomTypes}) into Link
 * config `customtypes` ({@link TICustomTypes} and filter out empty Custom types.
 */
function convertStateToCustomTypes(fields: PickerCustomTypes) {
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
