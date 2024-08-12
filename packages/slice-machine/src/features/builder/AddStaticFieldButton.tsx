import { Button } from "@prismicio/editor-ui";
import { ButtonProps } from "@prismicio/editor-ui/dist/components/Button";
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

  const commonTriggerProps: ButtonProps = {
    startIcon: "add",
    color: "grey",
  };

  return (
    <>
      <StaticFieldsInfoDialog
        trigger={
          !isInfoDialogSeen && (
            <Button
              {...commonTriggerProps}
              data-testid="static-fields-info-trigger"
              aria-label="Add a field"
            />
          )
        }
        onClose={dismissDialog}
      />
      <AddFieldDropdown
        open={isAddFieldDropdownOpen}
        onOpenChange={setAddFieldDropdownOpen}
        disabled={disabled}
        onSelectField={onSelectField}
        fields={fields}
        trigger={
          isInfoDialogSeen && (
            <Button
              {...commonTriggerProps}
              data-testid={triggerDataTestId ?? "add-field"}
              aria-label="Add a field"
            />
          )
        }
      />
    </>
  );
}
