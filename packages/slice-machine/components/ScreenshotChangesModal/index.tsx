import { useState } from "react";
import { useSelector } from "react-redux";
import { Flex, Heading, Close, Box, Text } from "theme-ui";

import Card from "@components/Card";
import { AiOutlinePicture } from "react-icons/ai";
import { RiErrorWarningLine } from "react-icons/ri";
import SliceMachineModal from "@components/SliceMachineModal";

import { isModalOpen } from "@src/modules/modal";

import { SliceMachineStoreType } from "@src/redux/type";
import { ModalKeysEnum } from "@src/modules/modal/types";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";

type SliceVariationSelector = { sliceID: string; variationID: string };

const VariationIcon: React.FC<{ isValid?: boolean }> = ({ isValid }) => (
  <Flex
    sx={{
      p: 2,
      border: "1px solid #E4E2E4",
      borderRadius: "6px",
      bg: "#FFF",
    }}
  >
    {isValid ? (
      <AiOutlinePicture style={{ fontSize: "16px" }} />
    ) : (
      <RiErrorWarningLine style={{ fontSize: "16px", color: "#ED811C" }} />
    )}
  </Flex>
);

const VariationsList = ({
  slice,
  onSelectVariation,
  variationSelector,
}: {
  slice: ComponentUI;
  isSelected?: boolean;
  variationSelector: SliceVariationSelector;
  onSelectVariation: (s: SliceVariationSelector) => void;
}) => (
  <>
    <Heading
      as="h4"
      sx={{
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {slice.model.name}
    </Heading>
    <Box>
      <Box
        as="ul"
        sx={{
          pl: 0,
          my: 3,
        }}
      >
        {slice.model.variations.map((variation) => {
          const { sliceID, variationID } = variationSelector;
          const isSelectedVariation =
            sliceID === slice.model.id && variationID === variation.id;
          return (
            <Box
              as="li"
              sx={{
                listStyle: "none",
                my: 2,
                p: 2,
                cursor: "pointer",
                borderRadius: "4px",
                ...(isSelectedVariation && {
                  bg: "#EDECEE",
                  fontWeight: "500",
                }),
                ":hover": {
                  bg: "#EDECEE",
                },
              }}
              onClick={() =>
                onSelectVariation({
                  sliceID: slice.model.id,
                  variationID: variation.id,
                })
              }
            >
              <Flex
                sx={{
                  alignItems: "center",
                }}
              >
                <VariationIcon isValid={!!slice.screenshots[variation.id]} />
                <Text sx={{ ml: 2 }}>{variation.name}</Text>
              </Flex>
            </Box>
          );
        })}
      </Box>
    </Box>
  </>
);

const ScreenshotChangesModal = ({
  slices,
  defaultVariationSelector,
}: {
  slices: ComponentUI[];
  defaultVariationSelector?: SliceVariationSelector | undefined;
}) => {
  const { closeScreenshotsModal } = useSliceMachineActions();

  const { isOpen } = useSelector((store: SliceMachineStoreType) => ({
    isOpen: isModalOpen(store, ModalKeysEnum.SCREENSHOTS),
  }));

  const [variationSelector, setVariationSelector] =
    useState<SliceVariationSelector>(
      defaultVariationSelector || {
        sliceID: slices[0].model.id,
        variationID: slices[0].model.variations[0].id,
      }
    );

  return (
    <SliceMachineModal
      isOpen={isOpen}
      shouldCloseOnOverlayClick
      onRequestClose={() => closeScreenshotsModal()}
    >
      <Card
        radius={"0px"}
        bodySx={{ p: 0, bg: "#FFF", position: "relative", height: "100%" }}
        sx={{ border: "none", height: "60vh" }}
        Header={({ radius }: { radius: string | number }) => (
          <Flex
            sx={{
              p: "16px",
              pl: 4,
              alignItems: "center",
              justifyContent: "space-between",
              borderTopLeftRadius: radius,
              borderTopRightRadius: radius,
              borderBottom: (t) => `1px solid ${String(t.colors?.borders)}`
              borderBottom: (t) => `1px solid ${t.colors?.borders}`,
            }}
          >
            <Heading sx={{ fontSize: "20px" }}>Slice screenshots</Heading>
            <Close type="button" onClick={() => closeScreenshotsModal()} />
          </Flex>
        )}
        Footer={null}
      >
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            height: "100%",
          }}
        >
          <Box
            as="aside"
            sx={{
              p: 3,
              bg: "grey07",
              flexGrow: 1,
              overflow: "auto",
              maxHeight: "100%",
              flexBasis: "sidebar",
            }}
          >
            {slices.map((slice) => (
              <VariationsList
                slice={slice}
                key={slice.model.id}
                variationSelector={variationSelector}
                onSelectVariation={setVariationSelector}
              />
            ))}
          </Box>
          <Box
            as="main"
            sx={{
              p: 3,
              flexGrow: 99999,
              flexBasis: 0,
              minWidth: 320,
            }}
          >
            SliceID: {variationSelector.sliceID}
            <br />
            VariationID: {variationSelector.variationID}
          </Box>
        </Box>
      </Card>
    </SliceMachineModal>
  );
};

export default ScreenshotChangesModal;
