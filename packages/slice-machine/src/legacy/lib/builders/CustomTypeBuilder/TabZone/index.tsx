import { Box, ProgressCircle } from "@prismicio/editor-ui";
import {
  Group,
  NestableWidget,
  UID,
} from "@prismicio/types-internal/lib/customtypes";
import { FC, Suspense } from "react";
import type { DropResult } from "react-beautiful-dnd";
import { flushSync } from "react-dom";
import { toast } from "react-toastify";

import { List } from "@/components/List";
import {
  addField,
  createSectionSliceZone,
  deleteField,
  deleteSectionSliceZone,
  deleteSliceZoneSlice,
  reorderField,
  updateField,
} from "@/domain/customType";
import { ErrorBoundary } from "@/ErrorBoundary";
import { useCustomTypeState } from "@/features/customTypes/customTypesBuilder/CustomTypeProvider";
import {
  CustomTypes,
  type TabField,
  type TabFields,
  TabFieldsModel,
  TabSM,
} from "@/legacy/lib/models/common/CustomType";
import { Widgets } from "@/legacy/lib/models/common/widgets";
import type { AnyWidget } from "@/legacy/lib/models/common/widgets/Widget";
import {
  ensureDnDDestination,
  ensureWidgetTypeExistence,
} from "@/legacy/lib/utils";
import { transformKeyAccessor } from "@/legacy/lib/utils/str";
import { trackFieldAdded } from "@/utils/tracking/trackFieldAdded";

import EditModal from "../../common/EditModal";
import Zone from "../../common/Zone";
import SliceZone from "../SliceZone";

const widgetsArray = [
  Widgets.UID,
  Widgets.Image,
  Widgets.Text,
  Widgets.StructuredText,
  Widgets.Link,
  Widgets.Select,
  Widgets.Boolean,
  Widgets.Number,
  Widgets.Color,
  Widgets.Date,
  Widgets.Embed,
  Widgets.Timestamp,
  Widgets.GeoPoint,
  Widgets.ContentRelationship,
  Widgets.LinkToMedia,
  Widgets.Group,
  Widgets.NestedGroup,
];

interface TabZoneProps {
  tabId: string;
}

type PoolOfFields = ReadonlyArray<{ key: string; value: TabField }>;

type OnSaveFieldProps = {
  apiId: string;
  newKey: string;
  value: TabField;
  isNewGroupField?: boolean;
};

