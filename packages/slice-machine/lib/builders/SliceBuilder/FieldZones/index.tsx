import { FC, useState } from "react";
import { flushSync } from "react-dom";
import { DropResult } from "react-beautiful-dnd";
import {
  FieldType,
  SlicePrimaryWidget,
} from "@prismicio/types-internal/lib/customtypes";
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
} from "@prismicio/editor-ui";

import { ensureDnDDestination } from "@lib/utils";
import { transformKeyAccessor } from "@utils/str";
import sliceBuilderWidgetsArray from "@lib/models/common/widgets/sliceBuilderArray";
import { List } from "@src/components/List";
import { WidgetsArea } from "@lib/models/common/Slice";
import { useSliceState } from "@src/features/slices/sliceBuilder/SliceBuilderProvider";
import {
  addField,
  deleteField,
  deleteRepeatableZone,
  reorderField,
  updateField,
} from "@src/domain/slice";
import Zone from "@lib/builders/common/Zone";
import EditModal from "@lib/builders/common/EditModal";
import { telemetry } from "@src/apiClient";
import { useGroupsInSlicesExperiment } from "@src/features/slices/sliceBuilder/useGroupsInSlicesExperiment";

const dataTipText = ` The non-repeatable zone
  is for fields<br/> that should appear once, like a<br/>
  section title.
`;
const dataTipText2 = `The repeatable zone is for a group<br/>
  of fields that you want to be able to repeat an<br/>
  indeterminate number of times, like FAQs`;

const FieldZones: FC = () => {
  const { slice, setSlice, variation } = useSliceState();
  const [
    isDeleteRepeatableZoneDialogOpen,
    setIsDeleteRepeatableZoneDialogOpen,
  ] = useState(false);
  const groupsInSlicesExperiment = useGroupsInSlicesExperiment();

  // We won't show the Repeatable Zone if no items are configured.
  const hasItems = Boolean(
    variation.items && Object.keys(variation.items).length > 0,
  );

  const _onDeleteItem = (widgetArea: WidgetsArea) => (key: string) => {
    if (
      groupsInSlicesExperiment.eligible &&
      widgetArea === WidgetsArea.Items &&
      variation.items &&
      Object.keys(variation.items).length <= 1
    ) {
      setIsDeleteRepeatableZoneDialogOpen(true);
      return;
    }

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
      const widget = sliceBuilderWidgetsArray.find(
        (sliceBuilderWidget) =>
          sliceBuilderWidget.CUSTOM_NAME === widgetTypeName ||
          sliceBuilderWidget.TYPE_NAME === widgetTypeName,
      );
      if (!widget) {
        throw new Error(`Unsupported Field Type: ${widgetTypeName}`);
      }

      const newField = widget.create(label) as SlicePrimaryWidget;

      try {
        widget.schema.validateSync(newField, { stripUnknown: false });
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

  const onDeleteRepeatableZone = () => {
    const newSlice = deleteRepeatableZone({ slice, variationId: variation.id });

    setSlice(newSlice);
    setIsDeleteRepeatableZoneDialogOpen(false);
  };

  const sliceBuilderWidgetsArrayWithoutGroups = sliceBuilderWidgetsArray.filter(
    (widget) => widget.TYPE_NAME !== "Group",
  );

  return (
    <List>
      <Zone
        zoneType="slice"
        zoneTypeFormat={undefined}
        tabId={undefined}
        title="Fields"
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
      {!groupsInSlicesExperiment.eligible || hasItems ? (
        <Zone
          zoneType="slice"
          zoneTypeFormat={undefined}
          tabId={undefined}
          isRepeatable
          title="Repeatable Zone"
          dataTip={dataTipText2}
          widgetsArray={sliceBuilderWidgetsArrayWithoutGroups}
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
      ) : null}
      <Dialog
        size="small"
        open={isDeleteRepeatableZoneDialogOpen}
        onOpenChange={(open) => setIsDeleteRepeatableZoneDialogOpen(open)}
      >
        <DialogHeader icon="delete" title="Delete field" />
        <DialogContent>
          <Box padding={24} gap={12} flexDirection="column">
            <strong>
              This action will permanently remove the Repeatable Zone from the{" "}
              {slice.model.name} slice.
            </strong>
            <div>
              If you need repeatable fields again, use a repeatable group field
              in place of the repeatable zone.
            </div>
          </Box>
          <DialogActions
            ok={{
              text: "Delete",
              color: "tomato",
              onClick: () => onDeleteRepeatableZone(),
            }}
            cancel={{ text: "Cancel" }}
          />
        </DialogContent>
      </Dialog>
    </List>
  );
};

export default FieldZones;
