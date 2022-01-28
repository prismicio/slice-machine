/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import React, { useState } from "react";
import { Box, Flex, Text, Link as ThemeLinK } from "theme-ui";
import MetaData from "./MetaData";
import { FiLayers } from "react-icons/fi";
import VariationModal from "./VariationModal";
import Link from "next/link";
import { useRouter } from "next/router";
import * as Links from "../links";
import VariationPopover from "./VariationsPopover";
import SaveButton from "./SaveButton";
// import type SliceState from "@lib/models/ui/SliceState";
import type SliceStore from "@src/models/slice/store";
// import type {Models} from '@slicemachine/core'

const Header: React.FC<{
  Model: unknown;
  store: SliceStore;
  variation: unknown;
  onSave: () => void;
  onPush: () => void;
  isLoading: boolean;
}> = ({ Model, store, variation, onSave, onPush, isLoading }) => {
  const router = useRouter();
  const [showMeta, setShowMeta] = useState(false);
  const [showVariationModal, setShowVariationModal] = useState(false);

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
                      <FiLayers /> <Text ml={2}>Slices</Text>
                    </Flex>
                  </ThemeLinK>
                </Link>
                <Box sx={{ fontWeight: "thin" }} as="span">
                  <Text ml={2}>
                    /{" "}
                    {
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                      Model.infos.sliceName
                    }{" "}
                    /{" "}
                    {
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                      variation.name
                    }
                  </Text>
                </Box>
              </Flex>
              <Flex mt={3} sx={{ alignItems: "center" }}>
                <Flex sx={{ alignItems: "center" }}>
                  <VariationPopover
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    defaultValue={variation}
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                    variations={Model.variations}
                    onNewVariation={() => setShowVariationModal(true)}
                    onChange={(v) => {
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-floating-promises
                      router.push(
                        ...Links.variation({
                          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                          lib: Model.href,
                          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-floating-promises, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                          sliceName: Model.infos.sliceName,
                          variationId: v.id,
                        }).all
                      );
                    }}
                  />
                  <Box ml={2}>
                    <Text // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                      variant="xs"
                    >
                      Variation id : {variation.id}
                    </Text>
                  </Box>
                </Flex>
              </Flex>
            </Flex>
          </Box>

          <SaveButton
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            onSave={onSave}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            onPush={onPush}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            __status={Model.__status}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            isTouched={Model.isTouched}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            isLoading={isLoading}
          />
          <VariationModal
            isOpen={showVariationModal}
            onClose={() => setShowVariationModal(false)}
            onSubmit={(id, name, copiedVariation) => {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
              store.copyVariation(id, name, copiedVariation);
              // eslint-disable-next-line @typescript-eslint/no-floating-promises
              router.push(
                ...Links.variation({
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                  lib: Model.href,
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                  sliceName: Model.infos.sliceName,
                  variationId: id,
                }).all
              );
            }}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            initialVariation={variation}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            variations={Model.variations}
          />
        </Flex>
      </Box>
      <MetaData
        isOpen={showMeta}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        Model={Model}
        close={() => setShowMeta(false)}
      />
    </Flex>
  );
};
export default Header;
