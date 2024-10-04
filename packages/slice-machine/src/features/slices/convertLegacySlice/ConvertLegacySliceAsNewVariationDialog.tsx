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
  FormInput,
  ScrollArea,
  Select,
  SelectItem,
  Text,
} from "@prismicio/editor-ui";
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
  const defaultValues = {
    libraryID: localSharedSlices[0]?.from,
    sliceID: localSharedSlices[0]?.model.id,
    variationID: camelCase(slice.key),
    variationName: sliceName,
  };
  const [inferIDFromName, setInferIDFromName] = useState(true);
  const [values, setValues] = useState<FormValues>(defaultValues);
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormValues, string>>
  >({});

  useOnChange(isOpen, () => {
    if (!isOpen) {
      setValues(defaultValues);
      setErrors({});
    }
  });

  function handleValueChange(values: FormValues) {
    setValues(values);
    setErrors(validateAsNewVariationValues(values, libraries));
  }

  function handleSubmit() {
    if (Object.keys(errors).length > 0) {
      return;
    }

    onSubmit(values);
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && close()}
      size={{ width: 448, height: "auto" }}
    >
      <DialogHeader title="Convert to slice variation" />
      <DialogContent>
        <Form onSubmit={handleSubmit}>
          <Box display="flex" flexDirection="column">
            <ScrollArea className={styles.scrollArea}>
              <Text variant="normal" color="grey11">
                If you have multiple slices that are similar, you can combine
                them as variations of the same slice.
              </Text>
              <Box display="flex" flexDirection="column" gap={4}>
                <label className={styles.label}>
                  <Text variant="bold">Target slice *</Text>
                  {typeof errors.libraryID === "string" ? (
                    <Text variant="small" color="tomato10">
                      {errors.libraryID}
                    </Text>
                  ) : null}
                  {typeof errors.sliceID === "string" ? (
                    <Text variant="small" color="tomato10">
                      {errors.sliceID}
                    </Text>
                  ) : null}
                </label>
                <Select
                  size="medium"
                  color="grey"
                  startIcon="viewDay"
                  flexContent={true}
                  value={`${values.libraryID}::${values.sliceID}`}
                  onValueChange={(value) => {
                    if (value) {
                      const [libraryID, sliceID] = value.split("::");
                      handleValueChange({
                        ...values,
                        libraryID,
                        sliceID,
                      });
                    }
                  }}
                >
                  {localSharedSlices.map((slice) => (
                    <SelectItem
                      key={`${slice.from}::${slice.model.id}`}
                      value={`${slice.from}::${slice.model.id}`}
                    >
                      {slice.from} {">"} {slice.model.name} ({slice.model.id})
                    </SelectItem>
                  ))}
                </Select>
                <Text variant="normal" color="grey11">
                  Choose the slice to which you would like to add this
                  variation.
                </Text>
              </Box>
              <Box display="flex" flexDirection="column" gap={4}>
                <FormInput
                  label="Variation name *"
                  placeholder={sliceName}
                  error={errors.variationName}
                  value={values.variationName}
                  onValueChange={(value) => {
                    const newValues = {
                      ...values,
                      variationName: value.slice(0, 30),
                    };

                    if (inferIDFromName) {
                      newValues.variationID = camelCase(
                        newValues.variationName,
                      );
                    }

                    handleValueChange(newValues);
                  }}
                  data-testid="variation-name-input"
                />
              </Box>
              <Box display="flex" flexDirection="column" gap={4}>
                <FormInput
                  label="ID *"
                  placeholder={camelCase(slice.key)}
                  error={errors.variationID}
                  value={values.variationID}
                  onValueChange={(value) => {
                    setInferIDFromName(false);
                    handleValueChange({
                      ...values,
                      variationID: value.slice(0, 30),
                    });
                  }}
                  data-testid="variation-id-input"
                />
              </Box>
            </ScrollArea>
            <DialogActions>
              <DialogCancelButton size="medium" />
              <DialogActionButton
                size="medium"
                loading={isLoading}
                disabled={Object.keys(errors).length > 0}
              >
                Convert
              </DialogActionButton>
            </DialogActions>
          </Box>
        </Form>
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
