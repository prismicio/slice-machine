import * as t from "io-ts";
import {
  NestableWidget,
  DynamicSection,
  DynamicWidget,
  DynamicSlices,
  Group,
  UID,
} from "@prismicio/types-internal/lib/customtypes";
import { Groups, GroupSM } from "../Group";

import { SlicesSM, SliceZone } from "../Slices";

import { SliceZone as SliceZoneOperations } from "./sliceZone";

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
      ([, value]) => value.type === "Slices"
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
            case "Group":
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

interface OrganisedFields {
  fields: ReadonlyArray<{ key: string; value: TabField }>;
  groups: ReadonlyArray<{ key: string; value: GroupSM }>;
  sliceZone?: DynamicSlices;
}

export const Tab = {
  init(id: string): TabSM {
    return { key: id, value: [] };
  },
  // eslint-disable-next-line @typescript-eslint/ban-types
  updateSliceZone(tab: TabSM): Function {
    return (mutate: (v: SlicesSM) => TabSM) => {
      return {
        ...tab,
        sliceZone: tab.sliceZone && mutate(tab.sliceZone),
      };
    };
  },
  updateGroup(tab: TabSM, groupId: string) {
    return (mutate: (v: GroupSM) => GroupSM): TabSM => {
      return {
        ...tab,
        value: tab.value.map((field) => {
          if (field.key === groupId && field.value.type === "Group") {
            return {
              key: groupId,
              value: mutate(field.value),
            };
          }
          return field;
        }),
      };
    };
  },
  addWidget(tab: TabSM, id: string, widget: TabField): TabSM {
    const elem = { key: id, value: widget };

    return {
      ...tab,
      value: [...tab.value, elem],
    };
  },
  replaceWidget(
    tab: TabSM,
    previousKey: string,
    newKey: string,
    value: TabField
  ): TabSM {
    return {
      ...tab,
      value: tab.value.map((t) => {
        if (t.key === previousKey) {
          return {
            key: newKey,
            value,
          };
        }
        return t;
      }),
    };
  },
  reorderWidget(tab: TabSM, start: number, end: number): TabSM {
    const reorderedWidget: { key: string; value: TabField } | undefined =
      tab.value[start];
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!reorderedWidget)
      throw new Error(`Unable to reorder the widget at index ${start}.`);

    const reorderedArea = tab.value.reduce<
      Array<{ key: string; value: TabField }>
    >((acc, widget, index: number) => {
      const elems = [widget, reorderedWidget];
      switch (index) {
        case start:
          return acc;
        case end:
          return [...acc, ...(end > start ? elems : elems.reverse())];
        default:
          return [...acc, widget];
      }
    }, []);
    return {
      ...tab,
      value: reorderedArea,
    };
  },
  removeWidget(tab: TabSM, id: string): TabSM {
    const newTab = {
      ...tab,
      value: tab.value.filter((e) => e.key !== id),
    };
    return newTab;
  },
  createSliceZone(tab: TabSM, key: string): TabSM {
    return {
      ...tab,
      sliceZone: SliceZoneOperations.createEmpty(key),
    };
  },
  deleteSliceZone(tab: TabSM): TabSM {
    const { sliceZone: _, ...restTab } = tab;

    return restTab;
  },

  organiseFields(tabSM: TabSM) {
    const { fields, groups } = tabSM.value.reduce<OrganisedFields>(
      (acc: OrganisedFields, current: { key: string; value: TabField }) => {
        switch (current.value.type) {
          case "UID":
            return acc;
          case "Group":
            return {
              ...acc,
              groups: [
                ...acc.groups,
                { key: current.key, value: current.value },
              ],
            };
            return acc;
          default:
            return {
              ...acc,
              fields: [
                ...acc.fields,
                current as { key: string; value: TabField },
              ],
            };
        }
      },
      { fields: [], groups: [] }
    );
    return {
      fields,
      groups,
      sliceZone: tabSM.sliceZone,
    };
  },
};
