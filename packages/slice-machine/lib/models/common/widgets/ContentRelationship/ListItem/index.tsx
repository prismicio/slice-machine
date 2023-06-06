import { Fragment, useState } from "react";

import { Box, Button, Flex, useThemeUI } from "theme-ui";

import ListItem from "@components/ListItem";
import ItemHeader from "@components/ItemHeader";
// import { Link } from "@prismicio/types-internal/lib/customtypes";

import { ContentRelationshipWidget } from "@models/common/widgets/ContentRelationship";

const ListElement = ({
  customType,
  fieldAccessor,
}: {
  customType: string;
  fieldAccessor: string;
}) => {
  const { theme } = useThemeUI();
  return (
    <Box
      as="li"
      sx={{
        bg: "headSection",
        width: "100%",
        borderRadius: "3px",
        my: 3,
        border: (t) => `1px solid ${String(t.colors?.borders)}`,
      }}
    >
      <Flex
        sx={{
          p: 3,
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <ItemHeader
          theme={theme}
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          text={customType}
          sliceFieldName={fieldAccessor}
          WidgetIcon={Box}
        />
        <Flex>meta</Flex>
      </Flex>
    </Box>
  );
};

/* eslint-disable */
const CustomListItem = ({
  widget,
  item: groupItem,
  draggableId,
  index,
  deleteItem,
  enterEditMode,
}: {
  item: any;
  draggableId: string;
  widget: typeof ContentRelationshipWidget;
  index: number;
  enterEditMode: (
    itemInfo: [string, any],
    modelFieldName: string | undefined,
    index: number
  ) => void;
  deleteItem: (key: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  console.log({ groupItem, widget });

  return (
    <Fragment>
      <ListItem
        index={index}
        item={groupItem}
        widget={widget}
        draggableId={draggableId}
        enterEditMode={enterEditMode}
        renderFieldAccessor={() => `data.${groupItem.key}.[...]`}
        deleteItem={deleteItem}
        CustomEditElements={[
          <Button
            key={`show-hide-content-relationship-${groupItem.key}`}
            mr={2}
            variant="buttons.darkSmall"
            onClick={() => setIsOpen((t) => !t)}
          >
            show/hide
          </Button>,
        ]}
        children={
          isOpen ? (
            <Box sx={{ ml: 5 }}>
              <ul>
                {(groupItem.value.config?.customtypes ?? []).map(
                  ({ customTypeId }) => {
                    const fieldAccessor = `data.${groupItem.key}.${customTypeId}`;
                    return (
                      <ListElement
                        key={customTypeId}
                        customType={customTypeId}
                        fieldAccessor={fieldAccessor}
                      />
                    );
                  }
                )}
              </ul>
            </Box>
          ) : null
        }
      />
    </Fragment>
  );
};

export default CustomListItem;
