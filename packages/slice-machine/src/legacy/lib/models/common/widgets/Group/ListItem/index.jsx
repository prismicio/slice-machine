import { GroupFieldType } from "@prismicio/types-internal/lib/customtypes/widgets";
import { Fragment, useState } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { flushSync } from "react-dom";
import { Box } from "theme-ui";

import { telemetry } from "@/apiClient";
import { fields as allFields } from "@/domain/fields";
import {
  addFieldToGroup,
  deleteFieldFromGroup,
  reorderFieldInGroup,
  updateFieldInGroup,
} from "@/domain/group";
import { AddFieldDropdown } from "@/features/builder/AddFieldDropdown";
import ListItem from "@/legacy/components/ListItem";
import EditModal from "@/legacy/lib/builders/common/EditModal";
import Hint from "@/legacy/lib/builders/common/Zone/Card/components/Hints";
import { findWidgetByConfigOrType } from "@/legacy/lib/builders/utils";
import { Groups } from "@/legacy/lib/models/common/Group";
import { ensureDnDDestination } from "@/legacy/lib/utils";
import { transformKeyAccessor } from "@/legacy/lib/utils/str";
import { getContentTypeForTracking } from "@/utils/tracking/getContentTypeForTracking";
import { trackFieldAdded } from "@/utils/tracking/trackFieldAdded";

