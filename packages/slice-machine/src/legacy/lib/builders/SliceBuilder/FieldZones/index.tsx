import {
  Box,
  Dialog,
  DialogActionButton,
  DialogActions,
  DialogCancelButton,
  DialogContent,
  DialogHeader,
} from "@prismicio/editor-ui";
import {
  GroupFieldType,
  type SlicePrimaryWidget,
} from "@prismicio/types-internal/lib/customtypes";
import { FC, useState } from "react";
import { DropResult } from "react-beautiful-dnd";
import { flushSync } from "react-dom";
import { toast } from "react-toastify";

import { List } from "@/components/List";
import {
  addField,
  deleteField,
  deleteRepeatableZone,
  reorderField,
  updateField,
} from "@/domain/slice";
import { useSliceState } from "@/features/slices/sliceBuilder/SliceBuilderProvider";
import EditModal from "@/legacy/lib/builders/common/EditModal";
import Zone from "@/legacy/lib/builders/common/Zone";
import { Groups } from "@/legacy/lib/models/common/Group";
import {
  SlicePrimaryFieldSM,
  WidgetsArea,
} from "@/legacy/lib/models/common/Slice";
import { Widgets } from "@/legacy/lib/models/common/widgets";
import { ensureDnDDestination } from "@/legacy/lib/utils";
import { transformKeyAccessor } from "@/legacy/lib/utils/str";
import { trackFieldAdded } from "@/utils/tracking/trackFieldAdded";

const dataTipText = ` The non-repeatable zone
  is for fields<br/> that should appear once, like a<br/>
  section title.
`;
const dataTipText2 = `The repeatable zone is for a group<br/>
  of fields that you want to be able to repeat an<br/>
  indeterminate number of times, like FAQs`;

const itemsWidgetsArray = [
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
];

const primaryWidgetsArray = [Widgets.Group, ...itemsWidgetsArray];

type OnSaveFieldProps = {
  apiId: string;
  newKey: string;
  value: SlicePrimaryFieldSM;
  isNewGroupField?: boolean;
};

const FieldZones: FC = () => {
  const { slice, setSlice, variation } = useSliceState();
  const [
    isDeleteRepeatableZoneDialogOpen,
    setIsDeleteRepeatableZoneDialogOpen,
  ] = useState(false);

  // We won't show the Repeatable Zone if no items are configured.
  const hasItems = Boolean(
    variation.items && Object.keys(variation.items).length > 0,
  );

  const _onDeleteItem = (widgetArea: WidgetsArea) => (key: string) => {
    if (
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

  const _onSave = (
    widgetArea: WidgetsArea,
    { apiId: previousKey, newKey, value, isNewGroupField }: OnSaveFieldProps,
  ) => {
    const newSlice = updateField({
      slice,
      variationId: variation.id,
      widgetArea,
      previousFieldId: previousKey,
      newFieldId: newKey,
      newField: value as SlicePrimaryWidget,
    });

    setSlice(newSlice, () => {
      if (isNewGroupField === true) {
        toast.success("Group added");
      }
    });
  };

  const _onSaveNewField = (
    widgetArea: WidgetsArea,
    { apiId: id, value: newField }: OnSaveFieldProps,
  ) => {
    const { type: widgetTypeName } = newField;

    const widget = primaryWidgetsArray.find(
      (sliceBuilderWidget) =>
        sliceBuilderWidget.CUSTOM_NAME === widgetTypeName ||
        sliceBuilderWidget.TYPE_NAME === widgetTypeName,
    );
    if (!widget) {
      throw new Error(`Unsupported Field Type: ${widgetTypeName}`);
    }

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
      newField:
        newField.type === GroupFieldType ? Groups.fromSM(newField) : newField,
    });

    setSlice(newSlice, () => {
      toast.success(`${widgetTypeName === "Group" ? "Group" : "Field"} added`);
    });

    trackFieldAdded({ id, field: newField });
  };

  const _onCreateOrSave = (widgetArea: WidgetsArea) => {
    return (props: OnSaveFieldProps) => {
      if (props.apiId === "") {
        return _onSaveNewField(widgetArea, { ...props, apiId: props.newKey }); // create new
      }
      return _onSave(widgetArea, props); // update existing
    };
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
        widgetsArray={primaryWidgetsArray}
        onDeleteItem={_onDeleteItem(WidgetsArea.Primary)}
        onSave={_onCreateOrSave(WidgetsArea.Primary)}
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
        emptyStateHeading={undefined}
      />
      {hasItems ? (
        <Zone
          zoneType="slice"
          zoneTypeFormat={undefined}
          tabId={undefined}
          isRepeatable
          title="Repeatable Zone"
          dataTip={dataTipText2}
          widgetsArray={itemsWidgetsArray}
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          fields={variation.items}
          EditModal={EditModal}
          onDeleteItem={_onDeleteItem(WidgetsArea.Items)}
          onSave={_onCreateOrSave(WidgetsArea.Items)}
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
          emptyStateHeading="No fields"
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
            {slice.model.variations.length > 1 ? (
              <>
                <strong>
                  This action will permanently remove the repeatable zone from
                  the {slice.model.name} slice {variation.name} variation.
                </strong>
                <div>
                  Other variations will be left untouched. To reimplement
                  repeatable fields later, use a group field instead of the
                  repeatable zone.
                </div>
              </>
            ) : (
              <>
                <strong>
                  This action will permanently remove the repeatable zone from
                  the {slice.model.name}.
                </strong>
                <div>
                  To reimplement repeatable fields later, use a group field
                  instead of the repeatable zone.
                </div>
              </>
            )}
          </Box>
          <DialogActions>
            <DialogCancelButton />
            <DialogActionButton color="tomato" onClick={onDeleteRepeatableZone}>
              Delete
            </DialogActionButton>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </List>
  );
};

export default FieldZones;
