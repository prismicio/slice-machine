import { DropDownMenu } from "@components/DropDownMenu";
import VarationsPopover from "@lib/builders/SliceBuilder/Header/VariationsPopover";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import { VariationSM } from "@slicemachine/core/build/models";
import { RiCloseLine } from "react-icons/ri";
import { Flex } from "theme-ui";
import {
  ScreensizeInput,
  ScreenSizeOptions,
  ScreenSizes,
} from "./ScreensizeInput";
import router from "next/router";
import * as Links from "@lib/builders/SliceBuilder/links";
import { useState } from "react";
import { ScreenDimensions } from "@lib/models/common/Screenshots";

const redirect = (
  model: ComponentUI,
  variation: { id: string } | undefined,
  isSimulator?: boolean
): void => {
  if (!variation) {
    void router.push(`/${model.href}/${model.model.name}`);
    return;
  }
  const params = Links.variation({
    lib: model.href,
    sliceName: model.model.name,
    variationId: variation?.id,
    isSimulator,
  });
  void router.push(params.href, params.as, params.options);
};

type ToolbarProps = {
  Model: ComponentUI;
  variation: VariationSM;
  handleScreenSizeChange: (screenDimensions: ScreenDimensions) => void;
  screenDimensions: ScreenDimensions;
};

export const Toolbar: React.FC<ToolbarProps> = ({
  Model,
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

  return (
    <Flex sx={{ flexDirection: "row", justifyContent: "space-between", mb: 3 }}>
      <VarationsPopover
        defaultValue={variation}
        variations={Model.model.variations}
        onChange={(v) => redirect(Model, v, true)}
        disabled={Model.model.variations.length <= 1}
      />
      <Flex
        sx={{
          alignItems: "center",
          flex: 1,
          justifyContent: "flex-end",
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
          startValue={screenDimensions.width}
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
          startValue={screenDimensions.height}
          onChange={(sizeEvent) => {
            screenSizeChangeHandler({
              ...screenDimensions,
              height: Number(sizeEvent.target.value),
            });
          }}
          sx={{ ml: 2 }}
        />
      </Flex>
    </Flex>
  );
};
