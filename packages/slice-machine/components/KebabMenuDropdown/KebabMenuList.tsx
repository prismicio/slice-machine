import React from "react";
import { Box, Flex } from "theme-ui";
import { MenuOption } from ".";

const MenuItem: React.FunctionComponent<MenuOption> = ({
  displayName,
  onClick,
  dataCy,
}) => {
  return (
    <Box
      sx={{
        py: 2,
        px: 3,
        cursor: "pointer",
        fontSize: "14px",
        borderRadius: 0,
        ":hover": {
          bg: "hoverBackground",
        },
      }}
      onClick={onClick}
      data-cy={dataCy}
    >
      {displayName}
    </Box>
  );
};

export const KebabMenuList: React.FunctionComponent<{
  menuOptions: MenuOption[];
  closeMenu: () => void;
  dataCy?: string;
}> = ({ menuOptions, closeMenu, dataCy }) => {
  return (
    <Box
      data-cy={dataCy}
      sx={{
        py: 1,
        flexDirection: "column",
        backgroundColor: "headSection",
        overflow: "auto",
        display: "flex",
        borderRadius: "6px",
        border: (t) => `1px solid ${String(t.colors?.darkBorder)}`,
        boxShadow: "0 10px 10px rgba(0, 0, 0, 0.05)",
        maxHeight: 340,
        minWidth: 120,
        maxWidth: 350,
        color: "text",
      }}
    >
      <Flex sx={{ p: 0, flexDirection: "column" }}>
        {menuOptions.map((option) => {
          return (
            <MenuItem
              key={option.displayName}
              displayName={option.displayName}
              onClick={(event) => {
                closeMenu();
                event.preventDefault();
                option.onClick(event);
              }}
              dataCy={option.dataCy}
            />
          );
        })}
      </Flex>
    </Box>
  );
};
