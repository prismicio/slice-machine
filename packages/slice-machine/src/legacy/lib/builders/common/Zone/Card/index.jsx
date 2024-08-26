import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { Box, Text } from "theme-ui";

import Li from "@/legacy/components/Li";
import ListItem from "@/legacy/components/ListItem";
import { Widgets } from "@/legacy/lib/models/common/widgets";

import { findWidgetByConfigOrType } from "../../../utils";
import Hint from "./components/Hints";

const FieldZone = ({
  fields,
  title,
  tabId,
  enterEditMode,
  enterSelectMode,
  onDragEnd,
  renderFieldAccessor,
  onDeleteItem,
  onSave,
  showHints,
  renderHintBase,
  isRepeatable,
  testId,
  isRepeatableCustomType,
}) => {
  return (
    <DragDropContext
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      onDragEnd={onDragEnd}
    >
      <Droppable
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment
        droppableId={title}
      >
        {(provided, snapshot) => (
          <Box
            as="ul"
            ref={provided.innerRef}
            {...provided.droppableProps}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            data-testid={testId}
            sx={{ paddingInline: "16px !important" }}
          >
            {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
              fields.map((item, index) => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const {
                  value: { config, type },
                } = item;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
                const widget = findWidgetByConfigOrType(Widgets, config, type);
                // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                if (!widget) {
                  return (
                    <Li>
                      <Text>Field type "{type}" not supported</Text>
                    </Li>
                  );
                }

                const props = {
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                  item,
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                  index,
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment
                  tabId,
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                  widget,
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment
                  showHints,
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                  key: item.key,
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment
                  enterSelectMode,
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                  renderFieldAccessor,
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment
                  enterEditMode,
                  parentSnapshot: snapshot,
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                  deleteItem: onDeleteItem,
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                  saveItem: onSave,
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
                  draggableId: `list-item-${item.key}`,
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                  isRepeatableCustomType,
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
                  testId: `list-item-${item.key}`,
                };

                const HintElement = (
                  <Hint
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
                    item={item}
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    show={showHints}
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    isRepeatable={isRepeatable}
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    renderHintBase={renderHintBase}
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    hintItemName={widget.hintItemName}
                    Widgets={Widgets}
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/strict-boolean-expressions
                    typeName={widget.CUSTOM_NAME || widget.TYPE_NAME}
                  />
                );

                // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                if (widget.CustomListItem) {
                  const { CustomListItem } = widget;
                  return (
                    <CustomListItem {...props} HintElement={HintElement} />
                  );
                }

                return <ListItem {...props} HintElement={HintElement} />;
              })
            }
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default FieldZone;
