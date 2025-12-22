import {
  DialogActionButton,
  DialogActions,
  DialogCancelButton,
} from "@prismicio/editor-ui";

import { getSubmitButtonLabel } from "../shared/getSubmitButtonLabel";

export function ReuseSlicesDialogContent() {}

interface DialogButtonsProps {
  totalSelected: number;
  onSubmit: () => void;
  location: "custom_type" | "page_type";
  typeName: string;
  isSubmitting?: boolean;
}

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
