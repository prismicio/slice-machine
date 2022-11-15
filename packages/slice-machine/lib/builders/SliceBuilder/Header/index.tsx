import React, { useState } from "react";
import { Box, Flex, Text, Link as ThemeLinK } from "theme-ui";
import VariationModal from "./VariationModal";
import Link from "next/link";
import { useRouter } from "next/router";
import * as Links from "../links";
import VariationPopover from "./VariationsPopover";
import { MdHorizontalSplit } from "react-icons/md";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { VariationSM } from "@slicemachine/core/build/models";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import { ModelStatus } from "@lib/models/common/ModelStatus";
import { Button } from "@components/Button";
import { AiFillSave } from "react-icons/ai";

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
        <Flex sx={{ justifyContent: "space-between", alignItems: "start" }}>
          <Box>
            <Flex sx={{ flexDirection: "column" }}>
              <Flex
                sx={{
                  fontSize: 4,
                  fontWeight: "heading",
                  alignItems: "center",
                }}
              >
                <Link href="/slices" passHref>
                  <ThemeLinK variant="invisible">
                    <Flex sx={{ alignItems: "center" }}>
                      <MdHorizontalSplit /> <Text ml={2}>Slices</Text>
                    </Flex>
                  </ThemeLinK>
                </Link>
                <Box sx={{ fontWeight: "thin" }} as="span">
                  <Text ml={2} data-cy="slice-and-variation-name-header">
                    {`/ ${component.model.name} / ${variation.name}`}
                  </Text>
                </Box>
              </Flex>
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
            </Flex>
          </Box>
          <Flex sx={{ flexDirection: "row", alignItems: "center" }}>
            <Button
              label="Save to File System"
              isLoading={isLoading}
              disabled={!isTouched || isLoading}
              onClick={onSave}
              Icon={AiFillSave}
              data-cy="builder-save-button"
            />
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
        </Flex>
      </Box>
    </Flex>
  );
};
export default Header;
