import React, { useState } from "react";
import { Box, Flex, Text, Link as ThemeLinK, useThemeUI } from "theme-ui";
import VariationModal from "./VariationModal";
import Link from "next/link";
import { useRouter } from "next/router";
import * as Links from "../links";
import VariationPopover from "./VariationsPopover";
import SaveButton from "./SaveButton";
import { MdHorizontalSplit, MdModeEdit } from "react-icons/md";
import SliceMachineIconButton from "../../../../components/SliceMachineIconButton";
import { RenameSliceModal } from "../../../../components/Forms/RenameSliceModal/RenameSliceModal";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { VariationSM } from "@slicemachine/core/build/models";
import { ExtendedComponentUI } from "@src/modules/selectedSlice/types";

const Header: React.FC<{
  extendedComponent: ExtendedComponentUI;
  variation: VariationSM;
  onSave: () => void;
  onPush: () => void;
  isLoading: boolean;
  imageLoading?: boolean;
}> = ({
  extendedComponent,
  variation,
  onSave,
  onPush,
  isLoading,
  imageLoading = false,
}) => {
  const router = useRouter();
  const [showVariationModal, setShowVariationModal] = useState(false);

  const unSynced =
    ["MODIFIED", "NEW_SLICE"].indexOf(extendedComponent.component.__status) !==
    -1;

  const { openRenameSliceModal, copyVariationSlice } = useSliceMachineActions();
  const { theme } = useThemeUI();

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
                    {`/ ${extendedComponent.component.model.name} / ${variation.name}`}
                  </Text>
                </Box>
              </Flex>
              <Flex mt={3} sx={{ alignItems: "center" }}>
                <Flex sx={{ alignItems: "center" }}>
                  <VariationPopover
                    defaultValue={variation}
                    variations={extendedComponent.component.model.variations}
                    onNewVariation={() => setShowVariationModal(true)}
                    onChange={(v) =>
                      void router.push(
                        ...Links.variation({
                          lib: extendedComponent.component.href,
                          sliceName: extendedComponent.component.model.name,
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
            <SliceMachineIconButton
              size={22}
              Icon={MdModeEdit}
              label="Edit slice name"
              data-cy="edit-slice-name"
              sx={{ cursor: "pointer", color: theme.colors?.icons }}
              onClick={openRenameSliceModal}
              style={{
                color: "#4E4E55",
                backgroundColor: "#F3F5F7",
                border: "1px solid #3E3E4826",
                marginRight: "8px",
              }}
            />
            <SaveButton
              onClick={extendedComponent.isTouched ? onSave : onPush}
              loading={isLoading && !imageLoading}
              disabled={
                isLoading ||
                imageLoading ||
                (!extendedComponent.isTouched && !unSynced)
              }
            >
              {extendedComponent.isTouched
                ? "Save model to filesystem"
                : unSynced
                ? "Push Slice to Prismic"
                : "Your Slice is up to date!"}
            </SaveButton>
          </Flex>
          <VariationModal
            isOpen={showVariationModal}
            onClose={() => setShowVariationModal(false)}
            onSubmit={(id, name, copiedVariation) => {
              copyVariationSlice(id, name, copiedVariation);
              void router.push(
                ...Links.variation({
                  lib: extendedComponent.component.href,
                  sliceName: extendedComponent.component.model.name,
                  variationId: id,
                }).all
              );
            }}
            initialVariation={variation}
            variations={extendedComponent.component.model.variations}
          />
          <RenameSliceModal
            sliceId={extendedComponent.component.model.id}
            sliceName={extendedComponent.component.model.name}
            libName={extendedComponent.component.from}
            variationId={variation.id}
            data-cy="rename-slice-modal"
          />
        </Flex>
      </Box>
    </Flex>
  );
};
export default Header;
