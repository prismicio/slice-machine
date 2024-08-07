import {
  Box,
  Button,
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
import { useState } from "react";

import {
  addUIDField,
  getUIDField,
  getUIDFieldLabel,
  updateUIDField,
} from "@/domain/customType";
import { useCustomTypeState } from "@/features/customTypes/customTypesBuilder/CustomTypeProvider";

export function UIDEditor() {
  const [isOpen, setOpen] = useState(false);
  const { customType, setCustomType } = useCustomTypeState();
  const field = getUIDField(customType);
  const uidFieldLabel = getUIDFieldLabel(customType);
  const [label, setLabel] = useState(uidFieldLabel ?? "");

  function handleSubmit() {
    if (!label) {
      return;
    }
    const updatedCustomType = field
      ? updateUIDField(label, customType)
      : addUIDField(label, customType);

    setCustomType(updatedCustomType);
    setOpen(false);
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={setOpen}
      size="small"
      trigger={
        <Button
          color="grey"
          textColor="placeholder"
          startIcon={field ? "language" : "add"}
          sx={{ marginInline: "auto" }}
        >
          {field ? uidFieldLabel : "Add an UID"}
        </Button>
      }
    >
      <DialogHeader title="Edit the UID label" />
      <DialogContent>
        <Form onSubmit={handleSubmit}>
          <Box flexDirection="column" padding={16} gap={4}>
            <FormInput
              type="text"
              label="Label *"
              placeholder="UID"
              value={label}
              onValueChange={setLabel}
              error={!label && "This field is required"}
            />
            {label && <Text color="grey11">A label for the UID</Text>}
          </Box>
          <DialogActions>
            <DialogCancelButton size="medium" />
            <DialogActionButton size="medium" disabled={!label}>
              Save
            </DialogActionButton>
          </DialogActions>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
