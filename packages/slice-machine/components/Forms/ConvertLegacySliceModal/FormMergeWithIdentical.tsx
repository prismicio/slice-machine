import Select from "react-select";
import { Label } from "theme-ui";

import ModalFormCard from "@components/ModalFormCard";

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
    <ModalFormCard
      dataCy="convert-legacy-slice-modal-as-new-variation"
      isOpen={isOpen}
      widthInPx="530px"
      formId="convert-legacy-slice-modal-as-new-variation"
      buttonLabel={"Convert"}
      close={close}
      onSubmit={(values) => {
        const [libraryID, sliceID, variationID] = values.path.split("::");
        onSubmit({ libraryID, sliceID, variationID });
      }}
      isLoading={isLoading}
      initialValues={{
        path: identicalSlices[0]?.path ?? "",
      }}
      validate={(values) => {
        if (!values.path) {
          return { path: "Cannot be empty." };
        }
      }}
      content={{
        title: `Merge with an existing slice`,
      }}
    >
      {(formik) => {
        return (
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
        );
      }}
    </ModalFormCard>
  );
};
