import { pluralize } from "@prismicio/editor-support/String";
import { useRequest } from "@prismicio/editor-support/Suspense";
import {
  AnimatedSuspense,
  Box,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
  IconButton,
  Skeleton,
  Text,
  Tooltip,
  TreeView,
  TreeViewCheckbox,
  TreeViewSection,
} from "@prismicio/editor-ui";
import {
  CustomType,
  DynamicWidget,
  Group,
  Link,
  LinkConfig,
  NestableWidget,
} from "@prismicio/types-internal/lib/customtypes";

import { ErrorBoundary } from "@/ErrorBoundary";
import { managerClient } from "@/managerClient";
import { isValidObject } from "@/utils/isValidObject";

type NonReadonly<T> = { -readonly [P in keyof T]: T[P] };

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
  return (
    <ErrorBoundary
      renderError={() => (
        <Box alignItems="center" gap={8}>
          <Icon name="alert" size="small" color="tomato10" />
          <Text color="tomato10">Error loading your types</Text>
        </Box>
      )}
    >
      <AnimatedSuspense
        fallback={
          <Box flexDirection="column" position="relative">
            <Skeleton height={240} />
            <Box
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              alignItems="center"
              gap={8}
            >
              <Icon name="autorenew" size="small" color="grey11" />
              <Text color="grey11">Loading your types...</Text>
            </Box>
          </Box>
        }
      >
        <ContentRelationshipFieldPickerContent {...props} />
      </AnimatedSuspense>
    </ErrorBoundary>
  );
}

