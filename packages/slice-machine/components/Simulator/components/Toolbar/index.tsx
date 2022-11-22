import { useState } from "react";

import { Flex } from "theme-ui";
import { RiCloseLine } from "react-icons/ri";
import { Button } from "@components/Button";
import { AiFillCamera } from "react-icons/ai";

import { DropDownMenu } from "@components/DropDownMenu";

import {
  ScreensizeInput,
  ScreenSizeOptions,
  ScreenSizes,
} from "./ScreensizeInput";

import { ScreenDimensions } from "@lib/models/common/Screenshots";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { isLoading } from "@src/modules/loading";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import { VariationSM } from "@prismic-beta/slicemachine-core/build/models";

type ToolbarProps = {
  slice: ComponentUI;
  variation: VariationSM;
  handleScreenSizeChange: (screenDimensions: ScreenDimensions) => void;
  screenDimensions: ScreenDimensions;
};

export const Toolbar: React.FC<ToolbarProps> = ({
  slice,
  variation,
  handleScreenSizeChange,
  screenDimensions,
}) => {
  const [selectedDropdown, setSelectedDropdown] = useState<string>(
    ScreenSizeOptions.DESKTOP
  );

  const dropDownChangeHandler = (selected: string) => {
    setSelectedDropdown(selected);
    if (selected === ScreenSizeOptions.CUSTOM) {
      return;
    }
    const dimensions = ScreenSizes[selected];
    handleScreenSizeChange(dimensions);
  };

  const screenSizeChangeHandler = (newScreenDimensions: ScreenDimensions) => {
    const matchingIndex = Object.values(ScreenSizes).findIndex(
      (dimension) =>
        JSON.stringify(dimension) === JSON.stringify(newScreenDimensions)
    );

    const newDropDownState =
      matchingIndex < 0
        ? ScreenSizeOptions.CUSTOM
        : Object.keys(ScreenSizes)[matchingIndex];

    setSelectedDropdown(newDropDownState);
    handleScreenSizeChange(newScreenDimensions);
  };

  const { generateSliceScreenshot } = useSliceMachineActions();

  const onTakingSliceScreenshot = () => {
    generateSliceScreenshot(
      variation.id,
      slice,
      {
        width: screenDimensions.width,
        height: screenDimensions.height,
      },
      "fromSimulator"
    );
  };

  const { isSavingScreenshot } = useSelector(
    (store: SliceMachineStoreType) => ({
      isSavingScreenshot: isLoading(
        store,
        LoadingKeysEnum.GENERATE_SLICE_SCREENSHOT
      ),
    })
  );

  return (
    <Flex
      sx={{
        alignItems: "center",
        pb: 2,
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
          sx={{ ml: 2 }}
        />
      </Flex>
      <Button
        onClick={onTakingSliceScreenshot}
        label="Take a screenshot"
        isLoading={isSavingScreenshot}
        Icon={AiFillCamera}
        variant="secondary"
      />
    </Flex>
  );
};
