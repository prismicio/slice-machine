import { useState } from "react";
import { Box, Flex, Text, Link as ThemeLinK } from "theme-ui";
import MetaData from "./MetaData";
import { FiLayers } from "react-icons/fi";
import VariationModal from "./VariationModal";
import Link from "next/link";
import { useRouter } from "next/router";
import * as Links from "../../links";
import VariationPopover from "./VariationsPopover";

import SaveButton from './SaveButton'

const Header = ({ Model, store, variation, onSave, onPush, isLoading }) => {
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
                    / {Model.infos.sliceName} / {variation.name}
                  </Text>
                </Box>
              </Flex>
              <Flex mt={3} sx={{ alignItems: "center" }}>
                <Flex sx={{ alignItems: "center" }}>
                  <VariationPopover
                    defaultValue={variation}
                    variations={Model.variations}
                    onNewVariation={() => setShowVariationModal(true)}
                    onChange={(v) => {
                      router.push(
                        ...Links.variation(
                          Model.href,
                          Model.infos.sliceName,
                          v.id
                        ).all
                      )
                    }}
                  />
                  <Box ml={2}>
                    <Text variant="xs">Variation id : {variation.id}</Text>
                  </Box>
                </Flex>
              </Flex>
            </Flex>
          </Box>

          <SaveButton
            onSave={onSave}
            onPush={onPush}
            __status={Model.__status}
            isTouched={Model.isTouched}
            isLoading={isLoading}
          />
          <VariationModal
            isOpen={showVariationModal}
            onClose={() => setShowVariationModal(false)}
            onSubmit={(id, name, copiedVariation) => {
              store.copyVariation(id, name, copiedVariation);
              router.push(
                ...Links.variation(Model.from, Model.infos.sliceName, id).all
              );
            }}
            initialVariation={variation}
            variations={Model.variations}
          />
        </Flex>
      </Box>
      <MetaData
        isOpen={showMeta}
        Model={Model}
        close={() => setShowMeta(false)}
      />
    </Flex>
  );
};
export default Header
