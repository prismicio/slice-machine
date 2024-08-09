import { Box } from "@prismicio/editor-ui";
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
  const [isInfoDialogSeen, setInfoDialogSeen] = usePersistedState<boolean>(
    LOCAL_STORAGE_KEY,
    false,
  );

  function dismissDialog() {
    setInfoDialogSeen(true);
    setAddFieldDropdownOpen(true);
  }

  return (
    <Box position="relative">
      <AddFieldDropdown
        open={isAddFieldDropdownOpen}
        onOpenChange={setAddFieldDropdownOpen}
        disabled={disabled}
        onSelectField={onSelectField}
        fields={fields}
        triggerDataTestId={triggerDataTestId}
        hideTriggerLabel={true}
      />
      {!isInfoDialogSeen && (
        <Box position="absolute" top={0} right={0}>
          <StaticFieldsInfoDialog onClose={dismissDialog} />
        </Box>
      )}
    </Box>
  );
}
