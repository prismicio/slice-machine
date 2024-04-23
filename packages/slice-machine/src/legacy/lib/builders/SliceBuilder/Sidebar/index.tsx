import { Box, Button, Gradient } from "@prismicio/editor-ui";
import { useRouter } from "next/router";
import { type FC, useState } from "react";
import { toast } from "react-toastify";

import { updateSlice } from "@/apiClient";
import { copySliceVariation } from "@/domain/slice";
import { useSliceState } from "@/features/slices/sliceBuilder/SliceBuilderProvider";
import { SharedSliceCard } from "@/features/slices/sliceCards/SharedSliceCard";
import { SLICES_CONFIG } from "@/features/slices/slicesConfig";
import { useScreenshotChangesModal } from "@/hooks/useScreenshotChangesModal";
import { DeleteVariationModal } from "@/legacy/components/DeleteVariationModal";
import { RenameVariationModal } from "@/legacy/components/Forms/RenameVariationModal";
import ScreenshotChangesModal from "@/legacy/components/ScreenshotChangesModal";
import AddVariationModal from "@/legacy/lib/builders/SliceBuilder/Sidebar/AddVariationModal";
import type { VariationSM } from "@/legacy/lib/models/common/Slice";
import useSliceMachineActions from "@/modules/useSliceMachineActions";

type DialogState =
  | { type: "ADD_VARIATION"; variation?: undefined; loading?: boolean }
  | { type: "RENAME_VARIATION"; variation: VariationSM; loading?: boolean }
  | { type: "DELETE_VARIATION"; variation: VariationSM; loading?: boolean }
  | undefined;

export const Sidebar: FC = () => {
  const { slice, variation, setSlice } = useSliceState();
  const [dialog, setDialog] = useState<DialogState>();
  const screenshotChangesModal = useScreenshotChangesModal();
  const { sliceFilterFn, defaultVariationSelector, onUploadSuccess } =
    screenshotChangesModal.modalPayload;
  const router = useRouter();
  const { saveSliceSuccess } = useSliceMachineActions();

  return (
    <>
      <Box flexDirection="column" gap={16}>
        {slice.model.variations.map((v) => (
          <SharedSliceCard
            action={{
              type: "menu",
              onRename: () => {
                setDialog({
                  type: "RENAME_VARIATION",
                  variation: v,
                });
              },
              onRemove: () => {
                setDialog({
                  type: "DELETE_VARIATION",
                  variation: v,
                });
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
                onUploadSuccess: (newSlice) => {
                  setSlice(newSlice);
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
            color="grey"
          >
            Add a new variation
          </Button>
        </Box>
      </Box>
      <ScreenshotChangesModal
        slices={sliceFilterFn([slice])}
        defaultVariationSelector={defaultVariationSelector}
        onUploadSuccess={onUploadSuccess}
      />
      <RenameVariationModal
        isOpen={dialog?.type === "RENAME_VARIATION"}
        onClose={() => {
          setDialog(undefined);
        }}
        slice={slice}
        variation={dialog?.variation}
      />
      <DeleteVariationModal
        isOpen={dialog?.type === "DELETE_VARIATION"}
        onClose={() => {
          setDialog(undefined);
        }}
        slice={slice}
        variation={dialog?.variation}
      />
      <AddVariationModal
        initialVariation={variation}
        isOpen={dialog?.type === "ADD_VARIATION"}
        onClose={() => {
          setDialog(undefined);
        }}
        onSubmit={async (id, name, copiedVariation) => {
          try {
            const { slice: newSlice, variation: newVariation } =
              copySliceVariation({ slice, id, name, copiedVariation });

            await updateSlice(newSlice);
            saveSliceSuccess(newSlice);
            setSlice(newSlice);

            const url = SLICES_CONFIG.getBuilderPagePathname({
              libraryName: newSlice.href,
              sliceName: newSlice.model.name,
              variationId: newVariation.id,
            });

            void router.replace(url);
          } catch (error) {
            const message = `Could not add variation \`${name}\``;
            console.error(message, error);

            toast.error(message);
          }
        }}
        variations={slice.model.variations}
      />
    </>
  );
};