function ContentRelationshipFieldPickerContent(
  props: ContentRelationshipFieldPickerProps,
) {
  const { value, onChange } = props;
  const { availableCustomTypes, pickedCustomTypes } = useCustomTypes(value);

  const fieldCheckMap = value
    ? convertLinkCustomtypesToFieldCheckMap(value)
    : {};

  function onCustomTypesChange(id: string, newCustomType: PickerCustomType) {
    // The picker does not handle strings (custom type ids), as it's only meant
    // to pick fields from custom types (objects). So we need to merge it with
    // the existing value, which can have strings in the first level that
    // represent new types added without any picked fields.
    onChange(
      mergeAndConvertCheckMapToLinkCustomtypes({
        existingLinkCustomtypes: value,
        previousPickerCustomtypes: fieldCheckMap,
        customTypeId: id,
        newCustomType,
      }),
    );
  }

  function addCustomType(id: string) {
    onChange([...(value ?? []), id]);
  }

  function removeCustomType(id: string) {
    if (value) {
      onChange(value.filter((existingCt) => getId(existingCt) !== id));
    }
  }

  return (
    <Box
      overflow="hidden"
      flexDirection="column"
      border
      borderRadius={6}
      width="100%"
    >
      <Box
        border={{ bottom: true }}
        padding={{ inline: 16, bottom: 16, top: 12 }}
        flexDirection="column"
        gap={8}
      >
        {pickedCustomTypes.length > 0 ? (
          <>
            <Box flexDirection="column">
              <Text variant="h4" color="grey12">
                Allowed Types
              </Text>
              <Text color="grey11">
                Restrict the selection to specific types your content editors
                can link to in the Page Builder.
                <br />
                For each type, choose which fields to expose in the API
                response.
              </Text>
            </Box>
            {pickedCustomTypes.map((customType) => (
              <Box
                key={customType.id}
                gap={4}
                padding={8}
                border
                borderRadius={6}
                borderColor="grey6"
                backgroundColor="white"
                justifyContent="space-between"
              >
                <TreeView>
                  <TreeViewCustomType
                    customType={customType}
                    onChange={(value) =>
                      onCustomTypesChange(customType.id, value)
                    }
                    fieldCheckMap={fieldCheckMap[customType.id] ?? {}}
                    availableCustomTypes={availableCustomTypes}
                  />
                </TreeView>
                <IconButton
                  icon="close"
                  size="small"
                  onClick={() => removeCustomType(customType.id)}
                  sx={{ height: 24, width: 24 }}
                  hiddenLabel="Remove type"
                />
              </Box>
            ))}
            <AddTypeButton
              onSelect={addCustomType}
              pickedCustomTypes={pickedCustomTypes}
              availableCustomTypes={availableCustomTypes}
            />
          </>
        ) : (
          <EmptyView
            onSelect={addCustomType}
            availableCustomTypes={availableCustomTypes}
          />
        )}
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

type EmptyViewProps = {
  onSelect: (customTypeId: string) => void;
  availableCustomTypes: CustomType[];
};

function EmptyView(props: EmptyViewProps) {
  const { availableCustomTypes, onSelect } = props;

  return (
    <Box
      flexDirection="column"
      gap={8}
      alignItems="center"
      padding={{ block: 24 }}
    >
      <Box flexDirection="column" alignItems="center" gap={4}>
        <Text variant="h5" color="grey12">
          No types selected yet.
        </Text>
        <Text color="grey11" component="p" align="center">
          Add one or more document types your content editors can link to.
          <br />
          For each type, select the fields to include in the API response (used
          in your frontend queries).
        </Text>
      </Box>
      <Box>
        <AddTypeButton
          availableCustomTypes={availableCustomTypes}
          onSelect={onSelect}
        />
      </Box>
    </Box>
  );
}

type AddTypeButtonProps = {
  onSelect: (customTypeId: string) => void;
  disabled?: boolean;
  availableCustomTypes: CustomType[];
  pickedCustomTypes?: CustomType[];
};

function AddTypeButton(props: AddTypeButtonProps) {
  const { availableCustomTypes, onSelect, pickedCustomTypes = [] } = props;

  const triggerButton = (
    <Button
      startIcon="add"
      color="grey"
      disabled={availableCustomTypes.length === 0}
    >
      {pickedCustomTypes.length > 0 ? "Add another type" : "Add type"}
    </Button>
  );

  const disabledButton = (
    <Box>
      <Tooltip content="All available types have been added" side="bottom">
        {triggerButton}
      </Tooltip>
    </Box>
  );

  if (availableCustomTypes.length === 0) return disabledButton;

  return (
    <Box>
      <DropdownMenu>
        <DropdownMenuTrigger>{triggerButton}</DropdownMenuTrigger>
        <DropdownMenuContent>
          {availableCustomTypes.flatMap((customType) => (
            <DropdownMenuItem
              key={customType.id}
              onSelect={() => onSelect(customType.id)}
            >
              <Text>{customType.id}</Text>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </Box>
  );
}

interface TreeViewCustomTypeProps {
  customType: CustomType;
  fieldCheckMap: PickerCustomType;
  onChange: (newValue: PickerCustomType) => void;
  availableCustomTypes: CustomType[];
}

function TreeViewCustomType(props: TreeViewCustomTypeProps) {
  const {
    customType,
    fieldCheckMap: customTypeFieldsCheckMap,
    onChange: onCustomTypeChange,
    availableCustomTypes,
  } = props;

  const renderedFields = mapCustomTypeStaticFields(
    customType,
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
            availableCustomTypes={availableCustomTypes}
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
            availableCustomTypes={availableCustomTypes}
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

  const exposedFieldsCount = countPickedFields(customTypeFieldsCheckMap);
  return (
    <TreeViewSection
      key={customType.id}
      title={customType.id}
      subtitle={
        exposedFieldsCount > 0
          ? getExposedFieldsLabel(exposedFieldsCount)
          : "(No fields returned in API)"
      }
      badge={customType.format === "page" ? "Page type" : "Custom type"}
    >
      {renderedFields.length > 0 ? (
        renderedFields
      ) : (
        <Text color="grey11">No available fields</Text>
      )}
    </TreeViewSection>
  );
}

interface TreeViewContentRelationshipFieldProps {
  fieldId: string;
  field: Link;
  fieldCheckMap: PickerContentRelationshipFieldValue;
  onChange: (newValue: PickerContentRelationshipFieldValue) => void;
  availableCustomTypes: CustomType[];
}

function TreeViewContentRelationshipField(
  props: TreeViewContentRelationshipFieldProps,
) {
  const {
    field,
    fieldId,
    fieldCheckMap: crFieldsCheckMap,
    onChange: onCrFieldChange,
    availableCustomTypes,
  } = props;

  if (!field.config?.customtypes) return null;

  const resolvedCustomTypes = resolveContentRelationshipCustomTypes(
    field.config.customtypes,
    availableCustomTypes,
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

        const renderedFields = mapCustomTypeStaticFields(
          customType,
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

  const renderedFields = mapGroupFields(group, ({ fieldId }) => {
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
  availableCustomTypes: CustomType[];
}

function TreeViewFirstLevelGroupField(
  props: TreeViewFirstLevelGroupFieldProps,
) {
  const {
    group,
    groupId,
    fieldCheckMap: groupFieldsCheckMap,
    onChange: onGroupFieldChange,
    availableCustomTypes,
  } = props;

  if (!group.config?.fields) return null;

  return (
    <TreeViewSection key={groupId} title={groupId} badge="Group">
      {mapGroupFields(group, ({ fieldId, field }) => {
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
              availableCustomTypes={availableCustomTypes}
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
  return `(${count} ${pluralize(count, "field", "fields")} returned in API)`;
}

/**
 * Gets all the existing local custom types from the store, filters and sorts
 * them.
 */
function useCustomTypes(value: LinkCustomtypes | undefined) {
  const allCustomTypes = useRequest(getCustomTypes, []);

  if (!value) {
    return { availableCustomTypes: allCustomTypes, pickedCustomTypes: [] };
  }

  const pickedCustomTypes = value.flatMap((pickedCt) => {
    const matchingCt = allCustomTypes.find(
      (existingCt) => existingCt.id === getId(pickedCt),
    );
    return matchingCt ?? [];
  });

  const availableCustomTypes = allCustomTypes.filter(
    (ct) => pickedCustomTypes.some((v) => v.id === ct.id) === false,
  );

  return {
    availableCustomTypes,
    pickedCustomTypes,
  };
}

async function getCustomTypes(): Promise<CustomType[]> {
  const { errors, models } =
    await managerClient.customTypes.readAllCustomTypes();

  if (errors.length > 0) throw errors;
  return models.map(({ model }) => model);
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
 * Merges the existing Link `customtypes` array with the picker state, ensuring
 * that conversions from to string (custom type id) to object and vice versa and
 * that the order is preserved.
 */
function mergeAndConvertCheckMapToLinkCustomtypes(args: {
  existingLinkCustomtypes: LinkCustomtypes | undefined;
  previousPickerCustomtypes: PickerCustomTypes;
  newCustomType: PickerCustomType;
  customTypeId: string;
}): LinkCustomtypes {
  const {
    existingLinkCustomtypes,
    previousPickerCustomtypes,
    newCustomType,
    customTypeId,
  } = args;

  const result: NonReadonly<LinkCustomtypes> = [];
  const pickerLinkCustomtypes = convertFieldCheckMapToLinkCustomtypes({
    ...previousPickerCustomtypes,
    [customTypeId]: newCustomType,
  });

  if (!existingLinkCustomtypes) return pickerLinkCustomtypes;

  for (const existingLinkCt of existingLinkCustomtypes) {
    const existingPickerLinkCt = pickerLinkCustomtypes.find((ct) => {
      return getId(ct) === getId(existingLinkCt);
    });

    if (existingPickerLinkCt !== undefined) {
      // Custom type with exposed fields, keep the customtypes object
      result.push(existingPickerLinkCt);
    } else if (getId(existingLinkCt) === customTypeId) {
      // Custom type that had exposed fields, but now has none, change to string
      result.push(getId(existingLinkCt));
    } else {
      // Custom type without exposed fields, keep the string
      result.push(existingLinkCt);
    }
  }

  return result;
}

/**
 * Converts a picker fields check map structure ({@link PickerCustomTypes}) into
 * Link config `customtypes` ({@link LinkCustomtypes}) and filter out empty Custom
 * types.
 */
function convertFieldCheckMapToLinkCustomtypes(
  checkMap: PickerCustomTypes,
): LinkCustomtypes {
  return Object.entries(checkMap).flatMap<LinkCustomtypes[number]>(
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

function isValidField(fieldId: string, field: DynamicWidget): boolean {
  return (
    field.type !== "Slices" &&
    field.type !== "Choice" &&
    // Filter out uid fields because it's a special field returned by the
    // API and is not part of the data object in the document.
    // We also filter by key "uid", because (as of the time of writing
    // this), creating any field with that API id will result in it being
    // used for metadata.
    (field.type !== "UID" || fieldId !== "uid")
  );
}

function mapCustomTypeStaticFields<T>(
  customType: CustomType,
  callback: (args: { fieldId: string; field: NestableWidget | Group }) => T,
): T[] {
  const fields: T[] = [];
  for (const [_, tabFields] of Object.entries(customType.json)) {
    for (const [fieldId, field] of Object.entries(tabFields)) {
      if (isValidField(fieldId, field)) {
        fields.push(
          callback({ fieldId, field: field as NestableWidget | Group }),
        );
      }
    }
  }
  return fields;
}

function mapGroupFields<T>(
  group: Group,
  callback: (args: { fieldId: string; field: NestableWidget }) => T,
): T[] {
  if (!group.config?.fields) return [];
  const fields: T[] = [];
  for (const [fieldId, field] of Object.entries(group.config.fields)) {
    fields.push(callback({ fieldId, field: field as NestableWidget }));
  }
  return fields;
}
/** If it's a string, return it, otherwise return the `id` property. */
function getId<T extends string | { id: string }>(customType: T): string {
  if (typeof customType === "string") return customType;
  return customType.id;
}
