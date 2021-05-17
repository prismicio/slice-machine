import React, { useState } from "react";
import { Popover } from "react-tiny-popover";

import { Variation, AsArray } from "models/common/Variation";
import MenuList from "./MenuList";

import { Button } from "theme-ui";

const VarationsPopover: React.FunctionComponent<{
  defaultValue?: Variation<AsArray>;
  variations: ReadonlyArray<Variation<AsArray>>;
  onChange: (selected: Variation<AsArray>) => void;
}> = ({ defaultValue, variations, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [current, setCurrent] = useState<Variation<AsArray>>(
    defaultValue || variations[0]
  );

  const TRANSITION_DURATION = 200; //ms
  const handleChange = function (variation: Variation<AsArray>) {
    setIsOpen(false);
    setCurrent(variation);
    setTimeout(() => onChange(variation), TRANSITION_DURATION + 10); // time to properly close the popover with transition
  };

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
          />
        )}
        containerClassName={"variationSelectorContainer"}
      >
        <Button
          sx={{ fontSize: 12, padding: 2 }}
          variant="secondary"
          onClick={() => setIsOpen(!isOpen)}
        >
          Switch Variation
        </Button>
      </Popover>
    </div>
  );
};

export default VarationsPopover;
