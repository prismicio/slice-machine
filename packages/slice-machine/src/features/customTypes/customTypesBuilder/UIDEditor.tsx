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
import { z } from "zod";

import {
  addUIDField,
  getFieldLabel,
  getUIDFieldEntry,
  updateUIDField,
} from "@/domain/customType";
import { useCustomTypeState } from "@/features/customTypes/customTypesBuilder/CustomTypeProvider";

export function UIDEditor() {
  const [isOpen, setOpen] = useState(false);
  const { customType, setCustomType } = useCustomTypeState();
  const [_, field] = getUIDFieldEntry(customType) ?? [];
  const uidFieldLabel = field ? getFieldLabel(field) : "";
  const [label, setLabel] = useState(uidFieldLabel ?? "");
  const [error, setError] = useState<string | undefined>();

  function handleOpenChange(open: boolean) {
    setOpen(open);
    if (!open) {
      setLabel(uidFieldLabel ?? "");
      setError(undefined);
    }
  }

  function handleValueChange(value: string) {
    setLabel(value);
    setError(validateLabel(value));
  }

  function handleSubmit() {
    if (Boolean(error)) {
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
      onOpenChange={handleOpenChange}
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
              onValueChange={handleValueChange}
              error={error}
            />
            {/* TODO: refactor if change proposed in: https://github.com/prismicio/editor/pull/1151 is released */}
            {error === undefined && (
              <Text color="grey11">A label for the UID</Text>
            )}
          </Box>
          <DialogActions>
            <DialogCancelButton size="medium" />
            <DialogActionButton size="medium" disabled={Boolean(error)}>
              Save
            </DialogActionButton>
          </DialogActions>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function validateLabel(value: string): string | undefined {
  const result = UIDFieldLabelSchema.safeParse(value, {
    errorMap: UIDFieldCustomErrorMap,
  });

  if (result.error) {
    return result.error.errors[0].message;
  }
}

const UIDFieldLabelSchema = z.string().max(35).min(1);

const UIDFieldCustomErrorMap: z.ZodErrorMap = (issue) => {
  switch (issue.code) {
    case z.ZodIssueCode.too_big:
      return {
        message: `The label can't be longer than ${issue.maximum} characters`,
      };
    case z.ZodIssueCode.too_small:
      return { message: "This field is required" };
    default:
      return { message: "Invalid value" };
  }
};