const TabZone: FC<TabZoneProps> = ({ tabId }) => {
  const { customType, setCustomType } = useCustomTypeState();
  const customTypeSM = CustomTypes.toSM(customType);

  const sliceZone = customTypeSM.tabs.find((tab) => tab.key === tabId)
    ?.sliceZone;

  const allFields: TabFields =
    customTypeSM.tabs.find((tab) => tab.key === tabId)?.value ?? [];
  // the uid field is moved to the top of the editor on repeatable pages
  const fields =
    customTypeSM.format === "page" && customTypeSM.repeatable
      ? allFields.filter((field) => field.key !== "uid")
      : allFields;

  const poolOfFields = customTypeSM.tabs.reduce<PoolOfFields>(
    (acc: PoolOfFields, curr: TabSM) => {
      return [...acc, ...curr.value];
    },
    [],
  );

  const onDeleteItem = (fieldId: string) => {
    const newCustomType = deleteField({
      customType,
      fieldId,
      sectionId: tabId,
    });

    setCustomType(newCustomType);
  };

  const onSaveNewField = ({ apiId: id, value: field }: OnSaveFieldProps) => {
    const label = field.config?.label;
    if (ensureWidgetTypeExistence(Widgets, field.type) || label == null) return;

    if (
      field.type === "Range" ||
      field.type === "IntegrationFields" ||
      field.type === "Separator"
    ) {
      throw new Error(`Unsupported Field Type: ${field.type}`);
    }

    const CurrentWidget: AnyWidget = Widgets[field.type];

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      CurrentWidget.schema.validateSync(field, { stripUnknown: false });
    } catch (error) {
      throw new Error(`Add field: Model is invalid for field "${field.type}".`);
    }

    const newField: NestableWidget | UID | Group = TabFieldsModel.fromSM(field);
    const newCustomType = addField({
      customType,
      newField,
      newFieldId: id,
      sectionId: tabId,
    });

    setCustomType(newCustomType, () => {
      toast.success(`${field.type === "Group" ? "Group" : "Field"} added`);
    });

    trackFieldAdded({ id, field: newField });
  };

  const onDragEnd = (result: DropResult) => {
    if (ensureDnDDestination(result)) {
      return;
    }

    const { source, destination } = result;
    if (!destination) {
      return;
    }

    const newCustomType = reorderField({
      customType,
      sourceIndex: source.index,
      destinationIndex: destination.index,
      sectionId: tabId,
    });

    // When removing redux and replacing it by a simple useState, react-beautiful-dnd (that is deprecated library) was making the fields flickering on reorder.
    // The problem seems to come from the react non-synchronous way to handle our state update that didn't work well with the library.
    // It's a hack and since it's used on an old pure JavaScript code with a deprecated library it will be removed when updating the UI of the fields.
    flushSync(() => setCustomType(newCustomType));
  };

  const onSave = ({
    apiId: previousKey,
    newKey,
    value,
    isNewGroupField,
  }: OnSaveFieldProps) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    if (ensureWidgetTypeExistence(Widgets, value.type)) {
      return;
    }

    const newField: NestableWidget | UID | Group = TabFieldsModel.fromSM(value);
    const newCustomType = updateField({
      customType,
      previousFieldId: previousKey,
      newFieldId: newKey,
      newField,
      sectionId: tabId,
    });

    setCustomType(newCustomType, () => {
      if (isNewGroupField === true) {
        toast.success("Field added");
      }
    });
  };

  const onCreateOrSave = (props: OnSaveFieldProps) => {
    if (props.apiId === "") {
      return onSaveNewField({ ...props, apiId: props.newKey }); // create new
    }
    return onSave(props); // update existing
  };

  const onCreateSliceZone = () => {
    const newCustomType = createSectionSliceZone(customType, tabId);

    setCustomType(newCustomType);
  };

  const onDeleteSliceZone = () => {
    const newCustomType = deleteSectionSliceZone(customType, tabId);

    setCustomType(newCustomType);
  };

  const onRemoveSharedSlice = (sliceId: string) => {
    const newCustomType = deleteSliceZoneSlice({
      customType,
      sectionId: tabId,
      sliceId,
    });

    setCustomType(newCustomType);
  };

  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <Box padding={32}>
            <ProgressCircle />
          </Box>
        }
      >
        <List border={false} style={{ flexGrow: 1 }}>
          <Zone
            zoneType="customType"
            zoneTypeFormat={customType.format ?? "custom"}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            tabId={tabId}
            title="Static zone"
            dataTip={""}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            fields={fields}
            // @ts-expect-error propsType and typescript are incompatible on this type, we can remove the error when migrating the Zone component
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            poolOfFieldsToCheck={poolOfFields}
            showHints={true}
            EditModal={EditModal}
            widgetsArray={widgetsArray}
            onDeleteItem={onDeleteItem}
            onSave={onCreateOrSave}
            onDragEnd={onDragEnd}
            renderHintBase={({ item }) =>
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
              `data${transformKeyAccessor(item.key)}`
            }
            renderFieldAccessor={(key) =>
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
              `data${transformKeyAccessor(key)}`
            }
            testId="static-zone-content"
            isRepeatableCustomType={customType.repeatable}
          />

          <SliceZone
            customType={customTypeSM}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            tabId={tabId}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            sliceZone={sliceZone}
            onRemoveSharedSlice={onRemoveSharedSlice}
            onCreateSliceZone={onCreateSliceZone}
            onDeleteSliceZone={onDeleteSliceZone}
          />
        </List>
      </Suspense>
    </ErrorBoundary>
  );
};

export default TabZone;
