import type Models from "@prismic-beta/slicemachine-core/build/models";
import React, { useEffect, useState } from "react";
import { Popover } from "react-tiny-popover";

import MenuList from "./MenuList";

import { Button, Box, ThemeUICSSObject, ThemeUIStyleObject } from "theme-ui";

import { RiArrowDropDownFill, RiArrowDropUpFill } from "react-icons/ri";

const VarationsPopover: React.FunctionComponent<{
  buttonSx?: ThemeUICSSObject;
  defaultValue?: Models.VariationSM;
  onNewVariation?: () => void;
  variations: ReadonlyArray<Models.VariationSM>;
  onChange: (selected: Models.VariationSM) => void;
  sx?: ThemeUIStyleObject;
  disabled?: boolean;
}> = ({
  buttonSx,
  defaultValue,
  variations,
  onNewVariation,
  onChange,
  sx,
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [current, setCurrent] = useState<Models.VariationSM>(
    defaultValue || variations[0]
  );

  useEffect(() => {
    if (defaultValue) {
      setCurrent(defaultValue);
    }
  }, [defaultValue]);

  const TRANSITION_DURATION = 200; //ms
  const handleChange = function (variation: Models.VariationSM) {
    setIsOpen(false);
    setCurrent(variation);
    setTimeout(() => onChange(variation), TRANSITION_DURATION + 10); // time to properly close the popover with transition
  };

  const MenuItemAction = (
    <Box sx={{ p: 2 }}>
      <Button
        variant="transparent"
        sx={{ color: "text" }}
        onClick={() => {
          setIsOpen(false);
          if (onNewVariation) {
            onNewVariation();
          }
        }}
      >
        + Add new variation
      </Button>
    </Box>
  );

  return (
    <Box sx={sx}>
      <Popover
        align="start"
        isOpen={isOpen}
        onClickOutside={() => setIsOpen(false)}
        positions={["bottom"]}
        padding={10}
        content={() => (
          <MenuList
            defaultValue={current}
            variations={variations}
            onChange={handleChange}
            MenuItemAction={onNewVariation ? MenuItemAction : undefined}
          />
        )}
        containerClassName={"variationSelectorContainer"}
      >
        <Button
          sx={{
            ...buttonSx,
          }}
          variant="dropDownButton"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
        >
          {current.name}{" "}
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

export default VarationsPopover;
