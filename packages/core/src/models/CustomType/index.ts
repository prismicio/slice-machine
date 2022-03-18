import { StringOrNull } from "@prismicio/types-internal/lib/validators";
import { withFallback } from "io-ts-types";
import * as t from "io-ts";
import { Tabs, TabSM } from "./Tab";
import { CustomType } from "@prismicio/types-internal/lib/customtypes";

export const CustomTypeSM = t.exact(
  t.intersection([
    t.type({
      id: t.string,
      label: StringOrNull,
      repeatable: withFallback(t.boolean, true),
      tabs: t.array(TabSM),
      status: withFallback(t.boolean, true),
    }),
    t.partial({
      hash: t.string,
    }),
  ])
);
export type CustomTypeSM = t.TypeOf<typeof CustomTypeSM>;

export const CustomTypes = {
  toSM(ct: CustomType): CustomTypeSM {
    const tabs: Array<TabSM> = Object.entries(ct.json).map(
      ([tabKey, tabValue]) => Tabs.toSM(tabKey, tabValue)
    );
    return {
      ...ct,
      tabs,
    };
  },
  fromSM(ct: CustomTypeSM): CustomType {
    return {
      ...ct,
      json: ct.tabs.reduce((acc, tab) => {
        return {
          ...acc,
          [tab.key]: Tabs.fromSM(tab),
        };
      }, {}),
    };
  },
};

export * from "./Tab";
