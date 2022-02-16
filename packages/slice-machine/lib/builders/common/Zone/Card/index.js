import { DragDropContext, Droppable } from "react-beautiful-dnd";

import { Box, Text } from "theme-ui";

import ListItem from "components/ListItem";

// import Hint from "./components/Hints";

import { findWidgetByConfigOrType } from "../../../utils";

import * as Widgets from "@lib/models/common/widgets/withGroup";

import Li from "components/Li";
import { useSelector } from "react-redux";
import { getFramework } from "@src/modules/environment";

import CodeBlock from "./components/Hints/CodeBlock";

const FieldZone = ({
  fields,
  store,
  Model,
  title,
  tabId,
  enterEditMode,
  enterSelectMode,
  onDragEnd,
  renderFieldAccessor,
  onDeleteItem,
  showHints,
  NewFieldC,
  //  renderHintBase,
  //  isRepeatable,
}) => {
  const { framework } = useSelector((store) => ({
    framework: getFramework(store),
  }));

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
            style={{ ...provided.droppableProps.style, padding: "4px 0" }}
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

                const variation = "default-slice"; // TODO: get the current variation
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                const snippet = Model.snippets[variation][item.key];

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
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                  store,
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                  Model,
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
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
                  draggableId: `list-item-${item.key}`,
                };

                if (widget.CustomListItem) {
                  const { CustomListItem } = widget;
                  return <CustomListItem {...props} framework={framework} />;
                }

                const Snippet = (
                  <div style={{ display: showHints ? "initial" : "none" }}>
                    <CodeBlock
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                      code={snippet}
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                      lang={Model.syntax}
                    />
                  </div>
                );

                // const HintElement = (
                //   <Hint
                //     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
                //     item={item}
                //     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                //     show={showHints}
                //     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                //     isRepeatable={isRepeatable}
                //     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                //     renderHintBase={renderHintBase}
                //     framework={framework}
                //     Widgets={Widgets}
                //     typeName={widget.CUSTOM_NAME || widget.TYPE_NAME}
                //   />
                // );
                return <ListItem {...props} HintElement={Snippet} />;
              })
            }
            {provided.placeholder}
            <NewFieldC />
          </Box>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default FieldZone;
