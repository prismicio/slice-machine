import { pluralize } from "@prismicio/editor-support/String";
import {
  Alert,
  AnimatedSuspense,
  Badge,
  Box,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  Icon,
  IconButton,
  Skeleton,
  Text,
  TextOverflow,
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
import { useEffect } from "react";

import { ErrorBoundary } from "@/ErrorBoundary";
import {
  revalidateGetCustomTypes,
  useCustomTypes as useCustomTypesRequest,
} from "@/features/customTypes/useCustomTypes";
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
  const { value: linkCustomtypes, onChange } = props;
  const { allCustomTypes, pickedCustomTypes } = useCustomTypes(linkCustomtypes);

  const fieldCheckMap = linkCustomtypes
    ? convertLinkCustomtypesToFieldCheckMap({ linkCustomtypes, allCustomTypes })
    : {};

  function onCustomTypesChange(id: string, newCustomType: PickerCustomType) {
    // The picker does not handle strings (custom type ids), as it's only meant
    // to pick fields from custom types (objects). So we need to merge it with
    // the existing value, which can have strings in the first level that
    // represent new types added without any picked fields.
    onChange(
      mergeAndConvertCheckMapToLinkCustomtypes({
        fieldCheckMap,
        newCustomType,
        linkCustomtypes,
        customTypeId: id,
      }),
    );
  }

  function addCustomType(id: string) {
    const newFields = linkCustomtypes ? [...linkCustomtypes, id] : [id];
    onChange(newFields);
  }

  function removeCustomType(id: string) {
    if (linkCustomtypes) {
      onChange(
        linkCustomtypes.filter((existingCt) => getId(existingCt) !== id),
      );
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
                Allowed type
              </Text>
              <Text color="grey11">
                Select a single type that editors can link to in the Page
                Builder.
                <br />
                For the selected type, choose which fields to include in the API
                response.
              </Text>
              {pickedCustomTypes.length > 1 && (
                <Box margin={{ block: 12 }}>
                  <Alert
                    color="warn"
                    icon="alert"
                    subtitle={
                      <>
                        <Text color="inherit" variant="bold">
                          Legacy mode. Keep only one type to enable the improved
                          Content Relationship feature.
                        </Text>
                        <br />
                        <a
                          href="https://prismic.io/docs/fields/content-relationship"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: "inherit",
                            textDecoration: "none",
                            fontWeight: "bold",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <Text color="inherit" variant="bold">
                            See documentation
                          </Text>
                          <Icon
                            name="arrowForward"
                            size="small"
                            color="inherit"
                          />
                        </a>
                      </>
                    }
                  />
                </Box>
              )}
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
                {pickedCustomTypes.length > 1 ? (
                  <Text>{customType.id}</Text>
                ) : (
                  <TreeView>
                    <TreeViewCustomType
                      customType={customType}
                      onChange={(value) =>
                        onCustomTypesChange(customType.id, value)
                      }
                      fieldCheckMap={fieldCheckMap[customType.id] ?? {}}
                      allCustomTypes={allCustomTypes}
                    />
                  </TreeView>
                )}

                <IconButton
                  icon="close"
                  size="small"
                  onClick={() => removeCustomType(customType.id)}
                  sx={{ height: 24, width: 24 }}
                  hiddenLabel="Remove type"
                />
              </Box>
            ))}
          </>
        ) : (
          <EmptyView onSelect={addCustomType} allCustomTypes={allCustomTypes} />
        )}
      </Box>
      <Box backgroundColor="white" flexDirection="column" padding={12}>
        <Text variant="normal" color="grey11">
          Have ideas for improving this field?{" "}
          <a
            href="https://community.prismic.io/t/content-relationship-share-your-requests-and-feedback/19843"
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
  allCustomTypes: CustomType[];
};

function EmptyView(props: EmptyViewProps) {
  const { allCustomTypes, onSelect } = props;

  return (
    <Box
      flexDirection="column"
      gap={8}
      alignItems="center"
      padding={{ block: 24 }}
    >
      <Box flexDirection="column" alignItems="center" gap={4}>
        <Text variant="h5" color="grey12">
          No type selected
        </Text>
        <Text color="grey11" component="p" align="center">
          Select the type editors can link to.
          <br />
          Then, choose which fields to return in the API.
        </Text>
      </Box>
      <Box>
        <AddTypeButton allCustomTypes={allCustomTypes} onSelect={onSelect} />
      </Box>
    </Box>
  );
}

