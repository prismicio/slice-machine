import React from "react";
import * as Widgets from "@lib/models/common/widgets/withGroup";
import EditModal from "../../common/EditModal";

import { ensureDnDDestination, ensureWidgetTypeExistence } from "@lib/utils";

import { transformKeyAccessor } from "@utils/str";

import Zone from "../../common/Zone";

import ctBuilderArray from "@lib/models/common/widgets/ctBuilderArray";
import { CustomTypeMockConfig } from "@lib/models/common/MockConfig";

import SliceZone from "../SliceZone";

import { createFriendlyFieldNameWithId } from "@src/utils/fieldNameCreator";
import { UseCustomTypeActionsReturnType } from "@src/models/customType/useCustomTypeActions";
import { CustomTypeState } from "@models/ui/CustomTypeState";
import { AsArray } from "@models/common/widgets/Group/type";
import { SliceZoneAsArray } from "@models/common/CustomType/sliceZone";
import { Field } from "@lib/models/common/CustomType/fields";
import { Widget } from "@models/common/widgets/Widget";
import { AnyObjectSchema } from "yup";

interface TabZoneProps {
  Model: CustomTypeState;
  customTypeActions: UseCustomTypeActionsReturnType;
  tabId: string;
  sliceZone: SliceZoneAsArray | null;
  fields: AsArray;
}

const TabZone: React.FC<TabZoneProps> = ({
  Model,
  customTypeActions,
  tabId,
  fields,
  sliceZone,
}) => {
  const onDeleteItem = (fieldId: string) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
    customTypeActions.deleteWidgetMockConfig(Model.mockConfig, fieldId);
    customTypeActions.deleteField(tabId, fieldId);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getFieldMockConfig = ({ apiId }: { apiId: string }): any => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
    return CustomTypeMockConfig.getFieldMockConfig(Model.mockConfig, apiId);
  };

  const onSaveNewField = ({
    id,
    widgetTypeName,
  }: {
    id: string;
    widgetTypeName: string;
  }) => {
    if (ensureWidgetTypeExistence(Widgets, widgetTypeName)) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const widget: Widget<Field, AnyObjectSchema> = Widgets[widgetTypeName];
    const friendlyName = createFriendlyFieldNameWithId(id);
    customTypeActions.addField(tabId, id, widget.create(friendlyName));
  };

  const onDragEnd = (result: {
    destination?: { droppableId: string; index: number };
    source: { index: number; droppableId: string };
  }) => {
    if (ensureDnDDestination(result)) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    customTypeActions.reorderField(
      tabId,
      result.source.index,
      result.destination.index
    );
  };

  const onSave = ({
    apiId: previousKey,
    newKey,
    value,
    mockValue,
  }: {
    apiId: string;
    newKey: string;
    value: Field;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockValue: any;
  }) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    if (ensureWidgetTypeExistence(Widgets, value.type)) {
      return;
    }
    if (mockValue) {
      customTypeActions.updateWidgetMockConfig(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        Model.mockConfig,
        previousKey,
        newKey,
        mockValue
      );
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      customTypeActions.deleteWidgetMockConfig(Model.mockConfig, newKey);
    }
    customTypeActions.replaceField(tabId, previousKey, newKey, value);
  };

  const onCreateSliceZone = () => {
    customTypeActions.createSliceZone(tabId);
  };

  const onSelectSharedSlices = (keys: string[], preserve: string[] = []) => {
    customTypeActions.replaceSharedSlice(tabId, keys, preserve);
  };

  const onRemoveSharedSlice = (sliceId: string) => {
    customTypeActions.deleteSharedSlice(tabId, sliceId);
  };

  return (
    <>
      <Zone
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        tabId={tabId}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        Model={Model}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
        store={customTypeActions}
        title="Static Zone"
        dataTip={""}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        fields={fields}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        poolOfFieldsToCheck={Model.poolOfFieldsToCheck}
        showHints={true}
        EditModal={EditModal}
        widgetsArray={ctBuilderArray}
        getFieldMockConfig={getFieldMockConfig}
        onDeleteItem={onDeleteItem}
        onSave={onSave}
        onSaveNewField={onSaveNewField}
        onDragEnd={onDragEnd}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        renderHintBase={({ item }) => `data${transformKeyAccessor(item.key)}`}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
        renderFieldAccessor={(key) => `data${transformKeyAccessor(key)}`}
      />
      <SliceZone
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        tabId={tabId}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        sliceZone={sliceZone}
        onRemoveSharedSlice={onRemoveSharedSlice}
        onCreateSliceZone={onCreateSliceZone}
        onSelectSharedSlices={onSelectSharedSlices}
      />
    </>
  );
};

export default TabZone;
