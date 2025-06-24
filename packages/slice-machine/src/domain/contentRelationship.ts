import {
  CustomType,
  DynamicWidget,
  Link,
  LinkConfig,
} from "@prismicio/types-internal/lib/customtypes";
import { getAllStaticZoneFields } from "./customType";

/**
 * Types from @prismicio/types-internal
 */

export type LinkCustomtypes = NonNullable<LinkConfig["customtypes"]>;

export type LinkCustomtypesFields = Exclude<
  LinkCustomtypes[number],
  string
>["fields"][number];

export type LinkCustomtypesContentRelationshipFieldValue = Exclude<
  LinkCustomtypesFields,
  string | { fields: unknown }
>;

export type LinkCustomtypesGroupFieldValue = Exclude<
  LinkCustomtypesFields,
  string | { customtypes: unknown }
>;

/**
 * Utils functions
 */

export function isContentRelationshipField(
  field: DynamicWidget,
): field is Link {
  return field.type === "Link" && field.config?.select === "document";
}

export function getAllStaticZoneFieldsForContentRelationship(
  customType: CustomType,
) {
  return Object.entries(getAllStaticZoneFields(customType)).flatMap(
    ([fieldId, field]) => {
      if (canBePickedInContentRelationshipField(fieldId, field)) {
        return { fieldId, field };
      }
      return [];
    },
  );
}

export function canBePickedInContentRelationshipField(
  fieldId: string,
  referencedField: DynamicWidget,
) {
  // It's a special field returned by the API and is not part of the data object in the document.
  // We also filter by key "uid", because (as of the time of writing this),
  // creating any field with that API id will result in it being used for metadata.
  if (fieldId === "uid" || referencedField.type === "UID") return false;

  return true;
}

export function getContentRelationshipPickedFieldId<
  T extends string | { id: string },
>(customType: T): string {
  if (typeof customType === "string") return customType;
  return customType.id;
}

export function isValidContentRelationshipPickedField(
  field: LinkCustomtypesFields,
  referencedStaticZoneFields: Record<string, DynamicWidget>,
  customTypes: CustomType[],
): boolean {
  const fieldId = getContentRelationshipPickedFieldId(field);
  const referencedField = referencedStaticZoneFields[fieldId];

  // If the referenced field don't exist in the custom type, it cannot be picked
  if (!referencedField) return false;

  // If the picked field is named "uid" or the referenced field is a UID field type, it cannot be picked
  if (!canBePickedInContentRelationshipField(fieldId, referencedField))
    return false;

  if (referencedField.type === "Group") {
    const referencedGroupFields = referencedField.config?.fields;

    // If the referenced field is a group but don't contain any fields, it cannot be picked
    if (
      !referencedGroupFields ||
      Object.keys(referencedGroupFields).length === 0
    )
      return false;

    // If the picked field is a string, it cannot be picked as we don't accept selecting a group field as a string
    if (typeof field === "string") return false;

    // If the picked field don't contain any valid group fields, it cannot be picked
    if (
      !(
        typeof field === "object" &&
        "fields" in field &&
        field.fields.length > 0 &&
        field.fields.some((nestedGroupField) =>
          isValidContentRelationshipPickedField(
            nestedGroupField,
            referencedGroupFields,
            customTypes,
          ),
        )
      )
    )
      return false;
  }

  if (isContentRelationshipField(referencedField)) {
    // If there are valid fields in the custom type picked fields, it cannot be picked as a string
    if (typeof field === "string") {
      const contentRelationshipCustomType =
        referencedField.config?.customtypes?.[0];
      const contentRelationshipCustomTypeId = contentRelationshipCustomType
        ? getContentRelationshipPickedFieldId(contentRelationshipCustomType)
        : undefined;

      const referencedContentRelationshipCustomType = customTypes.find(
        (customType) => customType.id === contentRelationshipCustomTypeId,
      );
      const contentRelationshipCustomTypeFields =
        referencedContentRelationshipCustomType
          ? getAllStaticZoneFields(referencedContentRelationshipCustomType)
          : {};

      if (
        contentRelationshipCustomTypeFields &&
        Object.keys(contentRelationshipCustomTypeFields).length > 0 &&
        Object.keys(contentRelationshipCustomTypeFields).some((fieldId) =>
          isValidContentRelationshipPickedField(
            fieldId,
            contentRelationshipCustomTypeFields,
            customTypes,
          ),
        )
      )
        return false;
    }

    // If the picked field is an object but don't contain any valid custom type definition, it cannot be picked
    if (
      typeof field === "object" &&
      "customtypes" in field &&
      field.customtypes.length > 0 &&
      !field.customtypes.some((customtype) => {
        const customtypeId = getContentRelationshipPickedFieldId(customtype);
        const nestedReferencedCustomType = customTypes.find(
          (customType) => customType.id === customtypeId,
        );

        if (!nestedReferencedCustomType) return false;

        const nestedReferencedCustomTypeFields = getAllStaticZoneFields(
          nestedReferencedCustomType,
        );

        if (
          typeof customtype === "object" &&
          "fields" in customtype &&
          customtype.fields.length > 0 &&
          customtype.fields.some((field) =>
            isValidContentRelationshipPickedField(
              field,
              nestedReferencedCustomTypeFields,
              customTypes,
            ),
          )
        )
          return true;

        return false;
      })
    ) {
      return false;
    }
  }

  return true;
}

export function countContentRelationshipPickedFields(
  field: LinkCustomtypesFields,
  referencedStaticZoneFields: Record<string, DynamicWidget>,
  customTypes: CustomType[],
): number {
  if (
    typeof field === "string" &&
    isValidContentRelationshipPickedField(
      field,
      referencedStaticZoneFields,
      customTypes,
    )
  )
    return 1;

  if (
    typeof field === "object" &&
    "fields" in field &&
    isValidContentRelationshipPickedField(
      field,
      referencedStaticZoneFields,
      customTypes,
    )
  ) {
    const referenceCustomTypeField = referencedStaticZoneFields[field.id];
    const referencedCustomTypeGroupFields =
      (referenceCustomTypeField.type === "Group" &&
        referenceCustomTypeField.config?.fields) ||
      {};

    return field.fields.reduce<number>((count, nestedGroupField) => {
      return (
        count +
        countContentRelationshipPickedFields(
          nestedGroupField,
          referencedCustomTypeGroupFields,
          customTypes,
        )
      );
    }, 0);
  }

  if (
    typeof field === "object" &&
    "customtypes" in field &&
    isValidContentRelationshipPickedField(
      field,
      referencedStaticZoneFields,
      customTypes,
    )
  ) {
    return field.customtypes.reduce<number>((count, nestedCustomType) => {
      if (typeof nestedCustomType === "string") return count;

      const referencedCustomType = customTypes.find(
        (customType) => customType.id === nestedCustomType.id,
      );
      const referencedCustomTypeFields = referencedCustomType
        ? getAllStaticZoneFields(referencedCustomType)
        : {};

      return nestedCustomType.fields.reduce<number>(
        (count, nestedCustomTypeField) => {
          if (typeof nestedCustomTypeField === "string") return count + 1;

          return (
            count +
            countContentRelationshipPickedFields(
              nestedCustomTypeField,
              referencedCustomTypeFields,
              customTypes,
            )
          );
        },
        0,
      );
    }, 0);
  }

  return 0;
}
