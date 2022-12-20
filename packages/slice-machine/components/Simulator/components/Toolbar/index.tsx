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
import { VariationSM } from "@slicemachine/core/build/models";

type ToolbarProps = {
  slice: ComponentUI;
  variation: VariationSM;
  handleScreenSizeChange: (screenDimensions: ScreenDimensions) => void;
  screenDimensions: ScreenDimensions;
  actionsDisabled: boolean;
};

export const Toolbar: React.FC<ToolbarProps> = ({
  slice,
  variation,
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
      <Button
        onClick={onTakingSliceScreenshot}
        label="Take a screenshot"
        isLoading={isSavingScreenshot}
        Icon={AiFillCamera}
        iconSize={20}
        iconFill="#6F6E77"
        variant="secondary"
        disabled={actionsDisabled}
        sx={{
          padding: "4px 8px",
          borderRadius: "6px",
          fontSize: "14px",
          lineHeight: "24px",
          letterSpacing: "-0.15px",
          color: "#1A1523",
          border: "1px solid #DCDBDD",
          backgroundColor: "#FFFFF",
          boxShadow: "0px 1px 0px rgba(0, 0, 0, 0.04)",
          "&:focus": {
            boxShadow: "0px 0px 0px 3px rgba(124, 102, 220, 0.3)",
            border: "1px solid #6E56CF",
          },
          "&:hover": {
            backgroundColor: "#F4F2F4",
          },
          "&:active": {
            backgroundColor: "#F4F2F4",
            boxShadow: "inset 0px 2px 0px rgba(0, 0, 0, 0.08)",
          },
          "&:disabled": {
            color: "#908E96",
          },
        }}
      />
    </Flex>
  );
};
