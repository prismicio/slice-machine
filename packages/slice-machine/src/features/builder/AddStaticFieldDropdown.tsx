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

type AddStaticFieldDropdownProps = AddFieldDropdownProps & {
  zoneTypeFormat: "page" | "custom";
};

const commonTriggerProps: ButtonProps & {
  "aria-label": string;
  "data-testid": string;
} = {
  startIcon: "add",
  color: "grey",
  "aria-label": "Add a field",
  "data-testid": "add-field",
};

export function AddStaticFieldDropdown(props: AddStaticFieldDropdownProps) {
  const { zoneTypeFormat, ...remainingProps } = props;

  if (zoneTypeFormat === "page") {
    return <PageAddStaticFieldDropdown {...remainingProps} />;
  }

  return <CustomTypeAddStaticFieldDropdown {...remainingProps} />;
}

function PageAddStaticFieldDropdown(props: AddFieldDropdownProps) {
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
      {...commonTriggerProps}
      {...(triggerDataTestId != null && { "data-testid": triggerDataTestId })}
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

function CustomTypeAddStaticFieldDropdown(props: AddFieldDropdownProps) {
  const { disabled, fields, triggerDataTestId, onSelectField } = props;

  const trigger = (
    <Button
      {...commonTriggerProps}
      {...(triggerDataTestId != null && { "data-testid": triggerDataTestId })}
    />
  );

  return (
    <>
      <AddFieldDropdown
        disabled={disabled}
        onSelectField={onSelectField}
        fields={fields}
        trigger={trigger}
      />
    </>
  );
}
