import {
  CustomType,
  DynamicSection,
  DynamicSlicesConfig,
} from "@prismicio/types-internal/lib/customtypes";

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
