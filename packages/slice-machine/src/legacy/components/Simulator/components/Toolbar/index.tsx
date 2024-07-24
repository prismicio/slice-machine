import { useState } from "react";
import { RiCloseLine } from "react-icons/ri";
import { Flex } from "theme-ui";

import { DropDownMenu } from "@/legacy/components/DropDownSelector";
import { ScreenDimensions } from "@/legacy/lib/models/common/Screenshots";

import {
  ScreensizeInput,
  ScreenSizeOptions,
  ScreenSizes,
} from "./ScreensizeInput";

type ToolbarProps = {
  handleScreenSizeChange: (screenDimensions: ScreenDimensions) => void;
  screenDimensions: ScreenDimensions;
  actionsDisabled: boolean;
};

export const Toolbar: React.FC<ToolbarProps> = ({
  handleScreenSizeChange,
  screenDimensions,
  actionsDisabled,
}) => {
  const [selectedDropdown, setSelectedDropdown] = useState<string>(
    ScreenSizeOptions.DESKTOP,
  );

  const dropDownChangeHandler = (selected: string) => {
    setSelectedDropdown(selected);
    if (selected === ScreenSizeOptions.CUSTOM.toString()) {
      return;
    }
    const dimensions = ScreenSizes[selected];
    handleScreenSizeChange(dimensions);
  };

  const screenSizeChangeHandler = (newScreenDimensions: ScreenDimensions) => {
    const matchingIndex = Object.values(ScreenSizes).findIndex(
      (dimension) =>
        JSON.stringify(dimension) === JSON.stringify(newScreenDimensions),
    );

    const newDropDownState =
      matchingIndex < 0
        ? ScreenSizeOptions.CUSTOM
        : Object.keys(ScreenSizes)[matchingIndex];

    setSelectedDropdown(newDropDownState);
    handleScreenSizeChange(newScreenDimensions);
  };

  return (
    <Flex
      sx={{
        alignItems: "center",
        pb: "16px",
        justifyContent: "space-between",
        variant: "small",
      }}
    >
      <Flex
        sx={{
          alignItems: "center",
          flex: 1,
        }}
      >
        <DropDownMenu
          options={Object.values(ScreenSizeOptions)}
          onChange={dropDownChangeHandler}
          buttonSx={{ alignSelf: "start" }}
          currentValue={selectedDropdown}
          disabled={actionsDisabled}
        />
        <ScreensizeInput
          label="W"
          startValue={screenDimensions.width.toString()}
          onChange={(sizeEvent) => {
            screenSizeChangeHandler({
              ...screenDimensions,
              width: Number(sizeEvent.target.value),
            });
          }}
          disabled={actionsDisabled}
          sx={{ mx: 2 }}
        />
        <RiCloseLine size={16} color="#6F6E77" />
        <ScreensizeInput
          label="H"
          startValue={screenDimensions.height.toString()}
          onChange={(sizeEvent) => {
            screenSizeChangeHandler({
              ...screenDimensions,
              height: Number(sizeEvent.target.value),
            });
          }}
          disabled={actionsDisabled}
          sx={{ ml: 2 }}
        />
      </Flex>
    </Flex>
  );
};
