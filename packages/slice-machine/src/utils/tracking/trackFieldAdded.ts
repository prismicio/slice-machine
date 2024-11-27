import {
  Group,
  NestableWidget,
  UID,
} from "@prismicio/types-internal/lib/customtypes";

import { telemetry } from "@/apiClient";
import { SlicePrimaryFieldSM } from "@/legacy/lib/models/common/Slice";

import { getContentTypeForTracking } from "./getContentTypeForTracking";

type TrackFieldAddedArgs = {
  id: string;
  field: SlicePrimaryFieldSM | NestableWidget | UID | Group;
  isInAGroup?: boolean;
};

export function trackFieldAdded(args: TrackFieldAddedArgs) {
  const { id, field, isInAGroup = false } = args;

  void telemetry.track({
    event: "field:added",
    id,
    name: field.config?.label ?? "",
    type: field.type,
    isInAGroup,
    contentType: getContentTypeForTracking(window.location.pathname),
    ...(field.type === "Link" && {
      allowText: field.config?.allowText,
      repeat: field.config?.repeat,
    }),
  });
}
