import router from "next/router";
import { Box, Text, Flex, Button } from "theme-ui";
import { Models } from "@slicemachine/models";

import VarationsPopover from "@builders/SliceBuilder/layout/Header/VariationsPopover";

import SliceState from "@lib/models/ui/SliceState";

import ScreenSizes, { Size } from "../ScreenSizes";

import * as Links from "@builders/SliceBuilder/links";

type PropTypes = {
  title: string;
  Model: SliceState;
  variation: Models.VariationAsArray | undefined;
  handleScreenSizeChange: Function;
  size: Size;
};

const redirect = (
  model: SliceState,
  variation: { id: string } | undefined,
  isPreview?: boolean
) => {
  if (!variation) {
    return router.push(`/${model.href}/${model.infos.sliceName}`);
  }
  const params = Links.variation({
    lib: model.href,
    sliceName: model.infos.sliceName,
    variationId: variation?.id,
    isPreview,
  });
  router.push(params.href, params.as, params.options);
};

export default function Header({
  title,
  Model,
  variation,
  handleScreenSizeChange,
  size,
}: PropTypes) {
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
        <Text mr={2}>{title}</Text>
        {Model.variations.length > 1 ? (
          <VarationsPopover
            buttonSx={{ p: 1 }}
            defaultValue={variation}
            variations={Model.variations}
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
          alignItems: "center",
          justifyContent: "end",
        }}
      >
        <Button onClick={() => redirect(Model, variation)}>Leave</Button>
      </Flex>
    </Box>
  );
}
