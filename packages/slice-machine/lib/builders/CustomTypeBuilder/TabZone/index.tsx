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
import { AsArray } from "@models/common/widgets/Group/type";
import { SliceZoneAsArray } from "@models/common/CustomType/sliceZone";
import { Field } from "@lib/models/common/CustomType/fields";
import { Widget } from "@models/common/widgets/Widget";
import { AnyObjectSchema } from "yup";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import {useSelector} from "react-redux";
import {SliceMachineStoreType} from "@src/redux/type";
import {selectCurrentCustomType, selectCurrentMockConfig, selectCurrentPoolOfFields} from "@src/modules/customType";

interface TabZoneProps {
  customTypeActions: UseCustomTypeActionsReturnType;
  tabId: string;
  sliceZone: SliceZoneAsArray | null;
  fields: AsArray;
}

const TabZone: React.FC<TabZoneProps> = ({
  customTypeActions,
  tabId,
  fields,
  sliceZone,
}) => {
  const {
    deleteCustomTypeField,
    addCustomTypeField,
    reorderCustomTypeField,
    replaceCustomTypeField,
    createSliceZone,
    deleteCustomTypeSharedSlice,
    replaceCustomTypeSharedSlice,
    updateWidgetMockConfig,
    deleteWidgetMockConfig
  } = useSliceMachineActions()

  const { currentCustomType, mockConfig, poolOfFields } = useSelector((store: SliceMachineStoreType) => ({
    currentCustomType: selectCurrentCustomType(store),
    mockConfig: selectCurrentMockConfig(store),
    poolOfFields: selectCurrentPoolOfFields(store)
  }))

  if (!currentCustomType || !mockConfig || ! poolOfFields) {
    return null;
  }

  const onDeleteItem = (fieldId: string) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
    customTypeActions.deleteWidgetMockConfig(mockConfig, fieldId);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
    deleteWidgetMockConfig(mockConfig, fieldId)
    customTypeActions.deleteField(tabId, fieldId);
    deleteCustomTypeField(tabId, fieldId);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getFieldMockConfig = ({ apiId }: { apiId: string }): any => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
    return CustomTypeMockConfig.getFieldMockConfig(mockConfig, apiId);
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
    addCustomTypeField(tabId, id, widget.create(friendlyName));
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
    reorderCustomTypeField(
      tabId,
      result.source.index,
      result.destination.index
    )
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
        mockConfig,
        previousKey,
        newKey,
        mockValue
      );
      updateWidgetMockConfig(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        mockConfig,
        previousKey,
        newKey,
        mockValue)
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      customTypeActions.deleteWidgetMockConfig(mockConfig, newKey);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      deleteWidgetMockConfig(mockConfig, newKey)
    }
    customTypeActions.replaceField(tabId, previousKey, newKey, value);
    replaceCustomTypeField(tabId, previousKey, newKey, value);
  };

  const onCreateSliceZone = () => {
    customTypeActions.createSliceZone(tabId);
    createSliceZone(tabId);
  };

  const onSelectSharedSlices = (keys: string[], preserve: string[] = []) => {
    customTypeActions.replaceSharedSlice(tabId, keys, preserve);
    replaceCustomTypeSharedSlice(tabId, keys, preserve);
  };

  const onRemoveSharedSlice = (sliceId: string) => {
    customTypeActions.deleteSharedSlice(tabId, sliceId);
    deleteCustomTypeSharedSlice(tabId, sliceId);
  };

  return (
    <>
      <Zone
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        tabId={tabId}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        mockConfig={mockConfig}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
        store={customTypeActions}
        title="Static Zone"
        dataTip={""}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        fields={fields}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        poolOfFieldsToCheck={poolOfFields}
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
