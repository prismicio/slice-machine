import * as t from "io-ts";
import { NestableWidget } from "@prismicio/types-internal/lib/customtypes/widgets/nestable";
import {
  Group,
  UID,
  WidgetTypes,
} from "@prismicio/types-internal/lib/customtypes/widgets";
import { Groups, GroupSM } from "../../models/Group";
import { DynamicSection } from "@prismicio/types-internal/lib/customtypes/Section";
import { SlicesSM } from "../Slices";
import { DynamicWidget } from "@prismicio/types-internal/lib/customtypes/widgets/Widget";
import {
  CompositeSlice,
  LegacySlice,
  SharedSliceRef,
} from "@prismicio/types-internal/lib/customtypes/widgets/slices";
import { getOrElseW } from "fp-ts/lib/Either";

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
    const maybeSliceZone = (() => {
      if (!maybeSz) return;
      return getOrElseW(() => {
        () => {
          console.warn(`Invalid slicezone in tab ${key}`);
          return;
        };
      })(
        SlicesSM.decode({
          key: maybeSz[0],
          value: maybeSz[1],
        })
      );
    })();

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
      ...(maybeSliceZone ? { sliceZone: maybeSliceZone } : {}),
    };
  },
  fromSM(tab: TabSM): DynamicSection {
    const fields = tab.value
      .reduce<
        Array<
          [
            string,
            (
              | NestableWidget
              | UID
              | Group
              | Array<{
                  key: string;
                  value: LegacySlice | CompositeSlice | SharedSliceRef;
                }>
            )
          ]
        >
      >((acc, { key, value }) => {
        switch (value.type) {
          case WidgetTypes.Group:
            return [...acc, [key, Groups.fromSM(value)]];
          default:
            return [...acc, [key, value]];
        }
      }, [])
      .concat(!tab.sliceZone ? [] : [tab.sliceZone.key, tab.sliceZone.value])
      .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});
    return fields;
  },
};

export type TabField = NestableWidget | UID | GroupSM;
