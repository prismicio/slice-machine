import { NestableWidget } from "@prismicio/types-internal/lib/customtypes";
import { GroupSM } from "../Group";

export const Group = {
  addWidget(
    group: GroupSM,
    newField: { key: string; value: NestableWidget }
  ): GroupSM {
    return {
      ...group,
      config: {
        ...group.config,
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        fields: [...(group.config?.fields || []), newField],
      },
    };
  },
  deleteWidget(group: GroupSM, wkey: string): GroupSM {
    return {
      ...group,
      config: {
        ...group.config,
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        fields: (group.config?.fields || []).filter(({ key }) => key !== wkey),
      },
    };
  },
  reorderWidget(group: GroupSM, start: number, end: number): GroupSM {
    const reorderedWidget: { key: string; value: NestableWidget } | undefined =
      group.config?.fields?.[start];
    if (!reorderedWidget)
      throw new Error(`Unable to reorder the widget at index ${start}.`);

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const reorderedArea = (group.config?.fields || []).reduce<
      Array<{ key: string; value: NestableWidget }>
    >((acc, field, index) => {
      const elems = [field, reorderedWidget];
      switch (index) {
        case start:
          return acc;
        case end:
          return [...acc, ...(end > start ? elems : elems.reverse())];
        default:
          return [...acc, field];
      }
    }, []);

    return {
      ...group,
      config: {
        ...group.config,
        fields: reorderedArea,
      },
    };
  },
  replaceWidget(
    group: GroupSM,
    previousKey: string,
    newKey: string,
    value: NestableWidget
  ): GroupSM {
    return {
      ...group,
      config: {
        ...group.config,
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        fields: (group.config?.fields || []).map((t) => {
          if (t.key === previousKey) {
            return {
              key: newKey,
              value,
            };
          }
          return t;
        }),
      },
    };
  },
};
