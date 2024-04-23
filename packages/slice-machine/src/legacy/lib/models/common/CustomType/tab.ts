import {
  DynamicSection,
  DynamicSlices,
  DynamicWidget,
  Group,
  NestableWidget,
  UID,
} from "@prismicio/types-internal/lib/customtypes";
import * as t from "io-ts";

import { Groups, GroupSM } from "../Group";
import { SlicesSM, SliceZone } from "../Slices";

export const TabFields = t.array(
  t.type({
    key: t.string,
    value: t.union([NestableWidget, UID, GroupSM]),
  }),
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
      ([, value]) => value.type === "Slices",
    );
    const sliceZone =
      maybeSz && SliceZone.toSM(maybeSz[0], maybeSz[1] as DynamicSlices);

    return {
      key,
      value: Object.entries(tab).reduce<TabFields>(
        (acc: TabFields, [fieldId, value]: [string, DynamicWidget]) => {
          switch (value.type) {
            case "Choice":
            case "Slices":
              return acc;
            case "Group":
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
        [],
      ),
      ...(sliceZone ? { sliceZone } : {}),
    };
  },
  fromSM(tab: TabSM): DynamicSection {
    const fields = tab.value
      .reduce<Array<[string, NestableWidget | UID | Group | DynamicSlices]>>(
        (acc, { key, value }) => {
          switch (value.type) {
            case "Group":
              return [...acc, [key, Groups.fromSM(value)]];
            default:
              return [...acc, [key, value]];
          }
        },
        [],
      )
      .concat(
        !tab.sliceZone
          ? []
          : [[tab.sliceZone.key, SliceZone.fromSM(tab.sliceZone)]],
      )
      .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});
    return fields;
  },
};

export const TabFieldsModel = {
  fromSM(field: TabField): NestableWidget | UID | Group {
    switch (field.type) {
      case "Group":
        return Groups.fromSM(field);
      default:
        return field;
    }
  },
};

export type TabField = NestableWidget | UID | GroupSM;
