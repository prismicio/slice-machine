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

export default [
  StructuredTextWidget,
  ImageWidget,
  LinkWidget,
  LinkToMediaWidget,
  ContentRelationshipWidget,
  SelectWidget,
  BooleanWidget,
  DateWidget,
  TimestampWidget,
  EmbedWidget,
  NumberWidget,
  GeoPointWidget,
  ColorWidget,
  TextWidget,
];
