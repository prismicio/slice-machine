import {
  DialogActionButton,
  DialogActions,
  DialogCancelButton,
} from "@prismicio/editor-ui";

import { getSubmitButtonLabel } from "../shared/getSubmitButtonLabel";
import { CommonDialogProps } from "./types";

export function ReuseSlicesDialogContent() {}

type DialogButtonsProps = {
  totalSelected: number;
  isSubmitting?: boolean;
  onSubmit: () => void | Promise<void>;
  location: CommonDialogProps["location"];
  typeName: CommonDialogProps["typeName"];
};

export function DialogButtons(props: DialogButtonsProps) {
  const { totalSelected, onSubmit, isSubmitting, location, typeName } = props;

  return (
    <DialogActions>
      <DialogCancelButton disabled={isSubmitting} size="medium" />
      <DialogActionButton
        disabled={totalSelected === 0}
        loading={isSubmitting}
        onClick={() => void onSubmit()}
        size="medium"
      >
        {getSubmitButtonLabel(location, typeName)} ({totalSelected})
      </DialogActionButton>
    </DialogActions>
  );
}
