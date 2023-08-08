import { useEffect, useState } from "react";
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

import VariationDropZone from "./VariationDropZone";

import { FigmaIcon } from "@src/icons/FigmaIcon";
import { getOS, OS } from "@src/utils/os";
import { Kbd } from "@src/components/Kbd";

export type SliceVariationSelector = { sliceID: string; variationID: string };

const FigmaTip = () => {
  const os = getOS();

  const keys = (() => {
    if ([OS.Windows, OS.Linux].includes(os)) {
      return (
        <>
          <Kbd>ctrl</Kbd> + <Kbd>shift</Kbd> + <Kbd>c</Kbd>
        </>
      );
    }
    return (
      <>
        <Kbd>cmd</Kbd> + <Kbd>shift</Kbd> + <Kbd>c</Kbd>
      </>
    );
  })();

  return (
    <Flex
      sx={{
        pl: "4px",
        alignItems: "center",
        color: "#000",
        borderRadius: "6px",
        fontSize: "12px",
        lineHeight: "24px",
        border: "1px solid #E4E2E4",
        boxShadow: "0px 1px 0px 0px rgba(0, 0, 0, 0.04)",
        width: "100%",
        minHeight: "40px",
      }}
    >
      <FigmaIcon />
      <div>
        Use&nbsp;{keys} to copy any frame as .png, then just paste it here
      </div>
    </Flex>
  );
};

const VariationIcon: React.FC<{ isValid?: boolean }> = ({ isValid }) => (
  <Flex
    sx={{
      p: 2,
      border: "1px solid #E4E2E4",
      borderRadius: "6px",
      bg: "#FFF",
    }}
  >
    {/* eslint-disable-next-line @typescript-eslint/strict-boolean-expressions */}
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
              key={`${slice.model.id}-${variation.id}`}
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
                {/* eslint-disable-next-line @typescript-eslint/strict-boolean-expressions */}
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

const variationSetter = (
  defaultVariationSelector: SliceVariationSelector | undefined,
  slices: ComponentUI[]
) =>
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  defaultVariationSelector ||
  (slices.length
    ? {
        sliceID: slices[0].model.id,
        variationID: slices[0].model.variations[0].id,
      }
    : undefined);

const ScreenshotChangesModal = ({
  slices,
  defaultVariationSelector,
}: {
  slices: ComponentUI[];
  defaultVariationSelector?: SliceVariationSelector;
}) => {
  const { closeModals } = useSliceMachineActions();

  const { isOpen } = useSelector((store: SliceMachineStoreType) => ({
    isOpen: isModalOpen(store, ModalKeysEnum.SCREENSHOTS),
  }));

  const [variationSelector, setVariationSelector] = useState(
    variationSetter(defaultVariationSelector, slices)
  );

  useEffect(() => {
    setVariationSelector(variationSetter(defaultVariationSelector, slices));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    defaultVariationSelector?.sliceID,
    defaultVariationSelector?.variationID,
    isOpen,
  ]);

  if (slices.length === 0 || !variationSelector) return null;

  const supportsClipboardRead = typeof navigator.clipboard.read === "function";

  return (
    <SliceMachineModal
      isOpen={isOpen}
      shouldCloseOnOverlayClick
      onRequestClose={() => closeModals()}
    >
      <Card
        radius={"0px"}
        bodySx={{ p: 0, bg: "#FFF", position: "relative" }}
        sx={{ border: "none" }}
        Header={({ radius }: { radius: string | number }) => (
          <Flex
            sx={{
              position: "sticky",
              top: 0,
              zIndex: 1,
              background: "gray",
              p: "16px",
              alignItems: "center",
              justifyContent: "space-between",
              borderTopLeftRadius: radius,
              borderTopRightRadius: radius,
              borderBottom: (t) => `1px solid ${String(t.colors?.borders)}`,
            }}
          >
            <Heading sx={{ fontSize: "20px" }}>Slice screenshots</Heading>
            <Close type="button" onClick={() => closeModals()} />
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
            sx={{
              p: 3,
              bg: "grey07",
              flexGrow: 1,
              overflow: "auto",
              maxHeight: "100%",
              flexBasis: "sidebar",
            }}
          >
            {slices.map((slice, i) => (
              <VariationsList
                slice={slice}
                key={`${slice.model.id}-${i}`}
                variationSelector={variationSelector}
                onSelectVariation={setVariationSelector}
              />
            ))}
          </Box>
          <Flex
            as="main"
            sx={{
              p: 3,
              flexGrow: 99999,
              flexBasis: 0,
              flexDirection: "column",
              minWidth: 320,
              gap: "8px",
            }}
          >
            {supportsClipboardRead ? <FigmaTip /> : undefined}
            {(() => {
              const slice = slices.find(
                (s) => s.model.id === variationSelector.sliceID
              );
              return slice ? (
                <VariationDropZone
                  variationID={variationSelector.variationID}
                  slice={slice}
                />
              ) : null;
            })()}
          </Flex>
        </Box>
      </Card>
    </SliceMachineModal>
  );
};

export default ScreenshotChangesModal;
