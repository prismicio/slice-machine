import { Box, Button, Gradient } from "@prismicio/editor-ui";
import { useRouter } from "next/router";
import { type Dispatch, type FC, type SetStateAction, useState } from "react";

import AddVariationModal from "@builders/SliceBuilder/Sidebar/AddVariationModal";
import type { SliceBuilderState } from "@builders/SliceBuilder";
import { DeleteVariationModal } from "@components/DeleteVariationModal";
import { RenameVariationModal } from "@components/Forms/RenameVariationModal";
import ScreenshotChangesModal from "@components/ScreenshotChangesModal";
import type { ComponentUI } from "@lib/models/common/ComponentUI";
import type { VariationSM } from "@lib/models/common/Slice";
import { Variation } from "@lib/models/common/Variation";
import { SharedSliceCard } from "@src/features/slices/sliceCards/SharedSliceCard";
import { SLICES_CONFIG } from "@src/features/slices/slicesConfig";
import { useScreenshotChangesModal } from "@src/hooks/useScreenshotChangesModal";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";

type SidebarProps = {
  slice: ComponentUI;
  variation: VariationSM;
  sliceBuilderState: SliceBuilderState;
  setSliceBuilderState: Dispatch<SetStateAction<SliceBuilderState>>;
};

type DialogState =
  | { type: "ADD_VARIATION"; variation?: undefined }
  | { type: "RENAME_VARIATION"; variation: VariationSM }
  | { type: "DELETE_VARIATION"; variation: VariationSM }
  | undefined;

export const Sidebar: FC<SidebarProps> = (props) => {
  const { slice, variation, sliceBuilderState, setSliceBuilderState } = props;

  const [dialog, setDialog] = useState<DialogState>();

  const screenshotChangesModal = useScreenshotChangesModal();
  const { sliceFilterFn, defaultVariationSelector } =
    screenshotChangesModal.modalPayload;

  const { copyVariationSlice, updateSlice } = useSliceMachineActions();
  const router = useRouter();

  return (
    <>
      <Box flexDirection="column" gap={16}>
        {slice.model.variations.map((v) => (
          <SharedSliceCard
            action={{
              type: "menu",
              onRename: () => {
                setDialog({ type: "RENAME_VARIATION", variation: v });
              },
              onRemove: () => {
                setDialog({ type: "DELETE_VARIATION", variation: v });
              },
              removeDisabled: slice.model.variations.length <= 1,
            }}
            key={v.id}
            mode="navigation"
            onUpdateScreenshot={() => {
              screenshotChangesModal.onOpenModal({
                sliceFilterFn: (s) => s,
                defaultVariationSelector: {
                  sliceID: slice.model.id,
                  variationID: v.id,
                },
              });
            }}
            replace
            selected={v.id === variation.id}
            slice={slice}
            variant="outlined"
            variationId={v.id}
          />
        ))}
        <Box
          backgroundColor="grey2"
          bottom={0}
          flexDirection="column"
          padding={{ bottom: 40, inline: 24 }}
          position="sticky"
          // As `PageLayoutContent` has a `16px` bottom padding, we need to
          // apply an equal negative margin to the `Box` if we want it to sit
          // flush with the bottom of the page.
          // @ts-expect-error TODO(PBD-1080): write the new `ScrollAreaEndGradient` component instead of using a `Box`.
          style={{ marginBottom: "-16px" }}
        >
          <Gradient sx={{ left: 0, position: "absolute", right: 0 }} />
          <Button
            onClick={() => {
              setDialog({ type: "ADD_VARIATION" });
            }}
            startIcon="add"
            // Set `position` to `relative` to position `Button` on top of
            // `Gradient`.
            sx={{ position: "relative" }}
            variant="secondary"
          >
            Add a new variation
          </Button>
        </Box>
      </Box>
      <ScreenshotChangesModal
        slices={sliceFilterFn([slice])}
        defaultVariationSelector={defaultVariationSelector}
      />
      <RenameVariationModal
        isOpen={dialog?.type === "RENAME_VARIATION"}
        onClose={() => {
          setDialog(undefined);
        }}
        slice={slice}
        variation={dialog?.variation}
        sliceBuilderState={sliceBuilderState}
        setSliceBuilderState={setSliceBuilderState}
      />
      <DeleteVariationModal
        isOpen={dialog?.type === "DELETE_VARIATION"}
        onClose={() => {
          setDialog(undefined);
        }}
        slice={slice}
        variation={dialog?.variation}
        sliceBuilderState={sliceBuilderState}
        setSliceBuilderState={setSliceBuilderState}
      />
      <AddVariationModal
        initialVariation={variation}
        isOpen={dialog?.type === "ADD_VARIATION"}
        onClose={() => {
          setDialog(undefined);
        }}
        onSubmit={(id, name, copiedVariation) => {
          copyVariationSlice(id, name, copiedVariation);

          // We have to immediately save the new variation to prevent an
          // infinite loop related to screenshots handling.
          const newVariation = Variation.copyValue(copiedVariation, id, name);
          const newSlice = {
            ...slice,
            model: {
              ...slice.model,
              variations: [...slice.model.variations, newVariation],
            },
          };
          updateSlice(newSlice, setSliceBuilderState);

          const url = SLICES_CONFIG.getBuilderPagePathname({
            libraryName: newSlice.href,
            sliceName: newSlice.model.name,
            variationId: newVariation.id,
          });
          void router.replace(url);
        }}
        variations={slice.model.variations}
      />
    </>
  );
};
