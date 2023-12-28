import {
  CustomType,
  DynamicSection,
  DynamicSlicesConfig,
  GroupFieldType,
  NestableWidget,
} from "@prismicio/types-internal/lib/customtypes";

import { CustomTypeFormat } from "@slicemachine/manager/*";
import { CustomTypeSM, TabField } from "@lib/models/common/CustomType";
import type { AnyWidget } from "@lib/models/common/widgets/Widget";
import * as Widgets from "@lib/models/common/widgets/withGroup";

type DeleteSliceZoneSliceArgs = {
  customType: CustomType;
  sectionId: string;
  sliceId: string;
};

type AddFieldArgs = {
  customType: CustomTypeSM;
  tabId: string;
  field: TabField;
  fieldId: string;
};

type DeleteFieldArgs = {
  customType: CustomTypeSM;
  tabId: string;
  fieldId: string;
};

type UpdateFieldArgs = {
  customType: CustomTypeSM;
  tabId: string;
  previousKey: string;
  newKey: string;
  value: TabField;
};

type ReorderFieldArgs = {
  customType: CustomTypeSM;
  tabId: string;
  sourceIndex: number;
  destinationIndex: number;
};

type AddGroupField = {
  customType: CustomTypeSM;
  sectionId: string;
  groupItem: { key: string };
  newField: NestableWidget;
  newFieldId: string;
};

type DeleteGroupField = {
  customType: CustomTypeSM;
  sectionId: string;
  groupItem: { key: string };
  fieldKey: string;
};

type UpdateGroupFieldArgs = {
  customType: CustomTypeSM;
  sectionId: string;
  groupItem: { key: string };
  previousKey: string;
  newKey: string;
  value: NestableWidget;
};

type ReorderGroupFieldArgs = {
  customType: CustomTypeSM;
  sectionId: string;
  groupItem: { key: string };
  sourceIndex: number;
  destinationIndex: number;
};

export function getFormat(custom: CustomType): CustomTypeFormat {
  return custom.format ?? "custom";
}

export function getSectionEntries(
  customType: CustomType,
): [string, DynamicSection][] {
  return Object.entries(customType.json);
}

export function getMainSectionEntry(
  customType: CustomType,
): [string, DynamicSection] | undefined {
  // Currently we cannot rely on the name of the main section
  // since it's possible to rename it
  const sections = getSectionEntries(customType);
  return sections[0];
}

export function getSection(
  customType: CustomType,
  sectionId: string,
): DynamicSection | undefined {
  return customType.json[sectionId];
}

export function getSectionSliceZoneConfig(
  customType: CustomType,
  sectionId: string,
): DynamicSlicesConfig | undefined {
  const section = getSection(customType, sectionId);

  if (section === undefined) {
    return undefined;
  }

  // In Slice Machine we currently only support one slice zone per section
  // so we retrieve the first one
  const maybeSliceZone = Object.values(section).find(
    (value) => value.type === "Slices",
  );

  return maybeSliceZone?.config ?? undefined;
}

// Find the next available key for a slice zone
// Each section slice zone must have a unique key because
// all slice zones from a custom type are flattened and
// it's used as an API id
export function findNextSectionSliceZoneKey(
  customType: CustomType,
  sectionId: string,
): string {
  const sectionsEntries = getSectionEntries(customType);
  const sectionIndex = sectionsEntries.findIndex(([key]) => key === sectionId);

  const existingKeys = sectionsEntries.flatMap(([_, section]) =>
    Object.keys(section).filter((key) => section[key].type === "Slices"),
  );

  let i = sectionIndex;
  let proposedKey;
  do {
    proposedKey = `slices${i !== 0 ? i.toString() : ""}`;
    i++;
  } while (existingKeys.includes(proposedKey));

  return proposedKey;
}

export function createSectionSliceZone(
  customType: CustomType,
  sectionId: string,
): CustomType {
  const maybeSectionSliceZoneConfig = getSectionSliceZoneConfig(
    customType,
    sectionId,
  );

  // If the section already has a slice zone, return the custom type as is
  if (maybeSectionSliceZoneConfig) {
    return customType;
  }

  // Get the next available section key for the slice zone
  const availableSectionSlicesKey = findNextSectionSliceZoneKey(
    customType,
    sectionId,
  );

  return {
    ...customType,
    json: {
      ...customType.json,
      [sectionId]: {
        ...customType.json[sectionId],
        [availableSectionSlicesKey]: {
          type: "Slices",
          fieldset: "Slice Zone",
        },
      },
    },
  };
}

export function deleteSectionSliceZone(
  customType: CustomType,
  sectionId: string,
): CustomType {
  const section = getSection(customType, sectionId);

  if (section === undefined) {
    return customType;
  }

  const sliceZoneKey = Object.keys(section).find(
    (key) => section[key].type === "Slices",
  );

  if (sliceZoneKey === undefined) {
    return customType;
  }

  const newSection = { ...section };
  delete newSection[sliceZoneKey];

  return {
    ...customType,
    json: {
      ...customType.json,
      [sectionId]: newSection,
    },
  };
}

