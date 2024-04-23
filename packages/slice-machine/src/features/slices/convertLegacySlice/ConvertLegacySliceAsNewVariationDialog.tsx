import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  FormInput,
  ScrollArea,
  Select,
  SelectItem,
  Text,
} from "@prismicio/editor-ui";
import { Formik } from "formik";
import { camelCase } from "lodash";
import { type FC, useState } from "react";

import { LibraryUI } from "@/legacy/lib/models/common/LibraryUI";

import styles from "./ConvertLegacySliceButton.module.css";
import { DialogProps } from "./types";

type FormValues = {
  libraryID: string;
  sliceID: string;
  variationID: string;
  variationName: string;
};

export const ConvertLegacySliceAsNewVariationDialog: FC<DialogProps> = ({
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
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && close()}
      size={{ width: 448, height: "auto" }}
    >
      <DialogHeader title="Convert to slice variation" />
      <DialogContent>
        <Formik
          initialValues={{
            libraryID: localSharedSlices[0]?.from,
            sliceID: localSharedSlices[0]?.model.id,
            variationID: camelCase(slice.key),
            variationName: sliceName,
          }}
          validate={(values) => {
            return validateAsNewVariationValues(values, libraries);
          }}
          onSubmit={(values) => {
            onSubmit(values);
          }}
        >
          {(formik) => {
            return (
              <form id="convert-legacy-slice-as-new-variation-dialog">
                <Box display="flex" flexDirection="column">
                  <ScrollArea
                    className={styles.scrollArea}
                    style={{ width: 448 }}
                  >
                    <Text variant="normal" color="grey11">
                      If you have multiple slices that are similar, you can
                      combine them as variations of the same slice.
                    </Text>
                    <Box display="flex" flexDirection="column" gap={4}>
                      <label className={styles.label}>
                        <Text variant="bold">Target slice*</Text>
                        {typeof formik.errors.libraryID === "string" ? (
                          <Text variant="small" color="tomato10">
                            {formik.errors.libraryID}
                          </Text>
                        ) : null}
                        {typeof formik.errors.sliceID === "string" ? (
                          <Text variant="small" color="tomato10">
                            {formik.errors.sliceID}
                          </Text>
                        ) : null}
                      </label>
                      <Select
                        size="medium"
                        color="grey"
                        startIcon="viewDay"
                        flexContent={true}
                        value={`${formik.values.libraryID}::${formik.values.sliceID}`}
                        onValueChange={(value) => {
                          if (value) {
                            const [libraryID, sliceID] = value.split("::");
                            void formik.setFieldValue("libraryID", libraryID);
                            void formik.setFieldValue("sliceID", sliceID);
                          }
                        }}
                      >
                        {localSharedSlices.map((slice) => (
                          <SelectItem
                            key={`${slice.from}::${slice.model.id}`}
                            value={`${slice.from}::${slice.model.id}`}
                          >
                            {slice.from} {">"} {slice.model.name} (
                            {slice.model.id})
                          </SelectItem>
                        ))}
                      </Select>
                      <Text variant="normal" color="grey11">
                        Choose the slice to which you would like to add this
                        variation.
                      </Text>
                    </Box>
                    <Box display="flex" flexDirection="column" gap={4}>
                      <label className={styles.label}>
                        <Text variant="bold">Variation name*</Text>
                        {typeof formik.errors.variationName === "string" ? (
                          <Text variant="small" color="tomato10">
                            {formik.errors.variationName}
                          </Text>
                        ) : null}
                      </label>
                      <FormInput
                        placeholder={sliceName}
                        error={typeof formik.errors.variationName === "string"}
                        value={formik.values.variationName}
                        onValueChange={(value) => {
                          const values = {
                            ...formik.values,
                            variationName: value.slice(0, 30),
                          };

                          if (inferIDFromName) {
                            values.variationID = camelCase(
                              values.variationName,
                            );
                          }

                          formik.setValues(values, true);
                        }}
                        data-testid="variation-name-input"
                      />
                    </Box>
                    <Box display="flex" flexDirection="column" gap={4}>
                      <label className={styles.label}>
                        <Text variant="bold">ID*</Text>
                        {typeof formik.errors.variationID === "string" ? (
                          <Text variant="small" color="tomato10">
                            {formik.errors.variationID}
                          </Text>
                        ) : null}
                      </label>
                      <FormInput
                        placeholder={camelCase(slice.key)}
                        error={typeof formik.errors.variationID === "string"}
                        value={formik.values.variationID}
                        onValueChange={(value) => {
                          setInferIDFromName(false);
                          void formik.setFieldValue(
                            "variationID",
                            camelCase(value.slice(0, 30)),
                          );
                        }}
                        data-testid="variation-id-input"
                      />
                    </Box>
                  </ScrollArea>
                  <DialogActions
                    ok={{
                      text: "Convert",
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

const validateAsNewVariationValues = (
  values: FormValues,
  libraries: readonly LibraryUI[],
): Partial<Record<keyof FormValues, string>> => {
  const errors: Partial<Record<keyof FormValues, string>> = {};

  if (!values.libraryID) {
    errors.libraryID = "Cannot be empty.";
  }
  const library = libraries.find(
    (library) => library.path === values.libraryID,
  );
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (!errors.libraryID && !library) {
    errors.libraryID = "Does not exist.";
  }

  if (!values.sliceID) {
    errors.sliceID = "Cannot be empty.";
  }
  const slice = library?.components.find(
    (component) => component.model.id === values.sliceID,
  );
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (!errors.sliceID && !slice) {
    errors.sliceID = "Does not exist.";
  }

  if (!values.variationName) {
    errors.variationName = "Cannot be empty.";
  }

  if (!values.variationID) {
    errors.variationID = "Cannot be empty.";
  } else {
    const variationIDs =
      slice?.model.variations.map((variation) => variation.id) ?? [];

    if (variationIDs.includes(values.variationID)) {
      errors.variationID = "Slice variation ID is already taken.";
    }
  }

  return errors;
};
