import * as t from "io-ts";
import { NestableWidget } from "@prismicio/types-internal/lib/customtypes/widgets/nestable";
import {
  Group,
  UID,
  WidgetTypes,
} from "@prismicio/types-internal/lib/customtypes/widgets";
import { Groups, GroupSM } from "../../models/Group";
import { DynamicSection } from "@prismicio/types-internal/lib/customtypes/Section";
import { SlicesSM, SliceZone } from "../Slices";
import { DynamicWidget } from "@prismicio/types-internal/lib/customtypes/widgets/Widget";
import { DynamicSlices } from "@prismicio/types-internal/lib/customtypes/widgets/slices/Slices";

export const TabFields = t.array(
  t.type({
    key: t.string,
    value: t.union([NestableWidget, UID, GroupSM]),
  })
);
export type TabFields = t.TypeOf<typeof TabFields>;

export const TabSM = t.intersection([
  t.type({
    key: t.string,
    value: TabFields,
  }),
  t.partial({
    sliceZone: SlicesSM,
  }),
]);
export type TabSM = t.TypeOf<typeof TabSM>;

export const Tabs = {
  toSM(key: string, tab: DynamicSection): TabSM {
    const maybeSz = Object.entries(tab).find(
      ([, value]) => value.type === WidgetTypes.Slices
    );
    const sliceZone =
      maybeSz && SliceZone.toSM(maybeSz[0], maybeSz[1] as DynamicSlices);

    return {
      key,
      value: Object.entries(tab).reduce<TabFields>(
        (acc: TabFields, [fieldId, value]: [string, DynamicWidget]) => {
          switch (value.type) {
            case WidgetTypes.LegacySlices:
            case WidgetTypes.Slices:
              return acc;
            case WidgetTypes.Group:
              return [
                ...acc,
                {
                  key: fieldId,
                  value: Groups.toSM(value),
                },
              ];
            default:
              return [...acc, { key: fieldId, value }];
          }
        },
        []
      ),
      ...(sliceZone ? { sliceZone } : {}),
    };
  },
  fromSM(tab: TabSM): DynamicSection {
    const fields = tab.value
      .reduce<Array<[string, NestableWidget | UID | Group | DynamicSlices]>>(
        (acc, { key, value }) => {
          switch (value.type) {
            case WidgetTypes.Group:
              return [...acc, [key, Groups.fromSM(value)]];
            default:
              return [...acc, [key, value]];
          }
        },
        []
      )
      .concat(
        !tab.sliceZone
          ? []
          : [[tab.sliceZone.key, SliceZone.fromSM(tab.sliceZone)]]
      )
      .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});
    return fields;
  },
};

export type TabField = NestableWidget | UID | GroupSM;
