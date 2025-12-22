import {
  DialogActionButton,
  DialogActions,
  DialogCancelButton,
} from "@prismicio/editor-ui";

import { CommonDialogProps } from "./types";

type DialogButtonsProps = {
  totalSelected: number;
  isSubmitting?: boolean;
  onSubmit: () => void | Promise<void>;
  typeName: CommonDialogProps["typeName"];
};

export function DialogButtons(props: DialogButtonsProps) {
  const { totalSelected, onSubmit, isSubmitting, typeName } = props;

  return (
    <DialogActions>
      <DialogCancelButton disabled={isSubmitting} size="medium" />
      <DialogActionButton
        disabled={totalSelected === 0}
        loading={isSubmitting}
        onClick={() => void onSubmit()}
        size="medium"
      >
        Add to {typeName} ({totalSelected})
      </DialogActionButton>
    </DialogActions>
  );
}
