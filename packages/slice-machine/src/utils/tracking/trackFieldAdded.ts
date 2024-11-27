import {
  Group,
  NestableWidget,
  UID,
} from "@prismicio/types-internal/lib/customtypes";

import { telemetry } from "@/apiClient";
import { SlicePrimaryFieldSM } from "@/legacy/lib/models/common/Slice";

import { getContentTypeForTracking } from "./getContentTypeForTracking";

export function trackFieldAdded(
  id: string,
  field: SlicePrimaryFieldSM | NestableWidget | UID | Group,
) {
  void telemetry.track({
    event: "field:added",
    id,
    name: field.config?.label ?? "",
    type: field.type,
    isInAGroup: false,
    contentType: getContentTypeForTracking(window.location.pathname),
    ...(field.type === "Link" && {
      allowText: field.config?.allowText,
      repeat: field.config?.repeat,
    }),
  });
}
