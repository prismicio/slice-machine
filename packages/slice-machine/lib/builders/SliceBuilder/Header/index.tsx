import React, { useState } from "react";
import { Box, Flex, Text } from "theme-ui";
import VariationModal from "./VariationModal";
import { useRouter } from "next/router";
import * as Links from "../links";
import VariationPopover from "./VariationsPopover";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { VariationSM } from "@lib/models/common/Slice";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import { ModelStatus } from "@lib/models/common/ModelStatus";

const Header: React.FC<{
  component: ComponentUI;
  status: ModelStatus;
  variation: VariationSM;
  imageLoading?: boolean;
}> = ({ component, variation }) => {
  const router = useRouter();
  const [showVariationModal, setShowVariationModal] = useState(false);

  const { copyVariationSlice } = useSliceMachineActions();

  return (
    <>
      <Flex>
        <VariationPopover
          defaultValue={variation}
          variations={component.model.variations}
          onNewVariation={() => setShowVariationModal(true)}
          onChange={(v) =>
            void router.push(
              ...Links.variation({
                lib: component.href,
                sliceName: component.model.name,
                variationId: v.id,
              }).all
            )
          }
        />
        <Box ml={2}>
          <Text variant="xs">Variation id : {variation.id}</Text>
        </Box>
      </Flex>

      <VariationModal
        isOpen={showVariationModal}
        onClose={() => setShowVariationModal(false)}
        onSubmit={(id, name, copiedVariation) => {
          copyVariationSlice(id, name, copiedVariation);
          void router.push(
            ...Links.variation({
              lib: component.href,
              sliceName: component.model.name,
              variationId: id,
            }).all
          );
        }}
        initialVariation={variation}
        variations={component.model.variations}
      />
    </>
  );
};
export default Header;
