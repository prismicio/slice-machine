import { useOnChange } from "@prismicio/editor-support/React";
import {
  Box,
  Dialog,
  DialogActionButton,
  DialogActions,
  DialogCancelButton,
  DialogContent,
  DialogHeader,
  Form,
  FormInput,
  Text,
} from "@prismicio/editor-ui";
import { type FC, useState } from "react";
import { z } from "zod";

import { renameVariation } from "@/features/slices/sliceBuilder/actions/renameVariation";
import { useSliceState } from "@/features/slices/sliceBuilder/SliceBuilderProvider";
import type { ComponentUI } from "@/legacy/lib/models/common/ComponentUI";
import type { VariationSM } from "@/legacy/lib/models/common/Slice";
import useSliceMachineActions from "@/modules/useSliceMachineActions";

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
  const [variationName, setVariationName] = useState<string>("");

  const [error, setError] = useState<string | undefined>();

  const { setSlice } = useSliceState();
  const { saveSliceSuccess } = useSliceMachineActions();

  useOnChange(isOpen, () => {
    if (isOpen && variation?.name !== variationName) {
      setVariationName(variation?.name ?? "");
      setError(undefined);
    }
  });

  function handleValueChange(value: string) {
    setVariationName(value);
    setError(validateVariationName(value));
  }

  function handleSubmit() {
    if (Boolean(error) || !variation) {
      return;
    }

    setRenaming(true);

    try {
      void renameVariation({
        component: slice,
        saveSliceSuccess,
        variation,
        variationName: variationName.trim(),
      }).then((newSlice) => {
        setSlice(newSlice);
      });
    } catch {}

    setRenaming(false);
    onClose();
  }

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => !open && onClose()}
        size={{ width: 448, height: "auto" }}
      >
        <DialogHeader icon="edit" title="Rename variation" />
        <DialogContent>
          <Form onSubmit={handleSubmit}>
            <Box flexDirection="column" gap={8} padding={16}>
              <Text variant="normal" color="grey11">
                This action will rename the variation in the slice model. When
                you push your changes, the variation will be renamed in your
                repository.
              </Text>
              <Box flexDirection="column" gap={4}>
                <FormInput
                  type="text"
                  label="Variation name *"
                  placeholder="Variation name"
                  error={error}
                  value={variationName}
                  onValueChange={handleValueChange}
                />
              </Box>
            </Box>
            <DialogActions>
              <DialogCancelButton size="medium" />
              <DialogActionButton
                size="medium"
                loading={isRenaming}
                disabled={Boolean(error)}
              >
                Rename
              </DialogActionButton>
            </DialogActions>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

function validateVariationName(value: string): string | undefined {
  const result = VariationNameFieldSchema.safeParse(value, {
    errorMap: VariationNameFieldCustomErrorMap,
  });

  if (result.error) {
    return result.error.errors[0].message;
  }
}

const VariationNameFieldSchema = z.string().min(1);

const VariationNameFieldCustomErrorMap: z.ZodErrorMap = (issue) => {
  switch (issue.code) {
    case z.ZodIssueCode.too_small:
      return { message: "This field is required" };
    default:
      return { message: "Invalid value" };
  }
};
