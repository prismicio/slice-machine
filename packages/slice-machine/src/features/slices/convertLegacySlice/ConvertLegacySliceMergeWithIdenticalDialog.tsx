import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  ScrollArea,
  Select,
  SelectItem,
  Text,
} from "@prismicio/editor-ui";
import { Formik } from "formik";
import type { FC } from "react";

import styles from "./ConvertLegacySliceButton.module.css";
import { DialogProps } from "./types";

export const ConvertLegacySliceMergeWithIdenticalDialog: FC<DialogProps> = ({
  isOpen,
  close,
  onSubmit,
  isLoading,
  identicalSlices,
}) => {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && close()}
      size={{ width: 448, height: "auto" }}
    >
      <DialogHeader title="Merge with an existing slice" />
      <DialogContent>
        <Formik
          initialValues={{
            path: identicalSlices[0]?.path ?? "",
          }}
          validate={(values) => {
            if (!values.path) {
              return { path: "Cannot be empty." };
            }
          }}
          onSubmit={(values) => {
            const [libraryID, sliceID, variationID] = values.path.split("::");
            onSubmit({ libraryID, sliceID, variationID });
          }}
        >
          {(formik) => {
            return (
              <form id="convert-legacy-slice-merge-with-identical-dialog">
                <Box display="flex" flexDirection="column">
                  <ScrollArea className={styles.scrollArea}>
                    <Text variant="normal" color="grey11">
                      If you have multiple identical slices, you can merge them.
                      All of your content will be remapped to the target slice.
                    </Text>
                    <Box display="flex" flexDirection="column" gap={4}>
                      <label className={styles.label}>
                        <Text variant="bold">Target slice*</Text>
                        {typeof formik.errors.path === "string" ? (
                          <Text variant="small" color="tomato10">
                            {formik.errors.path}
                          </Text>
                        ) : null}
                      </label>
                      <Select
                        size="medium"
                        color="grey"
                        startIcon="viewDay"
                        flexContent={true}
                        value={formik.values.path}
                        onValueChange={(value) => {
                          value
                            ? void formik.setFieldValue("path", value)
                            : null;
                        }}
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
                  <DialogActions
                    ok={{
                      text: "Merge",
                      onClick: () => void formik.submitForm(),
                      loading: isLoading,
                      disabled: !formik.isValid,
                    }}
                    cancel={{ text: "Cancel" }}
                    size="medium"
                  />
                </Box>
              </form>
            );
          }}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};
