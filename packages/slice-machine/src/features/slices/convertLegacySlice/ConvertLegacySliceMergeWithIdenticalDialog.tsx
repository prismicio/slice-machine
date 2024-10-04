import { useOnChange } from "@prismicio/editor-support/React";
import {
  Box,
  Dialog,
  DialogActionButton,
  DialogActions,
  DialogCancelButton,
  DialogContent,
  DialogHeader,
  Form,
  ScrollArea,
  Select,
  SelectItem,
  Text,
} from "@prismicio/editor-ui";
import { type FC, useState } from "react";

import styles from "./ConvertLegacySliceButton.module.css";
import { DialogProps } from "./types";

export const ConvertLegacySliceMergeWithIdenticalDialog: FC<DialogProps> = ({
  isOpen,
  close,
  onSubmit,
  isLoading,
  identicalSlices,
}) => {
  const defaultPath = identicalSlices[0]?.path ?? "";
  const [path, setPath] = useState<string>(defaultPath);
  const [error, setError] = useState<string | undefined>();

  useOnChange(isOpen, () => {
    if (!isOpen) {
      setPath(defaultPath);
      setError(undefined);
    }
  });

  function handleValueChange(value: string) {
    setPath(value);

    if (!value) setError("Cannot be empty.");
  }

  function handleSubmit() {
    if (Boolean(error)) {
      return;
    }

    const [libraryID, sliceID, variationID] = path.split("::");
    onSubmit({ libraryID, sliceID, variationID });
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && close()}
      size={{ width: 448, height: "auto" }}
    >
      <DialogHeader title="Merge with an existing slice" />
      <DialogContent>
        <Form onSubmit={handleSubmit}>
          <Box display="flex" flexDirection="column">
            <ScrollArea className={styles.scrollArea}>
              <Text variant="normal" color="grey11">
                If you have multiple identical slices, you can merge them. All
                of your content will be remapped to the target slice.
              </Text>
              <Box display="flex" flexDirection="column" gap={4}>
                <label className={styles.label}>
                  <Text variant="bold">Target slice*</Text>
                  {typeof error === "string" ? (
                    <Text variant="small" color="tomato10">
                      {error}
                    </Text>
                  ) : null}
                </label>
                <Select
                  size="medium"
                  color="grey"
                  startIcon="viewDay"
                  flexContent={true}
                  value={path}
                  onValueChange={handleValueChange}
                >
                  {identicalSlices.map((slice) => (
                    <SelectItem key={slice.path} value={slice.path}>
                      {slice.path.split("::").join(" > ")}
                    </SelectItem>
                  ))}
                </Select>
                <Text variant="normal" color="grey11">
                  Choose a slice that you would like to merge this into.
                </Text>
              </Box>
            </ScrollArea>
            <DialogActions>
              <DialogCancelButton size="medium" />
              <DialogActionButton
                size="medium"
                loading={isLoading}
                disabled={Boolean(error)}
              >
                Merge
              </DialogActionButton>
            </DialogActions>
          </Box>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
