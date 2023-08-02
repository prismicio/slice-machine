import { useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { Popover } from "react-tiny-popover";
import { Box, Button, useThemeUI } from "theme-ui";
import { KebabMenuList } from "./KebabMenuList";

export type MenuOption = {
  displayName: string;
  onClick: (event: React.MouseEvent<HTMLDivElement>) => void;
  dataCy?: string;
};

type KebabMenuDropdownProps = {
  menuOptions: MenuOption[];
  dataCy?: string;
};

export const KebabMenuDropdown: React.FC<KebabMenuDropdownProps> = ({
  menuOptions,
  dataCy,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const { theme } = useThemeUI();

  return (
    <Box>
      <Popover
        align="end"
        isOpen={isOpen}
        onClickOutside={() => setIsOpen(false)}
        positions={["bottom", "top"]}
        padding={2}
        content={() => (
          <KebabMenuList
            menuOptions={menuOptions}
            closeMenu={() => setIsOpen(false)}
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
            dataCy={dataCy && `${dataCy}-dropdown`}
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
            event.preventDefault();
            setIsOpen(!isOpen);
          }}
          data-cy={dataCy}
        >
          <BsThreeDotsVertical
            color={theme.colors?.greyIcon as string}
            size={16}
          />
        </Button>
      </Popover>
    </Box>
  );
};
