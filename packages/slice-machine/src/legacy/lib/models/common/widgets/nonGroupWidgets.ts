import { BooleanWidget } from "./Boolean";
import { ColorWidget } from "./Color";
import { ContentRelationshipWidget } from "./ContentRelationship";
import { DateWidget } from "./Date";
import { EmbedWidget } from "./Embed";
import { GeoPointWidget } from "./GeoPoint";
import { ImageWidget } from "./Image";
import { LinkWidget } from "./Link";
import { LinkToMediaWidget } from "./LinkToMedia";
import { NumberWidget } from "./Number";
import { SelectWidget } from "./Select";
import { StructuredTextWidget } from "./StructuredText";
import { TextWidget } from "./Text";
import { TimestampWidget } from "./Timestamp";
import { UIDWidget } from "./UID";

export const NonGroupWidgets = {
  Boolean: BooleanWidget,
  Color: ColorWidget,
  ContentRelationship: ContentRelationshipWidget,
  Date: DateWidget,
  Embed: EmbedWidget,
  GeoPoint: GeoPointWidget,
  Image: ImageWidget,
  Link: LinkWidget,
  LinkToMedia: LinkToMediaWidget,
  Number: NumberWidget,
  Select: SelectWidget,
  StructuredText: StructuredTextWidget,
  Text: TextWidget,
  Timestamp: TimestampWidget,
  UID: UIDWidget,
};
