import React, { useRef, useState } from "react";
import { Box, Flex, Text, Link as ThemeLinK, useThemeUI } from "theme-ui";
import VariationModal from "./VariationModal";
import Link from "next/link";
import { useRouter } from "next/router";
import * as Links from "../links";
import VariationPopover from "./VariationsPopover";
import { MdHorizontalSplit, MdModeEdit } from "react-icons/md";
import SliceMachineIconButton from "../../../../components/SliceMachineIconButton";
import { RenameSliceModal } from "../../../../components/Forms/RenameSliceModal/RenameSliceModal";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { VariationSM } from "@slicemachine/core/build/models";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import { ModelStatus } from "@lib/models/common/ModelStatus";
import { Button } from "@components/Button";
import { AiFillSave } from "react-icons/ai";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import {
  getFramework,
  selectIsSimulatorAvailableForFramework,
} from "@src/modules/environment";
import SimulatorButton from "./SimulatorButton";

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
  const sliceNameRef = useRef<HTMLSpanElement>();
  const isSliceNameOverflowing = Boolean(
    sliceNameRef.current &&
      sliceNameRef.current?.offsetWidth < sliceNameRef.current?.scrollWidth
  );

  const { openRenameSliceModal, copyVariationSlice } = useSliceMachineActions();
  const { theme } = useThemeUI();

  const { isSimulatorAvailableForFramework, framework } = useSelector(
    (state: SliceMachineStoreType) => ({
      isSimulatorAvailableForFramework:
        selectIsSimulatorAvailableForFramework(state),
      framework: getFramework(state),
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
        <Flex
          sx={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "start",
            gap: "24px",
          }}
        >
          <Flex
            sx={{
              fontSize: 4,
              fontWeight: "heading",
              alignItems: "center",
            }}
          >
            <Link href="/slices" passHref>
              <ThemeLinK variant="invisible" sx={{ flexShrink: 0 }}>
                <Flex sx={{ alignItems: "center" }}>
                  <MdHorizontalSplit /> <Text ml={2}>Slices</Text>
                </Flex>
              </ThemeLinK>
            </Link>
            <Box
              ref={sliceNameRef}
              sx={{
                fontWeight: "thin",
                textOverflow: "ellipsis",
                overflow: "hidden",
              }}
              as="span"
            >
              <Text
                sx={{
                  ml: 2,
                  whiteSpace: "nowrap",
                }}
                data-cy="slice-and-variation-name-header"
                title={
                  isSliceNameOverflowing ? component.model.name : undefined
                }
              >
                {`/ ${component.model.name} / ${variation.name}`}
              </Text>
            </Box>
          </Flex>
          <Flex
            sx={{
              flexDirection: "row",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <SliceMachineIconButton
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
                width: 40,
                height: 40,
              }}
            />
            <SimulatorButton
              framework={framework}
              isSimulatorAvailableForFramework={
                isSimulatorAvailableForFramework
              }
            />
            <Button
              label="Save to File System"
              isLoading={isLoading}
              disabled={!isTouched || isLoading}
              onClick={onSave}
              Icon={AiFillSave}
              data-cy="builder-save-button"
            />
          </Flex>
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
        <RenameSliceModal
          sliceId={component.model.id}
          sliceName={component.model.name}
          libName={component.from}
          variationId={variation.id}
          data-cy="rename-slice-modal"
        />
      </Box>
    </Flex>
  );
};
export default Header;
