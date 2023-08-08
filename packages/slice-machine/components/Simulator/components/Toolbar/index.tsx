import { DropDownMenu } from "@components/DropDownSelector";
import { RiCloseLine } from "react-icons/ri";
import { useState } from "react";

import { Flex } from "theme-ui";

import {
  ScreensizeInput,
  ScreenSizeOptions,
  ScreenSizes,
} from "./ScreensizeInput";

import { ScreenDimensions } from "@lib/models/common/Screenshots";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import { VariationSM } from "@lib/models/common/Slice";

type ToolbarProps = {
  slice: ComponentUI;
  variation: VariationSM;
  handleScreenSizeChange: (screenDimensions: ScreenDimensions) => void;
  screenDimensions: ScreenDimensions;
  actionsDisabled: boolean;
};

export const Toolbar: React.FC<ToolbarProps> = ({
  slice: _slice,
  variation: _variation,
  handleScreenSizeChange,
  screenDimensions,
  actionsDisabled,
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

  // TODO(DT-1534): Uncomment to enable Puppeteer screenshots or delete if we decide to remove Puppeteer
  // const { generateSliceScreenshot } = useSliceMachineActions();
  //
  // const onTakingSliceScreenshot = () => {
  //   generateSliceScreenshot(
  //     variation.id,
  //     slice,
  //     {
  //       width: screenDimensions.width,
  //       height: screenDimensions.height,
  //     },
  //     "fromSimulator"
  //   );
  // };
  //
  // const { isSavingScreenshot } = useSelector(
  //   (store: SliceMachineStoreType) => ({
  //     isSavingScreenshot: isLoading(
  //       store,
  //       LoadingKeysEnum.GENERATE_SLICE_SCREENSHOT
  //     ),
  //   })
  // );

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
      {/* 
		  // TODO(DT-1534): Uncomment to enable Puppeteer screenshots or delete if we decide to remove Puppeteer
      <Button
        onClick={onTakingSliceScreenshot}
        label="Take a screenshot"
        isLoading={isSavingScreenshot}
        Icon={AiFillCamera}
        iconSize={20}
        iconFill="#6F6E77"
        variant="secondaryMedium"
        disabled={actionsDisabled}
      /> */}
    </Flex>
  );
};
