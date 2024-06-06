import { NestableWidget } from "@prismicio/types-internal/lib/customtypes";
import {
  Group,
  GroupFieldType,
} from "@prismicio/types-internal/lib/customtypes/widgets";
import { StringOrNull } from "@prismicio/types-internal/lib/validators";
import { getOrElseW } from "fp-ts/lib/Either";
import * as t from "io-ts";

import { NestedGroupSM } from "./NestedGroup";

export const GroupConfig = t.exact(
  t.partial({
    label: StringOrNull,
    repeat: t.boolean,
    fields: t.array(
      t.type({
        key: t.string,
        value: t.union([NestableWidget, NestedGroupSM]),
      }),
    ),
  }),
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
  ]),
);
export type GroupSM = t.TypeOf<typeof GroupSM>;

export const Groups = {
  fromSM(group: GroupSM): Group {
    const fields = (() => {
      if (!group.config?.fields) return;

      return group.config.fields.reduce((acc, { key, value }) => {
        if (value.type === GroupFieldType) {
          return { ...acc, [key]: Groups.fromSM(value) };
        } else {
          return { ...acc, [key]: value };
        }
      }, {});
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
      }),
    );
  },

  toSM(group: Group): GroupSM {
    const fields = (() => {
      if (!group.config?.fields) return;

      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      return Object.entries(group.config?.fields || {}).map(([key, value]) => {
        if (value.type === GroupFieldType) {
          return { key, value: Groups.toSM(value) };
        } else {
          return { key, value };
        }
      });
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
      }),
    );
  },
};
