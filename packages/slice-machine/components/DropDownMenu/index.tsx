import React, { useEffect, useState } from "react";
import { Popover } from "react-tiny-popover";

import MenuList from "./MenuList";

import { Button, Box, ThemeUICSSObject } from "theme-ui";

import { RiArrowDropDownFill } from "react-icons/ri";

type DropDownMenuProps = {
  options: string[];
  onChange: (selected: string) => void;
  buttonSx?: ThemeUICSSObject;
  defaultValue?: string;
};

export const DropDownMenu: React.FunctionComponent<DropDownMenuProps> = ({
  buttonSx,
  defaultValue,
  options,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [current, setCurrent] = useState<string>(defaultValue || options[0]);

  useEffect(() => {
    if (defaultValue) {
      setCurrent(defaultValue);
    }
  }, [defaultValue]);

  const TRANSITION_DURATION = 200; //ms
  const handleChange = function (variation: string) {
    setIsOpen(false);
    setCurrent(variation);
    setTimeout(() => onChange(variation), TRANSITION_DURATION + 10); // time to properly close the popover with transition
  };

  return (
    <Box>
      <Popover
        align="start"
        isOpen={isOpen}
        onClickOutside={() => setIsOpen(false)}
        positions={["bottom"]}
        padding={2}
        content={() => (
          <MenuList
            defaultValue={current}
            options={options}
            onChange={handleChange}
          />
        )}
        containerClassName={"variationSelectorContainer"}
      >
        <Button
          sx={{
            fontSize: 14,
            p: "3px",
            pl: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderRadius: "6px",
            border: "1px solid #DCDBDD",
            fontWeight: "bold",
            ...buttonSx,
          }}
          variant="secondary"
          onClick={() => setIsOpen(!isOpen)}
        >
          {current} <RiArrowDropDownFill size="24px" />
        </Button>
      </Popover>
    </Box>
  );
};
