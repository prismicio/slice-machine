import {
  Group,
  NestableWidget,
  UID,
} from "@prismicio/types-internal/lib/customtypes";

import { telemetry } from "@/apiClient";
import { SlicePrimaryFieldSM } from "@/legacy/lib/models/common/Slice";

import { getContentTypeForTracking } from "./getContentTypeForTracking";
import { getLinkTrackingProperties } from "./getLinkTrackingProperties";

type TrackFieldUpdatedArgs = {
  id: string;
  previousId: string;
  field: SlicePrimaryFieldSM | NestableWidget | UID | Group;
  isInAGroup?: boolean;
};

export function trackFieldUpdated(args: TrackFieldUpdatedArgs) {
  const { id, previousId = id, field, isInAGroup = false } = args;

  void telemetry.track({
    event: "field:updated",
    previousId: previousId,
    id,
    idUpdated: previousId !== id,
    name: field.config?.label ?? "",
    type: field.type,
    isInAGroup,
    contentType: getContentTypeForTracking(window.location.pathname),
    ...(field.type === "Link" && getLinkTrackingProperties(field)),
  });
}
