import { Fragment, useState } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { flushSync } from "react-dom";
import { Box, Button } from "theme-ui";

import { telemetry } from "@/apiClient";
import {
  addFieldToGroup,
  deleteFieldFromGroup,
  reorderFieldInGroup,
  updateFieldInGroup,
} from "@/domain/group";
import ListItem from "@/legacy/components/ListItem";
import EditModal from "@/legacy/lib/builders/common/EditModal";
import SelectFieldTypeModal from "@/legacy/lib/builders/common/SelectFieldTypeModal";
import Hint from "@/legacy/lib/builders/common/Zone/Card/components/Hints";
import NewField from "@/legacy/lib/builders/common/Zone/Card/components/NewField";
import { findWidgetByConfigOrType } from "@/legacy/lib/builders/utils";
import { Groups } from "@/legacy/lib/models/common/Group";
import * as Widgets from "@/legacy/lib/models/common/widgets";
import groupBuilderWidgetsArray from "@/legacy/lib/models/common/widgets/groupBuilderArray";
import { ensureDnDDestination } from "@/legacy/lib/utils";
import { transformKeyAccessor } from "@/legacy/lib/utils/str";
import { getContentTypeForTracking } from "@/utils/getContentTypeForTracking";

/* eslint-disable */
const CustomListItem = ({
  tabId,
  widget,
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
  const [selectMode, setSelectMode] = useState(false);
  const [newFieldData, setNewFieldData] = useState(null);
  const [editModalData, setEditModalData] = useState({ isOpen: false });

  const onSelectFieldType = (widgetTypeName) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    setNewFieldData({ widgetTypeName });
    setSelectMode(false);
  };

  const onCancelNewField = () => {
    setNewFieldData(null);
  };

  const closeEditModal = () => {
    setEditModalData({ isOpen: false });
  };

  const onSaveNewField = ({ id, label, widgetTypeName }) => {
    const widget = Widgets[widgetTypeName];
    const newField = widget.create(label);

    const newGroupValue = addFieldToGroup({
      group: Groups.fromSM(groupItem.value),
      fieldId: id,
      field: newField,
    });

    saveItem({
      apiId: groupItem.key,
      newKey: groupItem.key,
      value: Groups.toSM(newGroupValue),
    });

    void telemetry.track({
      event: "field:added",
      id,
      name: label,
      type: newField.type,
      isInAGroup: true,
      contentType: getContentTypeForTracking(window.location.pathname),
    });
  };

  const onSaveField = ({ apiId: previousKey, newKey, value }) => {
    const newGroupValue = updateFieldInGroup({
      group: Groups.fromSM(groupItem.value),
      previousFieldId: previousKey,
      newFieldId: newKey,
      field: value,
    });

    saveItem({
      apiId: groupItem.key,
      newKey: groupItem.key,
      value: Groups.toSM(newGroupValue),
    });
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
          <Button
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
            key={`custom-edit-element-${groupItem.key}`}
            mr={2}
            variant="buttons.darkSmall"
            onClick={() => setSelectMode(true)}
          >
            Add Field
          </Button>,
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
                              `item${transformKeyAccessor(item.key)}`
                            }
                            Widgets={Widgets}
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                            typeName={widget.CUSTOM_NAME || widget.TYPE_NAME}
                          />
                        );
                        return (
                          <ListItem {...props} HintElement={HintElement} />
                        );
                      })
                    }
                    {provided.placeholder}

                    {newFieldData && (
                      <NewField
                        {...newFieldData}
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                        fields={groupItem.value.config.fields || []}
                        onSave={(...args) => {
                          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                          onSaveNewField(...args);
                          setNewFieldData(null);
                        }}
                        onCancelNewField={onCancelNewField}
                      />
                    )}
                  </ul>
                )}
              </Droppable>
            </DragDropContext>
          </Box>
        }
      />
      <SelectFieldTypeModal
        data={{ isOpen: selectMode }}
        close={() => setSelectMode(false)}
        onSelect={onSelectFieldType}
        widgetsArray={groupBuilderWidgetsArray}
      />
      <EditModal
        data={editModalData}
        close={closeEditModal}
        onSave={onSaveField}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        fields={groupItem.value.config.fields}
      />
    </Fragment>
  );
};

export default CustomListItem;
/* eslint-enable */
