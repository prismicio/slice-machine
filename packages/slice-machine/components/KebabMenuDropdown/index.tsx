import { useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { Popover } from "react-tiny-popover";
import { Box, Button } from "theme-ui";
import { KebabMenuList } from "./KebabMenuList";

export const KebabMenuDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Box>
      <Popover
        align="end"
        isOpen={isOpen}
        onClickOutside={() => setIsOpen(false)}
        positions={["bottom"]}
        padding={2}
        content={() => (
          <KebabMenuList
            menuOptions={[
              {
                displayName: "Rename",
                onClick: (event) => {
                  event.stopPropagation();
                  setIsOpen(false);
                  alert("Renaming");
                },
              },
              {
                displayName: "Delete",
                onClick: (event) => {
                  event.stopPropagation();
                  setIsOpen(false);
                  alert("Deleting");
                },
              },
            ]}
          />
        )}
      >
        <Button
          variant="dropDownButton"
          sx={{
            p: "5px",
            backgroundColor: "white",
            boxShadow: "0px 1px 0px rgba(0, 0, 0, 0.04)",
          }}
          onClick={(event) => {
            event.stopPropagation();
            setIsOpen(!isOpen);
          }}
        >
          <BsThreeDotsVertical color="#6F6E77" size={16} />
        </Button>
      </Popover>
    </Box>
  );
};
