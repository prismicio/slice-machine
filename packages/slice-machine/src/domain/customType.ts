import { removeKey } from "@prismicio/editor-support/Object";
import {
  CustomType,
  DynamicSection,
  DynamicSlices,
  DynamicSlicesConfig,
  Group,
  NestableWidget,
  SlicesFieldType,
  UID,
} from "@prismicio/types-internal/lib/customtypes";
import { CustomTypeFormat } from "@slicemachine/manager";

type DeleteSliceZoneSliceArgs = {
  customType: CustomType;
  sectionId: string;
  sliceId: string;
};

type AddFieldArgs = {
  customType: CustomType;
  sectionId: string;
  newField: NestableWidget | UID | Group;
  newFieldId: string;
};

type DeleteFieldArgs = {
  customType: CustomType;
  sectionId: string;
  fieldId: string;
};

type UpdateFieldArgs = {
  customType: CustomType;
  sectionId: string;
  previousFieldId: string;
  newFieldId: string;
  newField: NestableWidget | UID | Group;
};

type ReorderFieldArgs = {
  customType: CustomType;
  sectionId: string;
  sourceIndex: number;
  destinationIndex: number;
};

type UpdateSectionArgs = {
  customType: CustomType;
  sectionId: string;
  updatedSection: DynamicSection;
};

type UpdateFieldsArgs<T> = {
  fields: Record<string, T>;
  previousFieldId: string;
  newFieldId: string;
  newField: T;
};

type ReorderFieldsArgs<T> = {
  fields: Record<string, T>;
  sourceIndex: number;
  destinationIndex: number;
};

type CreateArgs = {
  format: CustomTypeFormat;
  id: string;
  label: string;
  repeatable: boolean;
};

export function getFormat(customType: CustomType): CustomTypeFormat {
  return customType.format ?? "custom";
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

export function getSectionWithUIDFieldEntry(
  customType: CustomType,
): [string, DynamicSection] | undefined {
  const sections = getSectionEntries(customType);
  const sectionWithUID = sections.find(([_, section]) =>
    Object.values(section).some((field): field is UID => field.type === "UID"),
  );
  return sectionWithUID;
}

export function getUIDFieldEntry(
  customType: CustomType,
): [string, UID] | undefined {
  const [_, section] = getSectionWithUIDFieldEntry(customType) ?? [];

  return Object.entries(section ?? {}).find(
    ([_, field]) => field.type === "UID",
  ) as [string, UID] | undefined;
}

export function getFieldLabel(
  field: NestableWidget | UID | Group,
): string | undefined {
  return field?.config?.label ?? undefined;
}

export function getSectionSliceZoneEntry(
  customType: CustomType,
  sectionId: string,
): [string, DynamicSlices] | undefined {
  const section = getSection(customType, sectionId);

  if (section === undefined) {
    return undefined;
  }

  // In Slice Machine we currently only support one slice zone per section
  // so we retrieve the first one
  const maybeSliceZone = Object.entries(section).find(
    (entry): entry is [string, DynamicSlices] => {
      const [_, value] = entry;
      return value.type === SlicesFieldType;
    },
  );

  return maybeSliceZone;
}

export function getSectionSliceZoneConfig(
  customType: CustomType,
  sectionId: string,
): DynamicSlicesConfig | undefined {
  const maybeSliceZoneEntry = getSectionSliceZoneEntry(customType, sectionId);
  const [_, maybeSliceZone] = maybeSliceZoneEntry ?? [];

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
    Object.keys(section).filter((key) => section[key].type === SlicesFieldType),
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
          type: SlicesFieldType,
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
    (key) => section[key].type === SlicesFieldType,
  );

  if (sliceZoneKey === undefined) {
    return customType;
  }

  const newSection = removeKey(section, sliceZoneKey);

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
    (key) => section[key].type === SlicesFieldType,
  );

  if (sliceZoneKey === undefined) {
    return customType;
  }

  const sliceZone = section[sliceZoneKey];

  if (sliceZone.type !== SlicesFieldType) {
    return customType;
  }

  const newChoices = removeKey(sliceZone.config?.choices ?? {}, sliceId);

  return {
    ...customType,
    json: {
      ...customType.json,
      [sectionId]: {
        ...section,
        [sliceZoneKey]: {
          ...sliceZone,
          config: {
            ...sliceZone.config,
            choices: newChoices,
          },
        },
      },
    },
  };
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
  return {
    ...customType,
    json: {
      ...customType.json,
      // Create the empty section
      [sectionId]: {},
    },
  };
}

