import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  Text,
} from "@prismicio/editor-ui";
import { useRouter } from "next/router";
import type { Dispatch, FC, PropsWithChildren, SetStateAction } from "react";

import type { SliceBuilderState } from "@builders/SliceBuilder";
import type { ComponentUI } from "@lib/models/common/ComponentUI";
import type { VariationSM } from "@lib/models/common/Slice";
import { deleteVariation } from "@src/features/slices/sliceBuilder/actions/deleteVariation";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";

type DeleteVariationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  slice: ComponentUI;
  variation: VariationSM | undefined;
  sliceBuilderState: SliceBuilderState;
  setSliceBuilderState: Dispatch<SetStateAction<SliceBuilderState>>;
};

export const DeleteVariationModal: FC<DeleteVariationModalProps> = ({
  isOpen,
  onClose,
  slice,
  variation,
  sliceBuilderState,
  setSliceBuilderState,
}) => {
  const router = useRouter();
  const { updateAndSaveSlice } = useSliceMachineActions();
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      size={{ width: 448, height: "auto" }}
    >
      <DialogHeader icon="delete" title="Delete variation" />
      <DialogContent>
        <Box flexDirection="column">
          <Text color="grey11" sx={{ marginBlock: 16, marginInline: 16 }}>
            This action will remove the variation from the slice model and
            delete associated files. When you push your changes, the variation
            will disappear from your repository. This update will{" "}
            <Bold>not</Bold> affect your documents until you <Bold>edit</Bold>{" "}
            them manually.
          </Text>
          <DialogActions
            ok={{
              text: "Delete",
              onClick: () => {
                if (!variation) return;
                void (async () => {
                  try {
                    await deleteVariation({
                      component: slice,
                      router,
                      setSliceBuilderState,
                      updateAndSaveSlice,
                      variation,
                    });
                  } catch {}
                  onClose();
                })();
              },
              loading: sliceBuilderState.loading,
            }}
            cancel={{ text: "Cancel" }}
            size="medium"
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

const Bold: FC<PropsWithChildren> = (props) => (
  <Text {...props} color="inherit" component="span" variant="bold" />
);
