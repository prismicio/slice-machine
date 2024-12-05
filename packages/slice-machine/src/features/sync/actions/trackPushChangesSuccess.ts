import {
  FieldType,
  NestableWidget,
  UID,
} from "@prismicio/types-internal/lib/customtypes";

import { telemetry } from "@/apiClient";
import { countMissingScreenshots } from "@/domain/slice";
import { GroupSM } from "@/legacy/lib/models/common/Group";
import {
  ChangedCustomType,
  ChangedSlice,
  ModelStatus,
} from "@/legacy/lib/models/common/ModelStatus";

type TrackPushChangesSuccessArgs = {
  changedSlices: ReadonlyArray<ChangedSlice>;
  changedCustomTypes: ReadonlyArray<ChangedCustomType>;
  hasDeletedDocuments: boolean;
  startTime: number;
};

export function trackPushChangesSuccess(args: TrackPushChangesSuccessArgs) {
  const { startTime, hasDeletedDocuments, changedCustomTypes, changedSlices } =
    args;

  const customTypesStats = changedCustomTypes.reduce<{
    customTypesCreated: number;
    customTypesModified: number;
    customTypesDeleted: number;
  }>(
    (acc, customType) => {
      if (customType.status === ModelStatus.New)
        return {
          ...acc,
          customTypesCreated: acc.customTypesCreated + 1,
        };
      else if (customType.status === ModelStatus.Modified)
        return {
          ...acc,
          customTypesModified: acc.customTypesModified + 1,
        };
      else if (customType.status === ModelStatus.Deleted)
        return {
          ...acc,
          customTypesDeleted: acc.customTypesDeleted + 1,
        };
      else return acc;
    },
    {
      customTypesCreated: 0,
      customTypesModified: 0,
      customTypesDeleted: 0,
    },
  );

  const slicesStats = changedSlices.reduce<{
    slicesCreated: number;
    slicesModified: number;
    slicesDeleted: number;
  }>(
    (acc, slice) => {
      if (slice.status === ModelStatus.New)
        return {
          ...acc,
          slicesCreated: acc.slicesCreated + 1,
        };
      else if (slice.status === ModelStatus.Modified)
        return {
          ...acc,
          slicesModified: acc.slicesModified + 1,
        };
      else if (slice.status === ModelStatus.Deleted)
        return {
          ...acc,
          slicesDeleted: acc.slicesDeleted + 1,
        };
      else return acc;
    },
    {
      slicesCreated: 0,
      slicesModified: 0,
      slicesDeleted: 0,
    },
  );

  const total = changedSlices.length + changedCustomTypes.length;
  const missingScreenshots: number = changedSlices.reduce(
    (sum, sliceChange) => sum + countMissingScreenshots(sliceChange.slice),
    0,
  );
  const duration = Date.now() - startTime;

  void telemetry.track({
    event: "changes:pushed",
    ...customTypesStats,
    ...slicesStats,
    total: total,
    missingScreenshots,
    duration: duration,
    hasDeletedDocuments,
    _includeEnvironmentKind: true,
  });

  trackPushedGroups({ changedCustomTypes, changedSlices });
}

type TrackPushedGroupsArgs = {
  changedSlices: ReadonlyArray<ChangedSlice>;
  changedCustomTypes: ReadonlyArray<ChangedCustomType>;
};
type FieldsCount = {
  [key in FieldType]?: number;
};
type FieldStats = {
  isInStaticZone: boolean;
  isInSlice: boolean;
} & FieldsCount;

function trackPushedGroups(args: TrackPushedGroupsArgs) {
  const { changedCustomTypes, changedSlices } = args;

  const groupsInStaticZone = changedCustomTypes.reduce<FieldStats[]>(
    (acc, customType) => {
      if (customType.status !== ModelStatus.New) return acc;

      customType.customType.tabs.forEach((tab) => {
        const fieldsCount = countGroupFields(acc, tab.value, "custom-type");
        acc.push(...fieldsCount);
      });

      return acc;
    },
    [],
  );

  const groupsInSlices = changedSlices.reduce<FieldStats[]>((acc, slice) => {
    if (slice.status !== ModelStatus.New) return acc;

    slice.slice.model.variations.forEach((variation) => {
      const fieldsCount = countGroupFields(acc, variation.primary, "slice");
      acc.push(...fieldsCount);
    });

    return acc;
  }, []);
  [...groupsInSlices, ...groupsInStaticZone].forEach((group) => {
    void telemetry.track({
      event: "changes:group-pushed",
      ...group,
    });
  });
}

interface Field {
  key: string;
  value: GroupSM | UID | NestableWidget;
}
function countGroupFields<TField extends Field>(
  fieldStats: FieldStats[],
  fields: TField[] | undefined,
  groupParent: "custom-type" | "slice",
) {
  if (!fields) return fieldStats;

  const newFieldState = fieldStats.slice();

  fields.forEach((field) => {
    if (field.value.type === "Group" && field.value.config?.fields) {
      const fieldsCount: FieldsCount = {};
      field.value.config.fields.forEach(({ value: fieldValue }) => {
        const value = fieldsCount[fieldValue.type] ?? 0;
        fieldsCount[fieldValue.type] = value + 1;
      });

      newFieldState.push({
        isInStaticZone: groupParent === "custom-type",
        isInSlice: groupParent === "slice",
        ...fieldsCount,
      });
    }
  });

  return newFieldState;
}
