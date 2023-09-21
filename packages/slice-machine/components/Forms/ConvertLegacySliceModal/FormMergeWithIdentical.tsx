import { Formik } from "formik";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  ScrollArea,
  Text,
  Select,
  SelectItem,
} from "@prismicio/editor-ui";

import * as styles from "./ConvertLegacySliceModal.css";
import { FormProps } from "./types";

export const FormMergeWithIdentical: React.FC<FormProps> = ({
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
          validateOnChange
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
              <form
                id="convert-legacy-slice-modal-merge-with-identical"
                data-cy="convert-legacy-slice-modal-merge-with-identical"
                className={styles.form}
              >
                <ScrollArea className={styles.scrollArea}>
                  <Text variant="normal" color="grey11">
                    If you have multiple identical slices, you can merge them.
                    All of your content will be remapped to the target slice.
                  </Text>
                  <div className={styles.field}>
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
                      variant="secondary"
                      startIcon="viewDay"
                      flexContent={true}
                      value={formik.values.path}
                      onValueChange={(value) => {
                        value ? void formik.setFieldValue("path", value) : null;
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
                  </div>
                </ScrollArea>
                <DialogActions
                  ok={{
                    text: "Merge",
                    onClick: () => void formik.submitForm(),
                    loading: isLoading,
                    disabled: !formik.isValid,
                  }}
                  cancel={{ text: "Cancel" }}
                />
              </form>
            );
          }}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};
