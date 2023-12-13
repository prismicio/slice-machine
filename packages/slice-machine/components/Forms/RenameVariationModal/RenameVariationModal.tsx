import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  FormInput,
  Text,
} from "@prismicio/editor-ui";
import { Formik } from "formik";
import type { Dispatch, FC, SetStateAction } from "react";

import type { SliceBuilderState } from "@builders/SliceBuilder";
import type { ComponentUI } from "@lib/models/common/ComponentUI";
import type { VariationSM } from "@lib/models/common/Slice";
import { renameVariation } from "@src/features/slices/sliceBuilder/actions/renameVariation";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";

import * as styles from "./RenameVariationModal.css";

type RenameVariationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  slice: ComponentUI;
  variation: VariationSM | undefined;
  sliceBuilderState: SliceBuilderState;
  setSliceBuilderState: Dispatch<SetStateAction<SliceBuilderState>>;
};

export const RenameVariationModal: FC<RenameVariationModalProps> = ({
  isOpen,
  onClose,
  slice,
  variation,
  sliceBuilderState,
  setSliceBuilderState,
}) => {
  const { updateAndSaveSlice } = useSliceMachineActions();
  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => !open && onClose()}
        size={{ width: 448, height: "auto" }}
      >
        <DialogHeader icon="edit" title="Rename variation" />
        <DialogContent>
          <Formik
            validateOnChange
            validateOnMount
            initialValues={{ variationName: variation?.name ?? "" }}
            validate={(values) => {
              if (values.variationName.length === 0) {
                return { variationName: "Cannot be empty" };
              }
            }}
            onSubmit={async (values) => {
              if (!variation) return;
              try {
                await renameVariation({
                  component: slice,
                  setSliceBuilderState,
                  updateAndSaveSlice,
                  variation,
                  variationName: values.variationName.trim(),
                });
              } catch {}
              onClose();
            }}
          >
            {(formik) => (
              <form>
                <Box flexDirection="column" gap={8} padding={16}>
                  <Text variant="normal" color="grey11">
                    This action will rename the variation in the slice model.
                    When you push your changes, the variation will be renamed in
                    your repository.
                  </Text>
                  <Box flexDirection="column" gap={4}>
                    <label className={styles.label}>
                      <Text variant="bold">Variation name*</Text>
                      {typeof formik.errors.variationName === "string" ? (
                        <Text variant="small" color="tomato10">
                          {formik.errors.variationName}
                        </Text>
                      ) : null}
                    </label>
                    <FormInput
                      placeholder="Variation name"
                      error={typeof formik.errors.variationName === "string"}
                      value={formik.values.variationName}
                      onValueChange={(value) =>
                        void formik.setFieldValue(
                          "variationName",
                          value.slice(0, 30),
                        )
                      }
                    />
                  </Box>
                </Box>
                <DialogActions
                  ok={{
                    text: "Rename",
                    onClick: () => void formik.submitForm(),
                    loading: sliceBuilderState.loading,
                    disabled: !formik.isValid,
                  }}
                  cancel={{ text: "Cancel" }}
                  size="medium"
                />
              </form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>
    </>
  );
};
