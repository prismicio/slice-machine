import { WidgetTypes } from "@prismicio/types-internal/lib/customtypes/widgets";
import { DynamicSlices } from "@prismicio/types-internal/lib/customtypes/widgets/slices/Slices";
import {
  TabSM,
  TabField,
} from "@slicemachine/core/build/src/models/CustomType/Tab";
import { GroupSM } from "@slicemachine/core/build/src/models/Group";
import { SliceZone } from "@lib/models/common/CustomType/sliceZone";
import { SlicesSM } from "@slicemachine/core/build/src/models/Slices";

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
          if (field.key === groupId && field.value.type === WidgetTypes.Group) {
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
      sliceZone: SliceZone.createEmpty(key),
    };
  },
  deleteSliceZone(tab: TabSM): TabSM {
    return {
      ...tab,
      sliceZone: undefined,
    };
  },

  organiseFields(tabSM: TabSM) {
    const { fields, groups } = tabSM.value.reduce<OrganisedFields>(
      (acc: OrganisedFields, current: { key: string; value: TabField }) => {
        switch (current.value.type) {
          case WidgetTypes.UID:
            return acc;
          case WidgetTypes.Group:
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
