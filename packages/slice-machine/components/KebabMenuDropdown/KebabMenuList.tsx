import React from "react";
import { Box, Flex } from "theme-ui";

const MenuItem: React.FunctionComponent<{
  value: string;
  onClick: (event: React.MouseEvent<HTMLDivElement>) => void;
}> = ({ value, onClick }) => {
  return (
    <Box
      sx={{
        p: 2,
        cursor: "pointer",
        fontSize: "14px",
        borderRadius: 0,
        ":hover": {
          bg: "hoverBackground",
        },
      }}
      onClick={onClick}
    >
      {value}
    </Box>
  );
};

type MenuOption = {
  displayName: string;
  onClick: (event: React.MouseEvent<HTMLDivElement>) => void;
};

export const KebabMenuList: React.FunctionComponent<{
  menuOptions: MenuOption[];
}> = ({ menuOptions }) => {
  return (
    <Box
      sx={{
        py: 0,
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
            <MenuItem value={option.displayName} onClick={option.onClick} />
          );
        })}
      </Flex>
    </Box>
  );
};
