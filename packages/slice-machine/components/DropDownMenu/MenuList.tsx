import React from "react";
import { Box, Flex } from "theme-ui";

const MenuList: React.FunctionComponent<{
  defaultValue: string;
  options: string[];
  onChange: (selected: string) => void;
}> = ({ defaultValue, options, onChange }) => {
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
        minWidth: 180,
        maxWidth: 350,
        color: "text",
      }}
    >
      <Flex sx={{ p: 0, flexDirection: "column" }}>
        {options.map((option) => {
          return (
            <MenuItem
              value={option}
              isActive={option === defaultValue}
              onClick={onChange}
            />
          );
        })}
      </Flex>
    </Box>
  );
};

export default MenuList;

const MenuItem: React.FunctionComponent<{
  value: string;
  isActive: boolean;
  onClick: (v: string) => void;
}> = ({ value, isActive, onClick }) => {
  return (
    <Box
      sx={{
        p: 2,
        cursor: "pointer",
        fontSize: "14px",
        borderRadius: 0,
        bg: isActive ? "hoverBackground" : "background",
        ":hover": {
          bg: "hoverBackground",
        },
      }}
      onClick={() => onClick(value)}
    >
      {value}
    </Box>
  );
};
