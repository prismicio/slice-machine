import type Models from "@slicemachine/core/build/src/models";
import React, { useEffect, useState } from "react";
import { Popover } from "react-tiny-popover";

import MenuList from "./MenuList";

import { Button, Box, ThemeUICSSObject } from "theme-ui";

import { RiArrowDropDownLine } from "react-icons/ri";

const VarationsPopover: React.FunctionComponent<{
  buttonSx?: ThemeUICSSObject;
  defaultValue?: Models.VariationSM;
  // eslint-disable-next-line @typescript-eslint/ban-types
  onNewVariation?: Function;
  variations: ReadonlyArray<Models.VariationSM>;
  onChange: (selected: Models.VariationSM) => void;
}> = ({ buttonSx, defaultValue, variations, onNewVariation, onChange }) => {
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
    <div>
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
            fontSize: 14,
            p: 2,
            pl: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            ...buttonSx,
          }}
          variant="secondary"
          onClick={() => setIsOpen(!isOpen)}
        >
          {current.name} <RiArrowDropDownLine size="24px" />
        </Button>
      </Popover>
    </div>
  );
};

export default VarationsPopover;
