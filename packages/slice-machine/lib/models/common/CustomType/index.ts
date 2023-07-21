import { StringOrNull } from "@prismicio/types-internal/lib/validators";
import { withFallback } from "io-ts-types";
import * as t from "io-ts";
import { Tabs, TabSM } from "./tab";
import { CustomType as CustomTypeInternal } from "@prismicio/types-internal/lib/customtypes";
import { getOrElseW } from "fp-ts/lib/Either";
import { SlicesSM } from "../Slices";

export * from "./tab";

const CustomTypeFormat = {
  page: "page",
  custom: "custom",
};

export const CustomTypeSM = t.exact(
  t.intersection([
    t.type({
      id: t.string,
      label: StringOrNull,
      format: withFallback(t.keyof(CustomTypeFormat), "custom"),
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
  toSM(ct: CustomTypeInternal): CustomTypeSM {
    const tabs: Array<TabSM> = Object.entries(ct.json).map(
      ([tabKey, tabValue]) => Tabs.toSM(tabKey, tabValue)
    );
    return getOrElseW(() => {
      throw new Error("Error while parsing a prismic custom type.");
    })(
      CustomTypeSM.decode({
        ...ct,
        tabs,
      })
    );
  },
  fromSM(ct: CustomTypeSM): CustomTypeInternal {
    return getOrElseW(() => {
      throw new Error("Error while parsing an SM custom type.");
    })(
      CustomTypeInternal.decode({
        ...ct,
        json: ct.tabs.reduce((acc, tab) => {
          return {
            ...acc,
            [tab.key]: Tabs.fromSM(tab),
          };
        }, {}),
      })
    );
  },
};

export interface SaveCustomTypeBody {
  model: CustomTypeSM;
}

export interface RenameCustomTypeBody {
  customTypeId: string;
  newCustomTypeName: string;
}

export type DeleteCustomTypeQuery = {
  id: string;
};

export type DeleteCustomTypeResponse =
  | { err: unknown; reason: string; status: number; type: "error" | "warning" }
  | Record<string, never>;

export const CustomType = {
  getSliceZones(ct: CustomTypeSM): ReadonlyArray<SlicesSM | null> {
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    return ct.tabs.map((t) => t.sliceZone || null);
  },
};
