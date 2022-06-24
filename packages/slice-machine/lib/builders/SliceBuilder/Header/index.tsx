import React, { useState } from "react";
import { Box, Flex, Text, Link as ThemeLinK, useThemeUI } from "theme-ui";
import VariationModal from "./VariationModal";
import Link from "next/link";
import { useRouter } from "next/router";
import * as Links from "../links";
import VariationPopover from "./VariationsPopover";
import SaveButton from "./SaveButton";
import type { ContextProps } from "@src/models/slice/context";
import { MdHorizontalSplit, MdModeEdit } from "react-icons/md";
import SliceMachineIconButton from "../../../../components/SliceMachineIconButton";
import { RenameSliceModal } from "../../../../components/Forms/RenameSliceModal/RenameSliceModal";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";

const Header: React.FC<{
  Model: ContextProps["Model"];
  store: ContextProps["store"];
  variation: ContextProps["variation"];
  onSave: () => void;
  onPush: () => void;
  isLoading: boolean;
  imageLoading?: boolean;
}> = ({
  Model,
  store,
  variation,
  onSave,
  onPush,
  isLoading,
  imageLoading = false,
}) => {
  const router = useRouter();
  const [showVariationModal, setShowVariationModal] = useState(false);

  const unSynced = ["MODIFIED", "NEW_SLICE"].indexOf(Model.__status) !== -1;

  const { openRenameSliceModal } = useSliceMachineActions();
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
                  <Text ml={2}>
                    {`/ ${Model.model.name} / ${variation.name}`}
                  </Text>
                </Box>
              </Flex>
              <Flex mt={3} sx={{ alignItems: "center" }}>
                <Flex sx={{ alignItems: "center" }}>
                  <VariationPopover
                    defaultValue={variation}
                    variations={Model.variations}
                    onNewVariation={() => setShowVariationModal(true)}
                    onChange={(v) =>
                      void router.push(
                        ...Links.variation({
                          lib: Model.href,
                          sliceName: Model.model.name,
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
              onClick={Model.isTouched ? onSave : onPush}
              loading={isLoading && !imageLoading}
              disabled={
                isLoading || imageLoading || (!Model.isTouched && !unSynced)
              }
            >
              {Model.isTouched
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
              store.copyVariation(id, name, copiedVariation);
              void router.push(
                ...Links.variation({
                  lib: Model.href,
                  sliceName: Model.model.name,
                  variationId: id,
                }).all
              );
            }}
            initialVariation={variation}
            variations={Model.variations}
          />
          <RenameSliceModal
            sliceId={Model.model.id}
            sliceName={Model.model.name}
            libName={Model.from}
            variationId={variation.id}
          />
        </Flex>
      </Box>
    </Flex>
  );
};
export default Header;
