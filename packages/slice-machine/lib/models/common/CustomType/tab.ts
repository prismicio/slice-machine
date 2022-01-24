import { SliceZone, SliceZoneAsArray, sliceZoneType } from "./sliceZone";
import { Field, FieldType } from "./fields";
import { Group } from "./group";

import { AsArray, AsObject, GroupField } from "../widgets/Group/type";

export interface TabAsObject {
  key: string;
  value: AsObject;
}

export interface TabAsArray {
  key: string;
  value: AsArray;
  sliceZone: SliceZoneAsArray | null;
}

interface OrganisedFields {
  fields: ReadonlyArray<{ key: string; value: Field }>;
  groups: ReadonlyArray<{ key: string; value: GroupField<AsArray> }>;
  sliceZone?: SliceZone;
}

export const Tab = {
  init(id: string) {
    return { key: id, value: [], sliceZone: null };
  },
  toArray(key: string, tab: TabAsObject): TabAsArray {
    const maybeSliceZone = Object.entries(tab.value).find(
      ([, value]) => value.type === sliceZoneType
    );

    return {
      key,
      value: Object.entries(tab.value).reduce<AsArray>(
        (acc: AsArray, [fieldId, value]: [string, Field]) => {
          if (value.type === sliceZoneType) {
            return acc;
          }
          if (value.type === FieldType.Group) {
            return [
              ...acc,
              {
                key: fieldId,
                value: Group.toArray(value as GroupField<AsObject>),
              },
            ];
          }
          return [...acc, { key: fieldId, value }];
        },
        []
      ),
      sliceZone: maybeSliceZone
        ? SliceZone.toArray(maybeSliceZone[0], maybeSliceZone[1] as SliceZone)
        : null,
    };
  },
  toObject(tab: TabAsArray): TabAsObject {
    const tabValue = tab.value.reduce<AsObject>(
      (acc: AsObject, { key, value }: { key: string; value: Field }) => {
        if (value.type === FieldType.Group) {
          return {
            ...acc,
            [key]: Group.toObject(value as GroupField<AsArray>),
          };
        }
        return { ...acc, [key]: value };
      },
      {}
    );

    if (tab.sliceZone && tab.sliceZone.value?.length) {
      tabValue[tab.sliceZone.key] = SliceZone.toObject(tab.sliceZone);
    }
    return { key: tab.key, value: tabValue };
  },
  // eslint-disable-next-line @typescript-eslint/ban-types
  updateSliceZone(tab: TabAsArray): Function {
    return (mutate: (v: SliceZoneAsArray) => TabAsArray) => {
      return {
        ...tab,
        sliceZone: mutate(tab.sliceZone as SliceZoneAsArray),
      };
    };
  },
  updateGroup(tab: TabAsArray, groupId: string) {
    return (mutate: (v: GroupField<AsArray>) => Field): TabAsArray => {
      return {
        ...tab,
        value: tab.value.map((field) => {
          if (field.key === groupId) {
            return {
              key: groupId,
              value: mutate(field.value as GroupField<AsArray>),
            };
          }
          return field;
        }),
      };
    };
  },
  addWidget(tab: TabAsArray, id: string, widget: Field): TabAsArray {
    const elem =
      widget.type === FieldType.Group
        ? { key: id, value: widget as GroupField<AsArray> }
        : ({ key: id, value: widget } as { key: string; value: Field });

    return {
      ...tab,
      value: [...tab.value, elem],
    };
  },
  replaceWidget(
    tab: TabAsArray,
    previousKey: string,
    newKey: string,
    value: Field
  ): TabAsArray {
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
  reorderWidget(tab: TabAsArray, start: number, end: number): TabAsArray {
    type TabValue = { key: string; value: Field };
    const reorderedWidget: TabValue | undefined = tab.value[start];
    if (!reorderedWidget)
      throw new Error(`Unable to reorder the widget at index ${start}.`);

    const reorderedArea: AsArray = tab.value.reduce(
      (acc: AsArray, widget: TabValue, index: number) => {
        const elems = [widget, reorderedWidget];
        switch (index) {
          case start:
            return acc;
          case end:
            return [...acc, ...(end > start ? elems : elems.reverse())];
          default:
            return [...acc, widget];
        }
      },
      []
    );
    return {
      ...tab,
      value: reorderedArea,
    };
  },
  removeWidget(tab: TabAsArray, id: string): TabAsArray {
    const newTab = {
      ...tab,
      value: tab.value.filter((e) => e.key !== id),
    };
    return newTab;
  },
  createSliceZone(tab: TabAsArray, key: string): TabAsArray {
    return {
      ...tab,
      sliceZone: SliceZone.toArray(key, SliceZone.createEmpty()),
    };
  },
  deleteSliceZone(tab: TabAsArray): TabAsArray {
    return {
      ...tab,
      sliceZone: null,
    };
  },

  organiseFields(tab: TabAsObject) {
    const tabAsArray = Tab.toArray("", tab);
    const { fields, groups }: OrganisedFields =
      tabAsArray.value.reduce<OrganisedFields>(
        (
          acc: OrganisedFields,
          curr: { key: string; value: Field | GroupField<AsArray> }
        ) => {
          if (curr.value.type === sliceZoneType) {
            return acc;
          }
          if (curr.value.type === FieldType.UID) {
            return acc;
          }
          if (curr.value.type === FieldType.Group) {
            return {
              ...acc,
              groups: [
                ...acc.groups,
                { key: curr.key, value: curr.value as GroupField<AsArray> },
              ],
            };
          }
          return {
            ...acc,
            fields: [...acc.fields, curr],
          };
        },
        { fields: [], groups: [] }
      );
    return {
      fields,
      groups,
      sliceZone: tabAsArray.sliceZone,
    };
  },
};
