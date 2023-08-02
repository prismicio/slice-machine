import * as t from "io-ts";
import { Group } from "@prismicio/types-internal/lib/customtypes/widgets";
import { StringOrNull } from "@prismicio/types-internal/lib/validators";
import { FieldsSM } from "./Fields";
import { getOrElseW } from "fp-ts/lib/Either";

export const GroupConfig = t.exact(
  t.partial({
    label: StringOrNull,
    repeat: t.boolean,
    fields: FieldsSM,
  })
);
export type GroupConfig = t.TypeOf<typeof GroupConfig>;

export const GroupSM = t.exact(
  t.intersection([
    t.type({
      type: t.literal("Group"),
    }),
    t.partial({
      fieldset: StringOrNull,
      icon: t.string,
      description: t.string,
      config: GroupConfig,
    }),
  ])
);
export type GroupSM = t.TypeOf<typeof GroupSM>;

export const Groups = {
  fromSM(group: GroupSM): Group {
    const fields = (() => {
      if (!group.config?.fields) return;

      return group.config.fields.reduce(
        (acc, { key, value }) => ({ ...acc, [key]: value }),
        {}
      );
    })();

    return getOrElseW(() => {
      throw new Error("Error while parsing an SM group.");
    })(
      Group.decode({
        ...group,
        config: {
          ...group.config,
          ...(fields ? { fields } : {}),
        },
      })
    );
  },

  toSM(group: Group): GroupSM {
    const fields = (() => {
      if (!group.config?.fields) return;

      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      return Object.entries(group.config?.fields || {}).map(([key, value]) => ({
        key,
        value,
      }));
    })();

    return getOrElseW(() => {
      throw new Error("Error while parsing an SM group.");
    })(
      GroupSM.decode({
        ...group,
        config: {
          ...group.config,
          ...(fields ? { fields } : {}),
        },
      })
    );
  },
};
