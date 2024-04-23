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
import { type FC, useState } from "react";

import { renameVariation } from "@/features/slices/sliceBuilder/actions/renameVariation";
import { useSliceState } from "@/features/slices/sliceBuilder/SliceBuilderProvider";
import type { ComponentUI } from "@/legacy/lib/models/common/ComponentUI";
import type { VariationSM } from "@/legacy/lib/models/common/Slice";
import useSliceMachineActions from "@/modules/useSliceMachineActions";

import styles from "./RenameVariationModal.module.css";

type RenameVariationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  slice: ComponentUI;
  variation: VariationSM | undefined;
};

export const RenameVariationModal: FC<RenameVariationModalProps> = ({
  isOpen,
  onClose,
  slice,
  variation,
}) => {
  const [isRenaming, setRenaming] = useState(false);
  const { setSlice } = useSliceState();
  const { saveSliceSuccess } = useSliceMachineActions();

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
            validateOnMount
            initialValues={{ variationName: variation?.name ?? "" }}
            validate={(values) => {
              if (values.variationName.length === 0) {
                return { variationName: "Cannot be empty" };
              }
            }}
            onSubmit={async (values) => {
              if (!variation) return;
              setRenaming(true);
              try {
                const newSlice = await renameVariation({
                  component: slice,
                  saveSliceSuccess,
                  variation,
                  variationName: values.variationName.trim(),
                });
                setSlice(newSlice);
              } catch {}
              setRenaming(false);
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
                    loading: isRenaming,
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
