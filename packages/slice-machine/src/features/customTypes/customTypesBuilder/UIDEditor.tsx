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
  Icon,
  Text,
} from "@prismicio/editor-ui";
import { type KeyboardEvent, useState } from "react";

import { getUidField, updateUidField } from "@/domain/customType";
import { useCustomTypeState } from "@/features/customTypes/customTypesBuilder/CustomTypeProvider";

export function UIDEditor() {
  const [isOpen, setOpen] = useState(false);
  const { customType, setCustomType } = useCustomTypeState();
  const field = getUidField(customType);
  const [label, setLabel] = useState(field?.config?.label ?? "");

  function submitLabel() {
    const updatedCustomType = updateUidField(label, customType);
    setCustomType(updatedCustomType);
    setOpen(false);
  }

  function handleKeyDown(e: KeyboardEvent<Element>) {
    if (e.key === "Enter") {
      submitLabel();
    }
  }

  if (!field) {
    return null;
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
          startIcon="language"
          sx={{ marginInline: "auto" }}
        >
          {field.config?.label ?? "UID"}
        </Button>
      }
    >
      <DialogHeader title="Update the UID label" />
      <DialogContent>
        <Form onSubmit={submitLabel}>
          <Box flexDirection="column" padding={16} gap={4}>
            <FormInput
              type="text"
              label="Label *"
              placeholder="UID"
              value={label}
              onValueChange={setLabel}
              onKeyDown={handleKeyDown}
              error={!label}
            />
            <Box alignItems="center" gap={4}>
              {/* TODO: move error message into FormInput component when editor-ui is bumped to version 0.4.39 */}
              {!label ? (
                <>
                  <Icon name="alert" color="tomato11" size="small" />
                  <Text color="tomato11">This field is required</Text>
                </>
              ) : (
                <Text color="grey11">A label for the UID</Text>
              )}
            </Box>
          </Box>
          <DialogActions>
            <DialogCancelButton size="medium" />
            <DialogActionButton
              size="medium"
              onClick={submitLabel}
              disabled={!label}
            >
              Save
            </DialogActionButton>
          </DialogActions>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
