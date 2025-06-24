import { Link } from "@prismicio/types-internal/lib/customtypes/widgets";

import {
  convertLinkCustomtypesToFieldCheckMap,
  countPickedFields,
} from "@/features/builder/fields/ContentRelationshipFieldPicker";

export function getLinkTrackingProperties(field: Link) {
  return {
    allowText: field.config?.allowText,
    repeat: field.config?.repeat,
    variants: field.config?.variants,
    linkSelect: field.config?.select,
    ...(field.config?.select === "document" &&
      field.config?.customtypes &&
      (() => {
        const { pickedFields, nestedPickedFields } = countPickedFields(
          convertLinkCustomtypesToFieldCheckMap(field.config?.customtypes),
        );
        return {
          linkPickedFields: pickedFields,
          linkNestedPickedFields: nestedPickedFields,
        };
      })()),
  };
}