export function deleteSliceZoneSlice(
  args: DeleteSliceZoneSliceArgs,
): CustomType {
  const { customType, sectionId, sliceId } = args;

  const section = getSection(customType, sectionId);

  if (section === undefined) {
    return customType;
  }

  const sliceZoneKey = Object.keys(section).find(
    (key) => section[key].type === "Slices",
  );

  if (sliceZoneKey === undefined) {
    return customType;
  }

  const sliceZone = section[sliceZoneKey];

  if (sliceZone.type !== "Slices") {
    return customType;
  }

  const { [sliceId]: _, ...restChoices } = sliceZone.config?.choices ?? {};

  const newCustomType = {
    ...customType,
    json: {
      ...customType.json,
      [sectionId]: {
        ...section,
        [sliceZoneKey]: {
          ...sliceZone,
          config: {
            ...sliceZone.config,
            choices: restChoices,
          },
        },
      },
    },
  };

  return newCustomType;
}

export function convertToPageType(customType: CustomType): CustomType {
  let newCustomType: CustomType = {
    ...customType,
    format: "page",
  };

  // Create the slice zone for the main section if it doesn't exist
  const mainSectionEntry = getMainSectionEntry(customType);
  if (mainSectionEntry) {
    const [mainSectionKey] = mainSectionEntry;
    newCustomType = createSectionSliceZone(newCustomType, mainSectionKey);
  }

  return newCustomType;
}

export function createSection(customType: CustomType, sectionId: string) {
  const newCustomType = {
    ...customType,
    json: {
      ...customType.json,
      [sectionId]: {},
    },
  };

  return newCustomType;
}

export function deleteSection(customType: CustomType, sectionId: string) {
  const newCustomType = {
    ...customType,
    json: {
      ...customType.json,
    },
  };
  delete newCustomType.json[sectionId];

  return newCustomType;
}

export function renameSection(
  customType: CustomType,
  sectionId: string,
  newSectionId: string,
) {
  if (sectionId === newSectionId) {
    return customType;
  }

  const newJson = Object.keys(customType.json).reduce(
    (acc: CustomType["json"], key) => {
      if (key === sectionId) {
        acc[newSectionId] = customType.json[key];
      } else {
        acc[key] = customType.json[key];
      }
      return acc;
    },
    {},
  );

  const newCustomType = {
    ...customType,
    json: newJson,
  };

  return newCustomType;
}

export function addField(args: AddFieldArgs): CustomTypeSM {
  const { customType, tabId, field, fieldId } = args;

  try {
    if (
      field.type === "Range" ||
      field.type === "IntegrationFields" ||
      field.type === "Separator"
    ) {
      throw new Error("Unsupported Field Type.");
    }

    const CurrentWidget: AnyWidget = Widgets[field.type];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    CurrentWidget.schema.validateSync(field, { stripUnknown: false });

    const newCustomType: CustomTypeSM = {
      ...customType,
      tabs: customType.tabs.map((tab) =>
        tab.key === tabId
          ? {
              ...tab,
              value: [...tab.value, { key: fieldId, value: field }],
            }
          : tab,
      ),
    };

    return newCustomType;
  } catch (err) {
    console.error("Add field: Model is invalid for field. Full error:", err);

    throw new Error(`Add field: Model is invalid for field "${field.type}".`);
  }
}

export function deleteField(args: DeleteFieldArgs): CustomTypeSM {
  const { customType, tabId, fieldId } = args;
  const newCustomType: CustomTypeSM = {
    ...customType,
    tabs: customType.tabs.map((tab) =>
      tab.key === tabId
        ? {
            ...tab,
            value: tab.value.filter((field) => field.key !== fieldId),
          }
        : tab,
    ),
  };

  return newCustomType;
}

export function updateField(args: UpdateFieldArgs): CustomTypeSM {
  const { customType, tabId, previousKey, newKey, value } = args;

  const newCustomType: CustomTypeSM = {
    ...customType,
    tabs: customType.tabs.map((tab) =>
      tab.key === tabId
        ? {
            ...tab,
            value: tab.value.map((field) =>
              field.key === previousKey
                ? {
                    key: newKey,
                    value,
                  }
                : field,
            ),
          }
        : tab,
    ),
  };

  return newCustomType;
}

