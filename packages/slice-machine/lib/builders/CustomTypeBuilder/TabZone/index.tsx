import React from "react";
import * as Widgets from "../../../../lib/models/common/widgets/withGroup";
import EditModal from "../../common/EditModal";

import { ensureDnDDestination, ensureWidgetTypeExistence } from "@lib/utils";

import { transformKeyAccessor } from "@utils/str";

import Zone from "../../common/Zone";

import ctBuilderArray from "@lib/models/common/widgets/ctBuilderArray";
import { CustomTypeMockConfig } from "@lib/models/common/MockConfig";

import SliceZone from "../SliceZone";

import { Widget } from "../../../models/common/widgets/Widget";
import { AnyObjectSchema } from "yup";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import {
  selectCurrentCustomType,
  selectCurrentMockConfig,
  selectCurrentPoolOfFields,
} from "../../../../src/modules/selectedCustomType";
import { SlicesSM } from "@slicemachine/core/build/models/Slices";
import {
  TabField,
  TabFields,
} from "@slicemachine/core/build/models/CustomType";
import Tracker from "../../../../src/tracking/client";

interface TabZoneProps {
  tabId: string;
  sliceZone?: SlicesSM | null | undefined;
  fields: TabFields;
}

const TabZone: React.FC<TabZoneProps> = ({ tabId, fields, sliceZone }) => {
  const {
    deleteCustomTypeField,
    addCustomTypeField,
    reorderCustomTypeField,
    replaceCustomTypeField,
    createSliceZone,
    deleteCustomTypeSharedSlice,
    replaceCustomTypeSharedSlice,
    updateFieldMockConfig,
    deleteFieldMockConfig,
  } = useSliceMachineActions();

  const { currentCustomType, mockConfig, poolOfFields } = useSelector(
    (store: SliceMachineStoreType) => ({
      currentCustomType: selectCurrentCustomType(store),
      mockConfig: selectCurrentMockConfig(store),
      poolOfFields: selectCurrentPoolOfFields(store),
    })
  );

  if (!currentCustomType || !mockConfig || !poolOfFields) {
    return null;
  }

  const onDeleteItem = (fieldId: string) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
    deleteFieldMockConfig(mockConfig, fieldId);
    deleteCustomTypeField(tabId, fieldId);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getFieldMockConfig = ({ apiId }: { apiId: string }): any => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
    return CustomTypeMockConfig.getFieldMockConfig(mockConfig, apiId);
  };

  const onSaveNewField = ({
    id,
    label,
    widgetTypeName,
  }: {
    id: string;
    label: string;
    widgetTypeName: string;
  }) => {
    // @ts-expect-error We have to create a widget map or a service instead of using export name
    if (ensureWidgetTypeExistence(Widgets, widgetTypeName)) {
      return;
    }
    // @ts-expect-error We have to create a widget map or a service instead of using export name
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const widget: Widget<TabField, AnyObjectSchema> = Widgets[widgetTypeName];
    void Tracker.get().trackCustomTypeFieldAdded({
      fieldId: id,
      customTypeId: currentCustomType.id,
      type: widget.TYPE_NAME,
      zone: "static",
    });
    addCustomTypeField(tabId, id, widget.create(label));
  };

  const onDragEnd = (result: {
    destination?: { droppableId: string; index: number };
    source: { index: number; droppableId: string };
  }) => {
    if (ensureDnDDestination(result)) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    reorderCustomTypeField(
      tabId,
      result.source.index,
      // @ts-expect-error We have to change the typeGuard above to cast properly the "result" property
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
    value: TabField;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockValue: any;
  }) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    // @ts-expect-error We have to create a widget map or a service instead of using export name
    if (ensureWidgetTypeExistence(Widgets, value.type)) {
      return;
    }
    if (mockValue) {
      updateFieldMockConfig(mockConfig, previousKey, newKey, mockValue);
    } else {
      deleteFieldMockConfig(mockConfig, newKey);
    }
    replaceCustomTypeField(tabId, previousKey, newKey, value);
  };

  const onCreateSliceZone = () => {
    createSliceZone(tabId);
  };

  const onSelectSharedSlices = (keys: string[], preserve: string[] = []) => {
    void Tracker.get().trackCustomTypeSliceAdded({
      customTypeId: currentCustomType.id,
    });
    replaceCustomTypeSharedSlice(tabId, keys, preserve);
  };

  const onRemoveSharedSlice = (sliceId: string) => {
    deleteCustomTypeSharedSlice(tabId, sliceId);
  };

  return (
    <>
      <Zone
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        tabId={tabId}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        mockConfig={mockConfig}
        title="Static Zone"
        dataTip={""}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        fields={fields}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        // @ts-expect-error propsType and typescript are incompatible on this type, we can remove the error when migrating the Zone component
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
        dataCy="ct-static-zone"
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
