import React, { useState } from "react";
import { Popover } from "react-tiny-popover";

import MenuList from "./MenuList";

import { Button, Box, ThemeUICSSObject } from "theme-ui";

import { RiArrowDropDownFill, RiArrowDropUpFill } from "react-icons/ri";

type DropDownMenuProps = {
  options: string[];
  currentValue: string;
  onChange: (selected: string) => void;
  buttonSx?: ThemeUICSSObject;
  disabled: boolean;
};

// Note: This is a controlled component that requires its state to be managed via the currentValue prop
export const DropDownMenu: React.FunctionComponent<DropDownMenuProps> = ({
  buttonSx,
  currentValue,
  options,
  onChange,
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const TRANSITION_DURATION = 200; //ms
  const handleChange = function (variation: string) {
    setIsOpen(false);
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
            defaultValue={currentValue}
            options={options}
            onChange={handleChange}
          />
        )}
      >
        <Button
          sx={buttonSx}
          variant="dropDownButton"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
        >
          {currentValue}{" "}
          {!isOpen ? (
            <RiArrowDropDownFill size="24px" />
          ) : (
            <RiArrowDropUpFill size="24px" />
          )}
        </Button>
      </Popover>
    </Box>
  );
};