export function reorderField(args: ReorderFieldArgs): CustomTypeSM {
  const { customType, tabId, sourceIndex, destinationIndex } = args;

  const newCustomType: CustomTypeSM = {
    ...customType,
    tabs: customType.tabs.map((tab) => {
      if (tab.key === tabId) {
        const reorderedArea = tab.value.reduce<
          Array<{ key: string; value: TabField }>
        >((acc, widget, index: number) => {
          if (index === sourceIndex) {
            return [
              ...acc.slice(0, destinationIndex),
              widget,
              ...acc.slice(destinationIndex),
            ];
          } else if (
            sourceIndex < destinationIndex &&
            index > sourceIndex &&
            index <= destinationIndex
          ) {
            return [
              ...acc.slice(0, index - 1),
              widget,
              ...acc.slice(index - 1, index),
            ];
          } else if (
            sourceIndex > destinationIndex &&
            index >= destinationIndex &&
            index < sourceIndex
          ) {
            return [
              ...acc.slice(0, index),
              widget,
              ...acc.slice(index, index + 1),
            ];
          } else {
            return [...acc, widget];
          }
        }, []);
        return {
          ...tab,
          value: reorderedArea,
        };
      } else {
        return tab;
      }
    }),
  };

  return newCustomType;
}

export function addGroupField(args: AddGroupField): CustomTypeSM {
  const { customType, sectionId, groupItem, newField, newFieldId } = args;

  const newCustomType: CustomTypeSM = {
    ...customType,
    tabs: customType.tabs.map((tab) =>
      tab.key === sectionId
        ? {
            ...tab,
            value: tab.value.map((field) => {
              if (
                field.key === groupItem.key &&
                field.value.type === GroupFieldType
              ) {
                return {
                  key: groupItem.key,
                  value: {
                    ...field.value,
                    config: {
                      ...field.value.config,
                      fields: [
                        ...(field.value.config?.fields ?? []),
                        {
                          key: newFieldId,
                          value: newField,
                        },
                      ],
                    },
                  },
                };
              }
              return field;
            }),
          }
        : tab,
    ),
  };

  return newCustomType;
}

export function deleteGroupField(args: DeleteGroupField): CustomTypeSM {
  const { customType, sectionId, groupItem, fieldKey } = args;

  const newCustomType: CustomTypeSM = {
    ...customType,
    tabs: customType.tabs.map((tab) =>
      tab.key === sectionId
        ? {
            ...tab,
            value: tab.value.map((field) => {
              if (
                field.key === groupItem.key &&
                field.value.type === GroupFieldType
              ) {
                return {
                  key: groupItem.key,
                  value: {
                    ...field.value,
                    config: {
                      ...field.value.config,
                      fields: (field.value.config?.fields ?? []).filter(
                        (field) => field.key !== fieldKey,
                      ),
                    },
                  },
                };
              }
              return field;
            }),
          }
        : tab,
    ),
  };

  return newCustomType;
}

export function updateGroupField(args: UpdateGroupFieldArgs): CustomTypeSM {
  const { customType, sectionId, groupItem, previousKey, newKey, value } = args;

  const newCustomType: CustomTypeSM = {
    ...customType,
    tabs: customType.tabs.map((tab) =>
      tab.key === sectionId
        ? {
            ...tab,
            value: tab.value.map((field) => {
              if (
                field.key === groupItem.key &&
                field.value.type === GroupFieldType
              ) {
                return {
                  key: groupItem.key,
                  value: {
                    ...field.value,
                    config: {
                      ...field.value.config,
                      fields: (field.value.config?.fields ?? []).map(
                        (field) => {
                          if (field.key === previousKey) {
                            return {
                              key: newKey,
                              value,
                            };
                          }
                          return field;
                        },
                      ),
                    },
                  },
                };
              }
              return field;
            }),
          }
        : tab,
    ),
  };

  return newCustomType;
}

export function reorderGroupField(args: ReorderGroupFieldArgs): CustomTypeSM {
  const { customType, sectionId, groupItem, sourceIndex, destinationIndex } =
    args;

  const newCustomType: CustomTypeSM = {
    ...customType,
    tabs: customType.tabs.map((tab) =>
      tab.key === sectionId
        ? {
            ...tab,
            value: tab.value.map((field) => {
              if (
                field.key === groupItem.key &&
                field.value.type === GroupFieldType
              ) {
                const reorderedArea = (field.value.config?.fields ?? []).reduce<
                  Array<{ key: string; value: NestableWidget }>
                >((acc, widget, index: number) => {
                  if (index === sourceIndex) {
                    return [
                      ...acc.slice(0, destinationIndex),
                      widget,
                      ...acc.slice(destinationIndex),
                    ];
                  } else if (
                    sourceIndex < destinationIndex &&
                    index > sourceIndex &&
                    index <= destinationIndex
                  ) {
                    return [
                      ...acc.slice(0, index - 1),
                      widget,
                      ...acc.slice(index - 1, index),
                    ];
                  } else if (
                    sourceIndex > destinationIndex &&
                    index >= destinationIndex &&
                    index < sourceIndex
                  ) {
                    return [
                      ...acc.slice(0, index),
                      widget,
                      ...acc.slice(index, index + 1),
                    ];
                  } else {
                    return [...acc, widget];
                  }
                }, []);

                return {
                  key: groupItem.key,
                  value: {
                    ...field.value,
                    config: {
                      ...field.value.config,
                      fields: reorderedArea,
                    },
                  },
                };
              }
              return field;
            }),
          }
        : tab,
    ),
  };

  return newCustomType;
}
