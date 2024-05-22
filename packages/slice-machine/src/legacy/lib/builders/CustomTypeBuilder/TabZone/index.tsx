import { Box, ProgressCircle } from "@prismicio/editor-ui";
import {
  Group,
  NestableWidget,
  UID,
} from "@prismicio/types-internal/lib/customtypes";
import { useRouter } from "next/router";
import { FC, Suspense } from "react";
import type { DropResult } from "react-beautiful-dnd";
import { flushSync } from "react-dom";
import type { AnyObjectSchema } from "yup";

import { telemetry } from "@/apiClient";
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
import ctBuilderArray from "@/legacy/lib/models/common/widgets/ctBuilderArray";
import type { AnyWidget } from "@/legacy/lib/models/common/widgets/Widget";
import {
  ensureDnDDestination,
  ensureWidgetTypeExistence,
} from "@/legacy/lib/utils";
import { transformKeyAccessor } from "@/legacy/lib/utils/str";
import { getContentTypeForTracking } from "@/utils/getContentTypeForTracking";

import * as Widgets from "../../../../lib/models/common/widgets/withGroup";
import EditModal from "../../common/EditModal";
import Zone from "../../common/Zone";
import SliceZone from "../SliceZone";

interface TabZoneProps {
  tabId: string;
}

type PoolOfFields = ReadonlyArray<{ key: string; value: TabField }>;

const TabZone: FC<TabZoneProps> = ({ tabId }) => {
  const { customType, setCustomType } = useCustomTypeState();
  const customTypeSM = CustomTypes.toSM(customType);
  const sliceZone = customTypeSM.tabs.find((tab) => tab.key === tabId)
    ?.sliceZone;
  const fields: TabFields =
    customTypeSM.tabs.find((tab) => tab.key === tabId)?.value ?? [];

  const { query } = useRouter();
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

  const onSaveNewField = ({
    id,
    label,
    widgetTypeName,
  }: {
    id: string;
    label: string;
    widgetTypeName: keyof typeof Widgets;
  }) => {
    if (ensureWidgetTypeExistence(Widgets, widgetTypeName)) {
      return;
    }
    // @ts-expect-error We have to create a widget map or a service instead of using export name
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const widget: Widget<TabField, AnyObjectSchema> = Widgets[widgetTypeName];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
    const field: TabField = widget.create(label);

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

    setCustomType(newCustomType);

    void telemetry.track({
      event: "field:added",
      id,
      name: label,
      type: newField.type,
      isInAGroup: false,
      contentType: getContentTypeForTracking(window.location.pathname),
    });
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
  }: {
    apiId: string;
    newKey: string;
    value: TabField;
  }) => {
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

    setCustomType(newCustomType);
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
          {query.newPageType === undefined ? (
            <Zone
              zoneType="customType"
              zoneTypeFormat={customType.format ?? "custom"}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              tabId={tabId}
              title="Static Zone"
              dataTip={""}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              fields={fields}
              // @ts-expect-error propsType and typescript are incompatible on this type, we can remove the error when migrating the Zone component
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
              poolOfFieldsToCheck={poolOfFields}
              showHints={true}
              EditModal={EditModal}
              widgetsArray={ctBuilderArray}
              onDeleteItem={onDeleteItem}
              onSave={onSave}
              onSaveNewField={onSaveNewField}
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
              emptyStateActionTestId="add-Static-field"
            />
          ) : undefined}

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
