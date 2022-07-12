import React, { useState } from "react";
import { Box, Flex, Text, Link as ThemeLinK } from "theme-ui";
import VariationModal from "./VariationModal";
import Link from "next/link";
import { useRouter } from "next/router";
import * as Links from "../links";
import VariationPopover from "./VariationsPopover";
import SaveButton from "./SaveButton";
import type { ContextProps } from "@src/models/slice/context";
import { MdHorizontalSplit } from "react-icons/md";

const Header: React.FC<{
  Model: ContextProps["Model"];
  store: ContextProps["store"];
  variation: ContextProps["variation"];
  onSave: () => void;
  onPush: () => void;
  isLoading: boolean;
  imageLoading?: boolean;
  hasModelErrors: boolean;
}> = ({
  Model,
  store,
  variation,
  onSave,
  onPush,
  isLoading,
  imageLoading = false,
  hasModelErrors,
}) => {
  const router = useRouter();
  const [showVariationModal, setShowVariationModal] = useState(false);
  const unSynced = ["MODIFIED", "NEW_SLICE"].indexOf(Model.__status) !== -1;

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

          <SaveButton
            onClick={Model.isTouched ? onSave : onPush}
            loading={isLoading && !imageLoading}
            disabled={
              isLoading ||
              imageLoading ||
              (!Model.isTouched && !unSynced) ||
              hasModelErrors
            }
          >
            {Model.isTouched
              ? "Save model to filesystem"
              : unSynced
              ? "Push Slice to Prismic"
              : "Your Slice is up to date!"}
          </SaveButton>
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
        </Flex>
      </Box>
    </Flex>
  );
};
export default Header;
