import Select from "react-select";
import { Label } from "theme-ui";
import { Formik } from "formik";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  ScrollArea,
  tokens,
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
      size="small"
    >
      <DialogHeader title="Convert to new slice" />
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
                className={styles.layout.small}
              >
                <ScrollArea
                  style={{
                    height: "100%",
                    display: "flex",
                    gap: tokens.space[12],
                    paddingInline: tokens.space[24],
                    paddingBlock: tokens.space[16],
                  }}
                >
                  <div className={styles.layout.small}>
                    <div>
                      <Label htmlFor="path" sx={{ mb: 2 }}>
                        Merge with
                      </Label>
                      <Select
                        name="path"
                        options={identicalSlices.map((v) => ({
                          value: v.path,
                          label: v.path.split("::").join(" > "),
                        }))}
                        onChange={(option) =>
                          option
                            ? void formik.setFieldValue("path", option.value)
                            : null
                        }
                        defaultValue={{
                          value: formik.values.path,
                          label: formik.values.path.split("::").join(" > "),
                        }}
                        styles={{
                          option: (provided) => ({
                            ...provided,
                            // Color of item text (Dark/Shade-01)
                            color: "#161618",
                          }),
                        }}
                        theme={(theme) => {
                          return {
                            ...theme,
                            colors: {
                              ...theme.colors,
                              // Background of selected item (Gray/Shade-05)
                              primary: "#E9E8EA",
                            },
                          };
                        }}
                        menuPortalTarget={document.body}
                      />
                    </div>
                  </div>
                </ScrollArea>
                <DialogActions
                  ok={{
                    text: "Convert",
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
