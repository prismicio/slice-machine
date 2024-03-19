import { FC } from "react";
import { flushSync } from "react-dom";
import { DropResult } from "react-beautiful-dnd";
import {
  FieldType,
  NestableWidget,
} from "@prismicio/types-internal/lib/customtypes";

import { ensureDnDDestination } from "@lib/utils";
import { transformKeyAccessor } from "@utils/str";
import * as Widgets from "@lib/models/common/widgets";
import sliceBuilderWidgetsArray from "@lib/models/common/widgets/sliceBuilderArray";
import { List } from "@src/components/List";
import { WidgetsArea } from "@lib/models/common/Slice";
import { useSliceState } from "@src/features/slices/sliceBuilder/SliceBuilderProvider";
import {
  addField,
  deleteField,
  reorderField,
  updateField,
} from "@src/domain/slice";
import Zone from "@lib/builders/common/Zone";
import EditModal from "@lib/builders/common/EditModal";
import { AnyWidget } from "@lib/models/common/widgets/Widget";
import { telemetry } from "@src/apiClient";

const dataTipText = ` The non-repeatable zone
  is for fields<br/> that should appear once, like a<br/>
  section title.
`;
const dataTipText2 = `The repeatable zone is for a group<br/>
  of fields that you want to be able to repeat an<br/>
  indeterminate number of times, like FAQs`;

const FieldZones: FC = () => {
  const { slice, setSlice, variation } = useSliceState();

  const _onDeleteItem = (widgetArea: WidgetsArea) => (key: string) => {
    const newSlice = deleteField({
      slice,
      variationId: variation.id,
      widgetArea,
      fieldId: key,
    });

    setSlice(newSlice);
  };

  const _onSave =
    (widgetArea: WidgetsArea) =>
    ({
      apiId: previousKey,
      newKey,
      value,
    }: {
      apiId: string;
      newKey: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      value: any;
    }) => {
      const newSlice = updateField({
        slice,
        variationId: variation.id,
        widgetArea,
        previousFieldId: previousKey,
        newFieldId: newKey,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        newField: value,
      });

      setSlice(newSlice);
    };

  const _onSaveNewField =
    (widgetArea: WidgetsArea) =>
    ({
      id,
      label,
      widgetTypeName,
    }: {
      id: string;
      label: string;
      widgetTypeName: FieldType;
    }) => {
      // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const widget = Widgets[widgetTypeName];
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (!widget) {
        console.log(
          `Could not find widget with type name "${widgetTypeName}". Please contact us!`,
        );
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const newField = widget.create(label) as NestableWidget;

      if (
        newField.type === "Range" ||
        newField.type === "IntegrationFields" ||
        newField.type === "Separator"
      ) {
        throw new Error(`Unsupported Field Type: ${newField.type}`);
      }

      try {
        const CurrentWidget: AnyWidget = Widgets[newField.type];
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        CurrentWidget.schema.validateSync(newField, { stripUnknown: false });
      } catch (error) {
        throw new Error(`Model is invalid for widget "${newField.type}".`);
      }

      const newSlice = addField({
        slice,
        variationId: variation.id,
        widgetArea,
        newFieldId: id,
        newField,
      });

      setSlice(newSlice);

      void telemetry.track({
        event: "field:added",
        id,
        name: label,
        type: widgetTypeName,
        isInAGroup: false,
        contentType: "slice",
      });
    };

  const _onDragEnd = (widgetArea: WidgetsArea) => (result: DropResult) => {
    if (ensureDnDDestination(result)) return;

    const { source, destination } = result;
    if (!destination) {
      return;
    }

    const newSlice = reorderField({
      slice,
      variationId: variation.id,
      widgetArea,
      sourceIndex: source.index,
      destinationIndex: destination.index,
    });

    // When removing redux and replacing it by a simple useState, react-beautiful-dnd (that is deprecated library) was making the fields flickering on reorder.
    // The problem seems to come from the react non-synchronous way to handle our state update that didn't work well with the library.
    // It's a hack and since it's used on an old pure JavaScript code with a deprecated library it will be removed when updating the UI of the fields.
    flushSync(() => setSlice(newSlice));
  };

  return (
    <List>
      <Zone
        zoneType="slice"
        zoneTypeFormat={undefined}
        tabId={undefined}
        title="Non-Repeatable Zone"
        dataTip={dataTipText}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        fields={variation.primary}
        EditModal={EditModal}
        widgetsArray={sliceBuilderWidgetsArray}
        onDeleteItem={_onDeleteItem(WidgetsArea.Primary)}
        onSave={_onSave(WidgetsArea.Primary)}
        onSaveNewField={_onSaveNewField(WidgetsArea.Primary)}
        onDragEnd={_onDragEnd(WidgetsArea.Primary)}
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        poolOfFieldsToCheck={variation.primary || []}
        renderHintBase={({ item }) =>
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
          `slice.primary${transformKeyAccessor(item.key)}`
        }
        renderFieldAccessor={(key) =>
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          `slice.primary${transformKeyAccessor(key)}`
        }
        testId="static-zone-content"
        isRepeatableCustomType={undefined}
      />
      <Zone
        zoneType="slice"
        zoneTypeFormat={undefined}
        tabId={undefined}
        isRepeatable
        title="Repeatable Zone"
        dataTip={dataTipText2}
        widgetsArray={sliceBuilderWidgetsArray}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        fields={variation.items}
        EditModal={EditModal}
        onDeleteItem={_onDeleteItem(WidgetsArea.Items)}
        onSave={_onSave(WidgetsArea.Items)}
        onSaveNewField={_onSaveNewField(WidgetsArea.Items)}
        onDragEnd={_onDragEnd(WidgetsArea.Items)}
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        poolOfFieldsToCheck={variation.items || []}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        renderHintBase={({ item }) => `item${transformKeyAccessor(item.key)}`}
        renderFieldAccessor={(key) =>
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          `slice.items[i]${transformKeyAccessor(key)}`
        }
        testId="slice-repeatable-zone"
        isRepeatableCustomType={undefined}
      />
    </List>
  );
};

export default FieldZones;
