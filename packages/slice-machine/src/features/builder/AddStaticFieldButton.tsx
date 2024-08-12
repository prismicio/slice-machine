import { Button } from "@prismicio/editor-ui";
import { useState } from "react";

import {
  AddFieldDropdown,
  type AddFieldDropdownProps,
} from "@/features/builder/AddFieldDropdown";
import { StaticFieldsInfoDialog } from "@/features/builder/StaticFieldsInfoDialog";
import { usePersistedState } from "@/hooks/usePersistedState";

const LOCAL_STORAGE_KEY = "staticFieldsInfoDialogDismissed";

export function AddStaticFieldButton(props: AddFieldDropdownProps) {
  const { disabled, fields, triggerDataTestId, onSelectField } = props;

  const [isAddFieldDropdownOpen, setAddFieldDropdownOpen] = useState(false);
  const [isInfoDialogSeen, setInfoDialogSeen] = usePersistedState(
    LOCAL_STORAGE_KEY,
    false,
  );

  const dismissDialog = () => {
    if (!isInfoDialogSeen) {
      setInfoDialogSeen(true);
      setAddFieldDropdownOpen(true);
    }
  };

  const trigger = (
    <Button
      startIcon="add"
      color="grey"
      data-testid={triggerDataTestId ?? "add-field"}
      aria-label="Add a field"
    />
  );

  return (
    <>
      <StaticFieldsInfoDialog
        onClose={dismissDialog}
        trigger={!isInfoDialogSeen ? trigger : null}
      />
      <AddFieldDropdown
        open={isAddFieldDropdownOpen}
        onOpenChange={setAddFieldDropdownOpen}
        disabled={disabled}
        onSelectField={onSelectField}
        fields={fields}
        trigger={isInfoDialogSeen ? trigger : null}
      />
    </>
  );
}
