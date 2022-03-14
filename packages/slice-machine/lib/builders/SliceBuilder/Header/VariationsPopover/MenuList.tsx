import React from "react";
import type Models from "@slicemachine/core/build/models";
import { Box, Flex, Text } from "theme-ui";

const MenuList: React.FunctionComponent<{
  defaultValue: Models.VariationAsArray;
  variations: ReadonlyArray<Models.VariationAsArray>;
  onChange: (selected: Models.VariationAsArray) => void;
  MenuItemAction?: React.ReactElement;
}> = ({ defaultValue, variations, MenuItemAction, onChange }) => {
  return (
    <Box
      sx={{
        py: 0,
        flexDirection: "column",
        backgroundColor: "headSection",
        overflow: "auto",
        display: "flex",
        borderRadius: "4px",
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        border: (t) => `1px solid ${t.colors?.borders}`,
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
        {variations.length} VARIATION{variations.length > 1 ? "S" : ""}
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
        {MenuItemAction ? MenuItemAction : null}
      </Flex>
    </Box>
  );
};

export default MenuList;

const MenuItem: React.FunctionComponent<{
  value: Models.VariationAsArray;
  isActive: boolean;
  // eslint-disable-next-line @typescript-eslint/ban-types
  onClick: ((v: Models.VariationAsArray) => void) | Function;
}> = ({ value, isActive, onClick }) => {
  return (
    <Box
      sx={{
        px: 3,
        py: 2,
        color: isActive ? "primary" : "",
        cursor: "pointer",
        borderLeft: ({ colors }) =>
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          `2px solid ${isActive ? colors?.primary : colors?.background}`,
        borderRadius: 0,
        bg: isActive ? "background" : "background",
        ":hover": {
          bg: "hoverBackground",
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          borderLeft: ({ colors }) => `2px solid ${colors?.primary}`,
        },
      }}
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      onClick={() => onClick(value)}
    >
      {value.name}
    </Box>
  );
};
