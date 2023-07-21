import React, { useEffect, useState } from "react";
import { Popover } from "react-tiny-popover";

import MenuList from "./MenuList";

import { Button, Box, ThemeUICSSObject, ThemeUIStyleObject } from "theme-ui";

import { RiArrowDropDownFill, RiArrowDropUpFill } from "react-icons/ri";
import { VariationSM } from "@lib/models/common/Slice";

const VarationsPopover: React.FunctionComponent<{
  buttonSx?: ThemeUICSSObject;
  defaultValue?: VariationSM;
  onNewVariation?: () => void;
  variations: ReadonlyArray<VariationSM>;
  onChange: (selected: VariationSM) => void;
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
  const [current, setCurrent] = useState<VariationSM>(
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    defaultValue || variations[0]
  );

  useEffect(() => {
    if (defaultValue) {
      setCurrent(defaultValue);
    }
  }, [defaultValue]);

  const TRANSITION_DURATION = 200; //ms
  const handleChange = function (variation: VariationSM) {
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
            <RiArrowDropDownFill size="16px" aria-label="Expand variations" />
          ) : (
            <RiArrowDropUpFill size="16px" aria-label="Collapse variations" />
          )}
        </Button>
      </Popover>
    </Box>
  );
};

export default VarationsPopover;