/* eslint-disable */
export const CustomListItem = ({
  tabId,
  widget,
  Widgets,
  widgetsArray,
  hintBase,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  parentSnapshot,
  showHints,
  isRepeatable,
  item: groupItem,
  draggableId,
  saveItem,
  HintElement,
  ...rest
}) => {
  const [editModalData, setEditModalData] = useState({ isOpen: false });

  const onSelectFieldType = (widgetTypeName) => {
    /** `widgetTypeName` might have less keys than `Widgets`, but we lost track 
    of the types because the `widgetsArray` is not typed and is also filtered into 
    `widgetsArrayWithCondUid`. Although, it's safe to use it to index the `Widgets` 
    as long as `widgetsArrayWithCondUid` is a subset of `widgetsArray`.*/
    const field = Widgets[widgetTypeName].create("");
    setEditModalData({ isOpen: true, field: ["", field] });
  };

  const closeEditModal = () => {
    setEditModalData({ isOpen: false });
  };

  const onSaveNewField = ({ apiId: id, value: newField }) => {
    const label = newField.config?.label;
    const newGroupValue = addFieldToGroup({
      group: Groups.fromSM(groupItem.value),
      fieldId: id,
      field: newField,
    });

    saveItem({
      apiId: groupItem.key,
      newKey: groupItem.key,
      value: Groups.toSM(newGroupValue),
      isNewGroupField: true,
    });

    trackFieldAdded({ id, field: newField, isInAGroup: true });
  };

  const onSaveField = ({ apiId: previousKey, newKey, value }) => {
    const newGroupValue = updateFieldInGroup({
      group: Groups.fromSM(groupItem.value),
      previousFieldId: previousKey,
      newFieldId: newKey,
      field: value.type === GroupFieldType ? Groups.fromSM(value) : value,
    });

    saveItem({
      apiId: groupItem.key,
      newKey: groupItem.key,
      value: Groups.toSM(newGroupValue),
    });
  };

  const onCreateOrSave = (props) => {
    if (props.apiId === "") {
      return onSaveNewField({ ...props, apiId: props.newKey }); // create new
    }
    return onSaveField(props); // update existing
  };

  const onDragEnd = (result) => {
    if (ensureDnDDestination(result)) {
      return;
    }

    const { source, destination } = result;
    if (!destination) {
      return;
    }

    const { index: sourceIndex } = source;
    const { index: destinationIndex } = destination;

    const newGroupValue = reorderFieldInGroup({
      group: Groups.fromSM(groupItem.value),
      sourceIndex,
      destinationIndex,
    });

    // When removing redux and replacing it by a simple useState, react-beautiful-dnd (that is deprecated library) was making the fields flickering on reorder.
    // The problem seems to come from the react non-synchronous way to handle our state update that didn't work well with the library.
    // It's a hack and since it's used on an old pure JavaScript code with a deprecated library it will be removed when updating the UI of the fields.
    flushSync(() => {
      saveItem({
        apiId: groupItem.key,
        newKey: groupItem.key,
        value: Groups.toSM(newGroupValue),
      });
    });
  };

  const onDeleteItem = (key) => {
    const newGroupValue = deleteFieldFromGroup({
      group: Groups.fromSM(groupItem.value),
      fieldId: key,
    });

    saveItem({
      apiId: groupItem.key,
      newKey: groupItem.key,
      value: Groups.toSM(newGroupValue),
    });
  };

  /** @param {[string, import("@prismicio/types-internal/lib/customtypes").NestableWidget]} field */
  const enterEditMode = (field) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    setEditModalData({ isOpen: true, field });

    const [id, model] = field;
    void telemetry.track({
      event: "field:settings-opened",
      id,
      name: model.config.label,
      type: model.type,
      isInAGroup: true,
      contentType: getContentTypeForTracking(window.location.pathname),
    });
  };

  return (
    <Fragment>
      <ListItem
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        item={groupItem}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        widget={widget}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        draggableId={draggableId}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unused-vars, @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
        {...rest}
        HintElement={HintElement}
        CustomEditElements={[
          <AddFieldDropdown
            key="add-field-dropdown"
            onSelectField={onSelectFieldType}
            fields={widgetsArray.filter(Boolean).map((widget) => {
              const { TYPE_NAME, CUSTOM_NAME } = widget;

              const field = allFields.find(
                (f) =>
                  f.type === TYPE_NAME &&
                  (CUSTOM_NAME === undefined || f.variant === CUSTOM_NAME),
              );

              if (!field) {
                throw new Error(
                  `Field not found for widget: ${TYPE_NAME} - ${CUSTOM_NAME}`,
                );
              }

              return field;
            })}
          />,
        ]}
        children={
          <Box sx={{ ml: 4 }}>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/restrict-template-expressions, @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
                droppableId={`${tabId}-${groupItem.key}-zone`}
              >
                {(provided) => (
                  <ul ref={provided.innerRef} {...provided.droppableProps}>
                    {
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                      groupItem.value.config.fields.map((item, index) => {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        const {
                          value: { config, type },
                        } = item;
                        const widget = findWidgetByConfigOrType(
                          Widgets,
                          config,
                          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                          type,
                        );
                        if (!widget) {
                          return null;
                        }

                        const props = {
                          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/restrict-template-expressions, @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
                          item,
                          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                          index,
                          widget,
                          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                          key: item.key,
                          enterEditMode,
                          deleteItem: onDeleteItem,
                          saveItem: onSaveField,
                          showHints,
                          renderFieldAccessor: (key) =>
                            `item${transformKeyAccessor(item.key)}`,
                          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/restrict-template-expressions
                          draggableId: `group-${groupItem.key}-${item.key}-${index}`,
                          testId: `list-item-group-${groupItem.key}-${item.key}`,
                        };

                        const HintElement = (
                          <Hint
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment
                            item={item}
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                            show={showHints}
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                            isRepeatable={isRepeatable}
                            renderHintBase={({ item }) =>
                              // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
                              `${hintBase}${transformKeyAccessor(item.key)}`
                            }
                            hintItemName={widget.hintItemName}
                            Widgets={Widgets}
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                            typeName={widget.CUSTOM_NAME || widget.TYPE_NAME}
                          />
                        );

                        if (widget.CustomListItem) {
                          const { CustomListItem } = widget;
                          return (
                            <CustomListItem
                              {...props}
                              HintElement={HintElement}
                            />
                          );
                        }

                        return (
                          <ListItem {...props} HintElement={HintElement} />
                        );
                      })
                    }
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </DragDropContext>
          </Box>
        }
      />
      <EditModal
        data={editModalData}
        close={closeEditModal}
        onSave={onCreateOrSave}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        fields={groupItem.value.config.fields}
      />
    </Fragment>
  );
};
/* eslint-enable */
