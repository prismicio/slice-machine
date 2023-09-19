import { useState } from "react";
import Select from "react-select";
import { Field, Input, Label } from "theme-ui";

import { Text } from "@prismicio/editor-ui";
import { Variation } from "@models/common/Variation";
import { LibraryUI } from "@models/common/LibraryUI";
import ModalFormCard from "@components/ModalFormCard";

import * as styles from "./ConvertLegacySliceModal.css";
import { FormProps } from "./types";

type FormValues = {
  libraryID: string;
  sliceID: string;
  variationID: string;
  variationName: string;
};

const validateAsNewVariationValues = (
  values: FormValues,
  libraries: LibraryUI[]
): Partial<Record<keyof FormValues, string>> => {
  const errors: Partial<Record<keyof FormValues, string>> = {};

  if (!values.libraryID) {
    errors.libraryID = "Cannot be empty.";
  }
  const library = libraries.find(
    (library) => library.path === values.libraryID
  );
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (!errors.variationID && !library) {
    errors.variationID = "Does not exists.";
  }

  if (!values.sliceID) {
    errors.libraryID = "Cannot be empty.";
  }
  const slice = library?.components.find(
    (component) => component.model.id === values.sliceID
  );
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (!errors.sliceID && !slice) {
    errors.sliceID = "Does not exists.";
  }

  if (!values.variationName) {
    errors.libraryID = "Cannot be empty.";
  }

  if (!values.variationID) {
    errors.libraryID = "Cannot be empty.";
  } else {
    const variationIDs =
      slice?.model.variations.map((variation) => variation.id) ?? [];

    if (variationIDs.includes(values.variationID)) {
      errors.variationID = "Slice variation ID is already taken.";
    }
  }

  return errors;
};

export const FormAsNewVariation: React.FC<FormProps> = ({
  isOpen,
  close,
  onSubmit,
  isLoading,
  slice,
  sliceName,
  libraries,
  localSharedSlices,
}) => {
  const [inferIDFromName, setInferIDFromName] = useState(true);

  return (
    <ModalFormCard
      dataCy="convert-legacy-slice-modal-as-new-variation"
      isOpen={isOpen}
      widthInPx="530px"
      formId="convert-legacy-slice-modal-as-new-variation"
      buttonLabel={"Convert"}
      close={close}
      onSubmit={(values) => {
        onSubmit(values);
      }}
      isLoading={isLoading}
      initialValues={{
        libraryID: localSharedSlices[0]?.from,
        sliceID: localSharedSlices[0]?.model.id,
        variationID: Variation.generateId(slice.key),
        variationName: sliceName,
      }}
      validate={(values) => {
        return validateAsNewVariationValues(values, libraries);
      }}
      content={{
        title: `Convert to new variation`,
      }}
    >
      {(formik) => {
        return (
          <div className={styles.layout.small}>
            <div>
              <Label htmlFor="slice" sx={{ mb: 2 }}>
                Target Slice
              </Label>
              <Select
                name="slice"
                options={localSharedSlices.map((slice) => ({
                  value: `${slice.from}::${slice.model.id}`,
                  label: `${slice.from} > ${slice.model.name} (${slice.model.id})`,
                }))}
                onChange={(option) => {
                  if (option) {
                    const [libraryID, sliceID] = option.value.split("::");
                    void formik.setFieldValue("libraryID", libraryID);
                    void formik.setFieldValue("sliceID", sliceID);
                  }
                }}
                defaultValue={{
                  value: `${formik.values.libraryID}::${formik.values.sliceID}`,
                  label: `${formik.values.libraryID} > ${localSharedSlices[0]?.model.name} (${formik.values.sliceID})`,
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
            <div>
              <Label
                htmlFor="variationName"
                sx={{
                  mb: 2,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                Variation Name
                {typeof formik.errors.variationName === "string" ? (
                  <Text variant="small" color="tomato10">
                    {formik.errors.variationName}
                  </Text>
                ) : null}
              </Label>
              <Field
                autoComplete="off"
                id="variationName"
                name="variationName"
                type="text"
                placeholder={sliceName}
                as={Input}
                maxLength={30}
                value={formik.values.variationName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  void formik.setFieldValue(
                    "variationName",
                    e.currentTarget.value
                  );
                  if (inferIDFromName) {
                    void formik.setFieldValue(
                      "variationID",
                      Variation.generateId(e.currentTarget.value)
                    );
                  }
                }}
                data-cy="slice-name-input"
              />
            </div>
            <div>
              <Label
                htmlFor="variationID"
                sx={{
                  mb: 2,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                Variation ID
                {typeof formik.errors.variationID === "string" ? (
                  <Text variant="small" color="tomato10">
                    {formik.errors.variationID}
                  </Text>
                ) : null}
              </Label>
              <Field
                autoComplete="off"
                id="variationID"
                name="variationID"
                type="text"
                placeholder={Variation.generateId(slice.key)}
                as={Input}
                maxLength={30}
                value={formik.values.variationID}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setInferIDFromName(false);
                  void formik.setFieldValue(
                    "variationID",
                    Variation.generateId(e.currentTarget.value)
                  );
                }}
                data-cy="slice-name-input"
              />
            </div>
          </div>
        );
      }}
    </ModalFormCard>
  );
};