type AddTypeButtonProps = {
  onSelect: (customTypeId: string) => void;
  allCustomTypes: CustomType[];
};

function AddTypeButton(props: AddTypeButtonProps) {
  const { allCustomTypes, onSelect } = props;

  const triggerButton = (
    <Button startIcon="add" color="grey" disabled={allCustomTypes.length === 0}>
      Add type
    </Button>
  );

  if (allCustomTypes.length === 0) {
    return (
      <Box>
        <Tooltip
          content="No type available"
          side="bottom"
          align="start"
          disableHoverableContent
        >
          {triggerButton}
        </Tooltip>
      </Box>
    );
  }

  return (
    <Box>
      <DropdownMenu>
        <DropdownMenuTrigger>{triggerButton}</DropdownMenuTrigger>
        <DropdownMenuContent maxHeight={400} minWidth={256} align="center">
          <DropdownMenuLabel>
            <Text color="grey11">Types</Text>
          </DropdownMenuLabel>
          {allCustomTypes.map((customType) => (
            <DropdownMenuItem
              key={customType.id}
              onSelect={() => onSelect(customType.id)}
            >
              <Box alignItems="center" justifyContent="space-between" gap={8}>
                <TextOverflow>
                  <Text>{customType.id}</Text>
                </TextOverflow>
                <Badge
                  title={
                    <Text variant="extraSmall" color="purple11">
                      {getTypeFormatLabel(customType.format)}
                    </Text>
                  }
                  color="purple"
                  size="small"
                />
              </Box>
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
  allCustomTypes: CustomType[];
}

function TreeViewCustomType(props: TreeViewCustomTypeProps) {
  const {
    customType,
    fieldCheckMap: customTypeFieldsCheckMap,
    onChange: onCustomTypeChange,
    allCustomTypes,
  } = props;

  const renderedFields = getCustomTypeStaticFields(customType).map(
    ({ fieldId, field }) => {
      // Group field

      if (field.type === "Group") {
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
            allCustomTypes={allCustomTypes}
          />
        );
      }

      // Content relationship field with custom types

      if (isContentRelationshipFieldWithSingleCustomtype(field)) {
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
            allCustomTypes={allCustomTypes}
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
        exposedFieldsCount.pickedFields > 0
          ? getPickedFieldsLabel(
              exposedFieldsCount.pickedFields,
              "returned in the API",
            )
          : "(No fields returned in the API)"
      }
      badge={getTypeFormatLabel(customType.format)}
      defaultOpen
    >
      {renderedFields.length > 0 ? renderedFields : <NoFieldsAvailable />}
    </TreeViewSection>
  );
}

interface TreeViewContentRelationshipFieldProps {
  fieldId: string;
  field: Link;
  fieldCheckMap: PickerContentRelationshipFieldValue;
  onChange: (newValue: PickerContentRelationshipFieldValue) => void;
  allCustomTypes: CustomType[];
}

function TreeViewContentRelationshipField(
  props: TreeViewContentRelationshipFieldProps,
) {
  const {
    field,
    fieldId,
    fieldCheckMap: crFieldsCheckMap,
    onChange: onCrFieldChange,
    allCustomTypes,
  } = props;

  if (!field.config?.customtypes) return null;

  const resolvedCustomTypes = resolveContentRelationshipCustomTypes(
    field.config.customtypes,
    allCustomTypes,
  );

  if (resolvedCustomTypes.length === 0) return null;

  return (
    <TreeViewSection
      title={fieldId}
      subtitle={getPickedFieldsLabel(
        countPickedFields(crFieldsCheckMap).pickedFields,
      )}
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

        const renderedFields = getCustomTypeStaticFields(customType).map(
          ({ fieldId, field }) => {
            // Group field

            if (field.type === "Group") {
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

        return (
          <TreeViewSection
            key={customType.id}
            title={customType.id}
            subtitle={getPickedFieldsLabel(
              countPickedFields(nestedCtFieldsCheckMap).pickedFields,
            )}
            badge={getTypeFormatLabel(customType.format)}
          >
            {renderedFields.length > 0 ? renderedFields : <NoFieldsAvailable />}
          </TreeViewSection>
        );
      })}
    </TreeViewSection>
  );
}

function NoFieldsAvailable() {
  return <Text color="grey11">No available fields to select</Text>;
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

  const renderedFields = getGroupFields(group).map(({ fieldId }) => {
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

  return (
    <TreeViewSection
      key={groupId}
      title={groupId}
      subtitle={getPickedFieldsLabel(
        countPickedFields(groupFieldsCheckMap).pickedFields,
      )}
      badge="Group"
    >
      {renderedFields.length > 0 ? renderedFields : <NoFieldsAvailable />}
    </TreeViewSection>
  );
}

interface TreeViewFirstLevelGroupFieldProps {
  group: Group;
  groupId: string;
  fieldCheckMap: PickerFirstLevelGroupFieldValue;
  onChange: (newValue: PickerFirstLevelGroupFieldValue) => void;
  allCustomTypes: CustomType[];
}

function TreeViewFirstLevelGroupField(
  props: TreeViewFirstLevelGroupFieldProps,
) {
  const {
    group,
    groupId,
    fieldCheckMap: groupFieldsCheckMap,
    onChange: onGroupFieldChange,
    allCustomTypes,
  } = props;

  const renderedFields = getGroupFields(group).map(({ fieldId, field }) => {
    // Content relationship field with custom types

    if (isContentRelationshipFieldWithSingleCustomtype(field)) {
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
          allCustomTypes={allCustomTypes}
        />
      );
    }

    // Regular field

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

  return (
    <TreeViewSection
      key={groupId}
      title={groupId}
      subtitle={getPickedFieldsLabel(
        countPickedFields(groupFieldsCheckMap).pickedFields,
      )}
      badge="Group"
    >
      {renderedFields.length > 0 ? renderedFields : <NoFieldsAvailable />}
    </TreeViewSection>
  );
}

function getPickedFieldsLabel(count: number, suffix = "selected") {
  if (count === 0) return undefined;
  return `(${count} ${pluralize(count, "field", "fields")} ${suffix})`;
}

function getTypeFormatLabel(format: CustomType["format"]) {
  return format === "page" ? "Page type" : "Custom type";
}

/** Retrieves all existing page & custom types. */
function useCustomTypes(linkCustomtypes: LinkCustomtypes | undefined): {
  /** Every existing custom type, used to discover nested custom types down the tree and the add type dropdown. */
  allCustomTypes: CustomType[];
  /** The custom types that are already picked. */
  pickedCustomTypes: CustomType[];
} {
  const { customTypes: allCustomTypes } = useCustomTypesRequest();

  useEffect(() => {
    void revalidateGetCustomTypes();
  }, []);

  if (!linkCustomtypes) {
    return {
      allCustomTypes,
      pickedCustomTypes: [],
    };
  }

  const pickedCustomTypes = linkCustomtypes.flatMap(
    (pickedCt) => allCustomTypes.find((ct) => ct.id === getId(pickedCt)) ?? [],
  );

  return {
    allCustomTypes,
    pickedCustomTypes,
  };
}

function resolveContentRelationshipCustomTypes(
  linkCustomtypes: LinkCustomtypes,
  localCustomTypes: CustomType[],
): CustomType[] {
  return linkCustomtypes.flatMap((linkCustomtype) => {
    return localCustomTypes.find((ct) => ct.id === getId(linkCustomtype)) ?? [];
  });
}

/**
 * Converts a Link config `customtypes` ({@link LinkCustomtypes}) structure into
 * picker fields check map ({@link PickerCustomTypes}).
 */
export function convertLinkCustomtypesToFieldCheckMap(args: {
  linkCustomtypes: LinkCustomtypes;
  allCustomTypes: CustomType[];
}): PickerCustomTypes {
  const { linkCustomtypes, allCustomTypes } = args;

  return linkCustomtypes.reduce<PickerCustomTypes>(
    (customTypes, customType) => {
      if (typeof customType === "string") return customTypes;
      const existingCt = allCustomTypes.find((ct) => ct.id === customType.id);
      if (!existingCt) return customTypes;

      const ctFieldMap = createCustomTypeFieldMap(existingCt);

      const customTypeFields = customType.fields.reduce((fields, field) => {
        // Check if the field exists
        if (!ctFieldMap.has(getId(field))) return fields;

        if (typeof field === "string") {
          // Regular field
          fields[field] = { type: "checkbox", value: true };
        } else if ("fields" in field && field.fields !== undefined) {
          // Group field
          const groupFieldCheckMap = createGroupFieldCheckMap({
            group: field,
            allCustomTypes,
            ctFieldMap,
          });

          if (groupFieldCheckMap) {
            fields[field.id] = groupFieldCheckMap;
          }
        } else if ("customtypes" in field && field.customtypes !== undefined) {
          // Content relationship field
          const crFieldCheckMap = createContentRelationshipFieldCheckMap({
            field,
            allCustomTypes,
          });

          if (crFieldCheckMap) {
            fields[field.id] = crFieldCheckMap;
          }
        }

        return fields;
      }, {} as PickerCustomType);

      if (Object.keys(customTypeFields).length > 0) {
        customTypes[customType.id] = customTypeFields;
      }

      return customTypes;
    },
    {},
  );
}

function createGroupFieldCheckMap(args: {
  group: LinkCustomtypesGroupFieldValue;
  allCustomTypes: CustomType[];
  ctFieldMap: Map<string, DynamicWidget>;
}): PickerFirstLevelGroupField | undefined {
  const { group, ctFieldMap, allCustomTypes } = args;

  const value = group.fields.reduce<PickerFirstLevelGroupFieldValue>(
    (fields, field) => {
      // Check if the field exists
      if (!ctFieldMap.has(`${group.id}.${getId(field)}`)) return fields;

      if (typeof field === "string") {
        // Regular field
        fields[field] = { type: "checkbox", value: true };
      } else if ("customtypes" in field && field.customtypes !== undefined) {
        // Content relationship field
        const crFieldCheckMap = createContentRelationshipFieldCheckMap({
          field,
          allCustomTypes,
        });

        if (crFieldCheckMap) {
          fields[field.id] = crFieldCheckMap;
        }
      }

      return fields;
    },
    {},
  );

  if (Object.keys(value).length === 0) return undefined;

  return {
    type: "group",
    value,
  };
}

function createContentRelationshipFieldCheckMap(args: {
  field: LinkCustomtypesContentRelationshipFieldValue;
  allCustomTypes: CustomType[];
}): PickerContentRelationshipField | undefined {
  const { field, allCustomTypes } = args;

  const value: PickerContentRelationshipFieldValue = {};

  for (const customType of field.customtypes) {
    if (typeof customType === "string") continue;

    const existingCt = allCustomTypes.find((ct) => ct.id === customType.id);
    if (!existingCt) continue;

    value[customType.id] ??= {};
    const customTypeFields = value[customType.id];

    const ctFieldMap = createCustomTypeFieldMap(existingCt);

    for (const nestedField of customType.fields) {
      if (typeof nestedField === "string") {
        // Regular field
        if (ctFieldMap.has(nestedField)) {
          customTypeFields[nestedField] = { type: "checkbox", value: true };
        }
      } else {
        // Group field
        const groupFieldsEntries = nestedField.fields.flatMap((field) => {
          if (ctFieldMap.has(`${nestedField.id}.${field}`)) {
            return [[field, { type: "checkbox", value: true }]] as const;
          }
          return [];
        });

        if (groupFieldsEntries.length > 0) {
          customTypeFields[nestedField.id] = {
            type: "group",
            value: Object.fromEntries(groupFieldsEntries),
          };
        }
      }
    }
  }

  if (Object.keys(value).length === 0) return undefined;

  return {
    type: "contentRelationship",
    value,
  };
}

/**
 * Merges the existing Link `customtypes` array with the picker state, ensuring
 * that conversions from to string (custom type id) to object and vice versa are
 * made correctly and that the order is preserved.
 */
function mergeAndConvertCheckMapToLinkCustomtypes(args: {
  linkCustomtypes: LinkCustomtypes | undefined;
  fieldCheckMap: PickerCustomTypes;
  newCustomType: PickerCustomType;
  customTypeId: string;
}): LinkCustomtypes {
  const { linkCustomtypes, fieldCheckMap, newCustomType, customTypeId } = args;

  const result: NonReadonly<LinkCustomtypes> = [];
  const pickerLinkCustomtypes = convertFieldCheckMapToLinkCustomtypes({
    ...fieldCheckMap,
    [customTypeId]: newCustomType,
  });

  if (!linkCustomtypes) return pickerLinkCustomtypes;

  for (const existingLinkCt of linkCustomtypes) {
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

type CountPickedFieldsResult = {
  pickedFields: number;
  nestedPickedFields: number;
};

/**
 * Generic recursive function that goes down the fields check map and counts all
 * the properties that are set to true, which correspond to selected fields.
 *
 * Distinguishes between all picked fields and nested picked fields within a
 * content relationship field.
 *
 * It's not type safe, but checks the type of the values at runtime so that
 * it only recurses into valid objects, and only counts checkbox fields.
 */
export function countPickedFields(
  fields: Record<string, unknown> | undefined,
  isNested = false,
): CountPickedFieldsResult {
  if (!fields) return { pickedFields: 0, nestedPickedFields: 0 };

  return Object.values(fields).reduce<CountPickedFieldsResult>(
    (result, value) => {
      if (!isValidObject(value)) return result;

      if ("type" in value && value.type === "checkbox") {
        const isChecked = Boolean(value.value);
        if (!isChecked) return result;

        return {
          pickedFields: result.pickedFields + 1,
          nestedPickedFields: result.nestedPickedFields + (isNested ? 1 : 0),
        };
      }

      if ("type" in value && value.type === "contentRelationship") {
        const { pickedFields, nestedPickedFields } = countPickedFields(
          value,
          true,
        );

        return {
          pickedFields: result.pickedFields + pickedFields,
          nestedPickedFields: result.nestedPickedFields + nestedPickedFields,
        };
      }

      const { pickedFields, nestedPickedFields } = countPickedFields(
        value,
        isNested,
      );

      return {
        pickedFields: result.pickedFields + pickedFields,
        nestedPickedFields: result.nestedPickedFields + nestedPickedFields,
      };
    },
    {
      pickedFields: 0,
      nestedPickedFields: 0,
    },
  );
}

/**
 * Check if the field is a Content Relationship Link with a **single** custom
 * type. CRs with multiple custom types are not currently supported (legacy).
 */
function isContentRelationshipFieldWithSingleCustomtype(
  field: NestableWidget | Group,
): field is Link {
  return !!(
    field.type === "Link" &&
    field.config?.select === "document" &&
    field.config?.customtypes &&
    field.config.customtypes.length === 1
  );
}

function createCustomTypeFieldMap(customType: CustomType) {
  return Object.values(customType.json).reduce((acc, tabFields) => {
    for (const [fieldId, field] of Object.entries(tabFields)) {
      if (!isValidField(fieldId, field)) continue;

      if (field.type === "Group") {
        acc.set(fieldId, field);

        if (!field.config?.fields) continue;

        for (const [groupId, group] of Object.entries(field.config.fields)) {
          if (!isValidField(groupId, group)) continue;
          acc.set(`${fieldId}.${groupId}`, group);
        }
      } else {
        acc.set(fieldId, field);
      }
    }
    return acc;
  }, new Map<string, DynamicWidget>());
}

function getCustomTypeStaticFields(customType: CustomType) {
  return Object.values(customType.json).flatMap((tabFields) => {
    return Object.entries(tabFields).flatMap(([fieldId, field]) => {
      return isValidField(fieldId, field) ? { fieldId, field } : [];
    });
  });
}

function isValidField(
  fieldId: string,
  field: DynamicWidget,
): field is NestableWidget | Group {
  return (
    field.type !== "Slices" &&
    field.type !== "Choice" &&
    // We don't display uid fields because they're a special field returned by
    // the API and they're not included in the document data object.
    // We also filter by key "uid", because (as of the time of writing this)
    // creating any field with that API id will result in it being used for
    // metadata, regardless of its type.
    field.type !== "UID" &&
    fieldId !== "uid"
  );
}

function getGroupFields(group: Group) {
  if (!group.config?.fields) return [];
  return Object.entries(group.config.fields).map(([fieldId, field]) => {
    return { fieldId, field: field as NestableWidget };
  });
}

/** If it's a string, return it, otherwise return the `id` property. */
function getId<T extends string | { id: string }>(customType: T): string {
  if (typeof customType === "string") return customType;
  return customType.id;
}