export function deleteSection(customType: CustomType, sectionId: string) {
  const newJson = removeKey(customType.json, sectionId);

  return {
    ...customType,
    json: newJson,
  };
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
        // Rename the section
        acc[newSectionId] = customType.json[key];
      } else {
        // Retain all other sections as they are
        acc[key] = customType.json[key];
      }
      return acc;
    },
    {},
  );

  return {
    ...customType,
    json: newJson,
  };
}

export function addField(args: AddFieldArgs): CustomType {
  const { customType, sectionId, newField, newFieldId } = args;
  const sectionJson = customType.json[sectionId];
  const maybeSliceZoneEntry = getSectionSliceZoneEntry(customType, sectionId);

  // Separate the fields into slices and non-slices
  const sectionFields = Object.fromEntries(
    Object.entries(sectionJson).filter(
      ([_, value]) => value.type !== SlicesFieldType,
    ),
  );

  const updatedSection = {
    ...sectionFields,
    // Add the new field to the section
    [newFieldId]: newField,
  };

  // Merge the SlicesFieldType field back into the section, if it exists
  if (maybeSliceZoneEntry !== undefined) {
    const [sliceZoneKey, sliceZoneField] = maybeSliceZoneEntry;
    updatedSection[sliceZoneKey] = sliceZoneField;
  }

  const newCustomType = updateSection({
    customType,
    sectionId,
    updatedSection,
  });

  return newCustomType;
}

export function deleteField(args: DeleteFieldArgs): CustomType {
  const { customType, sectionId, fieldId } = args;

  const updatedSection = removeKey(customType.json[sectionId], fieldId);
  const newCustomType = updateSection({
    customType,
    sectionId,
    updatedSection,
  });

  return newCustomType;
}

export function updateField(args: UpdateFieldArgs): CustomType {
  const { customType, sectionId, previousFieldId, newFieldId, newField } = args;

  const updatedSection = updateFields({
    fields: customType.json[sectionId],
    previousFieldId,
    newFieldId,
    newField,
  });
  const newCustomType = updateSection({
    customType,
    sectionId,
    updatedSection,
  });

  return newCustomType;
}

export function reorderField(args: ReorderFieldArgs): CustomType {
  const { customType, sectionId, sourceIndex, destinationIndex } = args;
  const sectionJson = customType.json[sectionId];
  const maybeSliceZoneEntry = getSectionSliceZoneEntry(customType, sectionId);

  // Separate the fields into slices and non-slices
  const sectionFields = Object.fromEntries(
    Object.entries(sectionJson).filter(
      ([_, value]) => value.type !== SlicesFieldType,
    ),
  );

  // On repeatable pages UID field shouldn't be reordered
  const isRepeatablePage =
    customType.format === "page" && customType.repeatable;

  // Remove UID field from the fields to be reordered
  const sectionFieldsWithoutUid = Object.fromEntries(
    Object.entries(sectionFields).filter(([_, value]) => value.type !== "UID"),
  );

  const fieldsToReorder = isRepeatablePage
    ? sectionFieldsWithoutUid
    : sectionFields;

  const updatedSection = reorderFields({
    fields: fieldsToReorder,
    sourceIndex,
    destinationIndex,
  });

  // Merge the SlicesFieldType field back into the section, if it exists
  if (maybeSliceZoneEntry !== undefined) {
    const [sliceZoneKey, sliceZoneField] = maybeSliceZoneEntry;
    updatedSection[sliceZoneKey] = sliceZoneField;
  }

  // Put the UID field back at the beginning of the reordered fields
  const updatedSectionEntries = Object.entries(updatedSection);
  const uidFieldEntry = Object.entries(sectionFields).find(
    ([_, field]) => field.type === "UID",
  );
  if (uidFieldEntry) {
    updatedSectionEntries.unshift(uidFieldEntry);
  }
  const updatedSectionWithUid = Object.fromEntries(updatedSectionEntries);

  const newCustomType = updateSection({
    customType,
    sectionId,
    updatedSection: isRepeatablePage ? updatedSectionWithUid : updatedSection,
  });

  return newCustomType;
}

