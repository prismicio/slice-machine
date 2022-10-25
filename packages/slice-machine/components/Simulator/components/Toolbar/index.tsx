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
  const [isSizeEditable, setIsSizeEditable] = useState(false);

  const dropDownChangeHandler = (selected: string) => {
    if (selected === ScreenSizeOptions.CUSTOM) {
      setIsSizeEditable(true);
      return;
    }
    setIsSizeEditable(false);
    const dimensions = ScreenSizes[selected];
    handleScreenSizeChange(dimensions);
  };

  return (
    <Flex sx={{ flexDirection: "row", justifyContent: "space-between", mb: 3 }}>
      {Model.model.variations.length > 1 ? (
        <VarationsPopover
          buttonSx={{ p: 1 }}
          defaultValue={variation}
          variations={Model.model.variations}
          onChange={(v) => redirect(Model, v, true)}
        />
      ) : null}
      <Flex sx={{ alignItems: "center" }}>
        <DropDownMenu
          options={Object.values(ScreenSizeOptions)}
          onChange={dropDownChangeHandler}
          buttonSx={{ alignSelf: "start" }}
        />
        <ScreensizeInput
          label="W"
          startValue={screenDimensions.width}
          onChange={(sizeEvent) => {
            handleScreenSizeChange({
              ...screenDimensions,
              width: Number(sizeEvent.target.value),
            });
          }}
          isActive={isSizeEditable}
          sx={{ mx: 2 }}
        />
        <RiCloseLine size={16} color="#6F6E77" />
        <ScreensizeInput
          label="H"
          startValue={screenDimensions.height}
          onChange={(sizeEvent) => {
            handleScreenSizeChange({
              ...screenDimensions,
              height: Number(sizeEvent.target.value),
            });
          }}
          isActive={isSizeEditable}
          sx={{ ml: 2 }}
        />
      </Flex>
    </Flex>
  );
};
