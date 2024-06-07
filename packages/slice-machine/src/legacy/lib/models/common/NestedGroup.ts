import { NestedGroup } from "@prismicio/types-internal/lib/customtypes/widgets";
import { StringOrNull } from "@prismicio/types-internal/lib/validators";
import { getOrElseW } from "fp-ts/lib/Either";
import * as t from "io-ts";

import { FieldsSM } from "./Fields";

export const NestedGroupConfig = t.exact(
  t.partial({
    label: StringOrNull,
    repeat: t.boolean,
    fields: FieldsSM,
  }),
);
export type NestedGroupConfig = t.TypeOf<typeof NestedGroupConfig>;

export const NestedGroupSM = t.exact(
  t.intersection([
    t.type({
      type: t.literal("Group"),
    }),
    t.partial({
      fieldset: StringOrNull,
      icon: t.string,
      description: t.string,
      config: NestedGroupConfig,
    }),
  ]),
);
export type NestedGroupSM = t.TypeOf<typeof NestedGroupSM>;

export const NestedGroups = {
  fromSM(nestedGroup: NestedGroupSM): NestedGroup {
    const fields = (() => {
      if (!nestedGroup.config?.fields) return;

      return nestedGroup.config.fields.reduce(
        (acc, { key, value }) => ({ ...acc, [key]: value }),
        {},
      );
    })();

    return getOrElseW(() => {
      throw new Error("Error while parsing an SM nested group.");
    })(
      NestedGroup.decode({
        ...nestedGroup,
        config: {
          ...nestedGroup.config,
          ...(fields ? { fields } : {}),
        },
      }),
    );
  },

  toSM(nestedGroup: NestedGroup): NestedGroupSM {
    const fields = (() => {
      if (!nestedGroup.config?.fields) return;

      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      return Object.entries(nestedGroup.config?.fields || {}).map(
        ([key, value]) => ({
          key,
          value,
        }),
      );
    })();

    return getOrElseW(() => {
      throw new Error("Error while parsing an SM nested group.");
    })(
      NestedGroupSM.decode({
        ...nestedGroup,
        config: {
          ...nestedGroup.config,
          ...(fields ? { fields } : {}),
        },
      }),
    );
  },
};
