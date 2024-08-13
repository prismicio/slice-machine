import { Box, Button } from "@prismicio/editor-ui";
import { ButtonProps } from "@prismicio/editor-ui/dist/components/Button";
import { forwardRef, useState } from "react";

import {
  AddFieldDropdown,
  type AddFieldDropdownProps,
} from "@/features/builder/AddFieldDropdown";
import { StaticFieldsInfoDialog } from "@/features/builder/StaticFieldsInfoDialog";
import { usePersistedState } from "@/hooks/usePersistedState";

const LOCAL_STORAGE_KEY = "staticFieldsInfoDialogDismissed";

const AddFieldButton = forwardRef<
  HTMLButtonElement,
  ButtonProps & { "data-testid"?: string }
>((props, ref) => (
  <Button
    {...props}
    ref={ref}
    startIcon="add"
    color="grey"
    aria-label="Add a field"
    data-testid={props["data-testid"] ?? "add-field"}
  />
));

type AddStaticFieldDropdownProps = AddFieldDropdownProps & {
  zoneTypeFormat: "page" | "custom";
};

export function AddStaticFieldDropdown(props: AddStaticFieldDropdownProps) {
  const { zoneTypeFormat, ...remainingProps } = props;

  if (zoneTypeFormat === "page") {
    return <PageTypeAddStaticFieldDropdown {...remainingProps} />;
  }
  return <CustomTypeAddStaticFieldDropdown {...remainingProps} />;
}

const hiddenTrigger = (
  // DropdownMenu requires the presence of a trigger
  <div style={{ position: "absolute", bottom: 0, right: 0 }} />
);

function PageTypeAddStaticFieldDropdown(props: AddFieldDropdownProps) {
  const { disabled, fields, triggerDataTestId, onSelectField } = props;

  const [isFieldDropdownOpen, setFieldsDropdownOpen] = useState(false);
  const [isInfoDialogOpen, setInfoDialogOpen] = useState(false);
  const [isInfoDialogSeen, setInfoDialogSeen] = usePersistedState(
    LOCAL_STORAGE_KEY,
    false,
  );

  const onAddFieldClick = () => {
    if (isInfoDialogSeen) {
      setFieldsDropdownOpen(true);
    } else {
      setInfoDialogOpen(true);
    }
  };

  const onDialogConfirm = () => setInfoDialogSeen(true);
  const onDialogOpenChange = (open: boolean) => {
    setInfoDialogOpen(open);
    if (!open) setFieldsDropdownOpen(true);
  };

  return (
    <Box position="relative">
      <AddFieldButton
        onClick={onAddFieldClick}
        data-testid={triggerDataTestId}
      />
      <StaticFieldsInfoDialog
        open={isInfoDialogOpen}
        onOpenChange={onDialogOpenChange}
        onConfirm={onDialogConfirm}
      />
      <AddFieldDropdown
        open={isFieldDropdownOpen}
        onOpenChange={setFieldsDropdownOpen}
        disabled={disabled}
        onSelectField={onSelectField}
        fields={fields}
        trigger={hiddenTrigger}
      />
    </Box>
  );
}

function CustomTypeAddStaticFieldDropdown(props: AddFieldDropdownProps) {
  const { disabled, fields, triggerDataTestId, onSelectField } = props;

  return (
    <AddFieldDropdown
      disabled={disabled}
      onSelectField={onSelectField}
      fields={fields}
      trigger={<AddFieldButton data-testid={triggerDataTestId} />}
    />
  );
}
