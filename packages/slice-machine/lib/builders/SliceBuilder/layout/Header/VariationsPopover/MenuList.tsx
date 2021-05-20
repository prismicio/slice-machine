import React from "react";

import { Variation, AsArray } from "../../../../../models/common/Variation";
import { Box, Flex, Text } from "theme-ui";

const MenuList: React.FunctionComponent<{
  defaultValue: Variation<AsArray>;
  variations: ReadonlyArray<Variation<AsArray>>;
  onChange: (selected: Variation<AsArray>) => void;
}> = ({ defaultValue, variations, onChange }) => {
  return (
    <Box
      sx={{
        py: 0,
        flexDirection: "column",
        backgroundColor: "headSection",
        overflow: "auto",
        display: "flex",
        borderRadius: "4px",
        border: ({ colors }) => `1px solid ${colors.borders}`,
        boxShadow: "0 10px 10px rgba(0, 0, 0, 0.05)",
        maxHeight: 340,
        minWidth: 250,
        maxWidth: 350,
        color: "text",
      }}
    >
      <Text
        sx={{
          p: 3,
          fontSize: 12,
          color: "textClear",
        }}
      >
        {variations.length} VARIATIONS
      </Text>
      <Flex sx={{ p: 0, flexDirection: "column" }}>
        {variations.map((v) => {
          return (
            <MenuItem
              key={v.id}
              value={v}
              isActive={v.id === defaultValue.id}
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
  value: Variation<AsArray>;
  isActive: boolean;
  onClick: (v: Variation<AsArray>) => void;
}> = ({ value, isActive, onClick }) => {
  return (
    <Box
      sx={{
        px: 3,
        py: 2,
        color: isActive ? "primary" : "",
        cursor: "pointer",
        borderLeft: ({ colors }) =>
          `2px solid ${isActive ? colors.primary : colors.background}`,
        borderRadius: 0,
        bg: isActive ? "background" : "background",
        ":hover": {
          bg: "hoverBackground",
          borderLeft: ({ colors }) => `2px solid ${colors.primary}`,
        },
      }}
      onClick={() => onClick(value)}
    >
      {value.name}
    </Box>
  );
};