// if the UID is not existing in any section, it should be added to the main section
export function addUIDField(label: string, customType: CustomType): CustomType {
  const mainSectionEntry = getMainSectionEntry(customType);
  const [sectionId] = mainSectionEntry ?? [];

  if (sectionId === undefined) return customType;

  const newFieldId = "uid";
  const newField: UID = {
    type: "UID",
    config: {
      label,
    },
  };

  return addField({ customType, sectionId, newField, newFieldId });
}

export function updateUIDField(
  label: string,
  customType: CustomType,
): CustomType {
  const [sectionId] = getSectionWithUIDFieldEntry(customType) ?? [];
  const [fieldId, field] = getUIDFieldEntry(customType) ?? [];

  if (!field || fieldId === undefined || sectionId === undefined)
    return customType;

  const updatedSection = updateFields({
    fields: customType.json[sectionId],
    previousFieldId: fieldId,
    newFieldId: fieldId,
    newField: {
      ...field,
      config: {
        ...field.config,
        label,
      },
    },
  });

  const newCustomType = updateSection({
    customType,
    sectionId,
    updatedSection,
  });

  return newCustomType;
}

export function updateSection(args: UpdateSectionArgs): CustomType {
  const { customType, sectionId, updatedSection } = args;

  return {
    ...customType,
    json: {
      ...customType.json,
      [sectionId]: updatedSection,
    },
  };
}

export function updateFields<T>(args: UpdateFieldsArgs<T>): Record<string, T> {
  const { fields, previousFieldId, newFieldId, newField } = args;

  return Object.entries(fields).reduce(
    (acc, [key, value]) => {
      if (key === previousFieldId) {
        // If the current key is the previous field ID, replace it with the new field.
        acc[newFieldId] = newField;
      } else if (key !== newFieldId) {
        // Retain all other fields as they are.
        acc[key] = value;
      }
      return acc;
    },
    {} as Record<string, T>,
  );
}

export function reorderFields<T>(args: ReorderFieldsArgs<T>) {
  const { fields, sourceIndex, destinationIndex } = args;

  const fieldEntries = Object.entries(fields);
  const [removedEntry] = fieldEntries.splice(sourceIndex, 1);
  fieldEntries.splice(destinationIndex, 0, removedEntry);

  const reorderedFields = Object.fromEntries(fieldEntries);

  return reorderedFields;
}

export function create(args: CreateArgs) {
  const { id, label, repeatable, format } = args;
  const mainTab = makeMainTab(repeatable, format);

  return {
    format,
    id,
    json: mainTab,
    label,
    repeatable,
    status: true,
  };
}

function makeMainTab(
  repeatable: boolean,
  format: CustomTypeFormat,
): CustomType["json"] {
  if (repeatable === false && format === "page") {
    return { ...DEFAULT_MAIN_WITH_SLICE_ZONE, ...DEFAULT_SEO_TAB };
  }

  if (repeatable === false) {
    return DEFAULT_MAIN;
  }

  if (format === "page") {
    return {
      ...DEFAULT_MAIN_WITH_UID_AND_SLICE_ZONE,
      ...DEFAULT_SEO_TAB,
    };
  }

  return DEFAULT_MAIN_WITH_UID;
}

const DEFAULT_MAIN: CustomType["json"] = {
  Main: {},
};

const DEFAULT_MAIN_WITH_SLICE_ZONE: CustomType["json"] = {
  Main: {
    slices: {
      config: {
        choices: {},
      },
      fieldset: "Slice Zone",
      type: "Slices",
    },
  },
};

const DEFAULT_MAIN_WITH_UID: CustomType["json"] = {
  Main: {
    uid: {
      type: "UID",
      config: {
        label: "UID",
      },
    },
  },
};

const DEFAULT_MAIN_WITH_UID_AND_SLICE_ZONE: CustomType["json"] = {
  Main: {
    ...DEFAULT_MAIN_WITH_UID.Main,
    ...DEFAULT_MAIN_WITH_SLICE_ZONE.Main,
  },
};

const DEFAULT_SEO_TAB: CustomType["json"] = {
  "SEO & Metadata": {
    meta_title: {
      config: {
        label: "Meta Title",
        placeholder:
          "A title of the page used for social media and search engines",
      },
      type: "Text",
    },
    meta_description: {
      config: {
        label: "Meta Description",
        placeholder: "A brief summary of the page",
      },
      type: "Text",
    },
    meta_image: {
      config: {
        constraint: {
          height: 1260,
          width: 2400,
        },
        label: "Meta Image",
        thumbnails: [],
      },
      type: "Image",
    },
  },
};
