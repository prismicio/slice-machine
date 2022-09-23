import router from "next/router";
import { Box, Text, Flex } from "theme-ui";
import * as Models from "@slicemachine/core/build/models";

import VarationsPopover from "@lib/builders/SliceBuilder/Header/VariationsPopover";
import * as Links from "@lib/builders/SliceBuilder/links";

import ScreenSizes, { Size } from "../ScreenSizes";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import useSliceMachineActions from "src/modules/useSliceMachineActions";
import { useState } from "react";
import ScreenshotButton from "@components/ScreenshotButton";

type PropTypes = {
  Model: ComponentUI;
  variation: Models.VariationSM;
  handleScreenSizeChange: (screen: { size: Size }) => void;
  size: Size;
};

type ScreenShotSyncState = {
  imageLoading: boolean;
  done: boolean;
  error: null | string;
  status: number | null;
};

export const initialState: ScreenShotSyncState = {
  imageLoading: false,
  done: false,
  error: null,
  status: null,
};

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

const Header: React.FunctionComponent<PropTypes> = ({
  Model,
  variation,
  handleScreenSizeChange,
  size,
}) => {
  const { generateSliceScreenshot } = useSliceMachineActions();
  const [data, setData] = useState<ScreenShotSyncState>(initialState);
  const onTakingSliceScreenshot = () => {
    generateSliceScreenshot(variation?.id, Model, setData);
  };

  return (
    <Box
      sx={{
        p: 3,
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gridTemplateRows: "1fr",
        borderBottom: "1px solid #F1F1F1",
      }}
    >
      <Flex
        sx={{
          alignItems: "center",
        }}
      >
        <Text mr={2}>{Model.model.name}</Text>
        {Model.model.variations.length > 1 ? (
          <VarationsPopover
            buttonSx={{ p: 1 }}
            defaultValue={variation}
            variations={Model.model.variations}
            onChange={(v) => redirect(Model, v, true)}
          />
        ) : null}
      </Flex>
      <Flex
        sx={{
          alignItems: "center",
          justifyContent: "space-around",
        }}
      >
        <ScreenSizes size={size} onClick={handleScreenSizeChange} />
      </Flex>
      <Flex
        sx={{
          alignItems: "flex-end",
          flexDirection: "column",
        }}
      >
        <ScreenshotButton
          onClick={onTakingSliceScreenshot}
          isLoading={data.imageLoading}
          isDisabled={data.imageLoading}
        >
          Take a screenshot
        </ScreenshotButton>
      </Flex>
    </Box>
  );
};

export default Header;
