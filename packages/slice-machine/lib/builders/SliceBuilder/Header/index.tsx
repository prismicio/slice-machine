import React, { useState } from "react";
import { Box, Flex, Text } from "theme-ui";
import VariationModal from "./VariationModal";
import { useRouter } from "next/router";
import * as Links from "../links";
import VariationPopover from "./VariationsPopover";
import HeaderCommon from "@components/Header";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { VariationSM } from "@lib/models/common/Slice";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import { ModelStatus } from "@lib/models/common/ModelStatus";
import { Button } from "@components/Button";
import { AiFillSave } from "react-icons/ai";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { selectIsSimulatorAvailableForFramework } from "@src/modules/environment";
import SimulatorButton from "./SimulatorButton";
import { SliceListIcon } from "@src/components/Icons/SliceListIcon";

const Header: React.FC<{
  component: ComponentUI;
  status: ModelStatus;
  isTouched: boolean | undefined;
  variation: VariationSM;
  onSave: () => void;
  isLoading: boolean;
  imageLoading?: boolean;
}> = ({ component, isTouched, variation, onSave, isLoading }) => {
  const router = useRouter();
  const [showVariationModal, setShowVariationModal] = useState(false);

  const { copyVariationSlice } = useSliceMachineActions();

  const { isSimulatorAvailableForFramework } = useSelector(
    (state: SliceMachineStoreType) => ({
      isSimulatorAvailableForFramework:
        selectIsSimulatorAvailableForFramework(state),
    })
  );

  return (
    <Flex
      sx={{
        display: "flex",
        flexWrap: "wrap",
        margin: "0 auto",
        maxWidth: 1224,
        mx: "auto",
        px: 3,
        pt: 4,
      }}
    >
      <Box
        as="section"
        sx={{
          flexGrow: 99999,
          flexBasis: 0,
          minWidth: 320,
        }}
      >
        <HeaderCommon
          link={{
            Element: (
              <>
                <SliceListIcon /> <Text>Slices</Text>
              </>
            ),
            href: "/slices",
          }}
          subtitle={{
            Element: (
              <Text data-cy="slice-and-variation-name-header">
                {`/ ${component.model.name} / ${variation.name}`}
              </Text>
            ),
            title: `${component.model.name} / ${variation.name}`,
          }}
          Actions={[
            <SimulatorButton
              key="header-simulator-button"
              isSimulatorAvailableForFramework={
                isSimulatorAvailableForFramework
              }
              isTouched={!!isTouched}
            />,
            <Button
              key="header-save-button"
              label="Save to File System"
              isLoading={isLoading}
              disabled={!isTouched || isLoading}
              onClick={onSave}
              Icon={AiFillSave}
              iconFill="white"
              data-cy="builder-save-button"
            />,
          ]}
        />

        <Flex mt={3} sx={{ alignItems: "center" }}>
          <Flex sx={{ alignItems: "center" }}>
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
      </Box>
    </Flex>
  );
};
export default Header;
